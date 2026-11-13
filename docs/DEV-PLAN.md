# DEV-PLAN · 小疱宝 PustPal 泛发性脓疱型银屑病（GPP）工作台开发计划

版本：v0.1.0 · 2026-11-14 · 夜间无人值守开发代理
0 患者访谈 · 0 临床审核 · 夜班无人值守初稿（待晨审追认）

认领依据：[Issue #76](https://github.com/xyb-openharness-dsh-plugins/.github/issues/76)（已 claimed）· BACKLOG 罕见病管线 · T2 级 · 皮肤科发作性疾病型

## 一、领取理由

1. **认领 Issue #76：剩余池 T0/T1 已被认领完**。夜间无人值守窗口内可从剩余池认领的任务为 T2 级，GPP 在其中且无认领 issue、无同名仓（org 仓列表与 open issue 列表核对于 2026-11-14，未核实项以晨审复核为准）。
2. **发作性疾病随访天然结构化**：发作事件（起始/持续/最高体温/伴随症状/就诊去向）、白细胞/中性粒细胞/CRP/白蛋白/钙化验、GPPGA/PASI 评分登记、生物制剂输注与传统系统用药起止——与脚手架「档案 + 指标 + 事件」引擎直接对齐，非肿瘤表达（缓解第 N 天/距上次发作 N 天/发作—缓解区间带）与家族 1.3 节替换表一一对应。
3. **家族无同机制仓**：家族皮肤科仓 pemphigus-workbench 为表皮内水疱（棘层松解）机制，与 GPP 的中性粒细胞脓疱发作机制完全不同；心血管仓 pericarditis-workbench 提供发作事件结构参照但病种不同；无语义撞车风险。
4. **中国试验管线真实存在**：ClinicalTrials.gov v2 与 ChiCtr 上可检索到 GPP 相关登记项目（登记状态与详情以官方登记页为准，未核实项不写入指引文案），试验四段功能（快照获取→登记浏览→条件匹配→就诊提问）有真实数据底座，不做裁剪。

## 二、参考基准

| 基准 | 路径 | 拿什么 | 不拿什么 |
| --- | --- | --- | --- |
| pericarditis-workbench（本地仓，**移植样板=其本地仓结构底本**） | /Users/qinxiaoqiang/Downloads/pericarditis-workbench/ | 客户端链路（src→build→lib）、docs 九件结构与字段格式、发作—缓解第一实体与区间带结构、docs/02 apiBase 契约 | 心包炎病种语义、CRP/ESR 指标口径、其早版试验线裁剪决策 |
| 小粉宝 breast-cancer-workbench（成熟对比基准） | /Users/qinxiaoqiang/Downloads/breast-cancer-workbench/ | 首页 hero 与疾病介绍双入口、分类区块眉题、最近值/差值/次数/来源卡、最近报告表、390px 窄宽规则 | 肿瘤分期、治疗线序、疗效应答 |
| pemphigus-workbench（皮肤科兄弟仓） | /Users/qinxiaoqiang/Downloads/pemphigus-workbench/ | 皮肤科语境的皮损记录结构、就医信息卡 | 水疱/自身抗体随访语义（机制不同） |

跨仓只抄结构与字段格式，不抄内容；fork 复制明令禁止。

## 三、里程碑与闸口（M0–M9，按家族模板）

| 里程碑 | 内容 | 闸口 |
| --- | --- | --- |
| M0 骨架 | 本文档 + 文档九件 + 基线 check（四件门禁接入 check 链） | 骨架可装、check 全绿 |
| M1 调研与 SPEC | 一级页面重名率实测回填 DIFF-MATRIX；访谈待办启动 | G1 |
| M2 原型 v0.2 | prototypes/v0.2 + primer-data.js；PARITY.csv；X1–X4/A1–A10/P1–P8 探针 | G2 |
| M3 数据模型 | CLINICAL-DATA schema 冻结；subjects/flares/labs/medications/scores/saved_trial 落库 | G3 |
| M4 临床库 | ClinicalTrials.gov v2 + ChiCtr 快照；试验四段功能完整；check-trial-matching 接入 check 链 | 快照终态如实 |
| M5 开发版 | dsh/index.js 业务面板 + lib/client.js 数据层全量功能；五件门禁全绿 | V1 |
| M6 装机 | DSH Desktop 实机验证；390px 窄宽实测 | V2/V3 |
| M7 发布 | 夜间冻结为草稿 | 发布闸口 |
| M8 回填 | 截图/CHANGELOG/README 回填；夜间冻结为草稿 PR | — |
| M9 经验收敛 | 晨审追认后转正式版本 | 验收闸口 |

## 四、夜间无人值守默认值（待晨审追认）

| 决策点 | 默认值 | 可回退 |
| --- | --- | --- |
| 服务主体 | GPP 患者本人及照护者（含照护者代记） | 不做患儿代记专用视图 |
| 病程覆盖 | 确诊后全病程：发作期 + 缓解期随访 + 长期复发监测 | 不做首发急性期指导 |
| MinerU | 未接入；记录导入降级为手工归档，界面如实标注 | 按 18 号接入 |
| 品牌占位名 | 小疱宝 PustPal | 用户可改，全站仅一处 brand token |
| 试验通道 | ClinicalTrials.gov v2 + ChiCtr 快照；试验四段功能完整不裁剪 | 与 pericarditis 早版裁剪决策不同：本仓试验管线真实存在且无肿瘤式入排判读需求，完整链路可验 |

## 五、红线自查（每里程碑末跑）

私密三出口过滤一致；禁词 0（诊断/用药建议/预后/生存期/复发风险评分/匹配指数）；非肿瘤禁词 0（病期/线序/疗效/D+N）；GPPGA/PASI 只登记不判读；0 访谈与 0 临床审核如实标注；阈值一律「以医嘱与报告为准」；医生原话只照抄；不写死中国流行病学数字；未核实项写「未核实」。
