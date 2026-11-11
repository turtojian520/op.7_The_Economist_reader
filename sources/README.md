# Sources — 原始素材层（只读）

本目录存放从网络上采集回来的**原始素材**，是整座 wiki 的**事实来源（source of truth）**。
任何 agent 都不应修改这里的正文、图片或元数据；如需修正，另开一个 `sources/<id>/corrections.md` 记录。

## 目录约定

```
sources/
└── <yyyy-mm-dd>-<平台>-<短标题>/
    ├── meta.json          # 机器可读元数据：URL、发布时间、抓取时间、图片/视频哈希、出处映射
    ├── article.md         # 文章类：全文正文 + 就地插入的本地图片（图片放 assets/）
    ├── video-note.md      # 视频类：文案 + 逐帧记录（画面文字、时间轴、关键截图）
    ├── raw/               # 原始抓取产物（innerText、HTML、RENDER_DATA 等），供溯源与重解析
    └── assets/            # 本地化图片、视频、截图（不依赖外链）
```

## 现有素材

| id | 类型 | 平台 | 标题 | 抓取时间 | 入口文件 |
|---|---|---|---|---|---|
| `2026-10-30-wechat-draco-ereader` | 文章 | 微信公众号「Draco正在VibeCoding」 | 我在开发全世界最好的电子书阅读器 | 2026-11-09 | [article.md](2026-10-30-wechat-draco-ereader/article.md) |
| `2026-11-07-douyin-typewords` | 短视频 | 抖音「猫吃小鱼」 | 【012期】别再死记硬背了！打字背单词效率直接翻倍，开源免费 | 2026-11-09 | [video-note.md](2026-11-07-douyin-typewords/video-note.md) |
| `2026-11-09-wechat-ai-knowledge-base` | 文章（用户粘贴） | 微信公众号（未署名/无链接） | 别搞 AI 个人知识库了，真的没用 | 2026-11-09 | [article.md](2026-11-09-wechat-ai-knowledge-base/article.md) |

## 采集方式

- 全部通过 **ego-browser（ego lite 2.2.0）** 以真实浏览器会话加载页面后提取，避免静态抓取被反爬/登录墙拦截。
- 图片通过页面提取到的 `data-src` 原始地址 + `Referer: https://mp.weixin.qq.com/` 下载为 PNG；抖音视频通过 `<video>` 元素的播放地址下载 MP4，再用 ffmpeg 抽帧。
- 每张图片、每段视频的 **远端地址、SHA-256、字节数** 都记录在各自 `meta.json` 中，可校验本地文件是否与采集时一致。

## 文本类素材（用户粘贴）

没有原始链接的文本素材：`raw/original-pasted.txt` 保存逐字原文；`article.md` 若经过整理（如去口语化），必须在 `meta.json` 的 `transformation` 字段写清改写范围与未改动项。

## 校验

```bash
# 校验所有素材哈希
python3 scripts/verify_sources.py
```
