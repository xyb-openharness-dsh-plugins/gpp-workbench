# GPP 工作台硬约束快照（2026-11-14，命令/探针可验证口径）

> 本文件是 DEV-REQUIREMENTS 的当日快照：每条硬约束都挂验证命令或探针断言，audit「docs/强约束」项按此核对。

# DEV-REQUIREMENTS · 开发需求与硬约束（v0.1）

0 患者访谈 · 0 临床审核 · 夜班无人值守初稿（待晨审追认）

适用语境：本台为皮肤科发作性疾病型（泛发性脓疱型银屑病 GPP），夜间无人值守模式。反例与验收逐条可执行。

## 一、家族基线（不可让步）

1. 原型是唯一视觉与交互基准；令牌先于组件；正文 15px、行高 1.65–1.68、tabular-nums；按钮最小高 42–44px；断点 1180/900/600，390px 手机窄宽必验。
2. 三段外壳：原型声明条 → 侧栏 → 顶栏+页脚版本行；声明条不可省。
3. 统一类名 .card/.pill/.notice/.empty/.table-wrap/.section-title；阴影只给浮层。
4. 口径与数字同屏：仅回顾不解读 / 解读归医生 / 不同方法不合并。
5. 空态必须给下一步按钮；AI 输出恒为候选/预览。
6. 无障碍：a.skip、#main tabindex=-1、aria-current、图表 role=img、原生 details 折叠。

## 二、五件门禁（逐条对应实现位置）

| 门禁 | 位置 | 覆盖范围与验收 |
| --- | --- | --- |
| check-data-dir | `scripts/check-data-dir.mjs`（starter templates 下发，package.json `check` 链已接入） | 资料目录真入口校验：拒绝主目录/桌面/下载根/tmp；目录口径与设置页 workspace tab 一致 |
| check-trial-chain | `scripts/check-trial-chain.mjs`（已接入） | 临床试验四段链路完整：快照获取 → 登记浏览 → 条件匹配 → 就诊提问；断链即失败 |
| check-patient-create | `scripts/check-patient-create.mjs`（已接入） | demo 之外可新建患者并写入 sqlite；新建-写入-读回全链实测 |
| check-trial-snapshot | `scripts/check-trial-snapshot.mjs`（已接入，`--if-present`） | 快照来源/条数/日期/通道终态如实；FAILED 写 FAILED；获取成功≠已核实 |
| check-trial-matching | `templates/check-trial-matching.mjs`（starter 已下发；M4 接入试验匹配功能时追加进 `check` 链——当前 check 链未含，属待接入态，如实标注） | 匹配结果不替医生下判定；禁 match_score/入组概率类裸指数；「未核实」「以官方……为准」口径在位 |

说明：五件门禁在 M0 骨架期的现状如上（四件已接入 check 链、一件待接入），M1 起每轮提交 `npm run check` 全绿；门禁判据变更先改规范文档再改检查器。

## 三、三条不可让步（逐条对应实现位置）

1. **配置目录真入口**：设置页 workspace tab 是资料目录的唯一真入口（`dsh/index.js` 面板注册 + `lib/client.js` 目录校验逻辑），不允许任何绕过设置页直接写盘的旁路；check-data-dir.mjs 负责边界（拒绝主目录/桌面/下载根/tmp）。
2. **临床试验四段功能完整**：快照获取→登记浏览→条件匹配→就诊提问四段在 `dsh/index.js` 业务面板 + `lib/client.js` 数据层完整实现，前端不裁段；check-trial-chain.mjs 验链路、check-trial-snapshot.mjs 验快照真实性、check-trial-matching.mjs 验匹配语义（接入后生效）。
3. **demo 之外可新建患者写 sqlite**：`lib/client.js` 数据层必须支持非 demo 主体新建并写入 `workspace.sqlite`（subjects/profiles 表），check-patient-create.mjs 全链实测；不允许「只能跑 demo 数据」的半成品数据层。

## 四、非肿瘤语义（反例即失败）

- 禁止：D+N 天数、病期/分期、治疗线序、疗效、预后、生存期、复发风险评分、脓疱面积自动判定、「你已进入 X 期」。
- 必须用：缓解期第 N 天 / 发作中第 N 天 / 距上次发作 N 天 / 近 90 天发作次数；发作—缓解区间带；发热应对只呈现医生已确认的行动计划原话（「若出现 X 联系 Y」），不生成阈值提醒话术。
- 反例：「复发风险评分 3 分」「PASI 5 分属重度所以……」→ 任何页面出现即检查器失败。GPPGA/PASI 只登记医嘱数值与来源，不做严重度换算。

## 五、可回退默认值（夜间无人值守，待晨审追认）

| 决策点 | 默认值 | 状态 |
| --- | --- | --- |
| 服务主体 | GPP 患者本人及照护者（含照护者代记，不做患儿专用视图） | 待晨审追认 |
| 病程覆盖 | 确诊后全病程：发作期 + 缓解期随访 + 长期复发监测 | 待晨审追认 |
| MinerU | 未接入；记录导入降级为手工归档，界面如实标注 | 待晨审追认 |
| 品牌占位名 | 「小疱宝 PustPal」 | 待晨审追认 |
| 试验通道 | ClinicalTrials.gov v2 + ChiCtr 快照（四段功能完整，不裁剪） | 待晨审追认 |

每条默认值均在晨审时逐条追认；任何一条被推翻即改 SPEC/DEV-PLAN 同步修订。

## 六、数据与隐私

- 判读列 0；派生值读时算不落库；ORDER BY rowid、显式 null、in_use、分节 *_title、分类不进趋势。
- 私密三出口（看板摘要预览/导出/AI 上下文）共用同一过滤函数；由私密记录改写的问题同样算私密；页内「N 条中私密 M 条」。
- 更正=新增版本，每版本自带私密标记；体温/化验/评分等医学数值仅登记，一律「以医嘱与报告为准」。

## 七、AI 与宿主

- AI 入口唯一顺序（资料目录→设置→大字→AI→版本→?）；agent-draft 契约（34 号）：业务页 preventDefault + postMessage；lib/client.js 校验 event.source；对话草稿只填不发。
- 疾病概要 DP 模块：#disease-primer 整页浮层，四段固定顺序（定义→医学资料规范和指南情况→治疗全景→发展趋势），数据源 primer-data.js（window.DISEASE_PRIMER）；P1–P8 探针真跑在本仓原型上，不得拿 starter examples 顶替。
- apiBase 契约（02 号）：交界守卫、双形态回归、禁裸 throw。

## 八、提交前门禁

npm run check 全绿（SKIP 不计覆盖）；npm test 全过；npm run audit 数字照抄；dsh-wb-cli audit fail 不交付；版本号/CHANGELOG/README/截图四处同源；汇报三态（实测通过/骨架/未实现）。
