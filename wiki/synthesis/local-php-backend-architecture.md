---
title: 旁读本地 PHP 后端的技术分工
type: synthesis
status: growing
updated: 2026-11-16
sources: []
tags: [阅读器, PHP, Apache, 数据持久化]
---

旁读的本地原型用 Apache 提供网页、PHP-FPM 执行接口、MariaDB 保存学习记录；线上分享版使用独立的 Worker 与浏览器存储。

## 核查范围

用户引用了 ChatGPT 对话「本地搭建PHP后端」，但本次没有可用的 read_thread 工具，浏览器打开后显示未登录，未取得对话正文。因此本文只解释当前仓库实现，与该对话具体技术清单的对应关系 **（待验证）**。以下来源为仓库代码，不新增或修改原始素材。

## 请求如何流转

浏览器中的 React 页面通过 `fetch('/api' + path)` 发送 JSON。Apache 监听 `127.0.0.1:8097`，普通网页资源取自 `prototype/dist/`；`/api` 请求统一映射到 `server/index.php`，再经 FastCGI 交给监听 `127.0.0.1:9077` 的 PHP-FPM。PHP 按路径和方法执行逻辑，通过 PDO 连接 MariaDB，最后返回 JSON，React 据此更新界面。依据：[前端接口封装](../../prototype/src/main.jsx)、[启动与服务器配置](../../prototype/scripts/start-local.sh)、[PHP 接口](../../prototype/server/index.php)。

例如保存笔记时，前端调用 `POST /api/notes`；PHP 核验文章、段落及引用原文，生成记录并写入数据库。刷新后，前端读取 `GET /api/state` 恢复记录。草稿采纳还检查版本、使用事务和行锁，并保留签核历史。依据：[PHP 接口](../../prototype/server/index.php)。

## 数据在哪里

文章正文来自 `server/data/catalog.json`，图片来自 `public/media/`；MariaDB 的 `margin_reader` 数据库用一张 `records` 表按 `kind` 和 `id` 保存 JSON 格式的笔记、草稿、词汇、答题、阅读状态及签核记录。数据库文件位于 `server/runtime/db/`，经项目专用 Unix socket 访问，启动时使用 `--skip-networking`。依据：[PHP 数据读写](../../prototype/server/index.php)、[启动脚本](../../prototype/scripts/start-local.sh)。

`npm start` 执行项目脚本并启动三个进程；`npm run build` 生成 Apache 提供的前端文件。开发时 Vite 使用 5177 端口，并将 `/api` 代理至 8097。依据：[npm 命令](../../prototype/package.json)、[Vite 配置](../../prototype/vite.config.js)。

## 两个版本的边界

本地 PHP 查译读取预置词典与段落译解，笔记整理使用本地模板。分享版由 Worker 调用 DeepSeek，私人学习记录保存在每位访问者的 localStorage，不连接本机 PHP 或 MariaDB。依据：[本地说明](../../prototype/README.md)、[分享版说明](../../sites/margin-reader-share/README.md)。本次为静态代码核查，未启动服务或验证进程当前状态。

## 为什么分成两套，以及如何统一

从现有实现看，两版分别服务本机单用户持久化和免登录链接体验；这是根据代码与说明推断的用途取舍，不代表已核实完整历史决策。本地数据库不需要用户账号即可服务一个人；分享版把学习记录放到各访问者浏览器，避免当前阶段实现云端账号与记录归属，但也不提供跨设备同步。Worker 当前仅接收查词、概括及 AI 状态接口，并未实现学习记录的云端存储。依据：[分享版存储适配器](../../sites/margin-reader-share/src/browser-api.js)、[Worker 路由](../../sites/margin-reader-share/worker/index.js)、[两版功能说明](../../prototype/README.md)。

执行环境与存储是独立选择：Worker 可以连接数据库，不必绑定 localStorage；PHP 也可以部署到远程服务器。Workers 的数据库能力见 [官方存储说明](https://developers.cloudflare.com/workers/platform/storage-options/)。localStorage 按站点来源存于浏览器，可跨浏览器会话保留，但不自动提供账号或跨设备同步，见 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)。

建议先统一 `api(path, body)` 的接口契约、记录格式与业务校验，保留浏览器与服务器存储适配器；再根据个人离线工具或多设备产品的目标决定是否统一运行环境。当前两版已有相近接口，但收藏、批量词汇等功能已出现差异，迁移前需明确共同规范。若目标是多设备使用，可采用共享前端和服务端业务代码，本地开发连接独立测试存储，线上连接持久数据库；访客继续本地使用，登录后选择迁移同步。此为建议，尚未实施，具体数据库还需核验当前托管环境能力。

无论选择 PHP 还是 Worker，跨设备同步都需要可稳定识别用户的机制、服务端记录归属校验、备份恢复和冲突处理，以及两版既有记录的导入去重。单纯更换运行语言不能完成这些工作。

## 相关

- [Economist Reader 产品需求](economist-context-learning-prd.md)
- [知识库写入权限](../concepts/knowledge-base-write-permissions.md)
