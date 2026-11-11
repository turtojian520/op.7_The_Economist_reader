---
title: Economist Reader 原刊图表呈现核查
type: synthesis
status: growing
updated: 2026-11-11
sources: []
tags: [阅读器, 图表, 产品核查]
---

本地版与分享版现已按原 EPUB 位置展示全部图表和配图，保持比例并支持放大。

## 修复前的核查事实

- 本地与分享版目录均含三期、225 个条目、358 个文章图片引用；78 篇有正文的文章含多图。图片引用包含插图、地图与数据图，不能全部计为统计图表。依据：[本地目录](../../prototype/server/data/catalog.json)、[分享版目录](../../sites/margin-reader-share/public/content/catalog.json)。
- 每期的 Economic data, commodities and markets 为纯图片条目，各有 4 张图。修复前两个阅读组件已能遍历这些图片并提供原图链接。
- 修复前普通文章仅渲染 `article.image`，没有遍历 `article.images`；随后直接渲染正文段落。依据：[本地组件](../../prototype/src/main.jsx)、[分享版组件](../../sites/margin-reader-share/src/main.jsx)。
- 例如 Japan prepares for its next natural disaster 保存两张图片；第二张为日本板块与地震地图，已检查本地文件，修复前普通文章组件不会显示它。
- 修复前普通文章首图样式为 `max-height: 350px; object-fit: cover`，存在裁切图表的风险；实际各屏幕裁切情况 **（待验证）**。纯图片页使用 `object-fit: contain`。依据：[分享版样式](../../sites/margin-reader-share/src/style.css)。

## 已实现与验证

导入器回读三期 EPUB，新增有序 `blocks`，引用既有段落 ID 并记录原图所在位置。两个阅读组件按此顺序渲染；图片使用完整比例、不裁切，点击进入原生模态窗口，支持两倍放大、滚动查看、原图链接和 Esc 关闭。依据：[导入器](../../prototype/scripts/import-issues.py)、[图片组件](../../prototype/src/ArticleFigure.jsx)。

逐篇对照源 EPUB，225 个条目的 358 个图片引用、图文顺序和原图字节校验通过，两版一致；2,519 个正文段落及 ID 未变。分享版 18 项测试通过，两版构建成功。已在浏览器检查桌面与 390px 手机宽度下的地图、经济数据页和弹窗；Esc 关闭后焦点返回触发按钮。依据：[顺序核对脚本](../../prototype/qa/check-figure-order.py)、[验证记录](../../prototype/qa/figure-verification.md)。

放大沿用 EPUB 原始图片，不增加原图自身的分辨率；图片文字仍不可选中。`--sync-share` 可同步生成不含本机路径的分享目录，但不负责新增期刊的图片资源同步。

## 相关

- [Economist Reader 产品需求](economist-context-learning-prd.md)
