# M7 发布草稿（冻结待授权——未授权不得执行 tag/Release）

## tag
- tag 名：v0.2.0（指向 commit ad3030a 或更新）
- 标题：gpp-workbench v0.2.0 · 泛发性脓疱型银屑病工作台

## Release notes
泛发性脓疱型银屑病（GPP）患者工作台首个可用版本。

- 九线导航：速览 / 发作日志 / 化验与趋势 / 用药与输注 / 就诊准备 / 报告归档 / 生活与情绪 / 档案总览 / 临床研究
- 疾病概要整页面板（定义/医学资料规范和指南情况/目前治疗全景概要/发展趋势，四段带来源行）
- 两套合成示例档案；新建我的档案（is_demo=0 落 sqlite）；资料目录真入口（客户端+服务端双校验）
- 临床研究：35 号四段链路（建档/检索/匹配/收藏），候选池=真实快照 11 条（research/gpp；chictr_online/ictrp 通道失败如实记录，见 FAILED.md；CT.gov 独立口径 68 条另记未入池）；登记状态一律未核实，匹配不是入组资格
- 门禁：五件门禁 + probe-gpp-m2 56/56 + primer 10/10 + page-view 13/13 + test 35/35 全绿
- 已知缺口：0 患者访谈、0 临床审核（HVT-REVIEW 待补两层）；MinerU 未接入；V3 实机走查待用户重启 Desktop 后执行

## 附件
- release/xyb-community-gpp-workbench-0.2.0.tgz（sha256 见 release-notes 附 SHA256SUMS）
- sha256 生成命令：shasum -a 256 release/xyb-community-gpp-workbench-0.2.0.tgz

## CHANGELOG 发版段
已写入仓库 CHANGELOG.md 0.2.0 段。
