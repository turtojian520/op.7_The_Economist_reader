---
title: Andrej Karpathy
type: entity
status: growing
updated: 2026-11-09
sources: [2026-11-09-wechat-ai-knowledge-base]
tags: [人物, AI, LLM, 知识库]
---

# Andrej Karpathy

**一句话**：AI 研究者与教育者；2026 年 4 月提出个人知识库模式 **LLM Wiki**（raw / wiki / schema 三层），成为本 wiki 及众多 AI 知识库实践的直接范式来源。

## LLM Wiki（2026-04）

- 形式：一份被称为 “idea file” 的 gist（`llm-wiki.md`），不是库或应用，而是**给 agent 复制粘贴、让它为自己领域实例化**的模式说明。
- 前身：2026-04-02 的一条 X 帖（“用 LLM 为各种研究兴趣主题构建个人知识库”），两天后发布 gist。
- 三层架构：
  - **raw**：原始素材，不可变，模型只读；
  - **wiki**：Markdown 页面，完全由 LLM 拥有和维护；
  - **schema**（`CLAUDE.md` / `AGENTS.md`）：把通用聊天机器人变成“训练有素的 wiki 维护者”的约定。
- 三个操作：**Ingest / Query / Lint**；一个来源通常触及 10–15 个页面；好的回答可以归档回 wiki 成为新页面。
- 两个导航文件：`index.md`（目录）与 `log.md`（append-only 日志，固定前缀可 grep）。
- 规模经验：约 100 个来源、数百个页面时，`index.md` 仍然够用，不需要 embedding。
- 他的分工比喻：“Obsidian 是 IDE；LLM 是程序员；wiki 是代码库。”

## 关键判断（被广泛引用）

> “维护知识库中最繁琐的部分不是阅读或思考，而是簿记（bookkeeping）……LLM 不会厌倦，不会忘记更新交叉引用，而且能在一次处理中改动 15 个文件。”

这句话被中文技术圈浓缩为：“知识库最贵的不是读和想，是记账。”

## 核对与边界

- 本 wiki 收录的中文来源称“他本人那份长到 100 篇、40 万字，一个字没亲手写”。其中 **“约 100 个来源 / 数百个页面”有一手依据；“40 万字”暂无出处 [待验证]**。
- 常见误传（据研究整理）：情景记忆/语义记忆分层、类睡眠整合、置信度评分与遗忘衰减等，**并非 Karpathy gist 原文**，而是社区扩展（如 LLM Wiki v2）。
- 他明确将想法与 Vannevar Bush 1945 年的 Memex 联系起来，认为 Bush 未解决的是“由谁维护”，而 LLM 恰好补上。

## 与本 wiki 的关系

本仓库的 [AGENTS.md](../../AGENTS.md) 与 `wiki/` 结构直接实现了这套模式；中文来源在此基础上提出“人工签核”的加强版，见 [知识库写入权限](../concepts/knowledge-base-write-permissions.md) 与 [综合页](../synthesis/karpathy-vs-one-hand-signoff.md)。

## 相关

- 来源：[别搞 AI 个人知识库了，真的没用](../sources/wechat-ai-knowledge-base.md)
- 概念：[LLM Wiki 模式](../concepts/llm-wiki-pattern.md) · [知识库写入权限](../concepts/knowledge-base-write-permissions.md)
- 参考：[Karpathy LLM Wiki 研究报告（ai-memory）](https://ai-memory.atomgit.com/research-karpathy-llm-wiki.html)
