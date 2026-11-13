/* ui-parity：public/ 与 prototypes/v0.2 的移植一致性断言
 * 口径（scripts/migrate-public.mjs 定点移植）：
 *   - style.css / demo-data.js：与原型**逐字节相同**；
 *   - index.html / app.js：等于「原型 + 白名单替换点」（版本/构建占位符、开发版横幅、bootstrap 数据源块），
 *     除白名单外其余字符与原型一致——业务文件不改字符。
 * M0 阶段 prototypes/v0.2 尚未落位：文件齐才判，缺文件 SKIP 并打印原因
 * （M2 原型落位后自动生效；不许写死永远 pass）。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, expected, OUT, hasPrototype } from '../scripts/migrate-public.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BYTE_COPY = ['style.css', 'demo-data.js'];
const SRC = join(ROOT, 'prototypes/v0.2');

test('ui-parity: 原型目录齐才判（缺文件 SKIP 并打印原因，不写死 pass）', (t) => {
  if (!hasPrototype()) {
    t.skip(`SKIP：prototypes/v0.2 未落位（M0 骨架阶段 public/ 自身为唯一源；M2 原型落位后本测试自动生效，当前 public 四件：${FILES.join('/')}）`);
    return;
  }
  for (const f of FILES) {
    assert.ok(existsSync(join(SRC, f)), `原型缺 ${f}`);
    assert.ok(existsSync(join(OUT, f)), `public 缺 ${f}`);
  }
});

test('ui-parity: 纯复制文件与原型逐字节相同', (t) => {
  if (!hasPrototype()) { t.skip('SKIP：prototypes/v0.2 未落位（M2 生效）'); return }
  for (const f of BYTE_COPY) {
    const proto = readFileSync(join(SRC, f));
    const pub = readFileSync(join(OUT, f));
    assert.ok(proto.equals(pub), `public/${f} 与原型逐字节不一致`);
  }
});

test('ui-parity: index.html / app.js 等于「原型 + 白名单替换点」产物', (t) => {
  if (!hasPrototype()) { t.skip('SKIP：prototypes/v0.2 未落位（M2 生效）'); return }
  for (const f of FILES) {
    const pub = readFileSync(join(OUT, f), 'utf8');
    assert.equal(pub, expected(f), `public/${f} 与定点移植产物不一致（白名单之外被改动）`);
  }
});

test('ui-parity: app.js 只追加不修改（原型主体是产物的前缀）', (t) => {
  if (!hasPrototype()) { t.skip('SKIP：prototypes/v0.2 未落位（M2 生效）'); return }
  const proto = readFileSync(join(SRC, 'app.js'), 'utf8');
  const pub = readFileSync(join(OUT, 'app.js'), 'utf8');
  assert.ok(pub.length > proto.length, 'app.js 追加块缺失');
  assert.ok(pub.startsWith(proto.slice(0, Math.min(200, proto.length))), 'app.js 主体不是原型前缀');
});
