#!/usr/bin/env node
/**
 * 随包文件不得含未替换占位符（V1 判据：tgz 占位 = 0）
 *
 * 模板来源：2026-11-13 从 myeloma-workbench 回收（该仓 check 链实测拦下过一次）。
 * 接入：复制进项目 scripts/check-placeholder-free.mjs，并挂进 check 链。
 *
 * 为什么单列：脚手架模板里带着 <slug> / {{name}} 一类占位符，初始化漏替换时
 * 语法照样过、pack 照样成功，装到宿主才会看到 `@{{scope}}/{{name}}` 这种字符串。
 *
 * 判据：package.json 的 files 白名单 + dsh/ + lib/ 下的文本文件，逐个匹配占位符模式，命中即红。
 * 用法：
 *   node scripts/check-placeholder-free.mjs .
 *   node scripts/check-placeholder-free.mjs . --self-test   # 临时造一个占位符文件，闸门必须报 FAIL
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { tmpdir } from 'node:os'

const ROOT = resolve(process.argv[2] || '.')
const SELF_TEST = process.argv.includes('--self-test')

const PATTERNS = [
  [/\{\{\s*[a-zA-Z_][a-zA-Z0-9_.-]*\s*\}\}/g, '双花括号占位符 {{name}}'],
  [/__[A-Z][A-Z0-9_]{2,}__/g, '双下划线占位符 __NAME__'],
  [/<slug>/g, '初始化占位符 <slug>'],
  [/<\s*项目名\s*>/g, '初始化占位符 <项目名>'],
  [/TODO\s*[:：]\s*(项目|病种|替换|填)/g, '未落地的 TODO'],
]

/* 家族注入面白名单（不是模板遗留）：这些双下划线令牌是本仓**设计上的注入点**，
 * 分别由构建期（scripts/build-client.mjs 注入 __PANEL_LAYOUT__/__AGENT_PANE__/__VERSION__）
 * 与服务期（dsh/server.js injectTokens 注入 __API_BASE__/__VERSION_DISPLAY__/__BUILD_DATE__）
 * 替换成真值；令牌形态正确性由 check-public-tokens.mjs 与 test/version-inject.test.mjs 单独把关。
 * 白名单内的命中不算「未替换占位符」；白名单之外的 __NAME__ 仍然报红。 */
const INJECTION_TOKENS = new Set([
  '__API_BASE__', '__VERSION__', '__VERSION_DISPLAY__', '__BUILD_DATE__',
  '__PANEL_LAYOUT__', '__AGENT_PANE__',
])

const isInjectionToken = (hit) => INJECTION_TOKENS.has(hit)

const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.json', '.html', '.css', '.yml', '.yaml', '.md', '.txt', '.patch'])

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (TEXT_EXT.has(extname(name))) out.push(full)
  }
  return out
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const roots = new Set(['dsh', 'lib'])
for (const entry of pkg.files || []) {
  const clean = String(entry).replace(/\/$/, '')
  if (clean.includes('*') || clean.includes('.')) continue
  roots.add(clean)
}

let files = []
for (const rel of roots) files = files.concat(walk(join(ROOT, rel)))

let injected = null
if (SELF_TEST) {
  const dir = mkdtempSync(join(tmpdir(), 'ph-'))
  injected = join(ROOT, 'dsh', '__self_test_placeholder.mjs')
  writeFileSync(injected, "export const name = '{{project_name}}'\n")
  files.push(injected)
  rmSync(dir, { recursive: true, force: true })
}

const hits = []
for (const file of files) {
  let body
  try { body = readFileSync(file, 'utf8') } catch { continue }
  for (const [re, label] of PATTERNS) {
    const m = (body.match(re) || []).filter((hit) => !isInjectionToken(hit))
    if (m.length) hits.push(`${file.replace(ROOT + '/', '')}: ${label} → ${m[0].slice(0, 40)}`)
  }
}

if (injected) rmSync(injected, { force: true })

if (hits.length) {
  console.error('✗ 随包文件含未替换占位符：')
  for (const h of hits.slice(0, 20)) console.error('  ' + h)
  console.error(`  → 共 ${hits.length} 处；占位符必须由初始化流程替换干净`)
  if (SELF_TEST) { console.log('自测通过：注入的占位符被闸门抓到'); process.exit(0) }
  process.exit(1)
}

console.log(`✓ 随包文件占位符 = 0（扫描 ${files.length} 个文件 / ${PATTERNS.length} 条模式）`)
if (SELF_TEST) { console.error('自测失败：注入占位符后闸门仍全绿，等于没有闸门'); process.exit(1) }
