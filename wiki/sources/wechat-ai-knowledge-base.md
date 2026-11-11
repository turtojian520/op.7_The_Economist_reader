---
title: 来源｜别搞 AI 个人知识库了，真的没用
type: source
status: mature
updated: 2026-11-09
sources: [2026-11-09-wechat-ai-knowledge-base]
tags: [知识库, 方法论, Karpathy, 写入权限]
---

# 来源｜别搞 AI 个人知识库了，真的没用

**一句话**：作者主张把知识库拆成“我的库 / AI 的库”，核心规则是 **AI 可读不可写**；在 Karpathy 的 LLM Wiki 三层之上再加一道“人工签核”，用最低成本保住“哪些判断属于我”。

- 平台：微信公众号（用户提供正文，**未提供原文链接**，作者未署名）
- 原文：本地 [`article.md`](../../sources/2026-11-09-wechat-ai-knowledge-base/article.md)（去口语化整理；[raw 原文](../../sources/2026-11-09-wechat-ai-knowledge-base/raw/original-pasted.txt) 保留原貌）
- 关联实体：[Karpathy](../entities/karpathy.md)

## 核心论点

1. **2026 年底，模型不再是变量**：国产大模型能力已够用；真正稀缺的是属于自己的知识库、Skill、上下文与记忆。
2. **95% 的知识库是数字废品收购站**：几百份 PDF、几千条剪藏、精美目录，查东西时仍不如直接问 AI；“收藏 / 整理 / 标签 / 以备调用”是被证伪的方法论。
3. **知识库要拆成两个**：我的库与 AI 的库；规则只有一条——**AI 可以读我的库，但绝不能写我的库**。否则 AI 的产出速度会淹没人的阅读速度，三个月后分不清哪些观点是自己的。
4. **Karpathy 的 LLM Wiki 是接近方案**：raw（只读）/ wiki（模型编译维护）/ schema（规则）三层；关键判断是“知识库最贵的不是读和想，是记账”。
5. **作者版本更严**：三层改为 **一手层（只有我能写）/ 加工层（AI 写我签）/ 索引层（AI 全权）**，连 wiki 层都要签字确认。
6. **签核不是重写**：只需判断“这句话是不是我的意思”，30 秒；而且改稿动作本身会留下判断增量。

## 结构对比

| Karpathy 版（素材转述） | 作者版 | 差异 |
|---|---|---|
| raw 层：原始素材，只读 | 一手层：只有人能写（判断、踩坑、犹豫） | 作者把“人的判断”也当成一层原始素材 |
| wiki 层：模型编译维护 | 加工层：AI 写、人签 | **增加人工签核**（本文的核心增量） |
| schema 层：规则与格式 | 索引层：AI 全权（摘要、检索、日报） | 作者把“规则”换成了“可自动生成的索引/产出” |

> 映射并非一一对应：Karpathy 按“素材 vs 编译 vs 规则”分层，作者按“谁有写入权”分层，两条轴正交。详见 [综合页](../synthesis/karpathy-vs-one-hand-signoff.md)。

## 可直接引用的原句

- “规则只有一条：AI 可以读我的库，但绝对不能写我的库。”
- “AI 快，人慢，它一天产出的东西我一星期读不完，混在一起，我的库三天就变成它的垃圾场。”
- “你会有一堆观点，但你分不清哪些是你想的，哪些是它替你想的。”
- “知识库最贵的不是读和想，是记账。”
- “签核不等于重写。我只需要判断这一句是不是我的意思，三十秒的事。”
- “知识库真正保住的不是知识，是哪些判断属于你这件事本身。”

## 待验证 / 缺口

- **原文出处未确认**：无链接、无公众号名、无发布时间；引用时应标注“用户提供正文”。
- “Karpathy 那份库长到 100 篇、40 万字”与一手资料有出入：Karpathy 2026-04 的 gist 里说的是“约 100 个来源、数百个页面”（见 [Karpathy](../entities/karpathy.md) 页的核对）；“40 万字”暂无出处 **（待验证）**。
- “95%”“被几十亿美金证伪”均为经验性断言，无数据来源 **（待验证）**。
- “签核三十秒”是作者自述，实际是否会退化为“橡皮图章”没有证据 **（待验证）**。

## 与本 wiki 的关系

本仓库正是按 Karpathy 的 LLM Wiki 模式搭建的（见 [AGENTS.md](../../AGENTS.md)、[LLM Wiki 模式](../concepts/llm-wiki-pattern.md)）。这篇文章相当于给它补了一条争议性设计：**wiki 层是否也需要人签核**。本 wiki 目前采用 Karpathy 原版（wiki 层由 LLM 维护，无强制签核），差异与取舍见 [综合页](../synthesis/karpathy-vs-one-hand-signoff.md)。

## 相关

- 实体：[Karpathy](../entities/karpathy.md)
- 概念：[LLM Wiki 模式](../concepts/llm-wiki-pattern.md) · [知识库写入权限](../concepts/knowledge-base-write-permissions.md)
- 综合：[Karpathy 三层 vs 作者签核版](../synthesis/karpathy-vs-one-hand-signoff.md)
- 别的素材：[Infinite Reader](../sources/draco-ereader-wechat.md) · [TypeWords](../sources/douyin-typewords.md)
