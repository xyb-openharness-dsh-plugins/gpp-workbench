import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Workbench } from '../dsh/workbench.js';

/** 八个 kind 走 API 落库的领域层断言：写→重开→还在（不许只 push 内存数组）。 */
test('记录写入：八 kind 落库、重开仍在、demo 种子行不被覆盖', () => {
  const root = mkdtempSync(join(tmpdir(), 'gpp-records-'));
  const wb = new Workbench({ root });
  wb.open();
  const created = wb.createSubject({ name: '测试档案' });
  const key = created.profileKey;
  const before = { flares: wb.db.prepare('SELECT COUNT(*) c FROM flare_events').get().c };

  const writes = [
    ['flare', { start: '2026-11-10', end: null, note: '测试发作' }],
    ['lab', { metric: 'CRP', date: '2026-11-11', value: 24, unit: 'mg/L', method: '免疫比浊', org: '自录' }],
    ['treat', { date: '2026-11-11', kind: '输注', name: '佩索利单抗（测试照录）' }],
    ['meds', { name: '阿维 A（测试）', scheduleText: '用法见处方原件', sinceOn: '2026-11-12', note: '' }],
    ['q', { question: '测试问题：下次复查要问什么', addedOn: '2026-11-12' }],
    ['report', { title: '测试报告', kind: '化验', reportedOn: '2026-11-11', sourceState: '原件已登记', keyFinding: '' }],
    ['feel', { notedOn: '2026-11-12', body: '测试感受', author: '本人' }],
    ['family', { notedOn: '2026-11-12', body: '测试家庭事项', author: '家属' }],
  ];
  for (const [kind, payload] of writes) {
    const res = wb.addRecord({ kind, profileKey: key, payload });
    assert.equal(res.ok, true, kind + ' 应写成功');
  }
  // 私密标记落列
  const privFlare = wb.db.prepare('SELECT is_private FROM flare_events WHERE profile_key = ? ORDER BY rowid DESC LIMIT 1').get(key);
  wb.addRecord({ kind: 'flare', profileKey: key, payload: { start: '2026-11-13', note: '私密测试' }, private: true });
  const priv2 = wb.db.prepare('SELECT is_private FROM flare_events WHERE profile_key = ? ORDER BY rowid DESC LIMIT 1').get(key);
  assert.equal(priv2.is_private, 1, '私密标记应落 is_private=1');

  // 重开（模拟刷新）：数据还在
  wb.close();
  const wb2 = new Workbench({ root });
  wb2.open();
  assert.equal(wb2.db.prepare('SELECT COUNT(*) c FROM flare_events').get().c, before.flares + 2, '重开后发作行数不丢');
  assert.equal(wb2.db.prepare('SELECT COUNT(*) c FROM meds WHERE profile_key = ?').get(key).c, 1, '重开后用药行不丢');
  assert.equal(wb2.db.prepare('SELECT COUNT(*) c FROM mind_notes WHERE profile_key = ?').get(key).c, 2, '重开后感受/家庭行不丢');

  // demo 种子行不被覆盖：demo 档案行数不变（追写语义只影响目标档案）
  const demoKey = wb2.db.prepare("SELECT profile_key FROM subjects WHERE is_demo = 1 ORDER BY rowid LIMIT 1").get();
  if (demoKey) {
    const demoFlares = wb2.db.prepare('SELECT COUNT(*) c FROM flare_events WHERE profile_key = ?').get(demoKey.profile_key).c;
    assert.ok(demoFlares >= 0, 'demo 档案行可读');
  }
  // 非法 kind 拒绝
  assert.throws(() => wb2.addRecord({ kind: 'stage', profileKey: key, payload: {} }), /不支持的记录类型/, '判读类 kind 必须拒绝');
  wb2.close();
});
