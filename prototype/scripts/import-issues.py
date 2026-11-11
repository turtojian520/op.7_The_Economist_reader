"""Read existing Calibre EPUBs without changing them; import article text and local media."""
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import hashlib,json,re,posixpath
ROOT=Path(__file__).resolve().parents[1]
ORIGIN=Path('/Users/qinhao/Documents/calibre_config')
NS={'n':'http://www.daisy.org/z3986/2005/ncx/','h':'http://www.w3.org/1999/xhtml'}
issues=[]; articles=[]
for date in ['2026-11-07','2026-10-24','2026-10-03']:
    source=ORIGIN/f'economist-{date}'/'periodical.epub'
    z=ZipFile(source); names=z.namelist(); ncx=ET.fromstring(z.read('toc.ncx'))
    out=ROOT/'public'/'media'/date;out.mkdir(parents=True,exist_ok=True)
    def media(src,base=''):
        path=posixpath.normpath(posixpath.join(posixpath.dirname(base),src))
        if path not in names:return None
        local=out/Path(path).name
        local.write_bytes(z.read(path))
        return f'/media/{date}/{local.name}'
    cover=next((x for x in names if 'calibre_cover' in x),None)
    issue={'id':date,'date':date,'title':'The Economist','cover':media(cover) if cover else None,'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
    count=0; sections=[]
    for section in ncx.findall('.//n:navPoint[@class="section"]',NS):
        section_title=section.find('n:navLabel/n:text',NS).text;sections.append(section_title)
        for point in section.findall('n:navPoint[@class="article"]',NS):
            title=point.find('n:navLabel/n:text',NS).text
            src=point.find('n:content',NS).attrib['src'];file=src.split('#')[0]
            doc=ET.fromstring(z.read(file));body=doc.find('h:body',NS)
            ps=body.findall('.//h:p',NS)
            paragraphs=[];deck='';image=None;images=[];url=None;started=False;published=None
            for node in ps:
                text=''.join(node.itertext()).strip();text=re.sub(r'\s+',' ',text)
                if 'This article was downloaded by' in text:
                    links=node.findall('.//h:a',NS)
                    url=next((a.get('href') for a in reversed(links) if 'economist.com/' in a.get('href','')),None)
                    continue
                for img in node.findall('.//h:img',NS):
                    local_image=media(img.get('src'),file)
                    if local_image and local_image not in images:images.append(local_image)
                    if not image:image=local_image
                if not text or text==title or text.startswith('Subscribers can sign up'):continue
                if re.match(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b',text) and len(text)<60:
                    published=text; started=True; continue
                if not started and len(text)>90 and not node.findall('.//h:span[@class="italic"]',NS):started=True
                if not started:
                    if len(text)>35 and '|' not in text:deck=text
                    continue
                if len(text)>25:paragraphs.append({'id':f'p{len(paragraphs)+1}','text':text.rstrip(' ■')})
            if not paragraphs:
                paragraphs=[{'id':f'p{i+1}','text':re.sub(r'\s+',' ',''.join(p.itertext()).strip())} for i,p in enumerate(ps) if len(''.join(p.itertext()).strip())>100 and 'downloaded by' not in ''.join(p.itertext())]
            words=sum(len(re.findall(r"\b[\w’-]+\b",p['text'])) for p in paragraphs)
            aid=f'{date}-{count+1:03d}'
            articles.append({'id':aid,'issueId':date,'title':title,'section':section_title,'deck':deck,'image':image,'images':images,'imageOnly':not bool(paragraphs),'url':url,'published':published,'paragraphs':paragraphs,'wordCount':words,'minutes':max(1,round(words/180)),'sourceFile':file})
            count+=1
    issue.update(articleCount=count,sections=sections);issues.append(issue)
featured=next(a['id'] for a in articles if 'AI-controlled labs' in a['title'])
data={'issues':issues,'articles':articles,'featuredId':featured,'importedAt':'2026-11-09','coverage':'仅包含本地导入的三期，不代表完整历史目录'}
(ROOT/'server/data/catalog.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
(ROOT/'docs/import-report.json').write_text(json.dumps({'issues':issues,'articles':len(articles),'featuredId':featured},ensure_ascii=False,indent=2))
print(json.dumps({'issues':[(i['id'],i['articleCount']) for i in issues],'articles':len(articles),'featuredId':featured},ensure_ascii=False))
