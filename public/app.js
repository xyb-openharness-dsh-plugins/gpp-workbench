/**
 * GPP 工作台 · 业务页脚本（M0 最小真实骨架；M2 重做全套界面）。
 *
 * 已实现的真实动作（不是说明弹窗）：
 *   - 「配置目录」：优先宿主 uiWorkspace.pickDirectory()，fallback showDirectoryPicker()；
 *     拒绝清单 isForbiddenDir 与 dsh/server.js checkDataDir 同一条规则（服务端再判一遍）；
 *     选中后 POST ${API_BASE}/root 落盘并回显。
 *   - 「新建我的档案」：openDialog 收集名称 → POST ${API_BASE}/subjects → 成功即切换
 *     state.profileId 并重渲染档案列表。
 *   - 档案列表：GET ${API_BASE}/subjects 渲染 + state.profileId 当前态；demo 档案标
 *     「演示」不可删（DELETE 只对 isDemo=0 发出，UI 侧先提示）。
 *
 * API_BASE 口径（lib/api-base.js 家族定稿）：独立启动 ''，宿主 '/api/gpp'。
 * 令牌必须是字符串字面量形态 "__API_BASE__"（宿主服务时注入成字面量才是合法 JS；
 * 禁止把令牌挂在 window 对象上——注入后会成为非法标识符，整段脚本语法错误）。
 */
var apiBase = "__API_BASE__";
var API_BASE = (typeof apiBase === 'string' ? apiBase : '').replace(/\/+$/, '');

/* 拒绝清单：与 dsh/server.js checkDataDir 同一条规则（主目录本身/桌面/下载根/tmp） */
var HOME_EXACT = /^(\/Users\/[^/]+|\/home\/[^/]+|\/root|[A-Za-z]:\\Users\\[^\\]+)$/i;
var FORBIDDEN_DIR = /((Desktop|桌面)$|(Downloads?|下载(夹)?)$|^(\/tmp|\/private\/tmp|\/var\/folders\/|\/private\/var\/folders\/))/i;
function isForbiddenDir(dir) {
  var d = String(dir || '').trim();
  return HOME_EXACT.test(d) || FORBIDDEN_DIR.test(d);
}

var state = {
  dir: '',
  records: [],        /* GET /subjects 的档案列表 */
  profileId: '',      /* 当前档案 */
};

/* ---------------- 小工具 ---------------- */

function $(sel) { return document.querySelector(sel); }

function toast(msg) {
  var el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { el.hidden = true; }, 4000);
}

function apiUrl(path) { return API_BASE + path; }

/* ---------------- 资料目录（真入口） ---------------- */

async function pickDirectory() {
  var ui = null;
  try { ui = (window.GPP_BRIDGE && window.GPP_BRIDGE.uiWorkspace) || null; } catch (e) { ui = null; }
  var dir = '';
  if (ui && typeof ui.pickDirectory === 'function') {
    try { dir = await ui.pickDirectory(); } catch (err) { toast('没能打开目录选择器：' + ((err && err.message) || err)); return; }
  } else if (typeof window.showDirectoryPicker === 'function') {
    try {
      var handle = await window.showDirectoryPicker();
      dir = handle && handle.name ? handle.name : '';
    } catch (err) {
      if (err && err.name === 'AbortError') { toast('已取消选择目录；当前资料目录没有更改。'); return; }
      toast('没能打开目录选择器：' + ((err && err.message) || err));
      return;
    }
  } else {
    toast('当前环境没有提供目录选择能力；数据写在服务端默认资料目录。');
    return;
  }
  if (!dir) { toast('已取消选择目录；当前资料目录没有更改。'); return; }
  if (isForbiddenDir(dir)) {
    toast('这个位置不能当资料目录（主目录本身 / 桌面 / 下载根目录 / tmp）。请在里面新建一个专用文件夹再选。');
    return;
  }
  try {
    var rsp = await fetch(apiUrl('/root'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dir: dir }),
    });
    var body = await rsp.json().catch(function () { return {}; });
    if (!rsp.ok) { toast(body.error || '目录切换失败'); return; }
    state.dir = body.dir || dir;
    renderDir();
    toast('资料目录已切换到：' + state.dir + '（旧目录数据不会自动搬迁）');
    await loadSubjects();
  } catch (err) {
    toast('目录切换失败：' + ((err && err.message) || err));
  }
}

function renderDir() {
  var el = $('#dir-current');
  if (el) el.textContent = state.dir ? state.dir : '未选择';
}

async function loadDir() {
  try {
    var rsp = await fetch(apiUrl('/root'), { credentials: 'same-origin' });
    if (!rsp.ok) return;
    var info = await rsp.json();
    if (info && info.dir) { state.dir = info.dir; renderDir(); }
  } catch (e) { /* 独立演示态读不到就算了，别编一个路径 */ }
}

/* ---------------- 患者档案：列表 / 新建 / 删除 ---------------- */

async function loadSubjects() {
  var listEl = $('#subject-list');
  try {
    var rsp = await fetch(apiUrl('/subjects'), { credentials: 'same-origin' });
    if (rsp.ok) {
      var body = await rsp.json();
      state.records = Array.isArray(body.records) ? body.records : [];
      if (!state.profileId || !state.records.some(function (r) { return r.profileKey === state.profileId; })) {
        state.profileId = state.records.length ? state.records[0].profileKey : '';
      }
    }
  } catch (e) { /* file:// 演示态：列表为空不报错 */ }
  renderSubjects();
  if (listEl && !state.records.length) {
    listEl.innerHTML = '';
    var li = document.createElement('li');
    li.textContent = '还没有档案；点「新建我的档案」开始记录。';
    listEl.appendChild(li);
  }
}

function renderSubjects() {
  var select = $('#profile-select');
  var listEl = $('#subject-list');
  if (select) {
    select.innerHTML = '';
    state.records.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r.profileKey;
      opt.textContent = (r.isDemo ? '（演示）' : '') + (r.name || r.profileKey);
      if (r.profileKey === state.profileId) opt.selected = true;
      select.appendChild(opt);
    });
  }
  if (listEl) {
    listEl.innerHTML = '';
    state.records.forEach(function (r) {
      var li = document.createElement('li');
      li.textContent = (r.isDemo ? '【演示 · 合成示例】' : '') + (r.name || r.profileKey) + (r.meta ? ' · ' + r.meta : '');
      if (r.profileKey === state.profileId) li.className = 'active';
      if (!r.isDemo) {
        var del = document.createElement('button');
        del.type = 'button';
        del.textContent = '删除';
        del.setAttribute('aria-label', '删除档案 ' + (r.name || r.profileKey));
        del.addEventListener('click', function () { deleteSubject(r); });
        li.appendChild(del);
      } else {
        var mark = document.createElement('span');
        mark.className = 'small-note';
        mark.textContent = '演示档案不可删除';
        li.appendChild(mark);
      }
      listEl.appendChild(li);
    });
  }
}

async function createSubject(name) {
  var rsp = await fetch(apiUrl('/subjects'), {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: name }),
  });
  var body = await rsp.json().catch(function () { return {}; });
  if (!rsp.ok) throw new Error(body.detail || body.error || '创建失败');
  state.records = body.records || state.records;
  state.profileId = body.profileKey || (body.records && body.records.length ? body.records[0].profileKey : state.profileId);
  renderSubjects();
  return body;
}

async function deleteSubject(record) {
  if (record.isDemo) { toast('演示档案不可删除。'); return; }
  try {
    var rsp = await fetch(apiUrl('/subjects?profileKey=' + encodeURIComponent(record.profileKey)), {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    var body = await rsp.json().catch(function () { return {}; });
    if (!rsp.ok) { toast(body.error || '删除失败'); return; }
    if (body.deleted !== record.profileKey) { toast(body.reason || '演示档案不可删除'); }
    else { toast('已删除档案。'); if (state.profileId === record.profileKey) state.profileId = ''; }
    state.records = body.records || state.records;
    renderSubjects();
    await loadSubjects();
  } catch (err) {
    toast('删除失败：' + ((err && err.message) || err));
  }
}

/* ---------------- 对话框（新建档案） ---------------- */

function openDialog() {
  var dlg = $('#dialog');
  if (!dlg) return;
  var input = $('#dialog-input');
  if (input) input.value = '';
  if (typeof dlg.showModal === 'function') dlg.showModal();
  if (input) input.focus();
}

function closeDialog() {
  var dlg = $('#dialog');
  if (dlg && typeof dlg.close === 'function') dlg.close();
}

/* ---------------- 事件绑定与启动 ---------------- */

function bindEvents() {
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('[data-action]') : null;
    if (!target) return;
    var action = target.getAttribute('data-action');
    if (action === 'pick-dir') { event.preventDefault(); void pickDirectory(); }
    else if (action === 'create-subject') { event.preventDefault(); openDialog(); }
    else if (action === 'dialog-cancel') { event.preventDefault(); closeDialog(); }
  });
  var select = $('#profile-select');
  if (select) select.addEventListener('change', function () {
    state.profileId = select.value;
    renderSubjects();
  });
  var form = $('#dialog-form');
  if (form) form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var input = $('#dialog-input');
    var name = input ? input.value.trim() : '';
    if (!name) { toast('请填写档案名（可以是昵称）'); return; }
    try {
      var created = await createSubject(name);
      closeDialog();
      toast('已创建档案「' + (created && created.name ? created.name : name) + '」，已切换为当前档案。');
    } catch (err) {
      toast('创建档案失败：' + ((err && err.message) || err));
    }
  });
}

/* 演示数据在独立 file:// 形态下兜底展示（宿主形态优先 bootstrap，见 migrate-public 注入块） */
function renderDemoFallback() {
  var note = $('#subject-note');
  var list = $('#subject-list');
  if (!list || !window.DEMO_DATA || !Array.isArray(window.DEMO_DATA.profiles)) return;
  if (state.records.length) return;
  if (note) note.textContent = '当前为演示态（未连接本机服务）：下面是两套合成示例档案，仅用于看界面形状。';
  window.DEMO_DATA.profiles.forEach(function (p) {
    var li = document.createElement('li');
    li.textContent = '【演示 · 合成示例】' + (p.name || p.id) + (p.tag ? ' · ' + p.tag : '');
    list.appendChild(li);
  });
}

async function boot() {
  bindEvents();
  renderDir();
  await loadDir();
  await loadSubjects();
  renderDemoFallback();
}

boot();
