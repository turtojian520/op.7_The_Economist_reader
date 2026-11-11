---
title: AI 伴读（AI Reading Companion）
type: concept
status: growing
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader]
tags: [AI, 阅读, agent, 引用]
---

# AI 伴读（AI Reading Companion）

**一句话**：AI 不是一个外挂聊天窗，而是坐在书页旁边的“伴读书童”——能定位原文、回答带出处、还能主动提问推进阅读。

## 素材中的实现（Infinite Reader）

- 名称：**Infinite**，产品内以浮层形式覆盖在书页上（[图 7](../sources/draco-ereader-wechat.md)）。
- 技术底座（作者自述）：**Pi Agent + DeepSeek-V4.1-Flash-1017**（模型版本命名 **待验证**）。
- 交互：问“这本书标题的含义”“纳迪尔沙的历史地位”等；回答末尾给出**可点击的引用编号**（页/序言/版权页/封面…），点击可回到原文。
- 相关能力：章节 → [思维导图](../entities/infinite-reader.md)（结果会被缓存，页面显示“无新增 AI 调用”）。

## 判断一个“AI 伴读”好不好，可以看四点

1. **是否引用原文**：回答必须能落到具体页/章节，否则就是通用问答套壳。
2. **是否贴着阅读流**：入口在书页上、不打断翻页，比“切到另一个 tab 问”更符合阅读状态。
3. **是否承认不确定**：Atlas 页面写“AI 识别：请结合原图核对”，是正确姿态。
4. **是否引导思考而非代劳**：作者下一步要做“Agent 主动提出有挑战性的问题”，走 IPO（Input–Processing–Output）闭环——这才是伴读区别于“代读”的地方。

## 风险与争议

- **代读风险**：AI 直接给结论，会削弱读者自己的加工过程；引用的价值就在于把结论拉回原文。
- **成本**：全书索引 + 问答的 token 成本不低；Infinite 用缓存导图来省调用，是一种工程折中。
- **可靠性**：引用页码可能错、地图匹配可能错，产品需要显式提示人工核对 **（待验证：实际错误率）**。

## 相关

- 实体：[Infinite Reader](../entities/infinite-reader.md) · [Draco](../entities/draco.md)
- 来源：[公众号｜做自己的电子书阅读器](../sources/draco-ereader-wechat.md)
- 概念：[行内批注](../concepts/inline-notes.md) · [vibe coding](../concepts/vibe-coding.md)
- 综合：[阅读理解 vs 记忆巩固](../synthesis/reading-vs-memorization.md)
