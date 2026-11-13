/**
 * 领域服务：把"数据根 → 开库 → 播种 → 读模型"收在一个可测对象里。
 *
 * 为什么单独一层：`dsh/index.js` 要 import Schemastery（宿主提供的 peer，本仓装不上），
 * 那一行会让整个入口不可单测。把可测逻辑放这里，入口只留 wiring。
 */
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const HERE = dirname(fileURLToPath(import.meta.url));
import { openStore, closeStore, migrate } from './store.js';
import { seedDemoData, hasDemoData } from './demo.js';
import { readBootstrap } from './readmodels.js';
import { DB_FILE, HOME_DIR } from '../lib/identity.js';
import { version, displayVersion, build as buildDate } from '../lib/version.js';

export class Workbench {
  /**
   * @param {object} options
   * @param {string} options.root      用户资料目录（必须由用户明确指定；调用方负责校验）
   * @param {boolean} [options.seedDemo] 首次打开是否写入演示数据（默认 true，仅空库生效）
   */
  constructor({ root, seedDemo = true } = {}) {
    if (typeof root !== 'string' || root.trim() === '') throw new Error('Workbench 需要 root（用户资料目录）');
    this.root = root;
    this.dbFile = join(root, DB_FILE);
    this.db = null;
    this.seedDemo = seedDemo;
  }

  /** 打开（幂等）。迁移与播种都在这里完成。 */
  open() {
    if (this.db) return this;
    this.db = openStore(this.dbFile);
    this.migrations = migrate(this.db);
    /* 用户上次在面板里选过的资料目录优先于 cordis 默认值（目录还在才生效）。 */
    if (!this._rootApplied) {
      this._rootApplied = true;
      try {
        const row = this.db.prepare("SELECT value FROM app_setting WHERE key='data_root'").get();
        if (row?.value && row.value !== this.root && existsSync(row.value)) {
          closeStore(this.db);
          this.root = row.value;
          this.dbFile = join(this.root, DB_FILE);
          this.db = openStore(this.dbFile);
          this.migrations = migrate(this.db);
        }
      } catch { /* 旧库没有 app_setting 也不该拦住打开 */ }
    }
    this.seeded = this.seedDemo ? seedDemoData(this.db) : { skipped: true, profiles: 0 };
    return this;
  }

  get dataRoot() { return this.root }

  /** 切换资料目录：先开新库成功再替换，失败回滚到原库。 */
  setDataRoot(nextRoot) {
    this.open();
    const dir = String(nextRoot || '').trim();
    if (!dir || dir === this.root) return this.root;
    const prevRoot = this.root;
    const prevFile = this.dbFile;
    closeStore(this.db);
    this.db = null;
    try {
      this.dbFile = join(dir, DB_FILE);
      this.db = openStore(this.dbFile);
      this.migrations = migrate(this.db);
      this.root = dir;
      this.db.prepare("INSERT INTO app_setting(key,value,updated_at) VALUES('data_root',?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(dir);
      this.seeded = this.seedDemo ? seedDemoData(this.db) : { skipped: true, profiles: 0 };
      return this.root;
    } catch (error) {
      this.root = prevRoot; this.dbFile = prevFile;
      try { this.db = openStore(this.dbFile); } catch { this.db = null; }
      throw error;
    }
  }

  listSubjects() {
    this.open();
    return this.db.prepare('SELECT profile_key, name, meta, is_demo, created_on FROM subjects ORDER BY rowid DESC').all()
      .map((r) => ({ profileKey: r.profile_key, name: r.name, meta: r.meta, isDemo: !!r.is_demo, createdOn: r.created_on }));
  }

  /** 新建档案：is_demo=0；profile_key 用 local-<时间戳>，不与 demo 撞键。 */
  createSubject({ name, meta } = {}) {
    this.open();
    const clean = String(name || '').trim();
    if (!clean) throw new Error('请填写档案名（可以是昵称）');
    if (clean.length > 40) throw new Error('档案名太长（≤40 字）');
    const key = 'local-' + Date.now().toString(36);
    this.db.prepare('INSERT INTO subjects (profile_key, name, meta, is_demo) VALUES (?,?,?,0)').run(key, clean, String(meta || '').trim() || null);
    return { profileKey: key, name: clean, records: this.listSubjects() };
  }

  /**
   * 记录写入（八个 kind → 表，追写不覆盖；demo 种子行不受影响）：
   * flare→flare_events / lab→lab_results（metric 名→metric_defs.key 经 title 反查）/ treat→treatment_events /
   * meds→meds / q→visit_questions / report→reports / feel|family→mind_notes(kind)。
   * is_private 随 payload 落列；未知值显式 null；ver=1（更正走版本列的语义由后续迁移承担）。
   */
  addRecord({ kind, profileKey, payload = {}, private: isPrivate = false } = {}) {
    this.open()
    const cleanKey = String(profileKey || '').trim()
    if (!cleanKey) throw new Error('缺少 profileKey')
    const sub = this.db.prepare('SELECT profile_key, is_demo FROM subjects WHERE profile_key = ?').get(cleanKey)
    if (!sub) throw new Error('档案不存在：' + cleanKey)
    const P = payload || {}
    const priv = isPrivate ? 1 : 0
    let info
    if (kind === 'flare') {
      if (!P.start) throw new Error('发作开始日期为必填项')
      info = this.db.prepare('INSERT INTO flare_events (profile_key, start_date, end_date, note, is_private, ver) VALUES (?,?,?,?,?,1)').run(cleanKey, P.start, P.end ?? null, P.note ?? '', priv)
    } else if (kind === 'lab') {
      if (!P.date || P.value == null) throw new Error('化验日期与结果为必填项')
      const mdef = this.db.prepare('SELECT key FROM metric_defs WHERE title = ?').get(String(P.metric || ''))
      if (!mdef) throw new Error('未知指标：' + P.metric + '（请先在指标目录登记）')
      info = this.db.prepare('INSERT INTO lab_results (profile_key, metric_key, measured_on, value, unit, method, org, is_private, ver) VALUES (?,?,?,?,?,?,?,?,1)').run(cleanKey, mdef.key, P.date, P.value ?? null, P.unit ?? null, P.method ?? null, P.org ?? null, priv)
    } else if (kind === 'treat') {
      if (!P.date || !P.name) throw new Error('治疗日期与内容为必填项')
      info = this.db.prepare('INSERT INTO treatment_events (profile_key, event_date, kind, name, note, is_private, ver) VALUES (?,?,?,?,?,?,1)').run(cleanKey, P.date, String(P.kind || '按次'), P.name, P.note ?? '', priv)
    } else if (kind === 'meds') {
      if (!P.name) throw new Error('药名为必填项')
      info = this.db.prepare('INSERT INTO meds (profile_key, name, schedule_text, since_on, note, ver) VALUES (?,?,?,?,?,1)').run(cleanKey, P.name, P.scheduleText ?? null, P.sinceOn ?? null, P.note ?? null)
    } else if (kind === 'q') {
      if (!P.question) throw new Error('问题内容为必填项')
      info = this.db.prepare('INSERT INTO visit_questions (profile_key, question, added_on, is_private, ver) VALUES (?,?,?,?,1)').run(cleanKey, P.question, P.addedOn ?? null, priv)
    } else if (kind === 'report') {
      if (!P.title) throw new Error('报告名称为必填项')
      info = this.db.prepare('INSERT INTO reports (profile_key, title, kind, reported_on, source_state, key_finding, is_private, ver) VALUES (?,?,?,?,?,?,?,1)').run(cleanKey, P.title, P.kind ?? '其他', P.reportedOn ?? null, P.sourceState ?? '未取得原件', P.keyFinding ?? null, priv)
    } else if (kind === 'feel' || kind === 'family') {
      if (!P.body) throw new Error('内容为必填项')
      info = this.db.prepare('INSERT INTO mind_notes (profile_key, kind, noted_on, body, author, is_private, ver) VALUES (?,?,?,?,?,?,1)').run(cleanKey, kind, P.notedOn ?? null, P.body, P.author ?? null, priv)
    } else {
      throw new Error('不支持的记录类型：' + kind + '（支持 flare/lab/treat/meds/q/report/feel/family 八类）')
    }
    return { ok: true, id: info.lastInsertRowid, kind }
  }

  /** demo 档案（is_demo=1）不可删。 */
  deleteSubject(profileKey) {
    this.open();
    const key = String(profileKey || '');
    const info = this.db.prepare('DELETE FROM subjects WHERE profile_key = ? AND is_demo = 0').run(key);
    const changed = Number(info?.changes ?? 0);
    return { deleted: changed > 0 ? key : null, reason: changed > 0 ? undefined : '不存在或演示档案不可删除', records: this.listSubjects() };
  }

  close() {
    if (this.db) { closeStore(this.db); this.db = null; }
  }

  get stats() {
    if (!this.db) return null;
    const subjects = this.db.prepare('SELECT COUNT(*) c FROM subjects').get().c;
    const labs = this.db.prepare('SELECT COUNT(*) c FROM lab_results').get().c;
    const flares = this.db.prepare('SELECT COUNT(*) c FROM flare_events').get().c;
    const metrics = this.db.prepare('SELECT COUNT(*) c FROM metric_defs').get().c;
    return { profiles: subjects, metrics, labs, flares, hasDemo: subjects > 0 };
  }

  bootstrap() {
    this.open();
    return readBootstrap(this.db);
  }

  profile(profileId) {
    this.open();
    return readBootstrap(this.db, profileId);
  }

  /** 供宿主 /health 用：只报事实，不报"是否已验证" */
  status() {
    return {
      version, displayVersion, buildDate,
      homeDir: HOME_DIR,
      dbFile: DB_FILE,
      root: this.root,
      capabilities: ['bootstrap', 'profile', 'health'],
      stats: this.stats,
      seeded: this.seeded ?? null,
      migrations: this.migrations ?? null,
    };
  }

  /** 演示数据重载（幂等；force 才清空重播，仅供开发用） */
  reloadDemo(force = false) {
    this.open();
    return seedDemoData(this.db, { force });
  }

  get hasData() {
    this.open();
    return hasDemoData(this.db);
  }

  /**
   * 临床试验检索（M4 research 快照，登记状态未核实；无匹配指数、无判读列）。
   * keyword 大小写不敏感 LIKE；未取得快照时返回 honest 空态（不写零结果）。
   */
  trialMatch(keyword) {
    /* 双形态查找：包内（宿主装机，research 随包发出）→ root 旁路（dev 布局）；都没有如实返回不可用 */
    const candidates = [
      join(HERE, '..', 'research', 'gpp', 'gpp_trials_2026.sqlite'),
      join(this.root, '..', 'research', 'gpp', 'gpp_trials_2026.sqlite'),
    ];
    let dbPath = null;
    for (const c of candidates) if (existsSync(c)) { dbPath = c; break; }
    if (!dbPath) {
      return { available: false, reason: 'research/gpp 快照不可用（M4 快照未采集或未随包发出）', records: [] };
    }
    const rdb = new DatabaseSync(dbPath, { readOnly: true });
    const kw = String(keyword || '').trim();
    const rows = kw
      ? rdb.prepare('SELECT * FROM trials WHERE title LIKE ? ORDER BY rowid LIMIT 50').all('%' + kw + '%')
      : rdb.prepare('SELECT * FROM trials ORDER BY rowid LIMIT 50').all();
    const out = rows.map((r) => ({
      recordId: r.record_id, title: r.title, studyType: r.study_type,
      sponsors: r.sponsors ? JSON.parse(r.sponsors) : null,
      registryNumbers: r.registry_numbers ? JSON.parse(r.registry_numbers) : null,
      sourceUrl: r.source_url, statusNote: r.status_note, snapshotDate: r.snapshot_date,
    }));
    rdb.close();
    return { available: true, snapshotDate: out[0]?.snapshotDate ?? null, total: out.length, records: out };
  }
}

export { readBootstrap, seedDemoData, openStore, closeStore };
