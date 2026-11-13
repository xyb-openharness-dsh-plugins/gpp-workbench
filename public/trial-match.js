/* 35 号 · 试验匹配纯函数（GPP 原型态 · 展示层计算；可被 node 测试以 new Function 方式断言）
 * 红线（E7）：
 *   ① 判据只来自样例池真实存在的字段（title/studyType）；未结构化 → '?' 不进已对照分母
 *   ② 药物靶点不进分母（本样例池没有靶点字段，函数签名也不收靶点）
 *   ③ 可对照项不足 2 条不给百分数
 *   ④ 待确认（'?'）按 0 符合计，不进已对照分母
 *   ⑤ 百分数只在展示层算；展示层把它落成四档分层（高/中/低/暂不分层），不写判读列
 */
;(function (global) {
  'use strict'

  var RELEVANT = /pustular|脓疱|银屑病|psoriasis|gpp/i

  function items(facts, prefs) {
    var out = []
    var title = String(facts && facts.title || '')
    var type = String(facts && facts.studyType || '')
    var pref = prefs && prefs.type ? String(prefs.type) : 'all'
    /* ① 疾病相关性（硬性）——来自样例池真实字段 title */
    out.push({
      state: RELEVANT.test(title) ? '✓' : '✕',
      label: '与本台疾病相关（GPP／脓疱型银屑病）',
      hard: true,
      got: '题目「' + (title.length > 40 ? title.slice(0, 40) + '…' : title) + '」（样例池字段 title）',
      req: '登记题目或研究对象与 GPP／脓疱型银屑病相关'
    })
    /* ② 研究类型 vs 用户偏好——偏好=all 时不产出该条（不进分母） */
    if (pref !== 'all') {
      var want = pref === 'interventional' ? '介入性' : '观察性'
      out.push({
        state: type.indexOf(want) >= 0 ? '✓' : (type ? '✕' : '?'),
        label: '研究类型符合你的偏好',
        hard: false,
        got: type ? '样例池类型「' + type + '」（字段 studyType）' : '样例池未存类型（需人工核对）',
        req: '研究类型为「' + want + '」（你在建档里选的偏好，只影响排序与对照，不是入排条件）'
      })
    }
    /* ③ 招募状态——样例池不冒充真实登记状态，恒为 '?'，不进已对照分母 */
    out.push({
      state: '?',
      label: '仍在招募（可入组）',
      hard: false,
      got: '样例池只有演示状态文字，登记状态一律「未核实」（正式快照 M4 接入）',
      req: '当前在招募期且名额可用——需人工核对，官方登记页为准'
    })
    return out
  }

  function score(items) {
    var comparable = (items || []).filter(function (i) { return i.state !== '?' })
    if (comparable.length < 2) return { pct: null, ok: 0, m: comparable.length, tier: '暂不分层', reason: '可对照项不足 2 条，不给符合度' }
    var ok = comparable.filter(function (i) { return i.state === '✓' }).length
    var pct = Math.round(ok / comparable.length * 100)
    return { pct: pct, ok: ok, m: comparable.length, tier: tierOf(pct), reason: '' }
  }

  /* 四档分层（展示层）：高 ≥75 / 中 40–74 / 低 1–39 / 暂不分层（可对照不足或 0） */
  function tierOf(pct) {
    if (pct == null) return '暂不分层'
    if (pct >= 75) return '高'
    if (pct >= 40) return '中'
    if (pct >= 1) return '低'
    return '暂不分层'
  }

  global.GPPTrialMatch = { items: items, score: score, tier: tierOf, RELEVANT: RELEVANT }
})(window)
