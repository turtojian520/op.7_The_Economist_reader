"""Integration checks for data provenance and note-signoff boundaries; removes only its test rows."""
import json,urllib.request,urllib.error,uuid,subprocess,hashlib
from pathlib import Path
BASE='http://127.0.0.1:8097/api';created=[]
def req(path,data=None,status=200):
    r=urllib.request.Request(BASE+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(r) as res: code=res.status;value=json.load(res)
    except urllib.error.HTTPError as e:code=e.code;value=json.load(e)
    assert code==status,(path,code,value)
    return value

def remember(kind,r):created.append((kind,r['id']));return r
try:
    c=req('/catalog');assert len(c['articles'])==225;assert [i['articleCount'] for i in c['issues']]==[76,75,74]
    a=req('/article/'+c['featuredId']);p=next(p for p in a['paragraphs'] if 'hypothesis' in p['text']);sel={'articleId':a['id'],'paragraphId':p['id'],'text':'hypothesis'}
    assert req('/lookup',sel)['meaning'].startswith('n.')
    req('/lookup',{**sel,'text':'THIS IS NOT IN THE ARTICLE'},400)
    note=remember('notes',req('/notes',{'articleId':a['id'],'paragraphId':p['id'],'quote':'hypothesis','noteText':'[API TEST] 我还不确定这个判断。','tag':'测试','kind':'note'},201))
    req('/notes',{'articleId':a['id'],'paragraphId':p['id'],'quote':'hypothesis','noteText':'should fail','kind':'reviewed'},403)
    draft=remember('drafts',req('/drafts',{'noteId':note['id']},201))
    assert not any(n.get('originalNoteId')==note['id'] for n in req('/state')['notes'])
    req('/drafts/'+draft['id']+'/decision',{'version':0,'decision':'accept','text':'bad stale'},409)
    req('/drafts/'+draft['id']+'/decision',{'version':1,'decision':'accept','text':'[API TEST] 我仍保留疑问。'})
    s=req('/state');accepted=next(n for n in s['notes'] if n.get('originalNoteId')==note['id']);created.append(('notes',accepted['id']))
    assert accepted['edited'] and accepted['author']=='user-confirmed-ai'
    assert next(n for n in s['notes'] if n['id']==note['id'])['text']==note['text']
    req('/drafts/'+draft['id']+'/decision',{'version':1,'decision':'accept','text':'duplicate'},409)
    req('/drafts/'+draft['id']+'/decision',{'version':1,'decision':'revoke'})
    assert not any(n.get('originalNoteId')==note['id'] for n in req('/state')['notes'])
    assert any(n['id']==note['id'] for n in req('/state')['notes'])
    # Rejected candidates also remain outside the personal conclusion library.
    d2=remember('drafts',req('/drafts',{'noteId':note['id']},201));req('/drafts/'+d2['id']+'/decision',{'version':1,'decision':'reject'})
    # Use a distinct source occurrence so this test cannot overwrite a user's practice record.
    vp=next(p for p in a['paragraphs'] if 'supercharge' in p['text'])
    v=remember('vocabulary',req('/vocabulary',{'articleId':a['id'],'paragraphId':vp['id'],'text':'supercharge','meaning':'增强'},201))
    group=str(uuid.uuid4())
    first=remember('attempts',req('/attempts',{'vocabularyId':v['id'],'answer':'wrong','mode':'cloze','group':group},201));assert not first['correct']
    second=remember('attempts',req('/attempts',{'vocabularyId':v['id'],'answer':'supercharge','mode':'cloze','group':group},201));assert second['correct'] and not second['firstCorrect']
    assisted=remember('attempts',req('/attempts',{'vocabularyId':v['id'],'answer':'supercharge','mode':'copy','group':str(uuid.uuid4())},201));assert assisted['assisted'] and not assisted['firstCorrect']
    assert req('/export')['history']
    print('PASS: 225-article catalogue, provenance, lookup fallback, user-only original notes, pending isolation, stale version, acceptance diff, duplicate refusal, revocation, rejection, and recall scoring.')
finally:
    root=Path(__file__).resolve().parents[1];socket='/tmp/margin-'+hashlib.sha256(str(root/'server').encode()).hexdigest()[:12]+'.sock'
    # IDs are application-generated hex or known reviewed-hex; never arbitrary input.
    sql=[]
    for kind,id in created:
        assert all(ch.isalnum() or ch=='-' for ch in id)
        sql.append(f"DELETE FROM records WHERE kind='{kind}' AND id='{id}';")
        if kind=='drafts':sql.append(f"DELETE FROM records WHERE kind='decisions' AND JSON_UNQUOTE(JSON_EXTRACT(data,'$.draftId'))='{id}';")
    subprocess.run(['/opt/homebrew/opt/mariadb/bin/mariadb','--no-defaults','--socket='+socket,'-u','root','margin_reader'],input='\n'.join(sql),text=True,check=True)
