# GPP 2026 采集通道终态与失败记录（诚实台账）

快照：research/gpp/{manifest.json, trials-2026.jsonl, gpp_trials_2026.sqlite} · 快照日期见 manifest.snapshotDate
工具：unified-trial-mcp（MCP stdio，绝不自拼 URL）· 检索词 4 个（泛发性脓疱型银屑病 / generalized pustular psoriasis / pustular psoriasis / 脓疱型银屑病）

## 合并后计数
- **11 条**（合并前 11 条；bySource：chinadrugtrials 10、ctv 1）
- 同登记号合并，其余并排保留来源；status_note 一律「登记状态，未核实」

## 逐通道终态（2026-11-14 实测）
| 通道 | 终态 | 说明 |
| --- | --- | --- |
| chinadrugtrials（药物临床试验登记平台） | SUCCESS | 4 个检索词中 2 个命中（8+10 条，去重后 10） |
| ctv（本地全文索引） | SUCCESS/NO_RESULTS 混合 | 本地索引未同步的记录不可见（coverage 自述），仅 1 条 |
| chictr_online（中国临床试验注册中心在线） | **FAILED** | 本轮未取得数据；不冒充"已查过" |
| ictrp（WHO ICTRP） | **FAILED / TIMEOUT** | 英文词 TIMEOUT、宽词 FAILED；上游静默缺口已知 |
| xyb_chinadrugtrials_archive | NO_RESULTS | 离线档案无本病覆盖 |
| chictr_pancreatic_archive | NEEDS_SETUP | 离线语料仅胰腺癌覆盖（未配置） |

## 独立口径（不在 unified 通道内，不计入 11 条）
- ClinicalTrials.gov api/v2（query.cond=generalized pustular psoriasis，countTotal）= **68 条**（2026-11-14 实测，见 docs/SOURCES-LEDGER.md）；本地 ctv 通道只有本地索引子集，故以独立口径记录候选池真实规模。

## 口径声明
- 「命中少」≠「没有研究」：检索词命中才进池；chictr_online 与 ictrp 失败意味着这两路登记可能未被纳入，工作台卡头写「已载 11 / 返回 M / 不是全库扫描 + 快照日期」。
- 登记状态 ≠ 有效 ≠ 安全 ≠ 可入组；本台不做入组资格判定。
