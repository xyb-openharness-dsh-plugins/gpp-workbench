/* 36 号 · 疾病概要数据（泛发性脓疱型银屑病 GPP）· 纯字面量，正则可扫
 * 0 临床审核：全部内容为待核占位（阈值【待核】），来源未取得原件的按二次来源标注。
 * 来源一律取 docs/SOURCES-LEDGER.md 的真实条目（S 编号写进 note）；未核实的如实标。
 */
window.DISEASE_PRIMER = {
  brand: 'GPP 工作台',
  name: '泛发性脓疱型银屑病',
  en: 'Generalized Pustular Psoriasis（GPP）',
  updated: '2026-11-14（0 临床审核 · 调研草稿口径 · 待晨审补原件核数）',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '银屑病是一种慢性皮肤病的大家族；GPP（泛发性脓疱型银屑病）是其中罕见的严重亚型：红斑基础上快速泛发的无菌性脓疱，常伴发热等全身症状。本段只做事实整理，不做诊断。',
      points: [
        'GPP 已列入国家卫生健康委等 6 部门 2023-09-20 公布的《第二批罕见病目录》（皮肤科罕见病）——这是中国官方定位。',
        '常见表现包括红斑基础上成批出现的无菌性脓疱、发热、乏力等；本台只记录你自己的经历，不据表现做判断。',
        '核心免疫通路研究多围绕 IL-36（IL36RN 等基因突变相关，二手综述口径）；基因检测是否做过，档案里只记有无，不记判读。',
        '患病率与患者数等流行病学数字，各来源口径差异大且未取得官方原件——本台不写任何数字。',
        '本台不区分你属于哪种银屑病亚型，只帮你把发作与缓解的时间线记清楚。'
      ],
      sources: [
        { org: '国家卫生健康委员会等 6 部门', doc: '《第二批罕见病目录》', version: '2023-09-20 公布', original: false, nolink: true, note: '目录原件未取得；人民网二手转载为 http 链接，按本台口径不直链（S04/S04b，未核实原件）' },
        { org: '国际银屑病理事会（IPC）', doc: 'GPP 国际共识定义与诊断标准', version: '2024', original: false, secondaryUrl: 'https://psoriasiscouncil.org/wp-content/uploads/2026/05/International-Consensus-Definition-and-Diagnostic-Criteria-for-Generalized-Pustular-Psoriasis-From-the-International-Psoriasis-Council.pdf', note: '未取得原件，据题录（S12，链接可公开访问但未打开核验）' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '下表是可查到的规范与指南入口。是否适用、适用哪一条，由医生判断；本台不把指南变成自测题。皮损评分工具（GPPGA/GPPASI）是医生评估用的研究工具，本台不做评分。',
      table: {
        head: ['资料', '发布方', '版本', '语言', '入口'],
        rows: [
          ['《中国银屑病诊疗指南》', '中华医学会皮肤性病学分会', '2023 版', '中文', { text: '医脉通指南库（需登录）', kind: 'link', url: 'https://guide.medlive.cn/guide_v2/1/29709' }],
          ['《脓疱型银屑病诊疗中国专家共识》', '中华医学会皮肤性病学分会银屑病专业委员会', '2022 版', '中文', { text: 'DOI 题录', kind: 'link', url: 'https://doi.org/10.35541/cjd.20210698' }],
          ['GPP 国际共识定义与诊断标准', '国际银屑病理事会（IPC）', '2024', '英文', { text: '理事会官网 PDF', kind: 'link', url: 'https://psoriasiscouncil.org/wp-content/uploads/2026/05/International-Consensus-Definition-and-Diagnostic-Criteria-for-Generalized-Pustular-Psoriasis-From-the-International-Psoriasis-Council.pdf' }],
          ['EADV S1 指南：Therapy of generalized pustular psoriasis', '欧洲皮肤病性病学会（EADV）', '2026', '英文', { text: '期刊全文', kind: 'link', url: 'https://onlinelibrary.wiley.com/doi/full/10.1111/ddg.70244x' }],
          ['GPPGA 医生整体评估工具', '题录（JEADV/BJD）', '2023', '英文', { text: '工具页', kind: 'link', url: 'https://eprovide.mapi-trust.org/instruments/generalized-pustular-psoriasis-physician-global-assessment' }],
          ['GPPASI 题录', 'JEADV', '2023', '英文', { text: 'DOI 题录', kind: 'link', url: 'https://onlinelibrary.wiley.com/doi/10.1111/jdv.18999' }]
        ]
      },
      points: [
        '中文规范以中国官方发布为准；本表只给入口，不摘要成「你该怎么做」。',
        '另有《中国银屑病生物制剂及小分子药物治疗指南（2024 版）》题录在册，本台未定位稳定公开入口，暂不列行（S08）。',
        '国际指南内容更新快，是否更新请以发布方页面为准；本台不替你判断版本新旧。'
      ],
      sources: [
        { org: '中华医学会皮肤性病学分会', doc: '中国银屑病诊疗指南（2023 版）', version: '2023-07', original: false, secondaryUrl: 'https://guide.medlive.cn/guide_v2/1/29709', note: '全文未取得（登录墙），按题录使用（S06）' },
        { org: '中华医学会皮肤性病学分会银屑病专业委员会', doc: '脓疱型银屑病诊疗中国专家共识（2022 版）', version: '2022', original: false, secondaryUrl: 'https://doi.org/10.35541/cjd.20210698', note: '全文未取得（付费墙），按题录使用（S07）' }
      ]
    },
    {
      id: 'landscape',
      title: '治疗全景',
      intro: '下面只列「医生在 GPP 中通常会谈到哪些方向」这一事实，不代表任何一项适合你；具体用药、剂量与疗程需要问你的医生。',
      groups: [
        { label: '传统系统治疗方向', points: ['阿维 A、甲氨蝶呤、环孢素等传统系统药物是常被谈到的方向之一（合成示例档案里出现的也是这一类）', '是否使用、如何调整，由医生决定'] },
        { label: '生物制剂方向', points: ['IL-36 受体抑制剂佩索利单抗在中国获批用于 GPP 发作（获批信息据企业官方报道与医保挂网资料交叉印证，NMPA 原件未取得——这一句需要问你的医生）', 'IL-17、IL-23 等其他靶点在银屑病整体中常被谈到；GPP 语境下的适用性由医生判断'] },
        { label: '外用与支持方向', points: ['外用药物、皮肤护理、水电解质与营养状态的监测等支持性方向常被谈到；具体以医生安排为准'] },
        { label: '随访与复查方向', points: ['血常规与炎症指标（白细胞、中性粒细胞、CRP）、体温、白蛋白、血钙是 GPP 随访常被谈到的复查项目【待核】；频率与项目以医生安排为准'] }
      ],
      points: [
        '本段各方向按受累器官与病情轻重排列（皮肤局部 → 系统炎症与全身状态 → 长期随访监测），是整理顺序，不代表任何一项适合你；具体选择需要问你的医生。',
        '发作可危及生命、需及时就医是来源一致的警示方向（原文以官方与指南为准）；本台不自行判断严重度。'
      ],
      sources: [
        { org: '中华医学会皮肤性病学分会银屑病专业委员会', doc: '脓疱型银屑病诊疗中国专家共识（2022 版）', version: '2022', original: false, secondaryUrl: 'https://doi.org/10.35541/cjd.20210698', note: '未取得原件，据题录；仅列方向不列方案（S07）' },
        { org: 'Romiti et al.', doc: 'GPP 综述', version: '2021', original: false, secondaryUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8799844', note: '二手-摘要（S16）；国际综述仅作方向参照' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '只写已经发生的事实，不预测。',
      points: [
        '2022-12，佩索利单抗（spesolimab）中国获批用于 GPP 的报道见勃林格殷格翰中国官网（企业官方一手；NMPA 原件未取得，多源交叉印证）。',
        '2023，佩索利单抗预防 GPP 发作的临床研究成果报道见同一官网；本台只登记报道存在，不做效果解读。',
        '2023 医保谈判周期，国家医保局挂网资料含佩索利单抗注射液条目（官方平台文件，未逐页核验）。',
        '截至 2026-11-14，ClinicalTrials.gov 以「generalized pustular psoriasis」检索到 68 项登记研究（API 结构化返回，本次调研唯一直接核验的数据源）；活跃数量另有约 20 项的二手转述口径（2026-02）。',
        '本台不预测任何治疗何时可用；可及性变化以官方发布为准。'
      ],
      sources: [
        { org: '勃林格殷格翰中国', doc: '圣利卓（佩索利单抗）中国获批/上市报道', version: '2022-12 报道', original: false, secondaryUrl: 'https://www.boehringer-ingelheim.cn/renleijiankang/leo-pharma', note: '企业官方一手（非 NMPA 原件），多源交叉（S02）；EFFISAYIL 2 预防发作报道同源（S03）' },
        { org: '国家医疗保障局', doc: '挂网资料：佩索利单抗注射液', version: '2023 医保谈判周期', original: false, secondaryUrl: 'https://www.nhsa.gov.cn/attach/Ypsn2023/YPSW202300192/YPSW202300192-W1(ppt).pdf', note: '官方平台文件，未逐页核验，按题录使用（S01）' },
        { org: 'ClinicalTrials.gov', doc: '登记条目检索：generalized pustular psoriasis', version: '2026-11-14 检索', original: false, secondaryUrl: 'https://clinicaltrials.gov/search?cond=Generalized%20Pustular%20Psoriasis', note: '登记平台入口，条目状态以官网为准（S10，API 结构化返回 68 项）' }
      ]
    }
  ]
}
