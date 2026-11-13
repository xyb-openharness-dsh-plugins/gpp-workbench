# PROGRESS · gpp-workbench（泛发性脓疱型银屑病 GPP）

- 当前里程碑：M0 进行中（认领四步完成，接线前置完成，文档九件/结构移植子代理运行中）
- 认领记录：2026-11-14 00:10 夜班代理无人值守认领，issue #76（claim 标签创建时已挂，/claim 后 bot 回执 ✅ 已挂 claimed），仓 xyb-openharness-dsh-plugins/gpp-workbench（私有）
- 选择理由：剩余未认领池 T0/T1 已被前几轮认领完（R2 非肿瘤线与 NCCN 线均无 T0/T1 剩余）；GPP 为发作性疾病，随访天然结构化（发作事件/体温/白细胞/CRP/GPPGA 评分/生物制剂输注/激素减量）；家族无脓疱型银屑病仓（天疱疮为桥粒芯蛋白自身免疫慢性病，机制与治疗线完全不同）；中国 2025 罕见病指南目录 #33；试验候选池真实存在（避免"相关 0"裁剪）
- 已完成：BACKLOG 实时核对（GPP 行仍 ⬜ 招募中）· issue #76 认领 + claimed 回执 · 私有仓创建（SSH clone，HTTPS 443 超时走 SSH 通道，路径类网络问题不计重试上限）· starter init 253 文件（config /tmp/gpp.config.json）· cordis.patch.yml config.root: !!js dshHomePath('gpp') · dsh/index.js 真读 config.root（apply 第二参数，家族教训 L75）· package.json dsh 块/repository 核对 · 线上宿主规范快照 reference/official/development-2026-10-27.md
- 子代理：文档九件（运行中）· 服务层结构移植（运行中，pericarditis 为底本，GPP 语义全量改写）· 医学约束调研（并发上限失败，待串行补跑）
- 闸口结论：无（未到闸口）
- 下一步：M0 收尾（文档九件合并 + 门禁切片绿 + commit）→ M1 三路调研 + DIFF-MATRIX 重名率实测（初设计 2/9≈22%）→ G1
- 阻塞：无
