"""Audit App-downloaded text against public article HTML; never replace text with web content."""
from pathlib import Path
from zipfile import ZipFile
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen, Request
import xml.etree.ElementTree as ET
import ast, json, re, unicodedata, hashlib
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent
ns={'h':'http://www.w3.org/1999/xhtml','n':'http://www.daisy.org/z3986/2005/ncx/'}
def norm(t):
 return re.sub(r'\s+','',unicodedata.normalize('NFKC',t)).replace('\u00ad','').replace('"','').replace('»','').replace('«','').replace('„','').replace('“','').replace('”','')
def get(url):
 try:return urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read()
 except Exception:return None
z=ZipFile(ROOT/'spiegel-app-download.epub');tree=ET.fromstring(z.read('toc.ncx'));rows=[]
for section in tree.findall('.//n:navPoint',ns):
 for point in section.findall('n:navPoint',ns):
  if point.findall('n:navPoint',ns):continue
  src=point.find('n:content',ns).get('src').split('#')[0];doc=ET.fromstring(z.read(src));body=doc.find('h:body',ns)
  ps=[' '.join(''.join(p.itertext()).split()) for p in body.findall('.//h:p',ns)]
  title=point.findtext('n:navLabel/n:text',namespaces=ns)
  if ps and norm(ps[0]).removesuffix('-DERSPIEGEL')==norm(title):ps=ps[1:]
  row={'title':title,'section':section.findtext('n:navLabel/n:text',namespaces=ns),'file':src,'paragraphs':ps}
  row['status']='subscription-prompt' if any('Freier Zugriff auf alle S+' in p for p in ps) else 'pending'
  rows.append(row)
recipes=ast.parse((ROOT/'spiegelde.recipe').read_text());feeds=[]
for node in ast.walk(recipes):
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='feeds' for t in node.targets):feeds=ast.literal_eval(node.value)
print('Entries:',len(rows),'Subscription:',sum(r['status']=='subscription-prompt' for r in rows),flush=True)
mapping={}
with ThreadPoolExecutor(8) as pool:
 for (name,url),data in zip(feeds,pool.map(get,[u.replace('http:','https:') for _,u in feeds])):
  if not data:continue
  try:feed=ET.fromstring(data)
  except ET.ParseError:continue
  for item in feed.findall('.//item'):
   title=item.findtext('title');link=item.findtext('link')
   if title and link:mapping[norm(title)]=link.split('#')[0]
print('RSS titles:',len(mapping),flush=True)
cache=ROOT/'app-audit-pages';cache.mkdir(exist_ok=True)
for row in rows:
 if row['status']=='pending':
  row['url']=mapping.get(norm(row['title']))
  if not row['url']:row['status']='unverified-source'
pending=[r for r in rows if r['status']=='pending']
def audit(row):
 path=cache/(hashlib.sha256(row['url'].encode()).hexdigest()[:20]+'.html')
 data=path.read_bytes() if path.exists() else get(row['url'])
 if not data:row['status']='source-unavailable';return
 if not path.exists():path.write_bytes(data)
 soup=BeautifulSoup(data,'html.parser');area=soup.select_one('[data-area="body"]')
 if area is None:row['status']='unverified-body';return
 paragraphs=area.select('[data-area="text"] p')
 if not paragraphs:row['status']='no-public-text';return
 expected=[''.join(p.strings).strip() for p in paragraphs if p.get_text(strip=True)]
 actual=norm(' '.join(row['paragraphs']))
 row['webParagraphs']=len(expected)
 row['missingParagraphs']=[p for p in expected if norm(p) not in actual]
 row['status']='incomplete' if row['missingParagraphs'] else 'complete-public-text'
 # Count matched text including opening and closing paragraphs; no length heuristic alone.
 row['matchedParagraphs']=len(expected)-len(row['missingParagraphs'])
with ThreadPoolExecutor(8) as pool:
 for i,_ in enumerate(pool.map(audit,pending),1):
  if i%20==0:print('Audited:',i,'/',len(pending),flush=True)
from collections import Counter
summary=dict(Counter(r['status'] for r in rows))
(ROOT/'app-filter-report.json').write_text(json.dumps({'source':'Calibre library item 525 (MOBI converted to EPUB)','summary':summary,'articles':rows},ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False),flush=True)
