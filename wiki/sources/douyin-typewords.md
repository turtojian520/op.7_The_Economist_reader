---
title: 来源｜抖音「打字背单词」（TypeWords 演示）
type: source
status: mature
updated: 2026-11-09
sources: [2026-11-07-douyin-typewords]
tags: [背单词, 语言学习, 开源, AI助手]
---

# 来源｜抖音「打字背单词」（TypeWords 演示）

**一句话**：一条 42 秒的抖音教程，演示如何用 AI 助手「百度搭子」找到开源工具 **TypeWords**，再用“打字”把单词从“认识”练到“记住”。

- 平台：抖音 @猫吃小鱼 · 2026-11-07 19:14 · 42.7 秒
- 数据：点赞 **185** / 评论 **3** / 收藏 **128** / 分享 **25**（登录态采集，2026-11-09；截图见 [video-page-stats.png](../../sources/2026-11-07-douyin-typewords/assets/video-page-stats.png)）
- 原视频：[douyin.com/video/7705386336974294291](https://www.douyin.com/video/7705386336974294291)
- 本地记录：[sources/2026-11-07-douyin-typewords/video-note.md](../../sources/2026-11-07-douyin-typewords/video-note.md)（9 帧逐帧记录 + 视频 + 截图）
- 关联实体：[TypeWords](../entities/typewords.md) · [猫吃小鱼](../entities/maochixiaoyu.md)

## 核心论点

1. **背单词不要“看”，要“敲”**：把每个单词的复习变成一个必须输出的打字动作，效率比被动浏览高（视频标题称“效率直接翻倍”）。
2. **工具链条是 AI 化的**：不用自己搜 GitHub，直接让 AI 助手「搭子」把开源工具“发我”——作者在评论区也确认“我这个指令是搭子的，优先用搭子”。
3. **词库 + 自建内容双轨**：既可用现成考试词库（CET-4/6、专四专八、雅思托福…），也能导入自己的文章（json/xlsx 或手动输入）。
4. **开源值得收藏**：项目 GPL-3.0，在线地址 typewords.cc，视频末尾给出“收藏”结论。

## 视频里出现的工具与链接

| 对象 | 信息 | 出处 |
|---|---|---|
| TypeWords | GitHub `zyronon/TypeWords`，Vue 实现，GPL-3.0，在线 <https://typewords.cc> | t≈15s 帧 [frame-04](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-04.png) |
| 百度搭子（dumate） | AI 助手，用于按提示词找工具；视频标签 `#百度搭子 #办公就用dumate` | t≈20s 帧 [frame-05](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-05.png) |
| 词库 | CET-4 2607 / CET-6 2345 / 专四 4025 / 专八 12197 / 雅思托福等 | t≈30s 帧 [frame-07](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-07.png) |
| 导入文章 | 支持 json/xlsx 文件或手动输入 | t≈35s 帧 [frame-08](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-08.png) |
| 资料区 | 语法书（张满胜、薄冰、旋元佑、剑桥等）+ 听力（VOA、TED-ED、哈佛演讲） | t≈40s 帧 [frame-09](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-09.png) |

## 演示到的功能（按时间轴）

1. **t≈0–10s**：词条页 `cancel`，含音标、释义、中英例句、短语、近义词；提示“输入完成后按空格键继续”；称单词有 **4 种模式**，从“认识”练到“记住”。
2. **t≈15s**：打开 GitHub 仓库证明“代码全部开源”。
3. **t≈20–25s**：用搭子取工具（提示词原文见视频记录），场景是“再战四级”。
4. **t≈30–35s**：选词库、导入自己的文章。
5. **t≈40s**：资料区展示，结论“这个开源项目真的可以收藏一下”。

## 评论区（全部 3 条）

| 用户 | 内容 | 时间 / IP |
|---|---|---|
| 天涯归途 | workbudy也可以用吗 | 1天前 · 宁夏 |
| 猫吃小鱼（作者回复） | 我这个指令是搭子的，优先用搭子 | 1天前 · 四川 |
| 猫吃小鱼（作者） | 搭子你好，帮我把GitHub上H74P7FP的"zyronon/TypeWords"在线工具发我，我要再战四级 | 1天前 · 四川 |

作者把自己的提示词公开在评论区，等于给了一条可复制的“AI 找工具”模板。

## 作者与系列背景

- 作者「猫吃小鱼」：抖音号 53154217266，IP 四川，关注 78 / 粉丝 265 / 累计获赞 2397 / 作品 18（[author-page.png](../../sources/2026-11-07-douyin-typewords/assets/author-page.png)）。
- 这是**「开源工具安利」系列（001–012 期）**：每期一个工具 + AI 搭子找工具 + 录屏演示 + “可以收藏”。
- 012 期同时出现 Pavise（2 条）、TypeWords（2 条）、Sherlock；同主题还有一条《打字也能背单词？这个开源工具把我十年背单词方式改了》（87 赞）。
- 更多见 [猫吃小鱼](../entities/maochixiaoyu.md)。

## 待验证 / 缺口

- **“效率直接翻倍”是营销式说法**，视频没有给出对照实验或数据，属于个人体验陈述 **（待验证）**。
- 视频无音轨（浏览器静音），没有口播解说；所谓“4 种模式”只听到字幕说法，未逐条演示。
- 视频发布时 GitHub 仓库名为 `zyronon/TypeWords`；帧里地址栏显示 `type-words`，可能是旧仓库名或重命名 **（待验证）**。
- 本素材是“工具演示”，不含 TypeWords 的技术细节（实现原理、算法）——相关事实取自仓库本身，见 [TypeWords](../entities/typewords.md)。

## 相关

- 实体：[TypeWords](../entities/typewords.md) · [猫吃小鱼](../entities/maochixiaoyu.md) · [百度搭子](../entities/dumate.md)
- 概念：[打字式记忆](../concepts/typing-based-learning.md) · [AI 助手即工具入口](../concepts/ai-as-tool-router.md)
- 对照素材：[公众号｜做自己的电子书阅读器](../sources/draco-ereader-wechat.md)
