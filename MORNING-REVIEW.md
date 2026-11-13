# MORNING-REVIEW · gpp-workbench 夜班（2026-11-14 00:05–02:40）

## 一、一句话结论
到 **M0–M6 全链完成 + D1/D2/D3 交付流水线走完 + M9 回流**：G1/G2/G3/V1/V2 自动签认（全部待晨审追认），V3 装机加载与实机点击待人工（Desktop 会话早于装机，夜班不重启宿主）；M7/M8 冻结草稿备妥未发。

## 二、原型审查入口
- 打开方式：`python3 -m http.server 8899 --directory prototypes/v0.2` → http://127.0.0.1:8899/index.html（或 npm start -- --root <资料目录> 看开发版）
- 截图：docs/screenshots/v0.2-01…10（playwright 真渲 10 张：看板/AI 面板/一图秀/发作带/指标翻转/折叠收展/primer 整页/整页视图/临床检索）
- 清单：probe-gpp-m2 56/56 · probe-disease-primer 10/10 · probe-page-view 13/13（--url 均指向本仓 prototypes/v0.2）

## 三、自动签认清单（全部待晨审追认）
G1（重名率 22.2% 实测）· G2（原型 56/56）· G3（schema 0272032a）· V1（0.2.0→0.2.1 版本同源+audit pass）· V2（装机 bundles 76→77+装机副本核验）——docs/signoffs/ 五件；D2 体检四态 45 通过/9 失败/1 待人工（P0=0，3×P1 已于 D3 修复并全量复跑绿）。

## 四、待用户决策项（默认值，DEV-REQUIREMENTS §五）
1. 服务主体=GPP 患者本人及照护者；病程覆盖=确诊后全病程（发作期+缓解期随访）
2. MinerU 未接入（记录导入降级手工归档）
3. 品牌占位名=「GPP 工作台 / PustPal（P2 建议）」
4. 试验通道=unified-trial-mcp 四通道 + CT.gov v2 独立口径（68 条未入池，是否补采待定）
5. M7 tag/Release 与 M8 BACKLOG PR：草稿在 docs/release-draft/，**未授权不发**
6. V3：请完整退出并重开 DSH Desktop → 新建会话 → 确认「泛发性脓疱型银屑病工作台 v0.2.1」→ 点「AI 对话」「配置目录」「新建我的档案」三条

## 五、消耗
- 时长：约 2 小时 35 分（00:05–02:40）
- token：客户端可见数据未取得（子代理合计约 6,700 万字符级 token，按任务通知回执累计）

## 六、未验证与异常
1. V3 实机走查：未验证（宿主加载、三条点击、真机截图）
2. verify-desktop-load 的「宿主已加载」结论为**误报**：harness/gpp 的 sqlite 由 D2 体检开库验证产生（01:41=D2 起跑时刻），非宿主运行痕迹——已回流 L114
3. 外部通道：chictr_online FAILED、ictrp FAILED/TIMEOUT（不冒充查过，FAILED.md 留痕）；NMPA 原件 HTTP 412 未取得（二手多源交叉核实佩索利单抗 IV 2022-12 获批）
4. 网络路径类：GitHub HTTPS 443 超时 1 次（换 SSH 通道解决，不计重试上限）；医学调研子代理并发上限失败 1 次（slot 空出后补跑成功）
5. check-profile 51/53：2 条 ✗ 属 find-museum / xyb-workbench（AI 面板契约违规，非本仓），晨审可安排独立修复轮
