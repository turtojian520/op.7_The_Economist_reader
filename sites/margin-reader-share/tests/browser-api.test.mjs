import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createBrowserApi} from '../src/browser-api.js';
const fixtures = Object.fromEntries(await Promise.all(['catalog','dictionary','translations'].map(async name => ['/content/'+name+'.json',JSON.parse(await readFile(new URL('../public/content/'+name+'.json',import.meta.url)))])));
const storage = () => {const data = new Map();return {getItem:k => data.get(k)??null,setItem:(k,v) => data.set(k,v)}};
const makeApi = s => createBrowserApi({storage:s,fetcher:async path => ({ok:!!fixtures[path],json:async()=>structuredClone(fixtures[path])})});
const article = fixtures['/content/catalog.json'].articles.find(a => a.id === fixtures['/content/catalog.json'].featuredId);
const paragraph = article.paragraphs.find(p => p.text.includes('hypothesis'));
const selection = {articleId:article.id,paragraphId:paragraph.id,text:'hypothesis'};

test('article API retains inline figure positions and all four economic data images',async()=>{
 const api=makeApi(storage());
 const japan=await api('/article/2026-11-07-013');
 assert.deepEqual(japan.blocks.slice(0,4).map(b=>b.type==='image'?b.src:b.paragraphId),[
  '/media/2026-11-07/00061.jpg','p1','/media/2026-11-07/00057.jpg','p2'
 ]);
 for(const original of fixtures['/content/catalog.json'].articles){
  const full=await api('/article/'+original.id);
  assert.deepEqual(full.blocks.filter(b=>b.type==='paragraph').map(b=>b.paragraphId),full.paragraphs.map(p=>p.id));
  assert.deepEqual(full.blocks.filter(b=>b.type==='image').map(b=>b.src),full.images);
  for(const b of full.blocks.filter(b=>b.type==='image')) assert.ok((await readFile(new URL('../public'+b.src,import.meta.url))).length>0);
  if(full.imageOnly) assert.equal(full.blocks.length,4);
 }
});

test('all nine editions are readable with no workstation paths in published content',async()=>{
 const api=makeApi(storage());const catalog=await api('/catalog');
 assert.equal(catalog.articles.length,431);
 assert.deepEqual(catalog.issues.map(i=>[i.id,i.articleCount]),[
  ['2026-11-21',80],['2026-11-14',76],['2026-11-07',76],['2026-10-24',75],['2026-10-03',74],
  ['2026-11-14-spiegel',9],['2026-09-atlantic',15],['2026-08-atlantic',13],['2026-06-atlantic',13]
 ]);
 assert.ok(catalog.articles.every(a=>!a.paragraphs));
 for(const issue of catalog.issues){
  assert.equal(catalog.articles.filter(a=>a.issueId===issue.id).length,issue.articleCount);
  assert.ok((await readFile(new URL('../public'+issue.cover,import.meta.url))).length>0);
 }
 const german=await api('/article/2026-11-14-spiegel-001');
 assert.equal(german.language,'de');
 assert.ok(german.paragraphs.length);
 const full=await api('/article/'+article.id);assert.ok(full.paragraphs.length);
 assert.ok(!JSON.stringify(fixtures).includes('/Users/'));
 assert.deepEqual(await api('/state'),{notes:[],drafts:[],vocabulary:[],attempts:[],reading:[],favorites:[]});
});
test('browser records persist on reopen and remain isolated across visitors',async()=>{
 const a=storage(),b=storage();const first=makeApi(a);await first('/notes',{...selection,quote:selection.text,noteText:'我还不确定。',kind:'note',tag:'问题'});
 assert.equal((await makeApi(a)('/state')).notes.length,1);
 assert.equal((await makeApi(b)('/state')).notes.length,0);
 await assert.rejects(first('/notes',{...selection,quote:'not in original',noteText:'wrong',kind:'note'}));
});
test('revealed answers are assisted and do not count as independent recall',async()=>{
 const api=makeApi(storage());const v=await api('/vocabulary',{...selection,meaning:'假设'});
 const revealed=await api('/attempts',{vocabularyId:v.id,answer:v.word,mode:'cloze',group:'revealed',revealed:true});assert.equal(revealed.assisted,true);assert.equal(revealed.firstCorrect,false);
 const independent=await api('/attempts',{vocabularyId:v.id,answer:v.word,mode:'cloze',group:'independent'});assert.equal(independent.firstCorrect,true);
 const exported=await api('/export');assert.equal(exported.storage,'this-browser-only');assert.equal(exported.state.attempts.length,2);
});
test('drafts require version-specific approval; edits, rejection and revocation preserve original notes',async()=>{
 const api=makeApi(storage());const note=await api('/notes',{...selection,quote:selection.text,noteText:'我还不确定。',kind:'note',tag:'问题'});
 await assert.rejects(api('/notes',{...selection,quote:selection.text,noteText:'fake',kind:'reviewed'}));
 const draft=await api('/drafts',{noteId:note.id});assert.equal((await api('/state')).notes.length,1);
 await assert.rejects(api('/drafts/'+draft.id+'/decision',{version:0,decision:'accept',text:'stale'}));
 await api('/drafts/'+draft.id+'/decision',{version:1,decision:'accept',text:'保留这个疑问，继续核对。'});
 const accepted=(await api('/state')).notes.find(n=>n.kind==='reviewed');assert.equal(accepted.edited,true);
 await assert.rejects(api('/drafts/'+draft.id+'/decision',{version:1,decision:'accept',text:'duplicate'}));
 await api('/drafts/'+draft.id+'/decision',{version:1,decision:'revoke'});assert.deepEqual((await api('/state')).notes,[note]);
 const second=await api('/drafts',{noteId:note.id});await api('/drafts/'+second.id+'/decision',{version:1,decision:'reject'});assert.deepEqual((await api('/state')).notes,[note]);
});
test('blocked storage fails visibly rather than claiming a successful save',async()=>{
 const api=makeApi({getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError')}});
 await assert.rejects(api('/notes',{...selection,quote:selection.text,noteText:'不能丢失',kind:'note'}),/未能保存/);
});

test('article key vocabulary batch persists once, deduplicates and immediately supports practice',async()=>{
 const s=storage(),api=makeApi(s);
 const word={...selection,meaning:'假设',phonetic:'/haɪˈpɒθəsɪs/',partOfSpeech:'n.'};
 assert.equal((await api('/vocabulary/batch',{words:[word,word]})).added,1);
 assert.equal((await api('/vocabulary/batch',{words:[word]})).added,0);
 const state=await makeApi(s)('/state'),saved=state.vocabulary[0];
 assert.equal(state.vocabulary.length,1);assert.equal(saved.partOfSpeech,'n.');assert.equal(saved.context,paragraph.text);assert.equal(saved.articleId,article.id);
 const attempt=await api('/attempts',{vocabularyId:saved.id,answer:'hypothesis',mode:'cloze',group:'key-words'});
 assert.equal(attempt.firstCorrect,true);
});
test('an invalid batch or blocked save never partially adds key vocabulary',async()=>{
 const api=makeApi(storage());
 await assert.rejects(api('/vocabulary/batch',{words:[{...selection,meaning:'假设'},{...selection,text:'inventedwordzz',meaning:'假词'}]}),/不匹配/);
 assert.equal((await api('/state')).vocabulary.length,0);
 const blocked=makeApi({getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError')}});
 await assert.rejects(blocked('/vocabulary/batch',{words:[{...selection,meaning:'假设'}]}),/未能保存/);
});

test('favorites persist, deduplicate, export, remove and remain isolated',async()=>{
 const s=storage(),api=makeApi(s),body={articleId:article.id,saved:true};
 await api('/favorites',body); await api('/favorites',body);
 assert.equal((await makeApi(s)('/state')).favorites.length,1);
 assert.equal((await api('/export')).state.favorites[0].articleId,article.id);
 assert.equal((await makeApi(storage())('/state')).favorites.length,0);
 await assert.rejects(api('/favorites',{articleId:'missing',saved:true}),/无效/);
 await assert.rejects(api('/favorites',{articleId:article.id,saved:'true'}),/无效/);
 await api('/favorites',{...body,saved:false});
 await api('/favorites',{...body,saved:false});
 assert.deepEqual((await makeApi(s)('/state')).favorites,[]);
});
test('legacy records gain favorites without losing learning data',async()=>{
 const s=storage(),api=makeApi(s);
 await api('/notes',{...selection,quote:selection.text,noteText:'保留笔记',kind:'note'});
 const legacy=JSON.parse(s.getItem('margin-reader-share:v1'));delete legacy.favorites;
 s.setItem('margin-reader-share:v1',JSON.stringify(legacy));
 const reopened=makeApi(s);
 assert.deepEqual((await reopened('/state')).favorites,[]);
 await reopened('/favorites',{articleId:article.id,saved:true});
 assert.equal((await reopened('/state')).notes[0].text,'保留笔记');
});
test('favorites reject blocked storage and malformed stored favorites',async()=>{
 const api=makeApi({getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError')}});
 await assert.rejects(api('/favorites',{articleId:article.id,saved:true}),/未能保存/);
 const s=storage();s.setItem('margin-reader-share:v1',JSON.stringify({notes:[],drafts:[],vocabulary:[],attempts:[],reading:[],decisions:[],favorites:null}));
 await assert.rejects(makeApi(s)('/state'),/无法读取/);
});
