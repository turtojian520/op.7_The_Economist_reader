# 旁读 Margin — ChatGPT Sites 分享版

与本地 PHP 原型共用第一版交互和视觉，包含三期原刊的 225 个文章与图表条目，以及查看答案功能。

## 数据与访问

- 此版由 ChatGPT Sites 托管，站点已公开；持有分享链接的访问者可直接使用站主提供的 DeepSeek 查词和翻译，无需 ChatGPT 账号、订阅或登录。
- 文章与图片作为静态资源部署，已去除本机文件路径。站点从纯静态站迁移为 Worker + 静态资源，/api/lookup 在服务端完成查询。
- 词汇、笔记、草稿、签核历史、答题记录和阅读状态保存在各访问者自己的浏览器 localStorage 中，不连接所有者的本地 PHP 或 MariaDB，也没有上传本地已有学习记录。
- 数据不跨浏览器或设备同步；清除浏览器网站数据会移除这些记录，可通过导出功能保存备份。
- 查词和翻译已接入 Magpie 配置中的 DeepSeek（deepseek-flash），运行时密钥仅存在 Sites 服务端 secret。英文词典使用 Free Dictionary API；其音标、英文义项与 AI 中文解释分开标明。打开文章时，右侧「中文概括」会用同一服务生成文章概括、关键要点、总结和重点词汇；纯图表页提示暂无正文。笔记整理仍为明确标注的预置模板。

## 本地开发与验证

```bash
npm install
npm test
npm run build
npm run preview
```

`src/browser-api.js` 提供本站浏览器版操作层，对应原 PHP 原型的阅读、词汇、笔记与签核接口。独立测试覆盖内容可用性、访问者记录隔离、查看答案计分、草稿版本签核和保存失败反馈。

站点身份保存在 `.openai/hosting.json`。后续更新应复用该 project_id，通过 Sites source helper 推送源码、打包和发布，不重复创建站点。原本地 PHP 原型位于 `../../prototype/`，保持独立运行。

## 在线查词与翻译

阅读时选词可获得当前义项、词形、英文词典、音标、其他义项、搭配与近义词；选句返回所选句子的译文与结构说明。手边栏“查译词典”也支持独立输入英文单词或短语。独立查询不伪造文章出处，需在正文选词后才能加入带语境的词汇本。

查词与翻译 API 仅发送选区和用于消歧的原段落；文章概括 API 从本站目录读取该篇完整正文发送给 DeepSeek，不发送私人笔记。所有访问者可使用英文词典及 DeepSeek 中文解释和翻译，费用由站主的 DeepSeek API 账户承担；浏览器只调用本站后端，不接触密钥。配置项：`DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`，均由 Sites runtime secrets 管理，不放进源码或前端环境变量。已移除原来的邮箱白名单与 ChatGPT 登录要求。

开发时执行 `node scripts/preview-magpie.mjs` 可在 `http://127.0.0.1:4198` 预览真实 Magpie DeepSeek 调用；该脚本只在本机读取 `~/.config/magpie/providers.json` 到内存，不修改 Magpie 配置、不写出密钥，生产 Worker 不导入此脚本。`npm run preview` 使用 Worker 模拟器时需自行提供私有开发环境变量。

接口会验证选区与原文匹配，限制长度、拒绝跨站来源，合并同一实例的重复查询并缓存结果。实例内每个访问者 IP 每分钟最多 30 次新 AI 查询，实例整体每分钟最多 120 次；无法取得边缘提供的 IP 时使用共享匿名限流。缓存命中不消耗新调用次数；这不是跨地域统一额度上限。失败时词典结果可保留，明确显示 AI 错误与重试入口。英文词典出处及许可在词典展开区可见。

实现依据：[DeepSeek JSON 输出](https://api-docs.deepseek.com/guides/json_mode/)、[Free Dictionary API](https://dictionaryapi.dev/)、[Cloudflare React SPA + API](https://developers.cloudflare.com/workers/vite-plugin/tutorial/)。AI 解释和生成例句不冒充词典原文。

## 中文文章概括

`POST /api/summary` 仅接收 articleId，由服务端读取正文生成简体中文概括、3–5 条关键要点和总结，同时识别 6–8 个重点词汇（短文可更少），给出词性、IPA 音标和语境释义。服务端只保留能够与完整原文单词匹配的词条，保留段落出处；点击单词切换到查译词典，点击「全部加入单词表」会一次保存并自动进入词汇练习，重复操作不会重复添加。与查译共用服务端密钥、来源校验和调用限流；相同文章的并发请求合并，实例缓存 24 小时，浏览器按正文指纹缓存 7 天（最多 40 篇）。这些缓存不保证跨设备或服务实例共享。打开文章自动生成，切换文章时不会显示上一篇结果，生成失败可重试；不截断正文后冒充全文概括。
