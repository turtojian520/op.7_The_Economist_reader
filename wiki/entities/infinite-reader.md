---
title: Infinite Reader（ereader.space）
type: entity
status: growing
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader]
tags: [产品, 电子书阅读器, AI伴读, 3D]
---

# Infinite Reader（ereader.space）

**一句话**：Draco 用 vibe coding 做的浏览器 EPUB 阅读器，主打“还原纸书体感 + 3D 地图 + AI 伴读”，站点 <https://ereader.space>，产品内 AI 助手名为 **Infinite**。

## 是什么

- 形态：网页版 EPUB 阅读器（官方表述），账号体系支持邮箱验证码 / Google 登录，可上传自己的 EPUB。
- 首次公开：2026-10-30 微信公众号文章 [我在开发全世界最好的电子书阅读器](../sources/draco-ereader-wechat.md)。
- 开发方式：Opus5.5 搭 UI 框架，随后用 Codex 迭代（见 [vibe coding](../concepts/vibe-coding.md)）。

## 功能版图

| 类别 | 功能 | 备注 |
|---|---|---|
| 纸书还原 | 3D 俯仰视角、拟真翻页、缩放 | 书页有厚度、中缝阴影；截图见 [图 1](../sources/draco-ereader-wechat.md) |
| 阅读增强 | INFINITE ATLAS（书中地图→3D 地球仪）、章节思维导图 | Atlas 标注 “AI 识别，请结合原图核对” |
| AI | Infinite 伴读：问书、答案带引用；章节导图；后续要做 Agent 主导提问 | 底层称 Pi Agent + DeepSeek-V4.1-Flash-1017 |
| 笔记 | inline note（手写字体/颜色）、`#tag` 标签聚合 | 见 [行内批注](../concepts/inline-notes.md) |

## 设计上的几个判断

1. **“所有阅读器都不能改”是立项理由**：作者认为现成产品无法按自己需求加功能，于是自研（原文：“所有电子书阅读器都是别人开发的，我要添加功能是半点也不行啊”）。
2. **AI 是阅读的一部分，不是外挂**：Infinite 直接覆盖在书页上提问，回答引用书内页码/章节，强调回到原文。
3. **AI 产出要有成本意识**：思维导图页显示“已读取保存的导图 · 无新增 AI 调用”，说明结果缓存复用。
4. **AI 结果保留不确定性**：地图匹配页明示 “AI 识别：请结合原图核对”。

## 路线图（作者自述）

- 由 Agent 主导阅读：AI 在阅读过程中提出有挑战性的问题，形成 IPO（输入-加工-输出）闭环。
- 游戏化：完成 AI 提出的书籍挑战 → 成就激励。

## 看得到的局限 / 待验证

- 文章里“翻页拟真”只有文字，截图无法验证动画质量；视频未归档。
- 站点（2026-11 采集时）**没有公开源码仓库**；同类产品 Book Space Time 的发布仓库声明“源码在私有仓库”（详见 [Draco](../entities/draco.md)）。
- 支持格式只有 EPUB，官方 FAQ 明确不支持 PDF。
- 站点上线时间很短（域名 2026-10-26 注册），功能稳定性、数据隐私政策都还需要观察 **（待验证）**。

## 相关

- 作者：[Draco](../entities/draco.md)
- 来源：[公众号文章摘要](../sources/draco-ereader-wechat.md)
- 概念：[AI 伴读](../concepts/ai-reading-companion.md) · [行内批注](../concepts/inline-notes.md)
- 对照产品：[TypeWords](../entities/typewords.md)（学习工具侧的另一个样本）
