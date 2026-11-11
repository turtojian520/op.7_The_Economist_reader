"""Verify both catalogs against source EPUB order without changing the books."""
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
figures = 0
for issue in local['issues']:
    with ZipFile(issue['source']) as book:
        for article in (a for a in local['articles'] if a['issueId'] == issue['id']):
            blocks = article['blocks']
            assert blocks == shared_by_id[article['id']]['blocks']
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
            assert [b['paragraphId'] for b in blocks if b['type'] == 'paragraph'] == list(paragraphs)
            assert [b['src'] for b in blocks if b['type'] == 'image'] == image_sources
            previous = -1
            for block in blocks:
                key = (block['type'], block['src'] if block['type'] == 'image' else paragraphs[block['paragraphId']])
                position = next(p for p in positions[key] if p > previous)
                assert position > previous
                previous = position
                if block['type'] == 'image':
                    for folder in ['prototype/public', 'sites/margin-reader-share/public']:
                        assert (ROOT / folder / block['src'].lstrip('/')).read_bytes() == book.read(
                            posixpath.normpath(posixpath.join(posixpath.dirname(article['sourceFile']), 'images', Path(block['src']).name)))
                    figures += 1
print(f"Verified {len(local['articles'])} articles and {figures} original figures: source order, paragraph references, asset bytes and shared parity.")
