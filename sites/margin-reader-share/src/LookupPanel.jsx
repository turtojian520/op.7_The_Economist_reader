import React, {useEffect,useState} from 'react';
import {Search,Languages,Volume2,Plus,Check,PenLine,Loader,RotateCcw,Copy,ExternalLink} from 'lucide-react';
export function LookupPanel({selection,definition,lookup,quickWord,addWord,vocabulary,saving,onNote,notify}){
 const [query,setQuery]=useState('');
 useEffect(()=>{if(selection?.task==='dictionary')setQuery(selection.text);},[selection]);
 const speak=lang=>{
  if(!selection?.text||!('speechSynthesis' in window)){notify('此浏览器暂不支持朗读');return;}
  speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(definition?.headword||selection.text);utterance.lang=lang;
  const voice=speechSynthesis.getVoices().find(v=>v.lang===lang);if(voice)utterance.voice=voice;
  utterance.onerror=()=>notify('发音暂不可用，可稍后重试');speechSynthesis.speak(utterance);
 };
 const word=definition?.kind!=='translation';
 const known=selection&&vocabulary.some(v=>v.word.toLowerCase()===selection.text.toLowerCase());
 const anchor=!!selection?.paragraphId;
 const copy=async()=>{try{await navigator.clipboard.writeText(definition.translation);notify('译文已复制');}catch{notify('复制失败，可直接选中译文复制');}};
 return <div className="definition-panel">
  <form className="dictionary-search" onSubmit={e=>{e.preventDefault();if(query.trim())lookup({text:query.trim(),task:'dictionary'});}}>
   <label className="sr-only" htmlFor="dictionary-query">查询英文单词或短语</label>
   <input id="dictionary-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="查单词或短语…" maxLength={80}/>
   <button type="submit" className="dictionary-submit" disabled={!query.trim()} aria-label="查询词典"><Search size={18}/></button>
  </form>
  {!selection?<div className="panel-empty"><Languages/><h3>理解一个词，也理解它的语境。</h3><p>选中正文查询，或在上方输入单词和短语。</p><button className="quiet" onClick={quickWord}>试着查询文中的词</button></div>:<>
   <h2 className={selection.text.length>40?'selected-sentence':''}>{selection.text}</h2>
   {anchor&&<div className="lookup-mode" aria-label="释义方式"><button className={selection.task!=='translate'?'active':''} onClick={()=>lookup({...selection,task:undefined})}>语境查译</button><button className={selection.task==='translate'?'active':''} onClick={()=>lookup({...selection,task:'translate'})}>翻译选区</button></div>}
    {definition?.aiNotice&&<p className="ai-notice">{definition.aiNotice}{definition.canRetryAI&&<button className="text-button" onClick={()=>lookup(selection)}><RotateCcw size={14}/>重试中文解释</button>}</p>}
   {definition?.loading?<p className="loading" role="status"><Loader size={18}/>正在查询词典与语境解释…</p>:definition?.error?<div className="lookup-error" role="alert"><p>{definition.error}</p><button className="quiet full" onClick={()=>lookup(selection)}><RotateCcw size={16}/>重试查询</button></div>:definition?.meaning?<>
    {word?<>
     {(definition.headword||definition.phonetic)&&<div className="word-heading"><span>{definition.headword!==selection.text?definition.headword:''}</span><span>{definition.phonetic}</span></div>}
     <div className="pronunciation-actions"><button onClick={()=>speak('en-GB')} aria-label="英音朗读"><Volume2 size={16}/>英音</button><button onClick={()=>speak('en-US')} aria-label="美音朗读"><Volume2 size={16}/>美音</button></div>
     <p className="word-meaning">{definition.partOfSpeech&&<span className="part-of-speech">{definition.partOfSpeech}</span>}{definition.meaning}</p>
     {definition.explanation&&<section className="lookup-explanation"><h3>{anchor?'在这句话里':'怎么使用'}</h3><p>{definition.explanation}</p></section>}
     {definition.senses?.length>0&&<details className="lookup-details"><summary>其他常见义项</summary>{definition.senses.map((s,i)=><div key={i} className="sense-entry"><span>{s.partOfSpeech}</span><p>{s.meaning}</p>{s.example&&<blockquote>{s.example}<small>AI 生成例句</small></blockquote>}</div>)}</details>}
     {definition.phrases?.length>0&&<details className="lookup-details"><summary>常用搭配</summary>{definition.phrases.map((p,i)=><div className="phrase-entry" key={i}><strong>{p.phrase}</strong><span>{p.meaning}</span></div>)}</details>}
     {definition.synonyms?.length>0&&<details className="lookup-details"><summary>近义词怎么区分</summary>{definition.synonyms.map((p,i)=><div className="phrase-entry" key={i}><strong>{p.word}</strong><span>{p.note}</span></div>)}</details>}
     {definition.dictionary&&<details className="lookup-details dictionary-entry"><summary>英文词典释义</summary>{definition.dictionary.meanings.map((m,i)=><div className="sense-entry" key={i}><span>{m.partOfSpeech}</span>{m.definitions.map((d,j)=><div key={j}><p>{d.definition}</p>{d.example&&<blockquote>{d.example}</blockquote>}</div>)}</div>)}<p className="lookup-source"><a href="https://dictionaryapi.dev/" target="_blank" rel="noreferrer">Free Dictionary API <ExternalLink size={12}/></a>{definition.dictionary.entryUrl&&<a href={definition.dictionary.entryUrl} target="_blank" rel="noreferrer">词条原文</a>}{definition.dictionary.licenseUrl&&<a href={definition.dictionary.licenseUrl} target="_blank" rel="noreferrer">{definition.dictionary.license||'词典许可'}</a>}</p></details>}
    </>:<>
     <div className="translation-result"><span>选区译文</span><p>{definition.translation}</p><div className="translation-actions"><button className="text-button" onClick={copy}><Copy size={14}/>复制译文</button><button className="text-button" onClick={()=>speak('en-GB')}><Volume2 size={15}/>朗读原文</button></div></div>
     {definition.explanation&&<section className="lookup-explanation"><h3>理解这句话</h3><p>{definition.explanation}</p></section>}
     {definition.grammar?.length>0&&<details className="lookup-details" open><summary>句子结构与表达</summary>{definition.grammar.map((g,i)=><div className="phrase-entry" key={i}><strong>{g.fragment}</strong><span>{g.explanation}</span></div>)}</details>}
    </>}
    {definition.context&&<details className="lookup-details original-context"><summary>查看原文语境</summary><blockquote>{definition.context}</blockquote></details>}
    <p className="lookup-source">{definition.source==='DeepSeek'?'DeepSeek 生成的中文解释，请结合原文判断。':'英文释义来自 Free Dictionary API。'}</p>

   </>:null}
   <button className="primary full" disabled={saving||definition?.loading||!anchor||selection.text.split(/\s+/).length>5} onClick={addWord}>{known?<Check size={17}/>:<Plus size={17}/>} {known?'已在词汇本':'加入拼写练习'}</button>
   <button className="quiet full" disabled={!anchor} onClick={onNote}><PenLine size={17}/>记下我的理解</button>
   {!anchor&&<p className="lookup-source">在正文中选词，可把原句一起加入拼写练习。</p>}
  </>}
 </div>;
}
