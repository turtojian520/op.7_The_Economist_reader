---
title: 旁读 Margin
type: entity
status: growing
updated: 2026-11-16
sources: [2026-11-16-notebooklm-build-in-public-workshop]
tags: [阅读器, 英语学习, AI编程]
---

旁读 Margin 是本仓库的英文阅读与语境词汇练习应用，也是拟于 12 月 1 日公开展示开发过程的主要案例。[^src-talk]

导师谈话展示了找文章、选词翻译、中文概括、重点词汇和原句拼写，主讲人提出在现场继续改进产品。展示中出现点选不顺的情况，可作为活动需求收集的切入口；不能由一次口述确认具体故障原因。[^src-talk]

当前仓库有两个实现：本地原型使用 PHP/MariaDB，查译与笔记整理采用预置内容；分享版使用 Worker 调用 DeepSeek 完成查词、翻译和文章概括，学习记录保存在各自浏览器，笔记整理仍为模板。依据：[本地说明](../../prototype/README.md)、[分享版说明](../../sites/margin-reader-share/README.md)。本次只核对说明与代码，没有复测线上功能。

谈话说“还没有托管到真正的云服务器”，仓库文档则记载已有 Sites 分享版。这是不同状态描述，是否对应同一构建版本 **（待验证）**；活动应以彩排时实际可访问的版本为准，见[活动设计的版本边界](../synthesis/build-in-public-workshop-2026-12-01.md#版本边界)。

## 相关

- [产品需求](../synthesis/economist-context-learning-prd.md)
- [Workshop 设计](../synthesis/build-in-public-workshop-2026-12-01.md)
- [AI 伴读](../concepts/ai-reading-companion.md)

[^src-talk]: [谈话来源摘要](../sources/dawu-build-in-public-workshop.md)，原始摘录 E3。
