---
title: Vibe Coding（个人软件的生产方式）
type: concept
status: growing
updated: 2026-11-09
sources: [2026-10-30-wechat-draco-ereader, 2026-11-07-douyin-typewords]
tags: [AI编程, 独立开发, 工作流]
---

# Vibe Coding（个人软件的生产方式）

**一句话**：用 AI 编程工具“说需求 → 出界面 → 再迭代”的方式，让一个人在一个周末里产出过去需要团队才能做的东西。

## 素材里的两个样本

### 样本 1：Infinite Reader（重度 vibe coding）

- Draco 的流程：**Opus5.5 先搭 UI 框架 → Codex 持续迭代**，几周内做出阅读器雏形。
- 原话：“让 Opus5.5 打了个底儿把 UI 框架搭好，后续用 Codex……陆陆续续地把这个电子书阅读器的雏形勾勒出来了。”
- 他还描述了当下 AI 编程的“版本焦虑”与算力充裕感：“Codex 每天都在重制啊有没有，几乎是无限 token 的 GPT-6 Astra 开着 Ultra Fast 模式拼命薅。”
- 产物特征：功能密度高（3D 书页、Atlas 地图、思维导图、AI 伴读、行内批注），视觉完成度接近商业产品。

### 样本 2：用 AI 找工具（轻量 AI 工作流）

- 抖音作者不写代码，而是让 AI 助手（[百度搭子](../entities/dumate.md)）去 GitHub 找现成开源工具并给出入口，见 [AI 助手即工具入口](../concepts/ai-as-tool-router.md)。
- 这说明 vibe coding 的外延不止“写代码”，还包括**用 AI 完成软件发现与选型**。

## 这种生产方式带来的变化

| 维度 | 过去 | 现在（素材所示） |
|---|---|---|
| 立项门槛 | 需要团队/预算 | 一个人 + 一个周末可以出雏形 |
| 差异化 | 功能由大厂定义 | 可以为自己做“别人不会做”的功能（如 3D 地图） |
| 护城河 | 代码量 | 品味、数据、持续迭代速度 |
| 风险 | 招人、排期 | 产品同质化、可维护性、AI 依赖 |

## 争议与隐忧

- **可维护性**：AI 生成代码快速堆功能，长期维护成本未知 **（待验证）**。
- **开源选择**：vibe coding 出来的产品常选择闭源（如 ereader.space 未公开源码），与全开源工具（如 [TypeWords](../entities/typewords.md)）形成两种路线，见 [阅读器开源 vs 闭源](../synthesis/reading-vs-memorization.md) 的讨论。
- **同质化**：当所有人都能用同一个模型生成 UI，差异化只能来自场景理解与数据。

## 相关

- 实体：[Draco](../entities/draco.md) · [Infinite Reader](../entities/infinite-reader.md)
- 来源：[公众号｜做自己的电子书阅读器](../sources/draco-ereader-wechat.md)
- 概念：[AI 助手即工具入口](../concepts/ai-as-tool-router.md) · [AI 伴读](../concepts/ai-reading-companion.md)
