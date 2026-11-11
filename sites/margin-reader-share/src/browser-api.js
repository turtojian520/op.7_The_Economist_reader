const STORAGE_KEY = 'margin-reader-share:v1';
const kinds = ['notes', 'drafts', 'vocabulary', 'attempts', 'reading'];
const emptyState = () => Object.fromEntries([...kinds, 'decisions'].map(key => [key, []]));
const clone = value => structuredClone(value);

// The hosted prototype uses per-browser storage. It never contacts the owner's PHP API.
export function createBrowserApi({storage, fetcher = globalThis.fetch, makeId = () => crypto.randomUUID(), now = () => new Date()} = {}) {
  const content = new Map();
  const getStorage = () => storage || globalThis.localStorage;
  const load = path => {
    if (!content.has(path)) content.set(path, fetcher(path).then(async response => {
      if (!response.ok) throw new Error('期刊加载失败，请刷新重试。');
      return response.json();
    }).catch(error => {content.delete(path);throw error;}));
    return content.get(path);
  };
  const read = () => {
    try {
      const raw = getStorage().getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const state = JSON.parse(raw);
      if (![...kinds, 'decisions'].every(key => Array.isArray(state[key]))) throw new Error('Invalid state');
      return state;
    } catch {
      throw new Error('无法读取此浏览器的学习记录，请检查是否允许网站存储数据。');
    }
  };
  const save = state => {
    try {getStorage().setItem(STORAGE_KEY, JSON.stringify(state));}
    catch {throw new Error('浏览器未能保存记录，可能已禁止存储或空间不足。请先导出已有笔记。');}
  };
  const snapshot = state => {
    const output = Object.fromEntries(kinds.map(key => [key, clone(state[key])]));
    output.notes.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    output.reading.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
    return output;
  };
  const string = (data, key, max = 5000, required = false) => {
    const value = data[key] ?? '';
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('请检查输入：' + key);
    return value.trim();
  };
  const today = offset => {
    const d = new Date(now());d.setDate(d.getDate() + offset);
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };
  const contextFor = (articles, data, quoteKey = 'text') => {
    const a = articles.find(a => a.id === string(data, 'articleId', 80, true));
    const p = a?.paragraphs.find(p => p.id === string(data, 'paragraphId', 20, true));
    const quote = string(data, quoteKey, 4000, true);
    if (!a || !p || !p.text.includes(quote)) throw new Error('选区与原文不匹配，请重新选择。');
    return {a,p,quote};
  };
  const related = (a,p,quote) => ({articleId:a.id, articleTitle:a.title, issueId:a.issueId, paragraphId:p.id, quote});

  return async function api(path, body, options = {}) {
    if (!body && path === '/state') return snapshot(read());
    if (!body && path === '/export') {
      const state = read();return {exportedAt:now().toISOString(), product:'Margin shared prototype', storage:'this-browser-only', state:snapshot(state), history:clone(state.decisions)};
    }
    const catalog = await load('/content/catalog.json');
    const articles = catalog.articles;
    if (!body && path === '/catalog') return {...clone(catalog), articles:articles.map(({paragraphs,...article}) => clone(article))};
    if (!body && path.startsWith('/article/')) {
      const a = articles.find(a => a.id === path.slice('/article/'.length));
      if (!a) throw new Error('文章不存在。');return clone(a);
    }
    if (!body) throw new Error('页面请求不存在。');
    if (path === '/lookup') {
      const response = await fetcher('/api/lookup', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:options.signal});
      let result;try{result=await response.json();}catch{throw new Error('翻译服务返回异常，请重试。');}
      if(!response.ok){const error=new Error(result.error||'查询失败，请重试。');error.code=result.code;error.status=response.status;throw error;}
      return result;
    }

    const state = read();
    const createdAt = now().toISOString();
    let result;
    if (path === '/reading') {
      const articleId = string(body,'articleId',80,true);
      if (!articles.some(a => a.id === articleId) || !['reading','completed'].includes(body.status)) throw new Error('阅读状态无效。');
      result = {id:articleId,articleId,status:body.status,updatedAt:createdAt};
      state.reading = [result,...state.reading.filter(r => r.id !== articleId)];
    } else if (path === '/notes') {
      if (!['note','highlight'].includes(body.kind)) throw new Error('不能直接创建已确认笔记。');
      const {a,p,quote} = contextFor(articles,body,'quote');
      result = {id:makeId(),...related(a,p,quote),text:string(body,'noteText',5000,body.kind === 'note'),tag:string(body,'tag',80),kind:body.kind,author:'user',createdAt};
      state.notes.push(result);
    } else if (path === '/vocabulary/batch') {
      if(!Array.isArray(body.words)||!body.words.length||body.words.length>8)throw new Error('请选择 1–8 个重点词汇。');
      let added=0;
      // Validate the complete batch before the single storage write.
      for(const word of body.words){
        const {a,p,quote}=contextFor(articles,word);
        if(!/^[A-Za-z][A-Za-z’' -]{0,65}$/.test(quote)||quote.split(' ').length>5)throw new Error('请选择英文单词或短语。');
        if(state.vocabulary.some(v=>v.articleId===a.id&&v.word.toLowerCase()===quote.toLowerCase()))continue;
        state.vocabulary.push({id:makeId(),...related(a,p,quote),word:quote,meaning:string(word,'meaning',500,true),phonetic:string(word,'phonetic',100),partOfSpeech:string(word,'partOfSpeech',60),context:p.text,createdAt,dueAt:today(0)});
        added++;
      }
      result={added};
    } else if (path === '/vocabulary') {
      const {a,p,quote} = contextFor(articles,body);
      if (!/^[A-Za-z][A-Za-z’' -]{0,65}$/.test(quote) || quote.split(' ').length > 5) throw new Error('请选择英文单词或短语。');
      const old = state.vocabulary.find(v => v.word.toLowerCase() === quote.toLowerCase() && v.articleId === a.id && v.paragraphId === p.id);
      if (old) return clone(old);
      result = {id:makeId(),...related(a,p,quote),word:quote,meaning:string(body,'meaning',500),phonetic:string(body,'phonetic',100),context:p.text,createdAt,dueAt:today(0)};
      state.vocabulary.push(result);
    } else if (path === '/attempts') {
      const v = state.vocabulary.find(v => v.id === body.vocabularyId);
      if (!v || !['cloze','meaning','copy'].includes(body.mode)) throw new Error('词条或练习模式无效。');
      const answer = string(body,'answer',100,true), group = string(body,'group',100,true);
      const revealed = !!body.revealed;
      const assisted = revealed || !!body.hinted || !!body.pasted || body.mode === 'copy';
      const correct = answer.toLowerCase() === v.word.toLowerCase();
      const first = !state.attempts.some(a => a.group === group && a.vocabularyId === v.id);
      result = {id:makeId(),vocabularyId:v.id,answer,correct,assisted,revealed,first,firstCorrect:first && correct && !assisted,mode:body.mode,group,createdAt};
      state.attempts.push(result);v.dueAt = today(1);
    } else if (path === '/drafts') {
      const n = state.notes.find(n => n.id === body.noteId && n.kind !== 'reviewed');
      if (!n) throw new Error('请选择一条原始笔记。');
      const old = state.drafts.find(d => d.noteId === n.id && d.status === 'pending');
      if (old) return clone(old);
      result = {id:makeId(),noteId:n.id,originalText:n.text,quote:n.quote,articleId:n.articleId,articleTitle:n.articleTitle,paragraphId:n.paragraphId,issueId:n.issueId,text:'我对这段内容的理解或疑问是：'+n.text+'\n接下来需要结合原句，继续核对这个判断。',version:1,status:'pending',provider:'local-template',createdAt};
      state.drafts.push(result);
    } else if (/^\/drafts\/[^/]+\/decision$/.test(path)) {
      const d = state.drafts.find(d => d.id === path.split('/')[2]);
      if (!d || d.version !== body.version) throw new Error('草稿不存在或版本已变化，请重新审阅。');
      const decision = body.decision;
      if (!['accept','reject','revoke'].includes(decision)) throw new Error('签核操作无效。');
      if (decision === 'revoke') {
        if (d.status !== 'accepted') throw new Error('该草稿当前未被采纳。');
        state.notes = state.notes.filter(n => n.id !== 'reviewed-'+d.id);d.status = 'revoked';
      } else {
        if (d.status !== 'pending') throw new Error('该草稿已处理，请刷新。');
        if (decision === 'accept') {
          const text = string(body,'text',6000,true);
          state.notes.push({id:'reviewed-'+d.id,articleId:d.articleId,articleTitle:d.articleTitle,paragraphId:d.paragraphId,issueId:d.issueId,quote:d.quote,text,kind:'reviewed',author:'user-confirmed-ai',originalNoteId:d.noteId,draftId:d.id,draftVersion:d.version,originalDraft:d.text,edited:text!==d.text,createdAt});d.status = 'accepted';
        } else d.status = 'rejected';
      }
      state.decisions.push({id:makeId(),draftId:d.id,version:d.version,decision,text:body.text??null,actor:'this-browser-user',createdAt});result = d;
    } else throw new Error('页面请求不存在。');
    save(state);return clone(result);
  };
}
export const api = createBrowserApi();
