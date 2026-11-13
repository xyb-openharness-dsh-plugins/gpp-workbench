# PROGRESS · gpp-workbench（泛发性脓疱型银屑病 GPP）

- 当前里程碑：M0 进行中（认领四步完成，接线前置完成，文档九件/结构移植子代理运行中）
- 认领记录：2026-11-14 00:10 夜班代理无人值守认领，issue #76（claim 标签创建时已挂，/claim 后 bot 回执 ✅ 已挂 claimed），仓 xyb-openharness-dsh-plugins/gpp-workbench（私有）
- 选择理由：剩余未认领池 T0/T1 已被前几轮认领完（R2 非肿瘤线与 NCCN 线均无 T0/T1 剩余）；GPP 为发作性疾病，随访天然结构化（发作事件/体温/白细胞/CRP/GPPGA 评分/生物制剂输注/激素减量）；家族无脓疱型银屑病仓（天疱疮为桥粒芯蛋白自身免疫慢性病，机制与治疗线完全不同）；中国 2025 罕见病指南目录 #33；试验候选池真实存在（避免"相关 0"裁剪）
- 已完成：BACKLOG 实时核对（GPP 行仍 ⬜ 招募中）· issue #76 认领 + claimed 回执 · 私有仓创建（SSH clone，HTTPS 443 超时走 SSH 通道，路径类网络问题不计重试上限）· starter init 253 文件（config /tmp/gpp.config.json）· cordis.patch.yml config.root: !!js dshHomePath('gpp') · dsh/index.js 真读 config.root（apply 第二参数，家族教训 L75）· package.json dsh 块/repository 核对 · 线上宿主规范快照 reference/official/development-2026-10-27.md
- 子代理：文档九件（运行中）· 服务层结构移植（运行中，pericarditis 为底本，GPP 语义全量改写）· 医学约束调研（并发上限失败，待串行补跑）
- 闸口结论：无（未到闸口）
- 下一步：M0 收尾（文档九件合并 + 门禁切片绿 + commit）→ M1 三路调研 + DIFF-MATRIX 重名率实测（初设计 2/9≈22%）→ G1
- 阻塞：无

## 2026-11-14 02:40 · M0–M6 全链完成（夜班）

- 当前里程碑：M0–M6 完成；M7/M8 冻结草稿（docs/release-draft/）；D2 独立体检运行中
- 已完成：文档九件+医学十主题（MEDICAL-CONSTRAINTS-DRAFT/SOURCES-LEDGER S01–S39）· DIFF-MATRIX 重名率实测 22.2%（vs pericarditis 2/9）· G1/G2/G3/V1/V2 自动签认（docs/signoffs/，全部待晨审追认）· 原型 v0.2 八件套+README 截图墙 10 张真渲 · schema 0001 冻结 sha256 0272032a · research/gpp 快照 11 条三处对账 PASS（chictr_online/ictrp FAILED 如实记，CT.gov 独立口径 68 另记）· check-trial-matching 入链（T2b 修复：分层口径词+不是入组资格）· 版本 0.2.0 同源 · 装机 Desktop profile（bundles 76→77，装机副本八件齐）
- 实测数字：npm run check exit=0 · test 35/35 · probe-gpp-m2 56/56 · primer 10/10（--url 指向本仓 prototypes/v0.2）· page-view 13/13 · audit pass=true · check-profile 51/53（本仓全过；2 ✗ 属 find-museum/xyb-workbench）· AI 面板 grep：newSession=2/subscribe=2/ensureSession(=0/Boolean(conversation)=0
- 阻塞：V3 待人工（Desktop 会话早于装机，夜班不重启宿主）
- 下一步：D2 体检报告 → D3 验收自修 → M9 回流 → MORNING-REVIEW
