---
title: 来源｜我在开发全世界最好的电子书阅读器（公众号）
type: source
status: mature
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader]
tags: [阅读器, AI伴读, vibe-coding, 笔记]
---

# 来源｜我在开发全世界最好的电子书阅读器（公众号）

**一句话**：作者 Draco 不满意现有读书体验，用 Opus5.5 + Codex 在一个周末内 vibe-code 出自己的网页电子书阅读器 **Infinite Reader**，本篇是它的首个功能清单与迭代路线。

- 平台：微信公众号「Draco正在VibeCoding」· 原创 · 2026-10-30 18:57（北京）
- 原文：[mp.weixin.qq.com/s/AA3UeIBUYrJWwMr-dcy2AQ](https://mp.weixin.qq.com/s/AA3UeIBUYrJWwMr-dcy2AQ)
- 本地全文：[sources/2026-10-30-wechat-draco-ereader/article.md](../../sources/2026-10-30-wechat-draco-ereader/article.md)（10 张配图已本地化）
- 关联实体：[Infinite Reader](../entities/infinite-reader.md) · [Draco](../entities/draco.md)

## 核心论点

1. **三种阅读形态各有硬伤**：纸质书体感最好但笔记/地图无法数字化；电子书数字化但缺“进度把控感”、内容数字化不完善；而所有现成阅读器都不能改，所以只能自己造。
2. **阅读器应该“还原纸书 + 增强数字能力”**：3D 俯仰视角、拟真翻页、缩放；地图转 3D 地球仪、章节思维导图、AI 伴读。
3. **笔记要贴着正文**：inline note（行内批注）+ `#tag` 标签聚合。
4. **下一步是 Agent 主导阅读**：让 AI 在阅读中主动提问，走完 IPO（Input–Processing–Output），再加游戏化激励。

## 关键事实（原文可核对）

| 功能 | 原文描述 | 截图 |
|---|---|---|
| 俯仰视角 | 调整俯仰角度，看到已读/剩余部分厚度 | [图 1](../../sources/2026-10-30-wechat-draco-ereader/assets/img-01.png)、[图 2](../../sources/2026-10-30-wechat-draco-ereader/assets/img-02.png) |
| 翻页拟真 / 缩放 | “翻页拟真”“灵活 Zoom in/out” | [图 3](../../sources/2026-10-30-wechat-draco-ereader/assets/img-03.png) 为 32% 缩放视图 |
| 3D 地图 | 书中地图 → 可互动 3D 地球仪（产品内称 INFINITE ATLAS） | [图 4](../../sources/2026-10-30-wechat-draco-ereader/assets/img-04.png)、[图 5](../../sources/2026-10-30-wechat-draco-ereader/assets/img-05.png) |
| 思维导图 | 章节可生成思维导图，可全折叠/全展开 | [图 6](../../sources/2026-10-30-wechat-draco-ereader/assets/img-06.png) |
| AI 伴读 | AI Agent「Infinite」，底层 **Pi Agent + DeepSeek-V4.1-Flash-1017** | [图 7](../../sources/2026-10-30-wechat-draco-ereader/assets/img-07.png) |
| inline note | 批注直接放在内容中，多种手写字体/颜色 | [图 8](../../sources/2026-10-30-wechat-draco-ereader/assets/img-08.png) |
| #tag 标签 | 聚合同一部书中相同标签的笔记 | [图 9](../../sources/2026-10-30-wechat-draco-ereader/assets/img-09.png)、[图 10](../../sources/2026-10-30-wechat-draco-ereader/assets/img-10.png) |

## 可直接引用的原句

- “阅读纸质书体感最好，但是阅读过程中产生的各种划线和笔记无法被数字化……比如地图，印在纸上的黑白地图为什么不能变成3D的呢？”
- “最大的问题是，所有电子书阅读器都是别人开发的，我要添加功能是半点也不行啊 😂”
- “让 Opus5.5 打了个底儿把 UI 框架搭好，后续用 Codex……陆陆续续地把这个电子书阅读器的雏形勾勒出来了。”
- “实现由 Agent 为主导（引导）的阅读体验……从而实现读书的 IPO「I（input）-P（processing）-O（output）」的完整链路。”
- “工欲善其事必先利其器！”

## 读图补充（截图里能看到、正文没写的）

- 阅读界面是**双页对开 + 假书页材质**，底部工具条含目录、上一页/下一页、缩放百分比、单双页切换、全屏；右下角常驻「Infinite」入口。
- 截图中的书分别是《波斯之剑：纳迪尔沙与现代伊朗的崛起》和关于 Token 经济的书；后者带黄色荧光笔高亮，说明正文高亮已是可用功能。
- INFINITE ATLAS 页面标注 “Natural Earth · Mapzen terrain”“AI 识别：请结合原图核对”，说明地图匹配是 AI 辅助且**带不确定性提示**。
- 思维导图页显示 “已读取保存的导图 · 无新增 AI 调用”，意味着导图会被缓存复用（省 token）。
- AI 伴读回答末尾带编号引用（页/章节），可点击回到原文。
- 图片水印为 “公众号：Draco正在VibeCoding”，用户名标签显示 “draco hu”。

## 待验证 / 缺口

- 文中嵌有一段 00:18 的翻页演示视频，本次未下载视频本体，**“翻页拟真”暂无截图证据**（截图无法体现动画）。
- “全世界最好的电子书阅读器”是作者自述目标，非可验证结论。
- 文章称 AI 底层为 “Pi Agent + DeepSeek-V4.1-Flash-1017”，模型版本命名需与官方信息核对 **（待验证）**。

## 相关

- 同一产品的延伸阅读：[产品页 Infinite Reader](../entities/infinite-reader.md)
- 概念：[AI 伴读](../concepts/ai-reading-companion.md) · [行内批注](../concepts/inline-notes.md) · [vibe coding](../concepts/vibe-coding.md)
- 对照素材：[抖音｜打字背单词](../sources/douyin-typewords.md)
