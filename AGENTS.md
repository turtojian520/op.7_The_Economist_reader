# AGENTS.md — 本 Wiki 的维护规约（Schema）

这是本仓库的 **schema**：任何 LLM agent（Claude Code / Codex / DSH …）在本目录工作时，先读本文件。
本仓库采用 [nashsu/llm_wiki](https://github.com/nashsu/llm_wiki) 描述的「LLM 增量维护的个人 wiki」模式；该模式的来源与设计取舍见 [wiki/concepts/llm-wiki-pattern.md](wiki/concepts/llm-wiki-pattern.md) 与 [wiki/concepts/knowledge-base-write-permissions.md](wiki/concepts/knowledge-base-write-permissions.md)。

## 1. 这是什么

一座围绕 **“AI 时代的阅读、学习与知识库”** 持续生长的个人知识库：
电子书阅读器、AI 伴读 / Agent、笔记与标注、背单词与语言学习工具、AI 知识库方法论（raw/wiki/schema、写入权限）、vibe coding 的产品实践。

三层架构：

| 层 | 目录 | 谁写 | 规则 |
|---|---|---|---|
| 原始素材 | `sources/` | 人 + 采集脚本 | **只读、不可变**，是所有事实的来源 |
| Wiki | `wiki/` | LLM 维护 | 摘要、实体、概念、综合、对比；随每次 ingest 更新 |
| Schema | `AGENTS.md` | 人 + LLM 共同演化 | 规则本身，改规则要先和用户确认 |

## 2. 目录结构

```
sources/            # 原始素材，见 sources/README.md
wiki/
├── index.md        # 内容目录：所有页面的清单（每次 ingest 必须更新）
├── log.md          # 时间线日志：append-only（每次 ingest / query / lint 追加）
├── overview.md     # 全局综述：当前对主题域的总体判断（随 ingest 重写）
├── sources/        # 每个素材一页摘要：wiki/sources/<source-id>.md
├── entities/       # 实体页：产品、项目、人物、组织
├── concepts/       # 概念页：方法、机制、设计模式
└── synthesis/      # 综合页：跨素材的比较、论点、结论
```

文件命名：小写 kebab-case；实体/概念页名 = 名词短语（如 `infinite-reader.md`、`typing-based-learning.md`）。

## 3. 页面格式

每个 wiki 页面以 YAML frontmatter 开头：

```yaml
---
title: 页面标题
type: entity | concept | source | synthesis | overview
status: stub | growing | mature
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader]   # 支撑本页的 source id
tags: [阅读器, agent]
---
```

正文要求：

- 首段一句话定义 / 结论，再展开。
- 事实必须可回溯：引用素材时用 `[^src-xxx]` 脚注或行内 `（来源：wiki/sources/xxx）`。
- 交叉链接：每个页面至少链到 1 个其他 wiki 页面，相关页面放在页尾「## 相关」。
- 有争议或不确定的地方显式标注 **（待验证）**。
- 页面长度：摘要 80–200 字；实体/概念页 200–800 字；综合页不限但要有明确论点。

## 4. index.md 规范

按类别分组列页面，每行：`- [标题](路径) — 一句话摘要（updated: YYYY-MM-DD）`。
每次 ingest 后必须把新增页面加进去、更新摘要。

## 5. log.md 规范

append-only，每条固定前缀，便于 `grep "^## \["` 解析：

```
## [2026-11-09] ingest | 我在开发全世界最好的电子书阅读器
- source: sources/2026-10-30-wechat-draco-ereader/
- 新增页面: ...
- 更新页面: ...
```

## 6. 工作流

### Ingest（摄入新素材）

1. 把素材放进 `sources/<yyyy-mm-dd>-<平台>-<短标题>/`（正文 + 本地图片 + `meta.json`），不改旧素材。
2. 写 `wiki/sources/<source-id>.md` 摘要页：核心论点、关键事实、可引用原句、图片索引、与已有知识的关联与冲突。
3. 更新受影响的实体页 / 概念页 / `overview.md`；新增的实体和概念各建一页。
4. 更新 `wiki/index.md`，追加 `wiki/log.md`。
5. 冲突处理：新素材与旧页面矛盾时，两边都保留，并在两页分别标注「观点冲突：见 X 页」。

### Query（提问）

先读 `wiki/index.md` 定位页面 → 读页面 → 需要原文时回读 `sources/`。回答带引用；
有长期价值的回答**另存为** `wiki/synthesis/` 页面，并更新 index 与 log。

### Lint（体检）

检查：孤儿页（无入链）、缺失概念页、过期结论、图片断链、index 与实际文件不一致。
结果写进 log。

## 7. 图片与媒体

- 素材图片只放 `sources/<id>/assets/`；wiki 页面用相对路径引用：`../sources/<id>/assets/img-01.png`。
- 图片 alt 写具体内容（画面里有什么），不要写 "图片"。
- 禁止把外链图片直接嵌进 wiki（会失效）；必须本地化。

## 8. 不要做的事

- 不改 `sources/` 下的正文、图片和 `meta.json`。
- 不删除 wiki 页面（要废弃就标 `status: deprecated` 并在 log 说明）。
- 不写没有来源的判断；把推断和事实分开写。
