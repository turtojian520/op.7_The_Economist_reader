import React, {useEffect, useState} from 'react';
import {Loader, RotateCcw, Plus, Check} from 'lucide-react';

const pending = new Map();
const CACHE_KEY = 'margin:article-summaries:v3';
const valid = data => data?.kind === 'summary' && typeof data.overview === 'string' && typeof data.conclusion === 'string' && Array.isArray(data.vocabulary) && data.vocabulary.length > 0 && Array.isArray(data.points) && data.points.every(p => typeof p === 'string');
const readCache = () => {
  try {return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};}
  catch {return {};}
};
async function loadSummary(article) {
  // Include article content so an updated article never reuses an older summary.
  const bytes = new TextEncoder().encode(JSON.stringify([article.title, article.paragraphs]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  const key = article.id + ':' + fingerprint;
  const cached = readCache()[key];
  if (cached?.until > Date.now() && valid(cached.data)) return cached.data;
  if (!pending.has(key)) {
    const request = (async () => {
      const response = await fetch('/api/summary', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({articleId: article.id}), signal: AbortSignal.timeout(65000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '概括生成失败，请重试。');
      if (!valid(data) || data.articleId !== article.id) throw new Error('概括内容不完整，请重试。');
      try {
        const entries = Object.entries(readCache()).filter(([,v]) => v?.until > Date.now()).slice(-39);
        localStorage.setItem(CACHE_KEY, JSON.stringify({...Object.fromEntries(entries), [key]: {until: Date.now() + 7*86400000, data}}));
      } catch { /* Storage is optional; a generated summary stays readable. */ }
      return data;
    })();
    pending.set(key, request);
    request.finally(() => pending.delete(key)).catch(() => {});
  }
  return pending.get(key);
}

export function ArticleSummary({article, onLookup, onAddWords, saving, vocabulary}) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const hasText = article.paragraphs?.some(p => p.text?.trim());
  useEffect(() => {
    let active = true;
    setResult(null); setError('');
    if (hasText) loadSummary(article).then(data => {if (active) setResult(data);}).catch(e => {
      if (active) setError(e.name === 'TimeoutError' ? '生成耗时较长，请重试。' : e.message || '概括生成失败，请重试。');
    });
    return () => {active = false;};
  }, [article, hasText, attempt]);
  const allAdded = result?.vocabulary.every(w => vocabulary.some(v => v.articleId === article.id && v.word.toLowerCase() === w.word.toLowerCase()));
  return <section className="article-summary" aria-label="中文文章概括" aria-busy={hasText && !result && !error}>
    <span className="summary-eyebrow">读懂这一篇</span>
    <h2>文章概括</h2>
    {!hasText ? <p>这篇内容仅有图表，暂无可供概括的正文。</p> : error ? <div role="alert"><p>{error}</p><button className="quiet full" onClick={() => setAttempt(n => n + 1)}><RotateCcw size={16} aria-hidden="true" /> 重新生成概括</button></div> : !result ? <p className="summary-loading" role="status"><Loader size={16} className="spin" aria-hidden="true" /> 正在阅读原文，生成中文概括…</p> : <>
      <p className="summary-overview">{result.overview}</p>
      <h3>关键要点</h3>
      <ol>{result.points.map((point,i) => <li key={i}>{point}</li>)}</ol>
      <h3>总结</h3>
      <p className="summary-conclusion">{result.conclusion}</p>
      <p className="summary-attribution">由 DeepSeek 根据本文生成，请结合原文阅读。</p>
      <div className="guide-rule" />
      <h3>本文重点词汇</h3>
      <p>点击单词查看词典与原文语境。</p>
      <ul className="key-vocabulary">{result.vocabulary.map(w => <li key={w.word}>
        <button className="key-word" onClick={() => onLookup({text:w.word,paragraphId:w.paragraphId,articleId:article.id})}>{w.word}</button>
        <div className="key-word-meta"><span>{w.partOfSpeech}</span><span>{w.phonetic || '音标待确认'}</span></div>
        <p>{w.meaning}</p>
      </li>)}</ul>
      <button className="primary full" disabled={saving || allAdded} onClick={() => onAddWords(result.vocabulary)}>{allAdded ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{allAdded ? '已全部加入单词表' : saving ? '正在加入…' : '全部加入单词表'}</button>
      <p className="summary-attribution">加入后自动进入词汇练习，保留本文原句。词性、音标和释义由 AI 生成，可点击单词查证。</p>
    </>}
  </section>;
}
