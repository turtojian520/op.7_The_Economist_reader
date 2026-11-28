---
title: 总览｜AI 时代的阅读、学习与知识库
type: overview
status: growing
updated: 2026-11-16
sources: [2026-10-30-wechat-draco-ereader, 2026-11-07-douyin-typewords, 2026-11-09-wechat-ai-knowledge-base, 2026-11-16-notebooklm-build-in-public-workshop]
tags: [overview]
---

# 总览｜AI 时代的阅读、学习与知识库

**当前判断（4 个素材，2026-11-16）**：
本 wiki 关注的其实是同一条链路上的三段：**把内容读进来**（AI 阅读器）、**把学过的东西留下来**（打字式练习）、**把留下来的变成自己的判断**（知识库写入权限）。三个素材分别对应其中一段，共同点是——**AI 不抢流程，只补流程**；而真正稀缺的始终是“人自己的判断”。

新增导师谈话把这条产品链带入同伴共学：计划于 12 月 1 日用[旁读 Margin](entities/margin-reader.md) 展示真实开发过程，并通过动手实践和交流获得成就感。[活动方案](synthesis/build-in-public-workshop-2026-12-01.md) 据此设计“体验—提问—改动—验证—后续公开记录”；这是提案，学习与情绪效果尚未验证。依据：[谈话摘要](sources/dawu-build-in-public-workshop.md)。

## 本 wiki 覆盖什么

- **电子书阅读器 / 阅读体验**：3D 书页、翻页、地图 Atlas、思维导图、笔记系统、AI 伴读。
- **语言学习 / 背单词**：打字式记忆、词库、自建文章、学习数据。
- **AI 知识库方法论**：raw/wiki/schema 三层、写入权限、人工签核、记账与判断的分工。
- **AI 工作流**：AI 编程（vibe coding）、AI 作为工具路由器。

## 已收录素材（4）

| 素材 | 类型 | 提供的事实 | 页面 |
|---|---|---|---|
| 我在开发全世界最好的电子书阅读器（公众号，2026-10-30） | 一手产品自述 + 10 张截图 | Infinite Reader 的功能、技术底座、路线图 | [来源页](sources/draco-ereader-wechat.md) |
| 【012期】打字背单词（抖音，2026-11-07） | 工具演示视频 + 9 帧 | TypeWords 的玩法、词库、开源信息 | [来源页](sources/douyin-typewords.md) |
| 别搞 AI 个人知识库了，真的没用（公众号，用户提供，2026-11-09） | 观点文章（已去口语化） | 两个库 + 三层 + 签核；Karpathy LLM Wiki 的转述与加强 | [来源页](sources/wechat-ai-knowledge-base.md) |
| 11 月 16 日导师生涯指导谈话（NotebookLM） | 媒体抽取转录的活动相关摘录 | 12 月 1 日活动时间、受众、共创目标、产品演示与组织分工；没有按音频复核 | [来源页](sources/dawu-build-in-public-workshop.md) |

## 核心结论

1. **AI 不抢流程**：最好的 AI 功能都“贴”在用户已有动作上（书页上的问答、按空格继续的单词卡、写入前的一次签核）。
2. **引用与权限是可信度的两根支柱**：AI 阅读产品靠“带页码引用 + 请核对提示”，知识库靠“AI 可读不可写 / 人签核”。
3. **“读完 → 记住”仍是断层**：阅读器把输入做到极致，记忆仍靠专门工具（见[综合页](synthesis/reading-vs-memorization.md)）。
4. **知识库真正保住的是判断归属**：素材可以自动化，判断不能外包；记账交给 AI，判断留给自己（见[写入权限](concepts/knowledge-base-write-permissions.md)）。
5. **个人开发者的两种活法**：vibe coding 让一个人能做重体验产品（闭源），开源工具则用分发换用户。
6. **把开发过程变成共学材料**：导师谈话提出分享流程与同伴监督；本次据此提议公开需求、改动与验收，而非只展示成品。活动尚未开展，不能当作效果证据，见[公开构建](concepts/build-in-public.md)。

## 本 wiki 的自我定位

本站就是按 [LLM Wiki 模式](concepts/llm-wiki-pattern.md) 运行的实例：`sources/` 是只读 raw 层，`wiki/` 是 LLM 维护的 wiki 层，`AGENTS.md` 是 schema 层。中文来源提出的“人工签核”尚未落地，取舍见 [综合页](synthesis/karpathy-vs-one-hand-signoff.md)。

## 尚需补充（wiki 的缺口）

- 缺少 **AI 阅读器的横向对比**（Infinite Reader vs 微信读书/Kobo/Kavita 等）。
- 缺少 **TypeWords 的实测**（4 种模式、导入文章流程、数据导出）。
- 缺少 **学习效果证据**：两个工具素材都只有体验陈述，没有实验数据 **[待验证]**。
- 缺少 **签核机制的实测**：作者“30 秒签核”的说法没有数据 **[待验证]**；Karpathy “100 篇/40 万字”与一手 gist 表述有出入。
- 缺少 **《经济学人》/长文精读场景** 的具体工具链素材（本仓库的下一步方向）。

## 相关

- 索引：[index](index.md) · 日志：[log](log.md)
- 综合：[阅读理解 vs 记忆巩固](synthesis/reading-vs-memorization.md) · [Karpathy 三层 vs 作者签核版](synthesis/karpathy-vs-one-hand-signoff.md)
- 概念：[AI 伴读](concepts/ai-reading-companion.md) · [打字式记忆](concepts/typing-based-learning.md) · [LLM Wiki 模式](concepts/llm-wiki-pattern.md)
