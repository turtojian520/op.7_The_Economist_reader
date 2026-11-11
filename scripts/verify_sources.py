#!/usr/bin/env python3
"""校验 sources/ 下所有素材的 SHA-256，确保本地文件与采集时一致。

用法:
    python3 scripts/verify_sources.py
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "sources"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def collect_entries(meta: dict) -> list[tuple[str, str]]:
    """返回 [(meta 中的相对路径, 期望 sha256), ...]"""
    entries: list[tuple[str, str]] = []
    for key in ("images", "media", "files"):
        val = meta.get(key)
        if not val:
            continue
        if isinstance(val, list):
            for item in val:
                if isinstance(item, dict) and item.get("local") and item.get("sha256"):
                    entries.append((item["local"], item["sha256"]))
        elif isinstance(val, dict):
            for item in val.values():
                if isinstance(item, dict) and item.get("local") and item.get("sha256"):
                    entries.append((item["local"], item["sha256"]))
                elif isinstance(item, list):
                    for sub in item:
                        if isinstance(sub, dict) and sub.get("local") and sub.get("sha256"):
                            entries.append((sub["local"], sub["sha256"]))
    return entries


def main() -> int:
    failures = 0
    total = 0
    for meta_path in sorted(SOURCES.glob("*/meta.json")):
        source_dir = meta_path.parent
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        entries = collect_entries(meta)
        print(f"\n{source_dir.relative_to(ROOT)}  ({len(entries)} 个文件)")
        for rel, expected in entries:
            total += 1
            path = source_dir / rel
            if not path.exists():
                print(f"  MISSING  {rel}")
                failures += 1
                continue
            actual = sha256(path)
            if actual == expected:
                print(f"  ok       {rel}")
            else:
                print(f"  MISMATCH {rel}\n           expected={expected}\n           actual  ={actual}")
                failures += 1
    print(f"\n共校验 {total} 个文件，失败 {failures} 个。")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
