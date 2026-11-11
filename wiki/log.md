# 日志

> append-only。格式：`## [YYYY-MM-DD] 类型 | 标题`，便于 `grep "^## \[" log.md | tail -5`。

## [2026-11-09] scaffold | 初始化 LLM Wiki
- 采用 [nashsu/llm_wiki](https://github.com/nashsu/llm_wiki) 的「原始素材 / wiki / schema」三层结构。
- 新建：`AGENTS.md`（schema）、`sources/README.md`、`wiki/`（index、log、overview、sources、entities、concepts、synthesis）、`scripts/verify_sources.py`。

## [2026-11-09] ingest | 我在开发全世界最好的电子书阅读器
- source: `sources/2026-10-30-wechat-draco-ereader/`（公众号「Draco正在VibeCoding」，2026-10-30；ego-browser 采集）
- 素材：全文 1 篇 + 10 张配图（已本地化）+ 元数据/哈希；嵌入视频仅记录元数据。
- 新增页面：
  - `wiki/sources/draco-ereader-wechat.md`
  - `wiki/entities/infinite-reader.md`、`wiki/entities/draco.md`
  - `wiki/concepts/ai-reading-companion.md`、`wiki/concepts/inline-notes.md`、`wiki/concepts/vibe-coding.md`
- 关键事实：Infinite Reader 的 3D 书页/Atlas 地图/思维导图/Infinite 伴读（Pi Agent + DeepSeek-V4.1-Flash-1017）/inline note + #tag；后续路线为 Agent 主导的 IPO 阅读与游戏化。

## [2026-11-09] ingest | 【012期】别再死记硬背了！打字背单词效率直接翻倍，开源免费
- source: `sources/2026-11-07-douyin-typewords/`（抖音 @猫吃小鱼，2026-11-07；ego-browser 短链跳转 + MP4 下载 + ffmpeg 抽帧）
- 素材：视频 1 个、抽帧 9 张、拼图 1 张、页面截图、页面文本/RENDER_DATA、元数据与哈希。
- 新增页面：
  - `wiki/sources/douyin-typewords.md`
  - `wiki/entities/typewords.md`、`wiki/entities/maochixiaoyu.md`、`wiki/entities/dumate.md`
  - `wiki/concepts/typing-based-learning.md`、`wiki/concepts/ai-as-tool-router.md`
  - `wiki/synthesis/reading-vs-memorization.md`（跨素材综合）
- 关键事实：TypeWords = zyronon/TypeWords（Vue / GPL-3.0 / 11,669 stars，2026-11-09）；玩法为打字式背单词 + 词库 + 导入文章；视频用百度搭子找工具并公开提示词。

## [2026-11-09] update | 抖音来源登录态补采与数据校正
- 登录 ego-browser 后重新采集 `sources/2026-11-07-douyin-typewords/`：
  - 互动数据：点赞 185 / 评论 3 / 收藏 128 / 分享 25（此前 meta description 的“2396 个喜欢”实为作者累计获赞，已更正为 2397）。
  - 评论区：3 条全部抓取（含作者回复）。
  - 作者主页：粉丝 265 / 累计获赞 2397 / 作品 18；确认为「开源工具安利」001–012 期系列。
  - 新增素材：`assets/author-page.png`、`assets/video-page-stats.png`、`raw/video-page-loggedin.json`、`raw/author-page.json`（截图已裁剪掉账号个人信息）。
- 更新页面：`wiki/sources/douyin-typewords.md`、`wiki/entities/maochixiaoyu.md`、`wiki/entities/dumate.md`、`wiki/concepts/ai-as-tool-router.md`。
- 校验：`python3 scripts/verify_sources.py` → 24 个文件全部通过。

## [2026-11-09] lint | 首次体检
- 页面互链：所有页面均有入链/出链，无孤儿页。
- 图片：wiki 中引用的本地图片路径均存在（`sources/**/assets/`）。
- 待补充：AI 阅读器横向对比、TypeWords 实测、学习效果证据（两个素材均为体验陈述）。

## [2026-11-09] ingest | 别搞 AI 个人知识库了，真的没用
- source: `sources/2026-11-09-wechat-ai-knowledge-base/`（用户粘贴的公众号正文；无原始链接/署名/日期）
- 处理：按用户要求做**去口语化**整理 → `article.md`；原文逐字保留在 `raw/original-pasted.txt`；改写范围与未改动项记录在 `meta.json`。
- 新增页面：
  - `wiki/sources/wechat-ai-knowledge-base.md`
  - `wiki/entities/karpathy.md`
  - `wiki/concepts/llm-wiki-pattern.md`、`wiki/concepts/knowledge-base-write-permissions.md`
  - `wiki/synthesis/karpathy-vs-one-hand-signoff.md`
- 关键事实：两个库（我的/AI 的）+ AI 可读不可写；Karpathy LLM Wiki 三层（raw/wiki/schema）；作者加强版（一手/加工/索引 + 人签核）。
- 待核对：来源称“Karpathy 的库 100 篇、40 万字”，一手 gist 表述为“约 100 个来源、数百个页面”；“95%”“几十亿美金证伪”为作者断言。

## [2026-11-09] query | 生成 Economist Reader 上下文英语学习 PRD
- 用户目标：兴趣驱动地阅读《经济学人》，结合划线、选词选句翻译、兴趣分类、漏读推荐与语境拼写，持续提升英语能力。
- 来源：`sources/2026-10-30-wechat-draco-ereader/`、`sources/2026-11-07-douyin-typewords/`；知识库素材用于补充人的判断与 AI 草稿归属设计。
- 新增页面：`wiki/synthesis/economist-context-learning-prd.md`。
- 更新页面：`wiki/index.md`。
- 设计提案与素材事实分开；全部来源能力列出 P0/P1/P2 映射，学习效果、用户水平、排序权重与复习规则标明待验证；内容供给是推荐落地的前置依赖。
- 未修改原始素材与 schema。

## [2026-11-09] lint | PRD 新增后的链接、格式与素材校验
- `python3 scripts/lint_wiki.py`：断链、页面格式、索引检查均通过，0 个问题；PRD 有索引入链与相关页出链。
- `python3 scripts/verify_sources.py`：元数据中登记的 26 个文件 SHA-256 全部通过，0 个失败。
- 本次未进行全库缺失概念或过期结论的语义审计；PRD 的产品假设与学习效果保留待验证标记。

## [2026-11-09] query | 按知识库素材增强 PRD 的读书与学习笔记设计
- 用户补充：笔记方面参考 `sources/2026-11-09-wechat-ai-knowledge-base/` 的建议。
- 回读正文、原有写入权限概念和综合页；将 S3 从补充归属参考提升为正式需求依据。
- 更新页面：`wiki/synthesis/economist-context-learning-prd.md`（v0.2）、`wiki/index.md`。
- 新增设计：我的库/AI 工作区、一手/加工/索引职责、可选读书与学习笔记模板、逐项签核与版本绑定、差异保留、拒绝/撤回、自动回顾及权限验收。
- 产品内人工签核不改变仓库 schema；原始素材与 AGENTS.md 未修改。

## [2026-11-09] lint | PRD v0.2 笔记机制更新校验
- `python3 scripts/lint_wiki.py`：链接、页面格式、索引均通过，0 个问题。
- `python3 scripts/verify_sources.py`：登记的 26 个素材文件哈希全部通过。
- 文本复核：来源分工、能力映射、数据对象、发布验收均已纳入 S3 签核机制；没有将产品签核要求扩展为仓库 schema 修改。

## [2026-11-09] update | 实现旁读 Margin 核心交互原型与三期本地期刊接入
- 用户要求：按 PRD 制作阅读、选词翻译、拼写、笔记签核原型；参考指定设计集合，首版后使用 Hallmark 优化；采用引用聊天的本地 PHP 方案。
- 接入来源：只读 `/Users/qinhao/Documents/calibre_config/` 内 2026-11-07、2026-10-24、2026-10-03 三期 periodical.epub；共 225 个目录条目（222 个正文、3 个图片图表页），原文件 SHA-256 未变。
- 实现：`prototype/`，React + Vite、Apache + PHP-FPM + 独立 MariaDB；详见 `prototype/README.md`、`prototype/docs/design-references.md`、`prototype/qa/verification.md`。
- 翻译与整理明确标为本地预置演示，未接在线 LLM；原始笔记、候选草稿与已签核整理分开保存。
- 检查：生产构建、PHP 语法、接口签核边界、拼写记录与浏览器核心流程通过；Hallmark 五路由八宽度检查为 0 FAIL、0 WARN、2 WAIVED，保留非阻断 NOTE。
- 更新页面：PRD 链接实现说明；根 README 增加原型入口。原始 sources 与 AGENTS.md 未修改。

## [2026-11-09] lint | 原型交付前检查
- Wiki 相对链接、页面格式和索引检查通过（0 个问题）；26 个登记素材文件哈希全部通过。
- 三期输入 EPUB 哈希未变；图表页原图补齐。Hallmark 窄屏截图已人工查看，API 测试记录与原型边界已写入 `prototype/qa/verification.md`。
- 只清理本次创建的已知测试记录，期刊目录和正文保留；未进行全库过期结论的语义审计。

## [2026-11-09] update | 每道词汇练习增加查看答案
- 三种练习模式增加查看/收起答案，答案不自动填入；换词隐藏，同词切换模式保留已查看标记。
- PHP 答题记录增加 `revealed`，查看后按辅助作答统计，不计入无提示首答正确。
- 验证：生产构建、PHP 语法、浏览器揭示/收起/切换/计分及数据库落盘通过；练习页八宽度检查 0 FAIL、0 WARN。
- 独立测试词与测试作答已清理，用户原有数据保留；说明更新于 `prototype/README.md` 和 `prototype/qa/verification.md`。原始素材与 schema 未修改。

## [2026-11-09] update | 发布旁读 Margin 到 ChatGPT Sites（仅所有者）
- 用户要求托管第一版，并明确选择先仅自己可见，之后再邀请指定的人；未开放公共访问、未添加访问者、未发送邀请。
- 分享版源码：`sites/margin-reader-share/`；站点身份：该目录 `.openai/hosting.json`；发布记录：`sites/margin-reader-deployment.json`。
- 地址：https://margin-economist-reader.hybrid-klvvc-7155.chatgpt.site；Sites 原生私有部署返回 succeeded。
- 适配：保留三期 225 个文章/图表条目及阅读、查词、拼写、查看答案和笔记签核流程。学习记录改存访问者各自浏览器；未上传本地 PHP/MariaDB、私人笔记、答题记录或本机文件路径。
- 验证：5 项浏览器操作层测试、生产构建、浏览器端到端与重载保存通过。原本地 PHP 版本继续独立运行，原始素材及 schema 未修改。

## [2026-11-10] update | 接入 Magpie DeepSeek，完善线上查词与翻译
- 用户要求：完善翻译、词典等功能，所需 API 使用 Magpie 中的 DeepSeek。
- 只读 Magpie DeepSeek 配置并验证真实调用；密钥转为 Sites runtime secret，未写入代码、浏览器存储或构建包，未修改 Magpie 配置。
- 线上实现：选词的中文语境义、词形与搭配、近义词说明、英文词典和音标、英美音朗读、独立单词/短语搜索；选句只翻译选区，提供结构解释、复制与失败重试。
- 原型从纯静态迁移为 Worker + 静态资源；英文词典标明 Free Dictionary API 来源，DeepSeek 中文解释及生成例句单独标识。
- 本次读取到站点已为 public，保留其现有范围；付费接口要求所有者登录邮箱匹配，匿名不调用 DeepSeek。私人学习记录继续保存在各自浏览器，未发送私人笔记给模型。
- 验证：10 项测试通过，真实单词/句子/短语 API 与浏览器流程通过；已扫描构建包无真实密钥；Sites 版本 2 发布 succeeded，线上 runtime 确认已配置 DeepSeek。
- 部署记录：`sites/margin-reader-deployment.json`；线上说明与上游依据：`sites/margin-reader-share/README.md`。原始 sources 与 AGENTS.md 未修改；本地 PHP 原型保留原状。

## [2026-11-10] update | 完善线上查词登录提示与音标选择
- 将 DeepSeek 登录入口移至查询结果顶部，匿名查询英文词典后可直接进入登录。
- 修正英文词典优先返回后缀残片时的音标选择，保留完整候选音标；补充对应验证。
- 10 项测试、构建与密钥扫描通过；Sites 版本 3 已发布 succeeded，访问范围及 API 所有者限制保持不变。
- 更新发布记录：`sites/margin-reader-deployment.json`；原始素材与 schema 未修改。

## [2026-11-10] update | 分享访客免登录使用站主 DeepSeek API
- 用户明确要求：持有链接的其他人可使用站主 API 查词与翻译，无需登录 ChatGPT。
- 移除后端所有者邮箱白名单和前端登录入口；删除 runtime 的 `AI_ALLOWED_EMAILS`，DeepSeek 密钥继续仅在服务端 secret 中。
- 保留选区原文校验、长度限制、来源检查与查询缓存；匿名调用按边缘提供的 IP 每实例每分钟 30 次新查询限流，实例整体每分钟最多 120 次，缓存命中不占新调用次数。
- 12 项测试、构建和源码/构建密钥扫描通过；线上词义查询成功，明确省略 cookie 的匿名选句翻译返回 200、DeepSeek 译文，界面无登录入口。
- Sites 版本 4 发布 succeeded，公开访问范围不变；部署记录与说明已更新。私人学习记录仍存于各自浏览器；原始 sources、schema 和本地 PHP 原型逻辑未修改。

## [2026-11-11] lint | GitHub 公开仓库初始化前检查
- 素材完整性：26 个文件校验通过，未修改 sources。
- Wiki 体检：断链、页面格式、索引检查共 0 个问题。
- 版本管理：新增根目录忽略规则与 docs/git-workflow.md；排除本地数据库、密钥、依赖及生成缓存，保留 Sites 独立仓库元数据。

## [2026-11-11] query | 原刊图表是否在阅读页面体现
- 检查本地与分享版目录、导入脚本、阅读组件及图片样式；查看日本地震地图原图。
- 结论：三期各有一个含 4 图的纯图片经济数据页；78 篇正文文章含多图，但普通文章组件只显示首图，未保留段落间图文顺序。
- 新增页面：wiki/synthesis/economist-chart-display-audit.md；更新 index。此次未实测线上页面，未修改产品实现与原始素材。

## [2026-11-11] update | 两版按原文位置完整呈现原刊图表
- 回读三期 EPUB，新增有序图文 blocks；保留全部正文及段落 ID，两版完整显示 358 个图片引用。
- 图片保持完整比例、不裁切；支持模态放大、两倍查看、滚动细节、原图链接、Esc 关闭与焦点返回。
- 新增原 EPUB 图文顺序与图片字节核对脚本、分享版回归测试与浏览器验证记录；原始 sources 与 schema 未修改。
- 更新图表核查综合页、index 及两版 README。
- 分享站第 7 版发布 succeeded，保留公开访问范围；线上确认地图位于 p1 与 p2 之间且原图加载成功。部署记录见 sites/margin-reader-deployment.json。
