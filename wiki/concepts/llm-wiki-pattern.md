---
title: LLM Wiki 模式
type: concept
status: mature
updated: 2026-11-09
sources: [2026-11-09-wechat-ai-knowledge-base]
tags: [知识库, 方法论, agent, markdown]
---

# LLM Wiki 模式

**一句话**：不把文档丢给 RAG 每次现查，而是让 LLM **增量编译**一座持久、互链的 Markdown wiki，位于原始素材和提问者之间——知识编译一次、持续维护，而不是每次重新推导。

## 三层

| 层 | 是什么 | 谁能写 |
|---|---|---|
| **raw** | 原始素材：文章、论文、图片、数据 | 只读，不可变（真相来源） |
| **wiki** | 摘要、实体页、概念页、对比、综合、总览 | LLM 全权维护 |
| **schema** | `AGENTS.md` / `CLAUDE.md`：格式、约定、工作流 | 人 + LLM 共同演化 |

## 三个操作

- **Ingest**：读素材 → 与已有页面整合 → 写摘要页 → 更新实体/概念页 → 更新 index → 追加 log。**一个来源通常触及 10–15 个页面**。
- **Query**：先读 index 定位页面 → 读页面 → 需要原文再回查 raw。**好的回答归档成新页面**，让探索也复利。
- **Lint**：定期体检——矛盾、过期结论、孤儿页、缺失的概念页、断链、数据缺口。

## 关键设计

1. **编译而非检索**：摄取时就把知识编进结构化页面，查询只做定位与拼接。
2. **交叉链接即综合**：页面互链本身承载了“知识之间的关系”；graph view 能直接看出枢纽页与孤儿页。
3. **记账外包**：交叉引用、去重、发现矛盾、保持摘要最新——这些人类会放弃的维护工作，交给 LLM。
4. **两个导航文件**：`index.md`（内容目录，约 100 个来源时仍然够用）+ `log.md`（append-only、固定前缀、可 grep）。
5. **纯 Markdown + git**：Obsidian 当查看器，git 提供历史与协作。

## 适用规模与边界

- 经验上：约 100 个来源、数百个页面的规模，`index.md` 导航依然有效，无需 embedding；更大规模再接本地搜索（如 qmd）或 MCP。
- 隐含前提：**素材质量由人把关**。模式解决的是维护成本，不解决“该不该收这篇素材”。
- 风险：wiki 层完全由 LLM 写，容易出现漂移、过度自信、来源混杂——这也是 [知识库写入权限](../concepts/knowledge-base-write-permissions.md) 要讨论的问题。

## 本仓库的实例化

本仓库即该模式的一个实例：

- `sources/` = raw（只读、带哈希）
- `wiki/` = wiki（LLM 维护：index、log、overview、sources、entities、concepts、synthesis）
- `AGENTS.md` = schema
- 工具：`scripts/verify_sources.py`（素材校验）、`scripts/lint_wiki.py`（wiki 体检）

## 相关

- 实体：[Karpathy](../entities/karpathy.md)
- 来源：[别搞 AI 个人知识库了，真的没用](../sources/wechat-ai-knowledge-base.md)
- 概念：[知识库写入权限](../concepts/knowledge-base-write-permissions.md)
- 综合：[Karpathy 三层 vs 作者签核版](../synthesis/karpathy-vs-one-hand-signoff.md)
- 实现规约：[AGENTS.md](../../AGENTS.md)
