/* 演示数据（唯一源）· 两组合成档案
 * A：刚确诊、记录少、多处未知；B：长期随访、脓疱发作多次、指标与用药都多。
 * 全部为合成示例，不冒充真实病历；页面不写死数字，一切从这里读。
 * 指标目录（唯一源）：白细胞/中性粒细胞/CRP 归 inflammation，体温归 vitals，
 * 白蛋白归 nutrition，血钙归 other；可比组 = method + org，不做跨组合并。
 * 本文件只放数据，不放逻辑；TODAY 冻结为 2026-11-14（宿主形态由 bootstrap 覆盖为当前日期）。
 */
window.DEMO_DATA = {
  TODAY: '2026-11-14',
  /* 指标元数据（唯一源）：app.js 与服务端 metric_defs 都从这里读 */
  metricDefs: [
    { key: '白细胞', db: 'wbc', title: '白细胞（WBC）', category: 'inflammation', unit: '×10⁹/L', color: '#2e7d5b', ord: 0 },
    { key: '中性粒细胞', db: 'neut', title: '中性粒细胞（NEUT#）', category: 'inflammation', unit: '×10⁹/L', color: '#4a7fb0', ord: 1 },
    { key: 'CRP', db: 'crp', title: 'C 反应蛋白（CRP）', category: 'inflammation', unit: 'mg/L', color: '#2f6f8f', ord: 2 },
    { key: '体温', db: 'temp', title: '体温', category: 'vitals', unit: '℃', color: '#8a5a44', ord: 3 },
    { key: '白蛋白', db: 'alb', title: '白蛋白（ALB）', category: 'nutrition', unit: 'g/L', color: '#b98a1f', ord: 4 },
    { key: '血钙', db: 'ca', title: '血钙（Ca）', category: 'other', unit: 'mmol/L', color: '#6b5b95', ord: 5 }
  ],
  metricGroups: [
    { key: 'inflammation', title: '炎症与血象', items: ['白细胞', '中性粒细胞', 'CRP'] },
    { key: 'vitals', title: '体征', items: ['体温'] },
    { key: 'nutrition', title: '营养（基线与随访）', items: ['白蛋白'] },
    { key: 'other', title: '其他（GPP 随访常见）', items: ['血钙'] }
  ],
  profiles: [
    {
      id: 'demo-a',
      name: '示例档案 A',
      tag: '刚确诊 · 记录少',
      isDemo: true,
      profile: {
        起病经过: '2026-10 全身泛发脓疱就诊，医生诊断 GPP（原文照录）',
        发作登记: '2026-10-08 起第一次记录的发作（更早经过未记，标注「未知」）',
        就诊医院: '示例市第一医院皮肤科',
        医生行动计划原话: '脓疱大面积增多或发热时，当天联系我（张医生）。'
      },
      flares: [
        { id: 'a-f1', start: '2026-10-08', end: '2026-10-20', note: '泛发脓疱伴低热，按医嘱用药后缓解（原文照录）', private: false },
        { id: 'a-f2', start: '2026-10-28', end: '2026-11-08', note: '再次发作，复诊调整方案后缓解', private: false }
      ],
      labs: [
        { id: 'a-l1', metric: 'CRP', date: '2026-10-09', value: 96, unit: 'mg/L', method: '免疫比浊', org: '示例市第一医院', private: false },
        { id: 'a-l2', metric: '白细胞', date: '2026-10-09', value: 13.5, unit: '×10⁹/L', method: '血常规 仪器法', org: '示例市第一医院', private: false },
        { id: 'a-l3', metric: '中性粒细胞', date: '2026-10-09', value: 10.2, unit: '×10⁹/L', method: '血常规 仪器法', org: '示例市第一医院', private: false },
        { id: 'a-l4', metric: '体温', date: '2026-10-09', value: 37.8, unit: '℃', method: '腋表', org: '自录', private: false },
        { id: 'a-l5', metric: '白蛋白', date: '2026-10-09', value: 36, unit: 'g/L', method: '溴甲酚绿法', org: '示例市第一医院', private: false },
        { id: 'a-l6', metric: '血钙', date: '2026-10-09', value: 2.18, unit: 'mmol/L', method: '偶氮胂Ⅲ法', org: '示例市第一医院', private: false },
        { id: 'a-l7', metric: 'CRP', date: '2026-11-02', value: 24, unit: 'mg/L', method: '免疫比浊', org: '示例市第一医院', private: false }
      ],
      treatments: [
        { id: 'a-t1', date: '2026-10-09', kind: '输注', name: 'spesolimab 输注（医生处方，合成示例）', note: '首次给药，仅登记经过；不做应答判定', private: false },
        { id: 'a-t2', date: '2026-11-03', kind: '复诊', name: '复诊（原文照录：继续目前方案，两周后复查血常规）', note: '', private: false }
      ],
      meds: [
        { id: 'a-m1', name: '阿维A', schedule: '每日（具体见处方）', since: '2026-10-09', note: '合成示例：剂量写在处方原件里，本台照录不换算' }
      ],
      questions: [],
      hospitals: [
        { id: 'a-h1', name: '示例市第一医院', dept: '皮肤科', contact: '电话见挂号单（未录入）', ver: 1 }
      ],
      reports: [
        { id: 'a-r1', title: '皮肤科门诊病历（2026-10-09）', date: '2026-10-09', kind: '病历', source: '原件已登记', finding: '全身泛发脓疱（医生报告原文）', private: false },
        { id: 'a-r2', title: '化验单（2026-10-09）', date: '2026-10-09', kind: '化验', source: '未取得原件', finding: '', private: false }
      ],
      docs: [
        { id: 'a-d1', name: '2026-10-09 门诊病历', date: '2026-10-09', type: '病历', state: '已登记' },
        { id: 'a-d2', name: '（日期未知示例）外院化验单', date: null, type: '化验', state: '待核对' }
      ],
      mind: {
        feel: [
          { d: '2026-11-09', text: '这次发作比第一次缓得快，但还是担心再犯。', author: '本人', private: false },
          { d: '2026-11-10', text: '（私密记录示例）夜里痒得睡不着，很烦躁。', author: '本人', private: true }
        ],
        family: [
          { d: '2026-11-10', text: '家人帮忙记了这次发作开始的那天。', author: '家属', private: false }
        ]
      }
    },
    {
      id: 'demo-b',
      name: '示例档案 B',
      tag: '长期随访 · 发作多次 · 记录多',
      isDemo: true,
      profile: {
        起病经过: '2024-03 首次全身脓疱发作，此后反复（合成示例）',
        发作登记: '发作次数由发作事件数据计算（见状态卡；私密发作不进聚合）',
        就诊医院: '示例市中心医院皮肤科；2025 起跨院随诊',
        医生行动计划原话: '若脓疱快速增多或发热超过 38℃，当天联系我或到急诊。（王医生 2026-11-02 门诊原话照录）'
      },
      flares: [
        { id: 'b-f01', start: '2024-03-10', end: '2024-04-02', note: '首次发作（时间按病历整理）', private: false },
        { id: 'b-f02', start: '2024-08-18', end: '2024-09-10', note: '第一次复发', private: false },
        { id: 'b-f03', start: '2024-12-30', end: '2025-01-16', note: '冬季复发，较长', private: false },
        { id: 'b-f04', start: '2025-08-14', end: '2025-09-05', note: '复发，加用药物后缓解（原文照录）', private: false },
        { id: 'b-f05', start: '2026-08-02', end: '2026-08-27', note: '复发；开始按次输注治疗（见治疗记录）', private: false },
        { id: 'b-f06', start: '2026-10-28', end: '2026-11-02', note: '最近一次发作，较短', private: false },
        { id: 'b-f07', start: '2026-09-10', end: '2026-09-12', note: '（私密示例）短暂脓疱增多，未就医，仅自己记', private: true }
      ],
      labs: [
        { id: 'b-l01', metric: 'CRP', date: '2024-03-11', value: 88, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: false },
        { id: 'b-l02', metric: '白细胞', date: '2024-03-11', value: 14.1, unit: '×10⁹/L', method: '血常规 仪器法', org: '示例市中心医院', private: false },
        { id: 'b-l03', metric: 'CRP', date: '2024-04-05', value: 21, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: false },
        { id: 'b-l04', metric: 'CRP', date: '2026-08-04', value: 52, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: false },
        { id: 'b-l05', metric: 'CRP', date: '2026-08-30', value: 13, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: false },
        { id: 'b-l06', metric: 'CRP', date: '2026-10-29', value: 38, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: false },
        { id: 'b-l07', metric: '白细胞', date: '2026-10-29', value: 9.8, unit: '×10⁹/L', method: '血常规 仪器法', org: '示例市中心医院', private: false },
        { id: 'b-l08', metric: '中性粒细胞', date: '2026-10-29', value: 6.7, unit: '×10⁹/L', method: '血常规 仪器法', org: '示例市中心医院', private: false },
        { id: 'b-l09', metric: '体温', date: '2026-10-28', value: 37.9, unit: '℃', method: '腋表', org: '自录', private: false },
        { id: 'b-l10', metric: '白蛋白', date: '2026-08-04', value: 33, unit: 'g/L', method: '溴甲酚绿法', org: '示例市中心医院', private: false },
        { id: 'b-l11', metric: '血钙', date: '2026-08-04', value: 2.11, unit: 'mmol/L', method: '偶氮胂Ⅲ法', org: '示例市中心医院', private: false },
        { id: 'b-l12', metric: 'CRP', date: '2026-09-14', value: 19, unit: 'mg/L', method: '免疫比浊', org: '示例市中心医院', private: true }
      ],
      treatments: [
        { id: 'b-t1', date: '2024-03-11', kind: '调药', name: '甲氨蝶呤起始（医生处方，合成示例）', note: '剂量与疗程见处方原件，本台不录判定', private: false },
        { id: 'b-t2', date: '2026-08-05', kind: '输注', name: 'spesolimab 输注（医生处方，合成示例）', note: '第 1 次输注', private: false },
        { id: 'b-t3', date: '2026-08-19', kind: '输注', name: 'spesolimab 输注（合成示例）', note: '第 2 次', private: false },
        { id: 'b-t4', date: '2026-09-02', kind: '输注', name: 'spesolimab 输注（合成示例）', note: '第 3 次', private: false },
        { id: 'b-t5', date: '2026-10-30', kind: '复诊', name: '复诊（原文照录：继续目前方案，下次复诊 2026-12）', note: '', private: false }
      ],
      meds: [
        { id: 'b-m1', name: '阿维A', schedule: '每日（具体见处方）', since: '2024-03-11', note: '合成示例' },
        { id: 'b-m2', name: '环孢素', schedule: '每日（具体见处方）', since: '2025-08-16', note: '合成示例；已按医嘱停用，停药日期见病历原件' }
      ],
      questions: [
        { id: 'b-q1', q: '输注治疗要坚持多久？什么时候复评？', addedOn: '2026-10-20', answered: false, private: false },
        { id: 'b-q2', q: '化验不同医院方法不一样，看趋势时怎么算可比？', addedOn: '2026-10-20', answered: false, private: false },
        { id: 'b-q3', q: '如果再次发作，是先联系您还是直接做检查？', addedOn: '2026-11-04', answered: false, private: false },
        { id: 'b-q4', q: '（私密示例）可以把激素的事写进病历吗？', addedOn: '2026-10-21', answered: false, private: true }
      ],
      hospitals: [
        { id: 'b-h1', name: '示例市中心医院', dept: '皮肤科', contact: '0XX-00000000（合成）', ver: 2 },
        { id: 'b-h2', name: '示例市第一医院', dept: '皮肤科（跨院随诊）', contact: '出处：2026-11 挂号单', ver: 1 },
        { id: 'b-h3', name: '示例大学附属医院', dept: '皮肤科（第二意见）', contact: '未录入', ver: 1 }
      ],
      reports: [
        { id: 'b-r1', title: '皮肤科门诊病历（2024-03-11）', date: '2024-03-11', kind: '病历', source: '原件已登记', finding: '全身泛发脓疱（报告原文）', private: false },
        { id: 'b-r2', title: '皮肤科门诊病历（2025-08-16）', date: '2025-08-16', kind: '病历', source: '原件已登记', finding: '脓疱较前增多（报告原文）', private: false },
        { id: 'b-r3', title: '化验单（2026-10-29）', date: '2026-10-29', kind: '化验', source: '未取得原件', finding: '', private: false },
        { id: 'b-r4', title: '（私密示例）2025 心理咨询小结', date: '2025-06-20', kind: '其他', source: '原件已登记', finding: '', private: true }
      ],
      docs: [
        { id: 'b-d1', name: '2024-03-11 门诊病历', date: '2024-03-11', type: '病历', state: '已登记' },
        { id: 'b-d2', name: '2024-03-11 化验单', date: '2024-03-11', type: '化验', state: '已核对' },
        { id: 'b-d3', name: '2025-08-16 门诊病历', date: '2025-08-16', type: '病历', state: '已核对' },
        { id: 'b-d4', name: '2026-10-29 化验单', date: '2026-10-29', type: '化验', state: '待核对' },
        { id: 'b-d5', name: '2026-11-02 随诊小结', date: '2026-11-02', type: '病历', state: '已登记' }
      ],
      mind: {
        feel: [
          { d: '2025-06-20', text: '反反复复，最难的是不知道这次会不会再犯。', author: '本人', private: false },
          { d: '2026-08-10', text: '开始输注治疗后，心里踏实了一点，但还是怕复发。', author: '本人', private: false },
          { d: '2026-11-03', text: '这次五天就缓解了，比以前快。', author: '本人', private: false },
          { d: '2026-10-25', text: '（私密记录示例）最近情绪很低落，不想让人知道。', author: '本人', private: true }
        ],
        family: [
          { d: '2026-08-06', text: '家人负责记住每两周的输注日期。', author: '家属', private: false },
          { d: '2026-10-29', text: '这次发作家人陪着去了急诊。', author: '家属', private: false }
        ]
      }
    }
  ]
}
