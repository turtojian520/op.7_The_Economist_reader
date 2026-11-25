"""Import the audited public-news EPUB; preserve all existing issues and study records."""
import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('epub', type=Path)
parser.add_argument('--date', required=True)
args = parser.parse_args()
from datetime import date
date.fromisoformat(args.date)
report = json.loads((args.epub.parent / 'completeness.json').read_text())
expected = json.loads((args.epub.parent / 'audit-input.json').read_text())
issue_id = f'{args.date}-spiegel'
ns = {'h': 'http://www.w3.org/1999/xhtml'}
articles = []
with ZipFile(args.epub) as book:
    for row in report:
        if row['missing']:
            raise SystemExit(f'Incomplete article: {row["title"]}')
        original = next(x for x in expected if x['url'] == row['url'])
        doc = ET.fromstring(book.read(row['file']))
        texts = [' '.join(''.join(p.itertext()).split())
                 for area in doc.findall('.//h:div[@data-area="text"]', ns)
                 for p in area.iter()
                 if p.tag.rsplit('}', 1)[-1] in {'p', 'h2', 'h3', 'h4'} and ''.join(p.itertext()).strip()]
        # Import only verified article paragraphs, excluding Calibre navigation and download credits.
        cursor = 0
        compact = lambda text: re.sub(r'\s+', '', text)
        for text in original['expectedParagraphs']:
            while cursor < len(texts) and compact(texts[cursor]) != compact(text):
                cursor += 1
            if cursor == len(texts):
                raise SystemExit(f'Paragraph missing or out of order: {row["title"]}: {text[:80]}')
            cursor += 1
        paragraphs = [{'id': f'p{i+1}', 'text': text} for i, text in enumerate(texts)]
        count = sum(len(re.findall(r'\b[\w’-]+\b', p['text'])) for p in paragraphs)
        articles.append(dict(id=f'{issue_id}-{len(articles)+1:03d}', issueId=issue_id,
                             title=row['title'], section='DER SPIEGEL · 德语公开新闻',
                             language='de', deck='网站公开新闻合集 · 非周刊整刊',
                             image=None, images=[], imageOnly=False, url=row['url'],
                             published=args.date, paragraphs=paragraphs,
                             blocks=[{'type':'paragraph', 'paragraphId':p['id']} for p in paragraphs],
                             wordCount=count, minutes=max(1, round(count/180)), sourceFile=row['file']))
    cover = next((n for n in book.namelist() if n.endswith('.jpg') and 'cover' in n), None)
    media = ROOT / 'public/media' / issue_id
    media.mkdir(parents=True, exist_ok=True)
    if cover:
        (media/'cover.jpg').write_bytes(book.read(cover))
catalog_path = ROOT / 'server/data/catalog.json'
catalog = json.loads(catalog_path.read_text())
old_articles = [a for a in catalog['articles'] if a['issueId'] != issue_id]
old_issues = [i for i in catalog['issues'] if i['id'] != issue_id]
issue = dict(id=issue_id, date=args.date, title='DER SPIEGEL · 德语新闻', language='de',
             cover=f'/media/{issue_id}/cover.jpg' if cover else None,
             source=str(args.epub.resolve()), sha256=hashlib.sha256(args.epub.read_bytes()).hexdigest(),
             articleCount=len(articles), sections=['DER SPIEGEL · 德语公开新闻'])
catalog['articles'] = old_articles + articles
catalog['issues'] = old_issues + [issue]
catalog['coverage'] = f'已导入 {len(catalog["issues"])} 份期刊或新闻合集，不代表完整历史目录'
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False))
print(json.dumps({'issueId':issue_id, 'articles':len(articles),
                  'paragraphs':sum(len(a['paragraphs']) for a in articles),
                  'existingArticlesPreserved':len(old_articles)}, ensure_ascii=False))
