/* GPP 工作台 M2 项目探针：对 prototypes/v0.2 真实浏览器断言（IP/C/MT/Q/A/TRIAL/PRIMER 组）
 * 通用铁律：先证明被测对象非空，再断言相等；SKIP 不计覆盖。
 * 全量路由探针：覆盖 ROUTES 全部叶子路由（与 check-probe-coverage.mjs 对账）。
 * 用法：node scripts/probe-gpp-m2.mjs [--port N] [--url http://...]
 * 依赖：puppeteer-core + 本机 Chrome（CHROME_PATH 可覆盖）。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const argOf = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(argOf('--port') || 8139)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' }

/* 全量叶子路由（与 app.js 顶层 ROUTES 一一对应；漏一条 check-probe-coverage 就会红） */
const LEAF_ROUTES = ['dash', 'flares/flare', 'flares/band', 'flares/trigger', 'labs/list', 'labs/chart', 'treatment/infusion', 'treatment/meds', 'visits/prep', 'visits/hospitals', 'reports/list', 'reports/wall', 'mind/feel', 'mind/life', 'records/archive', 'records/metrics', 'records/summary', 'clinical/facts', 'clinical/search', 'clinical/match', 'clinical/saved']

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ]
  return candidates.find(existsSync) || null
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return }
    const file = normalize(join(ROOT, urlPath))
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return }
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end('not found') }
})

const results = []
function t(id, desc, pass, detail) {
  results.push({ id, desc, pass: !!pass, detail: detail === undefined ? '' : String(detail) })
  console.log((pass ? 'PASS ' : 'FAIL ') + id + '  ' + desc + (detail !== undefined ? '  — ' + JSON.stringify(detail).slice(0, 220) : ''))
}

const serverReady = new Promise(r => server.listen(PORT, '127.0.0.1', r))

async function main() {
  /* ROUTES1（源码级，node 侧）：ROUTES 键数与 LEAF_ROUTES 一致（防止路由与探针清单漂移） */
  const appSrc = readFileSync(join(ROOT, 'prototypes/v0.2/app.js'), 'utf8')
  const routeKeys = [...appSrc.matchAll(/'([a-z]+(?:\/[a-z]+)?)':\s*page/g)].map(m => m[1])
  t('ROUTES1', 'app.js ROUTES 键数与探针叶子路由一致（' + routeKeys.length + '/' + LEAF_ROUTES.length + '）',
    routeKeys.length === LEAF_ROUTES.length && LEAF_ROUTES.every(r => routeKeys.includes(r)), { routes: routeKeys })

  await serverReady
  const chrome = findChrome()
  if (!chrome) { console.log('FAIL env  找不到 Chrome：设置 CHROME_PATH 后重试。'); process.exit(2) }
  let puppeteer
  try {
    const famRequire = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
    puppeteer = famRequire('puppeteer-core')
  } catch {
    puppeteer = require('puppeteer-core')
  }
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  })
  const page = await browser.newPage()
  /* 静态服务器对 /favicon.ico 一律 404，且报错文本不含 favicon 字样：回 204，不污染 ERR 断言 */
  await page.setRequestInterception(true)
  page.on('request', req => {
    if (req.url().includes('favicon')) req.respond({ status: 204 }).catch(() => { })
    else req.continue().catch(() => { })
  })
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()) })
  await page.setViewport({ width: 1280, height: 860 })
  const url = argOf('--url') || `http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.GPP_APP && document.querySelectorAll('#nav button').length >= 9, { timeout: 5000 })

  /* ---------- NAV1/IP2：导航 9 项；每个 (view,sub) 渲染非空，孤儿页 = 0 ---------- */
  const nav = await page.evaluate(() => document.querySelectorAll('#nav button').length)
  t('NAV1', '一级导航 9 项（GPP 定稿导航，不改一级名）', nav === 9, { nav })
  const walk = await page.evaluate((routes) => {
    const app = window.GPP_APP
    const covered = [], orphans = []
    for (const r of routes) {
      const [view, sub] = r.split('/')
      app.state.page = view
      if (sub) app.state.sub[view] = sub
      app.render()
      const n = document.querySelector('#main').innerText.trim().length
      if (n > 20) covered.push(r); else orphans.push(r)
    }
    app.state.page = 'dash'; app.render()
    return { covered: covered.length, total: routes.length, orphans }
  }, LEAF_ROUTES)
  t('IP2', '21 条叶子路由全部渲染非空（孤儿页=0，先证有内容）', walk.covered === walk.total && walk.orphans.length === 0, { covered: walk.covered, total: walk.total, orphans: walk.orphans })

  /* ---------- SUBT1：每个一级页 SUBTITLE 是 GPP 同族口径（只回顾/不解读/无判读列） ---------- */
  const subt = await page.evaluate((pages) => {
    const app = window.GPP_APP
    const out = []
    for (const pg of pages) {
      app.state.page = pg; app.render()
      const p = document.querySelector('.page-head p')
      out.push({ pg, len: p ? p.textContent.trim().length : 0 })
    }
    app.state.page = 'dash'; app.render()
    return out
  }, ['dash', 'flares', 'labs', 'treatment', 'visits', 'reports', 'mind', 'records', 'clinical'])
  t('SUBT1', '9 个一级页都有 SUBTITLE（每条 >20 字）', subt.every(x => x.len > 20), subt)

  /* ---------- X2：深链接直达 ---------- */
  await page.evaluate(() => { location.hash = '#records/metrics' })
  await new Promise(r => setTimeout(r, 300))
  const deep = await page.evaluate(() => ({
    crumb: document.querySelector('#breadcrumb').textContent,
    cards: document.querySelectorAll('.mcard').length
  }))
  t('X2', '深链接 #records/metrics 直达且内容真实（指标卡>0）', deep.crumb === '档案总览' && deep.cards > 0, deep)

  /* ---------- Q10/PVSW：A/B 切换整页联动、抽查不串档（含一图秀联动） ---------- */
  const before = await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.page = 'dash'; app.render()
    return { name: document.querySelector('#profile-name').textContent, flares: app.profile().flares.length }
  })
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-b'
    app.state.page = 'dash'; app.render()
  })
  const b = await page.evaluate(() => {
    const app = window.GPP_APP
    return { name: document.querySelector('#profile-name').textContent, flares: app.profile().flares.length, shown: document.querySelector('#main').innerText.includes('王医生') }
  })
  await page.evaluate(() => { window.GPP_APP.state.profileId = 'demo-a'; window.GPP_APP.render() })
  const back = await page.evaluate(() => ({ name: document.querySelector('#profile-name').textContent, id: window.GPP_APP.state.profileId }))
  t('Q10', 'A→B→A 抽查不串档（发作条数与医生原话随档案切换）', before.name !== b.name && b.flares > before.flares && b.shown && back.id === 'demo-a', { A: before, B: { name: b.name, flares: b.flares }, back: back.name })

  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.page = 'labs'; app.state.sub.labs = 'chart'; app.state.range = 'all'; app.render()
  })
  const crpA = await page.evaluate(() => window.GPP_APP.seriesCount('CRP'))
  await page.evaluate(() => { window.GPP_APP.state.profileId = 'demo-b'; window.GPP_APP.render() })
  const crpB = await page.evaluate(() => window.GPP_APP.seriesCount('CRP'))
  await page.evaluate(() => { window.GPP_APP.state.profileId = 'demo-a'; window.GPP_APP.render() })
  const crpBack = await page.evaluate(() => window.GPP_APP.seriesCount('CRP'))
  t('PVSW', '一图秀随档案切换联动不串档（A→B→A 的 CRP 序列数变化一致）', crpA === 2 && crpB > crpA && crpBack === crpA, { A: crpA, B: crpB, back: crpBack })

  /* ---------- MT/C：指标卡 3D（records/metrics，B 档案） ---------- */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-b'; app.state.page = 'records'; app.state.sub.records = 'metrics'; app.render()
  })
  const mcard = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.mcard')]
    const heights = cards.map(c => c.getBoundingClientRect().height)
    const beforeN = document.querySelectorAll('.mcard *').length
    const target = cards[0]
    target.focus(); target.click()
    const afterN = document.querySelectorAll('.mcard *').length
    return {
      count: cards.length,
      minH: Math.min(...heights), maxH: Math.max(...heights),
      pressed: target.getAttribute('aria-pressed'),
      otherPressed: cards[1] ? cards[1].getAttribute('aria-pressed') : null,
      domBefore: beforeN, domAfter: afterN,
      focusKept: document.activeElement === target,
      inner3d: getComputedStyle(target.querySelector('.mcard-inner')).transformStyle,
      hasBack: !!target.querySelector('.mface.back')
    }
  })
  t('MT04a', 'B 档案指标卡网格非空（6 指标 4 组，且背面存在）', mcard.count >= 6 && mcard.hasBack, { count: mcard.count })
  t('MT07', '卡片定高 194±1 且同网格高度差 ≤1px', Math.abs(mcard.minH - 194) <= 1 && (mcard.maxH - mcard.minH) <= 1, { minH: mcard.minH, maxH: mcard.maxH })
  t('C11', '翻转中 DOM 节点数不变、焦点保持在同一按钮', mcard.domBefore === mcard.domAfter && mcard.focusKept, { before: mcard.domBefore, after: mcard.domAfter })
  t('C12', '单卡 aria-pressed=true 其他卡仍 false', mcard.pressed === 'true' && mcard.otherPressed === 'false', { pressed: mcard.pressed, other: mcard.otherPressed })
  t('MT08a', 'preserve-3d 内层', mcard.inner3d === 'preserve-3d', { style: mcard.inner3d })

  /* ---------- C 组：一图秀（labs/chart，B 档案）+ smoothPath ---------- */
  const sp = await page.evaluate(() => {
    const f = window.GPP_APP.smoothPath
    if (!f) return null
    const d = f([{ x: 0, y: 10 }, { x: 10, y: 30 }, { x: 20, y: 5 }, { x: 30, y: 12 }])
    return { has: !!f, startsM: d.startsWith('M'), hasC: d.includes(' C') }
  })
  t('CHART1', 'smoothPath 存在且输出 M…C…（Fritsch–Carlson 样条）', sp && sp.has && sp.startsM && sp.hasC, sp)
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-b'; app.state.page = 'labs'; app.state.sub.labs = 'chart'
    app.state.range = 'all'; app.state.picked = { 'CRP': true, '白细胞': true, '中性粒细胞': false, '体温': false, '白蛋白': false, '血钙': false }; app.state.showEpisodes = true; app.render()
  })
  const chart1 = await page.evaluate(() => {
    const svg = document.querySelector('#chart-panel svg.chart')
    if (!svg) return { pathCount: 0 }
    const paths = [...svg.querySelectorAll('path[fill="none"]')].map(p => p.getAttribute('d'))
    const fills = [...svg.querySelectorAll('path[fill="none"]')].map(p => getComputedStyle(p).fill)
    const labels = [...svg.querySelectorAll('text')].filter(x => /\d+(\.\d+)?\s?(mg\/L|×10⁹\/L|℃|g\/L|mmol\/L)/.test(x.textContent)).length
    return { rootClass: svg.getAttribute('class'), pathCount: paths.length, nonEmpty: paths.every(d => d && d.length > 10), fillNone: fills.every(f => f === 'none' || f === 'rgba(0, 0, 0, 0)'), paths, endpointLabels: labels }
  })
  t('C1a', '两条量纲差异大的序列都渲染为 path 且 fill=none、根节点 class=chart（先证非空）', chart1.rootClass === 'chart' && chart1.pathCount === 2 && chart1.nonEmpty && chart1.fillNone, { pathCount: chart1.pathCount, fillNone: chart1.fillNone, rootClass: chart1.rootClass })
  t('C5', '只标末点：每序列 1 个数值标签', chart1.endpointLabels === 2, { labels: chart1.endpointLabels })
  const pathsBefore = chart1.paths
  await page.evaluate(() => { const app = window.GPP_APP; app.state.showEpisodes = false; app.render() })
  const pathsAfter = await page.evaluate(() => [...document.querySelectorAll('#chart-panel svg.chart path[fill="none"]')].map(p => p.getAttribute('d')))
  await page.evaluate(() => { const app = window.GPP_APP; app.state.showEpisodes = true; app.render() })
  t('C4', '关闭发作带不改曲线（path[d] 逐项相等且非空）', JSON.stringify(pathsBefore) === JSON.stringify(pathsAfter) && pathsAfter.length > 0, { equal: JSON.stringify(pathsBefore) === JSON.stringify(pathsAfter) })
  /* C2：单点序列（A 档案体温只有 1 条） */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-a'
    Object.keys(app.state.picked).forEach(k => { app.state.picked[k] = false })
    app.state.picked['体温'] = true
    app.state.range = 'all'; app.render()
  })
  const single = await page.evaluate(() => {
    const svg = document.querySelector('#chart-panel svg.chart')
    if (!svg) return { paths: -1, circles: -1 }
    return { paths: svg.querySelectorAll('path[fill="none"]').length, circles: svg.querySelectorAll('circle').length }
  })
  t('C2', '单点序列：path=0、circle=1', single.paths === 0 && single.circles === 1, single)
  /* C3：空窗口空态（A 档案血钙在近 1 月为空） */
  await page.evaluate(() => {
    const app = window.GPP_APP
    Object.keys(app.state.picked).forEach(k => { app.state.picked[k] = false })
    app.state.picked['血钙'] = true
    app.state.range = '1m'; app.render()
  })
  const empty = await page.evaluate(() => ({
    text: document.querySelector('#chart-panel').innerText,
    pre: window.GPP_APP.seriesCount('血钙')
  }))
  t('C3', '空窗口有空态文案（前置：该序列在窗口内 0 条）', empty.pre === 0 && empty.text.includes('没有所选指标'), { pre: empty.pre, text: empty.text.slice(0, 30) })
  /* C8：时间窗联动（B 档案 CRP：全部 5 条 → 近 3 月 2 条） */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-b'
    Object.keys(app.state.picked).forEach(k => { app.state.picked[k] = false })
    app.state.picked['CRP'] = true
    app.state.range = 'all'; app.render()
  })
  const allN = await page.evaluate(() => window.GPP_APP.seriesCount('CRP'))
  await page.evaluate(() => { const app = window.GPP_APP; app.state.range = '3m'; app.render() })
  const w3m = await page.evaluate(() => window.GPP_APP.seriesCount('CRP'))
  await page.evaluate(() => { const app = window.GPP_APP; app.state.range = 'all'; app.render() })
  t('C8', '切近 3 月后点数减少（all=' + allN + '）', allN > w3m && w3m >= 1, { all: allN, win3m: w3m })

  /* ---------- 私密三出口（Q35，代码级：看板摘要 / 导出预览 / AI 上下文） ---------- */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-b'; app.state.page = 'dash'; app.render()
  })
  const priv = await page.evaluate(() => {
    const app = window.GPP_APP
    const dashText = document.querySelector('#main').innerText
    const prompt = app.aiPromptFor('labs')
    const line = app.privacyLine(app.profile().reports)
    return {
      dashExcludesPrivate: !dashText.includes('心理咨询小结'),
      dashShowsCount: dashText.includes('私密'),
      promptExcludesPrivate: !prompt.includes('2026-09-14') && prompt.includes('已排除私密'),
      line
    }
  })
  t('Q35a', '看板摘要与 AI 上下文排除私密记录（同一 sharedOnly 过滤）', priv.dashExcludesPrivate && priv.dashShowsCount && priv.promptExcludesPrivate, priv)
  const privAgg = await page.evaluate(() => {
    const app = window.GPP_APP
    const st = app.derivedStatus()
    const all = app.profile().flares
    const dashText = document.querySelector('#main').innerText
    return {
      nearCount: st.nearCount,
      sharedNear: all.filter(f => !f.private && new Date(f.start) >= new Date('2026-08-16')).length,
      hasPrivateNote: dashText.includes('未计入')
    }
  })
  t('Q35c', '私密发作不进状态卡聚合（nearCount 只算共享，且页内标注未计入）', privAgg.nearCount === privAgg.sharedNear && privAgg.hasPrivateNote, privAgg)
  await page.evaluate(() => { const app = window.GPP_APP; app.state.page = 'records'; app.state.sub.records = 'summary'; app.render() })
  const histBefore = await page.evaluate(() => history.length)
  await page.evaluate(() => document.querySelector('[data-action="pv-export"]').click())
  await page.waitForSelector('.pv-overlay:not([hidden])', { timeout: 3000 })
  const pv = await page.evaluate(() => {
    const o = document.querySelector('.pv-overlay')
    const r = o.getBoundingClientRect()
    return {
      visible: !o.hidden && r.height > window.innerHeight * 0.8,
      hasBack: !!o.querySelector('[data-pv="back"]'),
      hasClose: !!o.querySelector('[data-pv="close"]'),
      title: o.querySelector('.pv-title').textContent,
      bodyText: o.querySelector('.pv-body').innerText,
      hist: history.length,
      hash: location.hash
    }
  })
  t('A1/A10', '整页视图打开（高度≥80%视口、返回+关闭双入口、history+1）', pv.visible && pv.hasBack && pv.hasClose && pv.hist > histBefore, { title: pv.title, hist: pv.hist, hash: pv.hash })
  t('A9', '整页标题无「未命名」且与内容一致', pv.title.includes('导出预览') && !pv.title.includes('未命名'), { title: pv.title })
  t('Q35b', '导出预览排除私密原文并给出条数说明', !pv.bodyText.includes('心理咨询小结') && pv.bodyText.includes('未包含'), {})
  /* A5：滚动后打开、关闭后恢复 */
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 400))
  await page.setViewport({ width: 1280, height: 500 })
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.page = 'records'; app.state.sub.records = 'summary'; app.render()
    window.scrollTo(0, 160)
  })
  await new Promise(r => setTimeout(r, 200))
  await page.evaluate(() => document.querySelector('[data-action="pv-export"]').click())
  await page.waitForSelector('.pv-overlay:not([hidden])', { timeout: 3000 })
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 500))
  const a5 = await page.evaluate(() => ({ scroll: window.scrollY, closed: document.querySelector('.pv-overlay').hidden }))
  t('A2/A5', 'Esc 关一层且滚动位置恢复', a5.closed && Math.abs(a5.scroll - 160) <= 4, a5)
  await page.setViewport({ width: 1280, height: 860 })

  /* ---------- DEEP2：#page=labs 深链直达整页层（starter probe 契约） ---------- */
  await page.evaluate(() => { location.hash = '#page=labs' })
  await new Promise(r => setTimeout(r, 400))
  const deepPv = await page.evaluate(() => ({
    open: !document.querySelector('.pv-overlay').hidden,
    title: document.querySelector('.pv-title').textContent
  }))
  t('DEEP2', '#page=labs 深链直达「化验记录」整页层', deepPv.open && deepPv.title === '化验记录', deepPv)
  await page.evaluate(() => { window.GPP_APP.pv.stack = []; document.querySelector('.pv-overlay').hidden = true })

  /* ---------- 病理报告整页层（报告详情双入口之一；A 档案带共享病理报告） ---------- */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.profileId = 'demo-a'
    app.state.page = 'reports'; app.state.sub.reports = 'list'; app.render()
    const btn = [...document.querySelectorAll('[data-open="pathology"]')][0]
    if (btn) btn.click()
  })
  await page.waitForSelector('.pv-overlay:not([hidden])', { timeout: 3000 })
  const pathPv = await page.evaluate(() => {
    const o = document.querySelector('.pv-overlay')
    const title = o.querySelector('.pv-title').textContent
    const hasDrill = !!o.querySelector('.pv-body .pv-btn')
    const drill = o.querySelector('.pv-body .pv-btn')
    if (drill) drill.click()
    return { title, hasDrill }
  })
  await new Promise(r => setTimeout(r, 200))
  const pathPv2 = await page.evaluate(() => ({
    title: document.querySelector('.pv-title').textContent,
    crumb: document.querySelector('.pv-crumb').textContent
  }))
  t('PATH1', '病理报告整页层：标题「病理报告」+ 可下钻「报告原文」第三层', pathPv.title === '病理报告' && pathPv.hasDrill && pathPv2.title.includes('原文') && pathPv2.crumb.includes('病理报告'), { l1: pathPv.title, l2: pathPv2 })
  await page.evaluate(() => { window.GPP_APP.pv.stack = []; document.querySelector('.pv-overlay').hidden = true })

  /* ---------- agent-draft：只填草稿不发送（Q14/Q17/Q19） ---------- */
  await page.evaluate(() => { window.__msg__ = []; window.addEventListener('message', e => window.__msg__.push({ type: e.data && e.data.type, send: e.data && e.data.send })) })
  await page.evaluate(() => { const app = window.GPP_APP; app.state.profileId = 'demo-b'; app.state.page = 'labs'; app.state.sub.labs = 'chart'; app.render() })
  await page.click('[data-action="ai"]')
  const draft = await page.evaluate(() => ({
    paneVisible: !document.querySelector('#agent-pane').hidden,
    text: document.querySelector('#agent-input').value,
    sendDisabled: document.querySelector('.agent-foot button.primary').disabled,
    msgs: window.__msg__
  }))
  t('Q14', '页面「和 AI 讨论」打开演示面板并填入草稿', draft.paneVisible && draft.text.includes('和 AI 讨论本页'), { ok: draft.paneVisible })
  t('Q17', '草稿只填不发（发送键 disabled、无 postMessage、type 为 gpp:agent-draft 形态）', draft.sendDisabled && draft.msgs.length === 0, draft.msgs)
  t('Q19', '携带上下文不含判定词', !/诊断|分级|预后|建议|风险/.test(draft.text), { text: draft.text.slice(0, 60) })

  /* ---------- 晨审回归：设置弹层 / 临床四段 / 看板指标卡 / 指标体系 ---------- */
  await page.evaluate(() => { window.GPP_APP.state.page = 'dash'; window.GPP_APP.render() })
  await page.click('[data-action="settings"]')
  const cfg = await page.evaluate(() => ({
    open: document.querySelector('#dialog').open,
    tabs: [...document.querySelectorAll('[data-action="settings-tab"]')].map(b => b.textContent.trim()),
    mineru: document.querySelector('#dialog').innerText.includes('MinerU'),
    notConnected: document.querySelector('#dialog').innerText.includes('未接入')
  }))
  await page.evaluate(() => document.querySelector('[data-action="dialog-close"]').click())
  t('CFG1', '设置弹层打开且三 tab（工作区/MinerU/临床数据库），MinerU 未接入态如实', cfg.open && cfg.tabs.join('|') === '工作区|文档解析（MinerU）|临床数据库' && cfg.mineru && cfg.notConnected, cfg)
  await page.evaluate(() => { const a = window.GPP_APP; a.state.page = 'clinical'; a.state.sub.clinical = 'facts'; a.render() })
  const facts = await page.evaluate(() => ({ rows: document.querySelectorAll('#main tbody tr').length, confirmed: document.querySelector('#main').innerText.includes('已确认入库') }))
  t('CLIN0', '建档页：档案字段网格 + 已确认入库口径', facts.rows >= 4 && facts.confirmed, facts)
  await page.evaluate(() => { const a = window.GPP_APP; a.state.sub.clinical = 'search'; a.render() })
  /* CLIN3：多条件检索 + 排序不掺分 */
  const search = await page.evaluate(() => {
    document.querySelector('#trial-kw').value = '佩索利'
    document.querySelector('#trial-sort').value = 'title'
    document.querySelector('[data-action="trial-search"]').click()
    const res = document.querySelector('#trial-result')
    return { rows: res.querySelectorAll('tbody tr').length, kwRows: res.innerText.includes('佩索利'), noScore: !res.innerText.includes('符合度'), note: res.innerText.includes('不掺分数') }
  })
  t('CLIN3', '检索多条件（关键词过滤 + 排序），结果不掺分数', search.rows === 3 && search.kwRows && search.noScore && search.note, search)
  await page.evaluate(() => { const a = window.GPP_APP; a.state.sub.clinical = 'match'; a.render() })
  const match = await page.evaluate(() => {
    const txt = document.querySelector('#main').innerText
    return {
      cards: document.querySelectorAll('.match-card').length,
      score: txt.includes('登记字段符合度'),
      nm: /项对得上/.test(txt) || txt.includes('可对照项不足'),
      chain: txt.includes('证据链'),
      pool: txt.includes('候选池口径：已载 10（本地样例池）/ 返回 10 / 不是全库扫描'),
      sampleDate: txt.includes('样例日期 2026-11-14'),
      tier: txt.includes('分层'),
      noFake: !txt.includes('入选概率'),
      enroll: txt.includes('入排标准请到官方登记页核对')
    }
  })
  t('CLIN1', '匹配页：分数方块 + n/m 行 + 证据链 + 候选池口径（已载/返回/不是全库扫描/样例日期）+ 四档分层', match.cards >= 8 && match.score && match.nm && match.chain && match.pool && match.sampleDate && match.tier && match.noFake && match.enroll, match)
  /* 35 号纯函数：可对照不足 2 不给分；靶点不进分母（签名不收靶点） */
  const tm = await page.evaluate(() => {
    const M = window.GPPTrialMatch
    const rel = M.items({ title: '佩索利单抗治疗脓疱型银屑病（GPP）发作（样例）', studyType: '介入性' }, { type: 'interventional' })
    const irr = M.items({ title: '糖尿病足溃疡敷料研究（样例）', studyType: '观察性' }, { type: 'interventional' })
    const relScore = M.score(rel), irrScore = M.score(irr)
    const oneCmp = M.score(M.items({ title: '佩索利单抗（样例）', studyType: '介入性' }, { type: 'all' }))
    return {
      relScore, irrScore, oneCmp,
      relItems: rel.map(i => i.state).join(''),
      irrHard: irr.some(i => i.hard && i.state === '✕'),
      noTargetArg: M.items.length === 2
    }
  })
  t('CLIN2', '匹配纯函数：相关=可对照给分（高）、不相关=硬性✕（暂不分层）、可对照<2 不给百分数、签名不收靶点',
    tm.relScore.pct === 100 && tm.relScore.tier === '高' && tm.irrScore.pct === 0 && tm.irrScore.tier === '暂不分层' && tm.relItems.includes('✓') && tm.irrHard && tm.oneCmp.pct == null && tm.noTargetArg, tm)
  /* CLIN4/SAVED-ISO：收藏 saved_trial 按档案隔离；拒收零副作用 */
  await page.evaluate(() => {
    localStorage.clear()
    const a = window.GPP_APP
    a.state.profileId = 'demo-a'
    a.state.page = 'clinical'; a.state.sub.clinical = 'match'; a.render()
    document.querySelector('[data-action="trial-save"]').click()
  })
  const savedA = await page.evaluate(() => JSON.parse(localStorage.getItem('gpp-trial-saved-demo-a') || '[]').length)
  await page.evaluate(() => document.querySelector('[data-action="trial-reject"]').click())
  const afterReject = await page.evaluate(() => JSON.parse(localStorage.getItem('gpp-trial-saved-demo-a') || '[]').length)
  await page.evaluate(() => { const a = window.GPP_APP; a.state.profileId = 'demo-b'; a.render() })
  const savedB = await page.evaluate(() => JSON.parse(localStorage.getItem('gpp-trial-saved-demo-b') || '[]').length)
  await page.evaluate(() => localStorage.clear())
  t('CLIN4', '收藏 saved_trial 入本机、拒收零副作用（收藏数不变）', savedA === 1 && afterReject === 1, { savedA, afterReject })
  t('SAVED-ISO', '收藏按档案隔离（B 档案收藏为空）', savedB === 0, { savedB })

  /* ---------- TRIG1：诱因登记（B 多条 + 枚举 + 表单） ---------- */
  await page.evaluate(() => { const a = window.GPP_APP; a.state.profileId = 'demo-b'; a.state.page = 'flares'; a.state.sub.flares = 'trigger'; a.render() })
  const trig = await page.evaluate(() => {
    const app = window.GPP_APP
    return {
      rows: app.triggerLogOf().length,
      hasEnum: document.querySelector('#main').innerText.includes('停用激素') && document.querySelector('#main').innerText.includes('低钙'),
      hasForm: !!document.querySelector('#form-trigger'),
      noCause: !document.querySelector('#main').innerText.includes('因为…诱发')
    }
  })
  t('TRIG1', '诱因登记：B 档案多条、八值枚举可点、表单在、无因果提示', trig.rows >= 4 && trig.hasEnum && trig.hasForm && trig.noCause, trig)

  /* ---------- TILE1/MC1：看板指标卡与指标体系 ---------- */
  await page.evaluate(() => { const a = window.GPP_APP; a.state.page = 'dash'; a.render() })
  const tiles = await page.evaluate(() => ({ tiles: document.querySelectorAll('.stat-tile').length, metrics: (window.GPP_APP.DATA.metricDefs || []).length }))
  t('TILE1', '看板关键指标最近值卡 ≥5 张（6 指标目录）', tiles.tiles >= 5 && tiles.metrics === 6, tiles)
  await page.evaluate(() => { const a = window.GPP_APP; a.state.page = 'records'; a.state.sub.records = 'metrics'; a.render() })
  const mcards = await page.evaluate(() => ({ n: document.querySelectorAll('.mcard').length, groups: document.querySelectorAll('.metric-group').length }))
  t('MC1', '指标检测页指标卡 ≥6 张、分组 4（6 指标 4 组，按有数据渲染）', mcards.n >= 6 && mcards.groups === 4, mcards)

  /* ---------- PRIMER：疾病概要「?」双入口 + 四段 ---------- */
  await page.evaluate(() => { const a = window.GPP_APP; a.state.profileId = 'demo-a'; a.state.page = 'dash'; a.render() })
  const primerTriggers = await page.evaluate(() => ({
    n: document.querySelectorAll('[data-primer-open]').length,
    labeled: [...document.querySelectorAll('[data-primer-open]')].every(b => /定义/.test(b.getAttribute('aria-label') || '') && /趋势/.test(b.getAttribute('aria-label') || ''))
  }))
  t('PRIMER1', '「?」疾病概要双入口（顶栏 + 速览状态卡），aria-label 说明四段', primerTriggers.n === 2 && primerTriggers.labeled, primerTriggers)
  const pdata = await page.evaluate(() => {
    const d = window.DISEASE_PRIMER
    return { ids: d ? d.sections.map(s => s.id) : [], n: d ? d.sections.length : 0 }
  })
  t('PRIMER2', 'DISEASE_PRIMER 四段 id 顺序 definition/evidence/landscape/trend', pdata.ids.join(',') === 'definition,evidence,landscape,trend', pdata)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-primer-open]')][0]
    btn.click()
  })
  await new Promise(r => setTimeout(r, 300))
  const pOpen = await page.evaluate(() => {
    const el = document.getElementById('disease-primer')
    return {
      open: !!el && !el.hidden,
      sections: el ? el.querySelectorAll('.dp-section').length : 0,
      ids: el ? [...el.querySelectorAll('.dp-section')].map(s => s.dataset.dpSection) : [],
      srcLines: el ? el.querySelectorAll('.dp-src').length : 0
    }
  })
  t('PRIMER3', '同一 #disease-primer 整页打开，四段渲染且每段带来源行', pOpen.open && pOpen.sections === 4 && pOpen.ids.join(',') === 'definition,evidence,landscape,trend' && pOpen.srcLines === 4, pOpen)
  await page.evaluate(() => { window.DiseasePrimer.close() })
  await new Promise(r => setTimeout(r, 300))

  /* ---------- 晨审二轮回归：添加记录按钮 + 缺失表单 + 翻转双通道 ---------- */
  const addBtns = await page.evaluate(() => {
    const a = window.GPP_APP
    const out = {}
    for (const pg of ['flares', 'labs', 'treatment', 'visits', 'reports', 'mind']) {
      a.state.page = pg
      a.state.sub[pg] = ({ flares: 'flare', labs: 'list', treatment: 'infusion', visits: 'prep', reports: 'list', mind: 'feel' })[pg]
      a.render()
      out[pg] = document.querySelector('#main').innerText.includes('＋')
    }
    return out
  })
  t('ADD1', '六个可写页都有「＋添加记录」入口', Object.values(addBtns).every(Boolean), addBtns)
  const forms = await page.evaluate(() => {
    const a = window.GPP_APP
    const out = {}
    a.state.page = 'labs'; a.state.sub.labs = 'list'; a.render(); out.labs = !!document.querySelector('#form-lab')
    a.state.page = 'reports'; a.state.sub.reports = 'list'; a.render(); out.reports = !!document.querySelector('#form-report')
    a.state.page = 'mind'; a.state.sub.mind = 'feel'; a.render(); out.feel = !!document.querySelector('#form-feel')
    a.state.page = 'flares'; a.state.sub.flares = 'trigger'; a.render(); out.trigger = !!document.querySelector('#form-trigger')
    return out
  })
  t('ADD2', '化验/报告/感受/诱因录入表单齐（≤6 字段、三态保存）', forms.labs && forms.reports && forms.feel && forms.trigger, forms)
  const flip2 = await page.evaluate(async () => {
    const a = window.GPP_APP
    a.state.flipped = {}
    a.state.page = 'records'; a.state.sub.records = 'metrics'; a.render()
    const c = document.querySelectorAll('.mcard')[0]
    c.click()
    await new Promise(r => setTimeout(r, 700))
    return { pressed: c.getAttribute('aria-pressed'), cls: c.className.includes('flipped'), tf: getComputedStyle(c.querySelector('.mcard-inner')).transform }
  })
  t('FLIP2', '翻转双通道（aria-pressed + flipped class，终态 matrix3d 含 rotateY）', flip2.pressed === 'true' && flip2.cls && /matrix3d/.test(flip2.tf) && flip2.tf.includes('-1'), flip2)

  /* ---------- TASK1：速览「就诊前想问的事」读 A 档案 2 条待问 ---------- */
  await page.evaluate(() => { const a = window.GPP_APP; a.state.profileId = 'demo-a'; a.state.page = 'dash'; a.render() })
  const tasks = await page.evaluate(() => {
    const txt = document.querySelector('#main').innerText
    const pending = window.GPP_APP.profile().questions.filter(q => !q.answered).length
    return { hasSection: txt.includes('就诊前想问的事'), pending }
  })
  t('TASK1', '速览待问清单联动档案（A 档案 2 条待问）', tasks.hasSection && tasks.pending === 2, tasks)

  /* ---------- 版式硬项：页脚贴底 / [hidden] 生效 / 字号 12.5–15px ---------- */
  await page.evaluate(() => {
    if (!document.querySelector('#agent-pane').hidden) document.querySelector('[data-action="agent-hide"]').click()
  })
  const layout = await page.evaluate(() => {
    const footer = document.querySelector('.footer')
    const fb = footer.getBoundingClientRect()
    const gapAfter = document.documentElement.scrollHeight - (fb.bottom + window.scrollY)
    const paneHidden = getComputedStyle(document.querySelector('#agent-pane')).display === 'none'
    const bodyFs = parseFloat(getComputedStyle(document.body).fontSize)
    const noteFs = parseFloat(getComputedStyle(document.querySelector('.small-note')).fontSize)
    const headFs = parseFloat(getComputedStyle(document.querySelector('.page-head p')).fontSize)
    return { gapAfter, paneHidden, bodyFs, noteFs, headFs }
  })
  t('FOOT1', '页脚贴底（文档底与页脚底差 |gap| ≤2px）', Math.abs(layout.gapAfter) <= 2, layout)
  t('HID1', '[hidden] 属性生效（AI 面板隐藏时 display:none）', layout.paneHidden, layout)
  t('FONT1', '字号口径：正文 15px、小字 ≥12.5px 且 ≤15px', layout.bodyFs === 15 && layout.noteFs >= 12.5 && layout.noteFs <= 15 && layout.headFs >= 12.5 && layout.headFs <= 15, layout)

  /* ---------- Q5/SPLIT：AI 面板宽度 25–45% 可拖可收 ---------- */
  await page.evaluate(() => {
    const app = window.GPP_APP
    app.state.page = 'dash'; app.render()
    if (document.querySelector('#agent-pane').hidden) document.querySelector('[data-action="agent-toggle"]').click()
  })
  const topbar = await page.evaluate(() => {
    const ta = document.querySelector('.top-actions')
    const pane = document.querySelector('#agent-pane')
    const wa = document.querySelector('.app-body').getBoundingClientRect()
    const opened = !pane.hidden
    const w = pane.getBoundingClientRect().width / wa.width * 100
    return { order: [...ta.children].map(b => b.textContent.trim()).join('|'), widthPct: Math.round(w), opened, now: document.querySelector('#agent-splitter').getAttribute('aria-valuenow') }
  })
  t('Q4', '顶栏操作组顺序（资料目录→AI→设置→大字→?→版本）', /资料目录.*AI 对话.*设置.*大字 Aa.*\?.*v0/.test(topbar.order), topbar.order)
  t('Q5', 'AI 面板打开时宽度在 25–45%', topbar.opened && topbar.widthPct >= 25 && topbar.widthPct <= 45, { pct: topbar.widthPct })
  await page.focus('#agent-splitter')
  await page.keyboard.press('ArrowLeft')
  const split = await page.evaluate(() => {
    const spv = document.querySelector('#agent-splitter').getAttribute('aria-valuenow')
    return { now: Number(spv), ok: Number(spv) >= 25 && Number(spv) <= 45 }
  })
  t('SPLIT1', '分隔线键盘步进后仍在 25–45%', split.ok, split)
  await page.evaluate(() => document.querySelector('[data-action="agent-hide"]').click())

  /* ---------- Q26：390 宽无横向溢出（CDP） ---------- */
  const client = await page.target().createCDPSession()
  await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await new Promise(r => setTimeout(r, 300))
  const narrow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  await client.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewport({ width: 1280, height: 860 })
  await new Promise(r => setTimeout(r, 400))
  t('Q26', '390 宽无横向溢出（scrollWidth===clientWidth===390）', narrow.sw === 390 && narrow.cw === 390, narrow)

  /* ---------- WALL1：原件墙排除私密 ---------- */
  await page.evaluate(() => { const a = window.GPP_APP; a.state.profileId = 'demo-b'; a.state.page = 'reports'; a.state.sub.reports = 'wall'; a.render() })
  const wall = await page.evaluate(() => ({
    noPrivate: !document.querySelector('#main').innerText.includes('心理咨询小结'),
    count: document.querySelectorAll('.wall-item').length
  }))
  t('WALL1', '原件墙排除私密报告（B 档案 3 张共享墙卡）', wall.noPrivate && wall.count === 3, wall)

  /* ---------- 页面错误 ---------- */
  t('ERR', '无页面错误（pageerror/console.error）', errors.length === 0, errors.slice(0, 3))

  await browser.close()
  const fails = results.filter(r => !r.pass)
  console.log(`\nSUMMARY: ${results.length - fails.length}/${results.length} pass, ${fails.length} fail` + (fails.length ? ' → ' + fails.map(f => f.id).join(', ') : ''))
  process.exit(fails.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
