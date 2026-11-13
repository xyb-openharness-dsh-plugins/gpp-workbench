# CLINICAL-DATA · 临床数据字典与医学边界（v0.1 草案）

0 患者访谈 · 0 临床审核 · 夜班无人值守初稿（待晨审追认）

**0 临床审核声明**：本文全部医学内容未经临床审核；阈值、频次、疗程一律【待核】或「以医嘱与报告为准」。表结构为设计初稿，**M3 冻结前可调**。

## 一、内容边界

- 病种语境：泛发性脓疱型银屑病（GPP）以「发作—缓解交替」为病程表达；界面只用「发作中第 N 天 / 缓解期第 N 天 / 距上次发作 N 天 / 近 90 天发作次数」这类已记录事实计数，不做严重度分期。
- 化验：白细胞、中性粒细胞、CRP、白蛋白、钙为主（其他检验可登记但不解读）；同屏口径「仅回顾，不解读」「不同方法/机构不合并」「解读归医生」。
- 皮损评分：GPPGA / PASI 仅登记医嘱给出的数值与日期，不换算、不判读、不给分期结论。
- 用药：生物制剂输注（药品名照抄处方原话）与传统系统药（激素/阿维A/环孢素/甲氨蝶呤等）起止与剂量——**仅记录，不建议**；界面不出现选药建议、剂量推荐、减量规则。
- 预后/生存：一律不出现。流行病学数字：不写死（未取得可信一手来源）。

## 二、表设计初稿（M3 冻结前可调）

### subjects / profiles（主体与档案）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | rowid |
| name | TEXT | 称呼（可匿名化） |
| birth_year | INTEGER | 显式 null 允许 |
| care_role | TEXT | self / caregiver（照护者代记标记） |
| is_demo | INTEGER | demo 主体标记；demo 之外可新建（check-patient-create 门禁） |
| in_use | INTEGER | 软使用标记 |
| created_at / updated_at | TEXT | ISO 8601 |

### flares（发作事件，第一实体）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| subject_id | INTEGER FK | |
| started_at | TEXT | 起始时间（日期或日期时间，按记录粒度） |
| ended_at | TEXT | 缓解时间；进行中=显式 null |
| duration_days | TEXT | 持续：**派生值读时算不落库**，此处不设列 |
| max_temp_c | REAL | 最高体温（自录/报告）；未知=显式 null；数值「以医嘱与报告为准」 |
| symptoms | TEXT | 伴随症状（原话记录） |
| visit_place | TEXT | 就诊去向：急诊/门诊/住院/未就医（原话） |
| doctor_actions | TEXT | 医生处理原话，只照抄 |
| is_private | INTEGER | 私密标记 |
| created_at / updated_at | TEXT | |

### labs（化验）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| subject_id / flare_id | INTEGER FK | flare_id 可空（非发作期化验） |
| metric | TEXT | wbc / neutrophil / crp / albumin / calcium / other |
| value | REAL | 数值 |
| unit | TEXT | 单位（照抄报告） |
| ref_range | TEXT | 参考范围（照抄报告，不解析成区间） |
| method | TEXT | 检验方法（可比组依据） |
| hospital | TEXT | 机构（可比组依据） |
| report_date | TEXT | 报告日期 |
| source | TEXT | 来源=手工归档（MinerU 未接入） |
| is_private | INTEGER | |

### medications（用药）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| subject_id | INTEGER FK | |
| category | TEXT | biologic_infusion（生物制剂输注）/ systemic（传统系统药） |
| drug_name | TEXT | 药品名照抄处方原话（如 spesolimab 类等，以处方为准） |
| dose | TEXT | 剂量原话（「以医嘱为准」，不做单位换算） |
| started_at / ended_at | TEXT | 起止；进行中 ended_at=显式 null |
| infusion_seq | INTEGER | 第几次输注（已记录事实计数，非推断） |
| flare_id | INTEGER FK | 可空：发作期用药挂事件 |
| is_private | INTEGER | |

### scores（皮损评分）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| subject_id | INTEGER FK | |
| scale | TEXT | gppga / pasi / other |
| total | TEXT | 总分原值（TEXT 存原话数值，不做数值化判定） |
| subscores | TEXT | 分项原话（如可得），JSON 串 |
| scored_at | TEXT | 评分日期 |
| source_quote | TEXT | 来源（医嘱/报告原话），必填 |
| is_private | INTEGER | |

### saved_trial（收藏的临床试验）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INTEGER PK | |
| subject_id | INTEGER FK | |
| registry | TEXT | ctgov_v2 / chictr |
| registry_id | TEXT | 登记号（以官方登记页为准） |
| title | TEXT | 标题原话 |
| status_text | TEXT | 状态原话（不做筛选资格判定） |
| snapshot_date | TEXT | 快照日期；获取成功≠已核实 |
| is_private | INTEGER | |

## 三、私密字段策略（private 三出口）

- 私密标记逐条（is_private），更正=新版本且每版本自带标记。
- **三出口共用同一过滤函数**：①看板摘要预览 ②导出 ③AI 上下文；由私密记录改写的问题清单条目同样算私密。
- 页内呈现「N 条中私密 M 条」；三出口过滤由 lib/client.js 单一函数实现，禁止各出口各写一套。

## 四、来源与未知值

- 来源=手工归档（MinerU 未接入，界面如实标注）；未来接入后按 18 号管道补来源分级。
- 未知值=显式 null，禁止用 0、空串或猜测值填充。
- ORDER BY rowid；分节标题列 *_title；分类不进趋势。
- 获取成功 ≠ 已核实：临床数据库快照按「原件 / 题录 / 二次来源 / 未取得」分级标注。
