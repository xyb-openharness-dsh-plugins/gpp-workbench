# M8 BACKLOG 回填 PR 草稿（冻结待授权——未授权不得发 PR）

## 步骤（31 号口径：只改状态列）
1. gh repo clone xyb-openharness-dsh-plugins/.github /tmp/dotgithub && cd /tmp/dotgithub && git pull origin main（改前先 pull 最新 main）
2. 编辑 BACKLOG.md 罕见病表第 33 行（泛发性脓疱型银屑病）：
   - 状态列 `⬜ 招募中` → `🔵 v0.2.0（2026-11-14，M0–M6 完成：五件门禁全绿+三探针+装机 profile，依据=仓内 docs/signoffs/ 五份自动签认；V3 待人工）`
   - **只改状态列**，不动其他列
3. 分支：backfill/gpp-v0.2.0；commit message：`BACKLOG: #33 GPP → 🔵 v0.2.0（2026-11-14）`
4. gh pr create --repo xyb-openharness-dsh-plugins/.github --title 同上 --body 附 signoffs 清单与实测数字
5. 关联 issue #76 与仓 xyb-openharness-dsh-plugins/gpp-workbench

## 注意
- 状态行依据引用仓内自动签认（待晨审追认），不写"维护者已确认"
- 若维护者已把 #76 triage 过级别，PR 描述里如实引用其标签状态
