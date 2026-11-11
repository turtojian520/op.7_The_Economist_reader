# The Economist Reader — 个人 LLM Wiki

一座用 [nashsu/llm_wiki](https://github.com/nashsu/llm_wiki) 模式维护的个人知识库，主题是 **“AI 时代的阅读与学习工具”**。
素材由 ego-browser 真实浏览器采集，正文与图片都已本地化，不依赖外链。

## 三层结构

```
sources/    原始素材（只读）：文章全文、视频、逐帧记录、图片、元数据与哈希
wiki/       LLM 维护的 wiki：索引、日志、总览、来源摘要、实体页、概念页、综合页
AGENTS.md   维护规约（schema）：页面格式、ingest/query/lint 工作流
```

## 已收录素材（3）

| 素材 | 类型 | 本地入口 |
|---|---|---|
| 公众号「Draco正在VibeCoding」：《我在开发全世界最好的电子书阅读器》 | 文章 + 10 张截图 | [sources/2026-10-30-wechat-draco-ereader/article.md](sources/2026-10-30-wechat-draco-ereader/article.md) |
| 抖音「猫吃小鱼」：《【012期】打字背单词效率直接翻倍，开源免费》 | 短视频（42.7s）+ 9 帧 | [sources/2026-11-07-douyin-typewords/video-note.md](sources/2026-11-07-douyin-typewords/video-note.md) |
| 公众号（用户提供）：《别搞 AI 个人知识库了，真的没用》 | 观点文章（去口语化 + raw 原文） | [sources/2026-11-09-wechat-ai-knowledge-base/article.md](sources/2026-11-09-wechat-ai-knowledge-base/article.md) |

## 怎么开始读

1. 打开 [wiki/index.md](wiki/index.md)（内容目录）
2. 读 [wiki/overview.md](wiki/overview.md)（当前判断与缺口）
3. 想看对比结论 → [wiki/synthesis/reading-vs-memorization.md](wiki/synthesis/reading-vs-memorization.md)
4. 想核对原文 → 对应 `sources/…` 下的 `article.md` / `video-note.md`

推荐用 Obsidian 打开本目录（graph view 能直接看到页面关系）。

## 怎么继续维护

- **新增素材**：放进 `sources/<yyyy-mm-dd>-<平台>-<短标题>/`，按 `sources/README.md` 的目录约定；然后让 LLM 按 `AGENTS.md` 的 Ingest 流程更新 wiki。
- **提问**：先让 LLM 读 `wiki/index.md` 定位页面；有长期价值的回答另存为 `wiki/synthesis/` 页面。
- **体检**：定期让 LLM 跑 `AGENTS.md` 的 Lint 流程，检查孤儿页、过期结论、图片断链。

## 校验素材完整性

```bash
python3 scripts/verify_sources.py
# → 校验 sources/**/meta.json 中记录的 SHA-256
```

## Git 与分支管理

GitHub 公开仓库：[turtojian520/op.7_The_Economist_reader](https://github.com/turtojian520/op.7_The_Economist_reader)。`main` 为主分支，Codex 功能开发使用 `codex/<任务名>` 分支与 Worktree；操作说明见 [Git 协作流程](docs/git-workflow.md)。本地数据库、密钥、依赖与构建缓存不提交。

## 环境

- 采集：ego-browser（ego lite）2.2.0，真实浏览器会话
- 视频抽帧：ffmpeg 9.0.2
- 校验脚本：Python 3（仅标准库）

## MVP 交互原型

[旁读 Margin](prototype/README.md) 已接入本地最近三期《经济学人》，可运行阅读、选词释义、拼写与笔记签核流程。使用项目独立的 Apache + PHP-FPM + MariaDB；演示范围与启动方式见原型说明。

ChatGPT Sites：[旁读 Margin](https://margin-economist-reader.hybrid-klvvc-7155.chatgpt.site)。分享版已接入 DeepSeek 查词与翻译，持有链接即可使用站主 API，无需登录 ChatGPT；学习记录存于各自浏览器，详见 [分享版说明](sites/margin-reader-share/README.md)。
