---
title: TypeWords
type: entity
status: growing
updated: 2026-11-09
sources: [2026-11-07-douyin-typewords]
tags: [开源, 语言学习, 背单词, Vue]
---

# TypeWords

**一句话**：开源（GPL-3.0）的英语单词/文章练习工具，核心玩法是**打字式记忆**——把单词复习变成必须敲出来的动作，在线版 <https://typewords.cc>。

## 基本事实

| 项 | 值 | 来源 |
|---|---|---|
| GitHub | [zyronon/TypeWords](https://github.com/zyronon/TypeWords) | 抖音视频 t≈15s（[frame-04](../../sources/2026-11-07-douyin-typewords/assets/frames/frame-04.png)） |
| 在线地址 | <https://typewords.cc> | 同上 + README |
| 许可证 | GPL-3.0 | README |
| 技术栈 | Vue | GitHub API（2026-11-09 采集） |
| Star / Fork | 11,669 / 1,406 | GitHub API（2026-11-09） |
| 创建 / 最近推送 | 2023-08-03 / 2026-10-16 | GitHub API（2026-11-09） |
| 一句话简介 | “Practice English, one strike, one step forward”；中文副标：一个开源单词与文章练习工具 | README |

> 注：抖音帧里地址栏显示 `zyronon/type-words`，视频口播/字幕写 `zyronon/TypeWords`；GitHub 现仓库为 `TypeWords` **（旧名待验证）**。

## 功能（视频实际演示到的）

- **单词练习**：词条页显示音标、释义、中英对照例句、短语、近义词；提示“输入完成后按空格键继续”；视频称一个单词有 **4 种模式**，“从认识练到记住”。
- **词库**：按考试分类——中国考试（CET-4/6、专四专八、考研、自考…）、国际考试（IELTS、TOEFL、GMAT、GRE、KET、SAT、BEC、PTE、TOEIC、CEFR…）；每个词库显示词数（如 CET-4 2607、专八 12197）。
- **导入自己的文章**：支持 json/xlsx 或手动输入 → 把任意文本变成练习材料。
- **学习数据**：今日学习时长、总学习天数、进度。
- **资料区**：英语语法书（张满胜、薄冰、旋元佑、剑桥《English Grammar in Use》、Oxford、Practical English Usage）+ 听力资源（VOA 慢速、TED-ED、哈佛演讲）。
- **在线访问**：无需安装，浏览器打开即用。

## 为什么值得收进这座 wiki

它是“学习工具”侧的一个清晰样本：**把复习动作从‘看’改成‘输出’**，再用词库/导入内容解决材料问题。和阅读器样本放在一起，可以对照“输入端工具”与“输出端工具”的设计差异，见 [阅读理解 vs 记忆巩固](../synthesis/reading-vs-memorization.md)。

## 待验证

- 视频标题宣称“效率直接翻倍”，无对照数据 **[待验证]**。
- 4 种模式的具体差异未在视频中逐条演示（推测包含中→英、英→中、听写、拼写等，待实测）。
- 仓库 Star 数会变化，引用时以采集日期为准。

## 相关

- 来源：[抖音｜打字背单词](../sources/douyin-typewords.md)
- 概念：[打字式记忆](../concepts/typing-based-learning.md)
- 对照产品：[Infinite Reader](../entities/infinite-reader.md)
- 推荐人：[猫吃小鱼](../entities/maochixiaoyu.md)
