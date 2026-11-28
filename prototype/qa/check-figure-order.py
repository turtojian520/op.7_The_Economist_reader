"""Verify catalog and media parity, and The Economist's source EPUB order."""
import json
import posixpath
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
local = json.loads((ROOT / 'prototype/server/data/catalog.json').read_text())
shared = json.loads((ROOT / 'sites/margin-reader-share/public/content/catalog.json').read_text())
shared_by_id = {a['id']: a for a in shared['articles']}
assert len(shared_by_id) == len(local['articles']) == len(shared['articles'])
assert shared['issues'] == [
    {key: value for key, value in issue.items() if key not in {'source', 'sha256'}}
    for issue in local['issues']
]
media = {issue['cover'] for issue in local['issues'] if issue.get('cover')}
figures = 0
for article in local['articles']:
    assert shared_by_id[article['id']] == {k: v for k, v in article.items() if k != 'sourceFile'}
    blocks = article['blocks']
    assert [b['paragraphId'] for b in blocks if b['type'] == 'paragraph'] == [
        p['id'] for p in article['paragraphs']
    ]
    media.update(b['src'] for b in blocks if b['type'] == 'image')
    media.update(article['images'])
    if article['image']:
        media.add(article['image'])
for src in media:
    relative = src.lstrip('/')
    assert (ROOT / 'prototype/public' / relative).read_bytes() == (
        ROOT / 'sites/margin-reader-share/public' / relative
    ).read_bytes(), src

economist_articles = 0
for issue in local['issues']:
    if issue['title'] != 'The Economist':
        continue
    with ZipFile(issue['source']) as book:
        for article in (a for a in local['articles'] if a['issueId'] == issue['id']):
            economist_articles += 1
            blocks = article['blocks']
            document = ET.fromstring(book.read(article['sourceFile']))
            # Source-node positions must increase across every displayed block.
            positions = {}
            image_sources = []
            for position, node in enumerate(document.iter()):
                if node.tag.endswith('}img'):
                    source = posixpath.normpath(posixpath.join(posixpath.dirname(article['sourceFile']), node.get('src')))
                    local_src = f"/media/{issue['id']}/{Path(source).name}"
                    image_sources.append(local_src)
                    positions.setdefault(('image', local_src), []).append(position)
                elif node.tag.endswith('}p'):
                    text = re.sub(r'\s+', ' ', ''.join(node.itertext()).strip()).rstrip(' ■')
                    positions.setdefault(('paragraph', text), []).append(position)
            paragraphs = {p['id']: p['text'] for p in article['paragraphs']}
            assert [b['src'] for b in blocks if b['type'] == 'image'] == image_sources
            previous = -1
            for block in blocks:
                key = (block['type'], block['src'] if block['type'] == 'image' else paragraphs[block['paragraphId']])
                position = next(p for p in positions[key] if p > previous)
                assert position > previous
                previous = position
                if block['type'] == 'image':
                    assert (ROOT / 'prototype/public' / block['src'].lstrip('/')).read_bytes() == book.read(
                        posixpath.normpath(posixpath.join(posixpath.dirname(article['sourceFile']), 'images', Path(block['src']).name)))
                    figures += 1
print(f"Matched {len(local['articles'])} articles and {len(media)} media files across both readers. "
      f"Verified EPUB order and bytes for {economist_articles} Economist entries and {figures} image references.")
