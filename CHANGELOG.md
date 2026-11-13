# Changelog

## 0.2.0（2026-11-14，M0–M5 夜班无人值守）

- 新增：泛发性脓疱型银屑病（GPP）患者工作台骨架——九线导航（速览/发作日志/化验与趋势/用药与输注/就诊准备/报告归档/生活与情绪/档案总览/临床研究）
- 新增：原型 v0.2 八件套（两套合成档案 A/B、疾病概要整页面板四段、一图秀 FC 样条、治疗折叠卡、35 号试验四段、诱因登记、设置三 tab）
- 新增：schema 0001/0002 冻结（flare_events 第一实体、无判读列，sha256 0272032a）
- 新增：dsh 服务层（bootstrap/profile/subjects/root/trials 路由、资料目录服务端二次校验、demo 种子、MinerU 未接入态）
- 新增：research/gpp 快照 11 条（chinadrugtrials 10 + ctv 1；chictr_online FAILED / ictrp FAILED·TIMEOUT 如实记录，见 research/gpp/FAILED.md；CT.gov 独立口径 68 条另记未入池）
- 门禁：五件门禁（data-dir / trial-chain / patient-create / trial-snapshot / trial-matching）全部入链且绿；probe-gpp-m2 56/56、primer 10/10、page-view 13/13；test 35/35
- 已知缺口：0 患者访谈、0 临床审核（HVT-REVIEW B1/G1–G3/W1–W3/U1–U4）；MinerU 未接入；V3 实机走查待用户重启 Desktop
