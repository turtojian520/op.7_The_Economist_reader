"""Import local Calibre EPUBs into the Margin catalogue, one Atlantic issue per file."""
import argparse
import hashlib
import json
import posixpath
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NCX = '{http://www.daisy.org/z3986/2005/ncx/}'
HTML = '{http://www.w3.org/1999/xhtml}'


def article_text(node):
    def visit(element):
        yield element.text or ''
        for child in element:
            if child.tag == HTML + 'br':
                yield '\n'
            else:
                yield from visit(child)
            yield child.tail or ''
    return '\n'.join(' '.join(line.split()) for line in ''.join(visit(node)).split('\n')).strip()


def read_issue(source):
    assets = {}
    articles = []
    skipped = []
    months = set()
    position = 0
    with ZipFile(source) as book:
        def asset(reference, page=''):
            path = posixpath.normpath(posixpath.join(posixpath.dirname(page), unquote(reference)))
            assets[path] = book.read(path)
            return path

        cover = asset('cover.jpg')
        toc = ET.fromstring(book.read('toc.ncx')).find(NCX + 'navMap')
        for section in toc.findall(NCX + 'navPoint'):
            section_title = section.findtext(f'{NCX}navLabel/{NCX}text')
            for point in section.findall(NCX + 'navPoint'):
                position += 1
                title = point.findtext(f'{NCX}navLabel/{NCX}text')
                page = urlsplit(point.find(NCX + 'content').get('src')).path
                document = ET.fromstring(book.read(page))
                body = document.find(f'.//{HTML}div[@id="from-json-by-calibre"]')
                if body is None:
                    skipped.append(title)
                    continue
                url = next(link.get('href') for paragraph in document.iter(HTML + 'p')
                           if article_text(paragraph).startswith('This article was downloaded by calibre from')
                           for link in paragraph.findall(HTML + 'a'))
                month = re.fullmatch(r'/magazine/(\d{4})/(0[1-9]|1[0-2])/.+', urlsplit(url).path)
                if urlsplit(url).hostname != 'www.theatlantic.com' or month is None:
                    raise ValueError(f'Cannot identify the print edition of {title}: {url}')
                months.add('-'.join(month.groups()))
                deck = body.find(HTML + 'h2')
                paragraphs = []
                blocks = []
                images = []
                for element in body.iter():
                    if element.tag == HTML + 'img':
                        image = asset(element.get('src'), page)
                        images.append(image)
                        blocks.append({'type': 'image', 'src': image,
                                       'alt': element.get('alt') or f'{title} · 原刊配图'})
                    elif element.tag == HTML + 'p' or (
                        element.tag == HTML + 'blockquote' and element.find('.//' + HTML + 'p') is None
                    ):
                        content = article_text(element)
                        if content:
                            paragraph_id = f'p{len(paragraphs) + 1}'
                            paragraphs.append({'id': paragraph_id, 'text': content})
                            blocks.append({'type': 'paragraph', 'paragraphId': paragraph_id})
                if not paragraphs:
                    raise ValueError(f'No readable paragraphs in {title}')
                words = sum(len(re.findall(r"\b[\w’-]+\b", paragraph['text'])) for paragraph in paragraphs)
                articles.append(dict(id=f'{position:03d}', title=title, section=section_title, url=url,
                                     deck=article_text(deck) if deck is not None else '',
                                     paragraphs=paragraphs, blocks=blocks, images=list(dict.fromkeys(images)),
                                     imageOnly=False, wordCount=words, minutes=max(1, round(words / 180)),
                                     sourceFile=page))
    if len(months) != 1:
        raise ValueError(f'Expected one print edition in {source}, found {sorted(months)}')
    month = months.pop()
    issue_id = f'{month}-atlantic'
    media_prefix = f'/media/{issue_id}/'
    for article in articles:
        article.update(id=f'{issue_id}-{article["id"]}', issueId=issue_id, published=None)
        article['images'] = [media_prefix + image for image in article['images']]
        article['image'] = next(iter(article['images']), None)
        for block in article['blocks']:
            if block['type'] == 'image':
                block['src'] = media_prefix + block['src']
    issue = dict(id=issue_id, date=month, title='The Atlantic', cover=media_prefix + cover,
                 source=str(source.resolve()), sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                 articleCount=len(articles), sections=list(dict.fromkeys(a['section'] for a in articles)))
    return issue, articles, assets, skipped


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('epubs', nargs='+', type=Path)
    args = parser.parse_args()
    imported = [read_issue(source) for source in args.epubs]
    issue_ids = {issue['id'] for issue, _, _, _ in imported}
    if len(issue_ids) != len(imported):
        parser.error('More than one EPUB represents the same print edition')
    catalog_path = ROOT / 'server/data/catalog.json'
    catalog = json.loads(catalog_path.read_text())
    report_path = ROOT / 'docs/import-report.json'
    report = json.loads(report_path.read_text())
    catalog['issues'] = [issue for issue in catalog['issues'] if issue['id'] not in issue_ids]
    catalog['articles'] = [article for article in catalog['articles'] if article['issueId'] not in issue_ids]
    for issue, articles, assets, skipped in sorted(imported, key=lambda entry: entry[0]['date'], reverse=True):
        catalog['issues'].append(issue)
        catalog['articles'].extend(articles)
        for name, data in assets.items():
            target = ROOT / 'public/media' / issue['id'] / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        print(json.dumps({'issue': issue['id'], 'articles': len(articles), 'skipped': skipped},
                         ensure_ascii=False))
    catalog['coverage'] = f'已导入 {len(catalog["issues"])} 份期刊或新闻合集'
    pending = catalog_path.with_suffix('.tmp')
    pending.write_text(json.dumps(catalog, ensure_ascii=False), encoding='utf-8')
    pending.replace(catalog_path)
    report.update(issues=catalog['issues'], articles=len(catalog['articles']))
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
