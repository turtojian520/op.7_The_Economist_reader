# Git 与 Codex 分支协作

本项目使用本地 Git 和 GitHub 远端保存版本，`main` 为主分支，功能修改使用 `codex/<任务名>` 分支。

远端仓库：https://github.com/turtojian520/op.7_The_Economist_reader

## 在 Codex / ChatGPT 桌面端使用

本目录已作为 Codex 项目打开。项目具有 Git 仓库后，可使用应用中的差异查看、提交、推送和分支操作。

在新聊天输入框选择 Worktree，以 `main` 为起点。应用会创建隔离工作目录；需要保留工作时，通过聊天顶部的 Create branch here 建立 `codex/<任务名>` 分支，然后提交、推送并创建 Pull Request，目标选择 `main`。通过审阅后合并。

Worktree 与本地目录共享提交历史，各自拥有文件副本。同一分支不能同时在两个目录检出；需要把工作移回原项目时使用应用的 Hand off。隔离目录不包含被忽略的依赖与本地数据库，前端开发需分别执行 `npm ci`。原项目数据库保留在 `prototype/server/runtime/`，不提交、不自动复制。

官方说明：[Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)。

## 终端操作

在项目根目录执行：

```bash
git switch main
git pull --ff-only
git switch -c codex/my-feature
# 修改文件后检查并提交
git diff
git add <本次修改的文件>
git commit -m "说明本次修改"
git push -u origin HEAD
gh pr create --base main
```

## 提交内容与验证

源码、Wiki、素材和已有验证记录纳入 Git；依赖、构建输出、缓存、密钥和本地 MariaDB 运行数据由 `.gitignore` 排除。GitHub 公开仓库中的已提交文件可被所有人读取。Sites 发布仍使用既有站点配置；Git 推送本身不触发站点部署。

当前本机 `sites/margin-reader-share/` 保留 Sites 独立仓库的 Git 元数据；主仓库直接跟踪其中的源码文件，不使用 submodule。分享版修改后，在项目根目录提交可保存完整项目；Sites 发布产生的内部提交不会自动成为主仓库提交，发布后仍需在根目录检查并提交文件变更。新克隆和 Worktree 中只有主仓库历史。

按修改范围运行现有检查：

```bash
python3 scripts/verify_sources.py
python3 scripts/lint_wiki.py
cd prototype && npm ci && npm run build
# 从项目根目录进入分享版
cd sites/margin-reader-share && npm ci && npm test && npm run build
```

Wiki 的变更继续遵守根目录 `AGENTS.md`，其中 `sources/` 的既有文件保持不可变。
