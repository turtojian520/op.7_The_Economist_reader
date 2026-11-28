"""Copy the current local catalog and its referenced media to the Sites edition."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'public'
SHARE = ROOT.parent / 'sites/margin-reader-share/public'


def sync_share_catalog():
    catalog = json.loads((ROOT / 'server/data/catalog.json').read_text(encoding='utf-8'))
    media = set()
    for issue in catalog['issues']:
        issue.pop('source', None)
        issue.pop('sha256', None)
        if issue.get('cover'):
            media.add(issue['cover'])
    for article in catalog['articles']:
        article.pop('sourceFile', None)
        if article.get('image'):
            media.add(article['image'])
        media.update(article.get('images', []))
        media.update(block['src'] for block in article.get('blocks', [])
                     if block['type'] == 'image')

    paths = [Path(url.removeprefix('/')) for url in sorted(media)]
    for path in paths:
        if path.parts[:1] != ('media',) or '..' in path.parts or not (LOCAL / path).is_file():
            raise SystemExit(f'Invalid or missing catalog media: {path}')
    for path in paths:
        target = SHARE / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(LOCAL / path, target)

    target = SHARE / 'content/catalog.json'
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(catalog, ensure_ascii=False), encoding='utf-8')
    temporary.replace(target)


if __name__ == '__main__':
    sync_share_catalog()
