---
title: 行内批注（Inline Notes）
type: concept
status: growing
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader]
tags: [笔记, 标注, 设计]
---

# 行内批注（Inline Notes）

**一句话**：把批注直接放在正文里、贴着被批注的句子，而不是集中到一个侧栏或独立笔记 App——让“想法”和“原文”永远在一起。

## 素材中的形态

Infinite Reader 的笔记系统（[图 8](../sources/draco-ereader-wechat.md)）：

- **inline note**：高亮段落后就地展开批注，支持**多种手写字体与颜色**，作者形容“指点江山激扬文字，感觉自己好似金圣叹”。
- **`#tag` 标签系统**：给笔记打标签，按标签聚合同一部书/跨书的笔记（[图 9](../sources/draco-ereader-wechat.md)、[图 10](../sources/draco-ereader-wechat.md)）。标签聚合页显示“2 条笔记 · 仅当前书籍 · 按原文顺序”，每条可“回到原文”。
- 截图里还能看到正文的黄色荧光笔高亮与紫色段落高亮——高亮与笔记是两种不同粒度的标注。

## 为什么这个设计值得注意

1. **降低记录摩擦**：不用切窗口、不用建新文档，想法发生在阅读现场。
2. **保留上下文**：脱离原文的笔记会变成“看不懂的摘抄”；行内批注天然带前后文。
3. **标签即第二次组织**：写的时候不分类，之后用 `#tag` 聚类，符合“先记录后整理”的个人知识管理习惯。
4. **对 AI 友好**：行内结构（段落 + 批注 + 标签）比自由文本更容易被检索和喂给 [AI 伴读](../concepts/ai-reading-companion.md)。

## 对比其他方案（本 wiki 的推断）

| 方案 | 优点 | 缺点 |
|---|---|---|
| 行内批注（本素材） | 上下文完整、摩擦低 | 笔记多了会挤占版面 |
| 侧栏批注（Kindle/微信读书式） | 版面干净 | 与原文分离，需要来回跳 |
| 独立笔记 App | 结构化、可复用 | 割裂阅读流，容易断更 |

> 上表为基于素材的设计推断，非产品实测对比 **（待验证）**。

## 相关

- 实体：[Infinite Reader](../entities/infinite-reader.md)
- 来源：[公众号｜做自己的电子书阅读器](../sources/draco-ereader-wechat.md)
- 概念：[AI 伴读](../concepts/ai-reading-companion.md)
- 综合：[阅读理解 vs 记忆巩固](../synthesis/reading-vs-memorization.md)
