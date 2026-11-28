---
title: Calibre 明镜下载正文完整性核查
type: synthesis
status: growing
updated: 2026-11-14
sources: []
tags: [阅读器, 德语, calibre, 正文完整性]
---

用户在 Calibre 下载的《明镜》新闻合集虽然任务成功，但本次严格正文筛选没有可导入的完整文章。

## 核查结果

核查对象为用户书库条目 525 的 MOBI，只读转换为 EPUB。179 个文章条目中，69 个包含订阅提示，4 个没有公开正文可供核验，106 个缺少公开网页中的正文段落；完整通过及新增导入均为 0。逐篇依据见[筛选报告](../../artifacts/spiegel-2026-11-14/app-filter-report.md)及[机器明细](../../artifacts/spiegel-2026-11-14/app-filter-report.json)。

直接解包原始 MOBI 后，106 个缺段条目各有至少一个缺失段落在整个原始解包文本中也不存在，因此不是 EPUB 转换或文章分割导致的遗漏。举例：Mannheim 枪击新闻缺少开头，dm 蛋白棒召回新闻缺少产品污染风险说明。来源网页快照及解包文件保存在同一 artifacts 目录，原始书库文件未修改。

## 判断范围

筛选按配方 RSS 的标题定位原文，比较公开网页正文区域的段落，统一空白与引号差异。网页只作核验，不补写下载原文；网页若在下载后更新也可能导致不通过，因此这些文章应理解为“未通过本次完整性验证”。该结果仅适用于这次下载，不能推断所有 Calibre 来源都会缺段。现有阅读器目录未改动，此前独立抓取的 9 篇测试文章不计入本次结果。

## 相关

- [原刊图表呈现核查](economist-chart-display-audit.md)
- [阅读器需求](economist-context-learning-prd.md)
