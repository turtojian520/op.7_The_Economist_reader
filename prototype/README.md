# 旁读 Margin — MVP 交互原型

本地阅读工作台，串通真实期刊阅读、语境释义、拼写练习与笔记人工签核。设计依据见 [PRD](../wiki/synthesis/economist-context-learning-prd.md)。

## 打开与启动

运行中的地址：<http://127.0.0.1:8097>。

```bash
cd /Users/qinhao/Documents/python/VS_code_python/projects/op.7_The_Economist_reader/prototype
npm install
npm run build
npm start
```

依赖 Homebrew 的 `httpd`、`php`、`mariadb`，本次已安装。启动脚本使用项目独立配置和独立数据库；不会修改系统 Apache 配置、启动登录服务、修改原有 MySQL 数据或写入 Calibre 书库。Apache 仅监听本地 `8097`，PHP-FPM 使用 `9077`，数据库只开放 Unix socket。

终端 Ctrl+C 停止启动脚本及它启动的进程。开发前端可在后端运行时另开终端执行 `npm run dev`，访问 `http://127.0.0.1:5177`。修改后需 `npm run build` 才会更新 Apache 提供的版本。

## 体验流程

1. 书架包含最近三期封面和 225 篇目录。点期刊筛选，按栏目或关键词找文；“继续浏览文章”展开更多条目。
2. 点首页“开始阅读”，默认打开本地 11 月 7 日期的 AI 实验室文章。
3. 拖选单词或句子，底部操作条支持翻译、划重点、记笔记。“试着理解一个词”可以直接体验 `hypothesis`。
4. 加入拼写练习。切到“词汇练习”，体验原句挖空、释义回忆、看词拼写；每题提供“查看答案 / 收起答案”。查看后不会自动填入输入框，后续作答计为借助提示；收起答案或切换同词的练习模式仍保留查看记录，下一词重新隐藏答案。错答、提示、揭示、粘贴、无提示首答正确分开记录。回忆模式的原句中目标词会被遮住。
5. 在阅读页写下自己的理解，进入“我的笔记”，点“请 AI 整理”。对照原话修改候选，明确采纳后才进入“已确认整理”；支持拒绝、撤回、导出。原始笔记始终保留。
6. 刷新页面，数据仍由 PHP/MariaDB 保留。文章阅读状态和最近打开文章也保存；字号、阅读位置断点尚未持久化。

Esc 关闭选区及阅读辅助浮层；所有主要操作支持键盘焦点。移动端选区操作和笔记面板采用底部浮层。

## 数据来源

读取 `/Users/qinhao/Documents/calibre_config/` 中已有的 `periodical.epub`，原文件只读：

| 期刊日期 | 目录条目 |
|---|---:|
| 2026-11-07 | 76 |
| 2026-10-24 | 75 |
| 2026-10-03 | 74 |

三期共 225 个文章/图表条目，其中 222 个有可选正文、3 个为图片数据页；图表页展示全部原图，可单独打开。保留 2,519 个正文段落以及来源链接、栏目、封面与本地图片。补读候选仅来自这三期，按照栏目匹配，不宣称完整历史覆盖或已经实现个性化推荐。

重导入：`python3 scripts/import-issues.py`。输入目录在脚本中显式指定；校验与原文件 SHA-256 记录见 [import-report.json](docs/import-report.json)。导入结果保存在 `server/data/catalog.json` 和 `public/media/`，没有改动 Wiki 的 sources。

## 已接通与演示范围

**真实接通**：React 页面与状态切换、真实文章与图片、选区及高亮、私人笔记、词汇卡与答题记录、草稿隔离、版本签核与撤回、数据持久化、JSON 导出、PHP API 和本地 Apache/MariaDB。

**明确为演示**：翻译使用 18 个预置词条和默认文章前三段的语境译解；未覆盖选区显示未收录，不编造释义。句子选择显示所属段落的译解，未实现任意句精确翻译。整理使用本地模板，未调用实时 LLM。发音使用浏览器系统语音，是否可用取决于设备。

**本轮尚未实现**：完整在线词典/翻译/伴读、真正的 AI 笔记推理、间隔复习调度器、词库管理、笔记删除编辑与版本重生成、用户账号/多人隔离、全文搜索索引和 EPUB 上传界面。当前是单用户本地原型，不作为公网服务部署。

## 测试与设计资料

- [视觉参考与设计决策](docs/design-references.md)
- [验证记录](qa/verification.md)
- API 集成验证：`python3 qa/test-api.py`。脚本只清理自己创建的测试记录。
- Hallmark：`bash qa/run-hallmark.sh`，固定上游提交；会在项目 `.cache/` 获取源码并运行真实 Chrome 多宽度检查。
- 数据保存在 `server/runtime/db/`，该目录和依赖已加入 `.gitignore`。请勿删除它来“重置”真实笔记。

## ChatGPT Sites 分享版

已发布：[旁读 Margin](https://margin-economist-reader.hybrid-klvvc-7155.chatgpt.site)，访问范围以 Sites 当前设置为准。线上版已接入 Magpie DeepSeek 查词与翻译，持有分享链接的访问者无需登录 ChatGPT 即可使用站主的 API。分享版源码位于 `../sites/margin-reader-share/`，不连接本机 PHP，学习记录分别保存在访问者自己的浏览器；本地已有笔记和答题数据未上传。
