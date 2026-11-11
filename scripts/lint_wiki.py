#!/usr/bin/env python3
"""LLM Wiki 体检脚本（对应 AGENTS.md 的 Lint 流程）。

检查项：
1. 所有 wiki / sources 文档中的相对链接与图片是否存在
2. 每个 wiki 页面是否有 frontmatter（title/type/updated）且非空
3. 每个 wiki 页面是否有「## 相关」小节并至少包含一个内部链接
4. wiki/index.md 是否列出了所有 wiki 页面

用法:
    python3 scripts/lint_wiki.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "wiki"
LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")


def is_external(target: str) -> bool:
    return target.startswith(("http://", "https://", "mailto:", "#"))


def check_links() -> list[str]:
    problems = []
    for md in list(WIKI.rglob("*.md")) + list((ROOT / "sources").rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        for target in LINK_RE.findall(text):
            clean = target.split("#")[0].strip()
            if not clean or is_external(clean):
                continue
            resolved = (md.parent / clean).resolve()
            if not resolved.exists():
                problems.append(f"{md.relative_to(ROOT)}: 断链 -> {target}")
    return problems


def check_frontmatter() -> list[str]:
    problems = []
    for md in WIKI.rglob("*.md"):
        if md.name in ("index.md", "log.md"):
            continue
        text = md.read_text(encoding="utf-8")
        if not text.startswith("---"):
            problems.append(f"{md.relative_to(ROOT)}: 缺少 frontmatter")
            continue
        fm = text.split("---", 2)[1]
        for key in ("title:", "type:", "updated:"):
            if key not in fm:
                problems.append(f"{md.relative_to(ROOT)}: frontmatter 缺少 {key}")
        if "## 相关" not in text:
            problems.append(f"{md.relative_to(ROOT)}: 缺少「## 相关」小节")
        elif not re.search(r"## 相关[\s\S]*?\]\(", text):
            problems.append(f"{md.relative_to(ROOT)}: 「## 相关」中没有内部链接")
    return problems


def check_index() -> list[str]:
    problems = []
    index_path = WIKI / "index.md"
    if not index_path.exists():
        return ["缺少 wiki/index.md"]
    index = index_path.read_text(encoding="utf-8")
    for md in WIKI.rglob("*.md"):
        if md in (index_path, WIKI / "log.md"):
            continue
        rel = md.relative_to(WIKI).as_posix()
        if rel not in index:
            problems.append(f"index.md 未收录: {rel}")
    return problems


def main() -> int:
    groups = {
        "断链": check_links(),
        "页面格式": check_frontmatter(),
        "索引": check_index(),
    }
    total = sum(len(v) for v in groups.values())
    for name, problems in groups.items():
        print(f"\n[{name}] {'OK' if not problems else str(len(problems)) + ' 个问题'}")
        for p in problems:
            print("  -", p)
    print(f"\n共 {total} 个问题。")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
