import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  X,
  Highlighter,
  Languages,
  PenLine,
  Volume2,
  RotateCcw,
  CheckCheck,
  FileText,
  Keyboard,
  SlidersHorizontal,
  Download,
  ExternalLink,
  Loader,
  AlertCircle,
  CornerDownLeft,
  Menu,
  Trash2,
  Eye,
  Lightbulb,
  BookMarked,
  Maximize2,
} from "lucide-react";
import "./style.css";
import { ArticleFigure } from "./ArticleFigure.jsx";
import { ArticleSummary } from "./ArticleSummary.jsx";
import { LookupPanel } from "./LookupPanel.jsx";

import { api } from "./browser-api.js";

const date = (d) => d.replaceAll("-", ".");
const Icon = ({ name: Component, size = 18, ...p }) => (
  <Component size={size} strokeWidth={1.5} aria-hidden="true" {...p} />
);
const initialView = () => location.hash.slice(1).split("?")[0] || "library";
function App() {
  const [view, setView] = useState(initialView),
    [catalog, setCatalog] = useState(null),
    [state, setState] = useState({
      notes: [],
      drafts: [],
      vocabulary: [],
      attempts: [],
      reading: [],
    }),
    [article, setArticle] = useState(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [limit, setLimit] = useState(30);
  const [issue, setIssue] = useState("all"),
    [topic, setTopic] = useState("all"),
    [query, setQuery] = useState(""),
    [selection, setSelection] = useState(null),
    [definition, setDefinition] = useState(null),
    [panel, setPanel] = useState("guide"),
    [noteText, setNoteText] = useState(""),
    [tag, setTag] = useState("阅读思考"),
    [saving, setSaving] = useState(false),
    [fontSize, setFontSize] = useState(20),
    [noteTab, setNoteTab] = useState(
      new URLSearchParams(location.hash.split("?")[1]).get("tab") || "mine",
    );
  const reader = useRef(null),
    lookupSeq = useRef(0),
    lookupAbort = useRef(null),
    toastTimer = useRef(null);
  const notify = (m) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const sync = async () => {
    const d = await api("/state");
    setState(d);
    return d;
  };
  const go = (v) => {
    lookupAbort.current?.abort();
    lookupSeq.current++;
    setView(v);
    location.hash = v;
    window.scrollTo({ top: 0 });
    setSelection(null);
  };
  useEffect(() => {
    const cb = () => {
      setView(initialView());
      const params = new URLSearchParams(location.hash.split("?")[1]);
      const id = params.get("article");
      if (initialView() === "reader") setPanel("guide");
      if (initialView() === "reader" && id)
        api("/article/" + id)
          .then(setArticle)
          .catch((e) => notify(e.message));
      if (params.get("tab")) setNoteTab(params.get("tab"));
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setSelection(null);
        setPanel("guide");
      }
    };
    window.addEventListener("keydown", escape);
    window.addEventListener("hashchange", cb);
    Promise.all([api("/catalog"), api("/state")])
      .then(async ([c, s]) => {
        setCatalog(c);
        setState(s);
        const id =
          new URLSearchParams(location.hash.split("?")[1]).get("article") ||
          s.reading[0]?.articleId ||
          c.featuredId;
        setArticle(await api("/article/" + id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
    return () => {
      window.removeEventListener("hashchange", cb);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const openArticle = async (id) => {
    try {
      setBusy(true);
      const a = await api("/article/" + id);
      setArticle(a);
      setPanel("guide");
      setDefinition(null);
      setSelection(null);
      setNoteText("");
      go("reader");
      location.hash = "reader?article=" + id;
      api("/reading", {
        articleId: id,
        status:
          state.reading.find((r) => r.articleId === id)?.status || "reading",
      })
        .then(sync)
        .catch(() => {});
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  const run = async (fn) => {
    try {
      setSaving(true);
      await fn();
      await sync();
    } catch (e) {
      notify(e.message);
    } finally {
      setSaving(false);
    }
  };
  const selectText = () => {
    const s = window.getSelection();
    const text = s?.toString().trim();
    if (!text || text.length > 1600) return;
    let node = s.anchorNode?.parentElement;
    const p = node?.closest("[data-paragraph]");
    if (!p || !reader.current?.contains(p)) return;
    lookupAbort.current?.abort();
    lookupSeq.current++;
    setSelection({
      text,
      paragraphId: p.dataset.paragraph,
      articleId: article.id,
    });
    setDefinition(null);
  };
  const lookup = async (sel = selection) => {
    if (!sel) return;
    lookupAbort.current?.abort();
    const controller = new AbortController();
    lookupAbort.current = controller;
    setSelection(sel);
    const seq = ++lookupSeq.current;
    setPanel("translation");
    setDefinition({ loading: true });
    try {
      const d = await api("/lookup", sel, {signal: controller.signal});
      if (seq === lookupSeq.current) setDefinition(d);
    } catch (e) {
      if (seq === lookupSeq.current) setDefinition({ error: e.message, code:e.code });
    }
  };
  const quickWord = () => {
    const p =
      article.paragraphs.find((p) =>
        p.text.toLowerCase().includes("hypothesis"),
      ) || article.paragraphs.find((p) => p.text.length > 100);
    if (!p) {notify("本页为图片内容，暂不支持选词。请打开一篇文字文章。");return;}
    const text = p.text.includes("hypothesis")
      ? "hypothesis"
      : (p.text.match(/\b[a-z]{9,}\b/i) || ["research"])[0];
    const sel = { text, paragraphId: p.id, articleId: article.id };
    setSelection(sel);
    lookup(sel);
    document
      .getElementById(p.id)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const addWord = () =>
    run(async () => {
      await api("/vocabulary", {
        ...selection,
        meaning: definition?.meaning || "",
        phonetic: definition?.phonetic || "",
      });
      notify("已加入词汇本，原句也一起保留");
    });
  const saveHighlight = () =>
    run(async () => {
      await api("/notes", {
        ...selection,
        quote: selection.text,
        noteText: "",
        tag: "重点",
        kind: "highlight",
      });
      notify("重点已保存，可在笔记中回到原文");
      setSelection(null);
    });
  const saveNote = () =>
    run(async () => {
      await api("/notes", {
        ...selection,
        quote: selection.text,
        noteText,
        tag,
        kind: "note",
      });
      setNoteText("");
      notify("你的原话已保存");
      setPanel("guide");
      setSelection(null);
    });
  const draftFrom = (note) =>
    run(async () => {
      await api("/drafts", { noteId: note.id });
      setNoteTab("review");
      go("notes");
      notify("整理示例已生成，等待你确认");
    });
  const jumpTo = async (record) => {
    await openArticle(record.articleId);
    setTimeout(
      () =>
        document
          .getElementById(record.paragraphId)
          ?.scrollIntoView({ block: "center" }),
      250,
    );
  };
  const exportData = async () => {
    try {
      const d = await api("/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "margin-notes.json";
      a.click();
      URL.revokeObjectURL(url);
      notify("笔记、来源和签核历史已导出");
    } catch (e) {
      notify(e.message);
    }
  };
  const pending = state.drafts.filter((d) => d.status === "pending").length;
  if (!catalog)
    return (
      <div className="boot">
        <span className="brand-mark">m</span>
        <h1>旁读</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button onClick={() => location.reload()}>重新连接</button>
          </>
        ) : (
          <p>
            <Icon name={Loader} /> 正在打开你的书架
          </p>
        )}
      </div>
    );
  const readStatus = (id) =>
    state.reading.find((r) => r.articleId === id)?.status;
  const recommendations = catalog.articles
    .filter(
      (a) =>
        a.id !== article?.id &&
        readStatus(a.id) !== "completed" &&
        [
          "Science & technology",
          "Business",
          "China",
          "Finance & economics",
        ].includes(a.section),
    )
    .slice(0, 4);
  const displayArticles = catalog.articles.filter(
    (a) =>
      (issue === "all" || a.issueId === issue) &&
      (topic === "all" || a.section === topic) &&
      (!query ||
        (a.title + " " + a.deck + " " + a.section)
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const featured = catalog.articles.find((a) => a.id === catalog.featuredId);
  return (
    <>
      <header className="app-header">
        <a href="#library" className="wordmark" onClick={() => go("library")}>
          <span className="brand-mark">m</span>
          <span>
            旁读 <em>Margin</em>
          </span>
        </a>
        <nav aria-label="主导航">
          {[
            ["library", "书架", BookOpen],
            ["reader", "阅读", FileText],
            ["practice", "词汇练习", Keyboard],
            ["notes", "我的笔记", PenLine],
          ].map(([id, label, I]) => (
            <a
              key={id}
              href={"#" + id}
              aria-current={view === id ? "page" : undefined}
              onClick={() => go(id)}
            >
              <Icon name={I} size={17} />
              {label}
              {id === "notes" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </a>
          ))}
        </nav>
        <span className="header-end">
          <span className="local-label">旁读</span>
          <button
            className="avatar"
            onClick={exportData}
            aria-label="导出我的学习数据"
          >
            Q
          </button>
        </span>
      </header>
      <main>
        {view === "library" && (
          <div className="library page-wrap">
            <div className="page-heading">
              <div>
                <h1>在世界的字里行间。</h1>
                <p>读你关心的事，让英语在语境里生长。</p>
              </div>
              <span className="edition-date">
                2026 年 11 月 9 日<br />
                <span>你的私人阅读室</span>
              </span>
            </div>
            <section className="library-grid" aria-label="本周选读">
              <div className="lead-story">
                <div className="story-copy">
                  <h2>
                    <a
                      href={"#reader?article=" + featured.id}
                      onClick={(e) => {
                        e.preventDefault();
                        openArticle(featured.id);
                      }}
                    >
                      <span className="headline-link">{featured.title}</span>
                    </a>
                  </h2>
                  <p>{featured.deck}</p>
                  <div className="story-meta">
                    <span>{date(featured.issueId)}</span>
                    <span>约 {featured.minutes} 分钟</span>
                    <span>原版英文</span>
                  </div>
                  <button
                    className="primary"
                    onClick={() => openArticle(featured.id)}
                  >
                    开始阅读 <Icon name={ArrowUpRight} />
                  </button>
                </div>
                <button
                  className="story-image"
                  onClick={() => openArticle(featured.id)}
                  aria-label="阅读本期选读"
                >
                  <img
                    src={featured.image}
                    alt="本篇经济学人文章的实验室主题插图"
                  />
                </button>
              </div>
              <aside className="reading-invitation">
                <Icon name={BookMarked} size={26} />
                <h2>读懂，也记得住。</h2>
                <p>
                  在文章里遇见一个词，
                  <br />
                  在下一次阅读时认出它。
                </p>
                <div className="invitation-bottom">
                  <span>你的词汇本</span>
                  <strong>
                    {state.vocabulary.length}
                    <small> 个语境词汇</small>
                  </strong>
                  <button
                    className="text-button"
                    onClick={() => go("practice")}
                  >
                    去练习 <Icon name={ArrowRight} />
                  </button>
                </div>
              </aside>
            </section>
            <section className="issues-section">
              <div className="section-heading">
                <h2>你的期刊</h2>
                <span>已导入的三期原刊</span>
              </div>
              <div className="issue-shelf">
                {catalog.issues.map((i, index) => (
                  <button
                    className={
                      "issue-item " + (issue === i.id ? "selected" : "")
                    }
                    key={i.id}
                    onClick={() => {
                      setIssue(issue === i.id ? "all" : i.id);
                      document.getElementById("article-list")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    <img
                      src={i.cover}
                      alt={"The Economist " + i.date + " 期封面"}
                    />
                    <span className="issue-info">
                      <span>{index === 0 ? "最新一期" : "往期阅读"}</span>
                      <strong>{date(i.date)}</strong>
                      <span>
                        {i.articleCount} 篇文章 <ChevronRight size={16} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section id="article-list" className="article-catalog">
              <div className="section-heading">
                <h2>
                  {issue === "all"
                    ? "沿着兴趣，继续读"
                    : date(issue) + " 期目录"}
                </h2>
                <span>
                  {displayArticles.length} 篇
                  {issue !== "all" && (
                    <button
                      className="text-button"
                      onClick={() => setIssue("all")}
                    >
                      查看全部
                    </button>
                  )}
                </span>
              </div>
              <div className="filter-row">
                <div className="filter-tabs">
                  {[
                    ["all", "全部"],
                    ["China", "中国"],
                    ["Business", "商业"],
                    ["Finance & economics", "财经"],
                    ["Science & technology", "科技"],
                  ].map(([id, t]) => (
                    <button
                      key={id}
                      className={topic === id ? "active" : ""}
                      onClick={() => setTopic(id)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Icon name={Search} size={17} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索文章、议题…"
                    aria-label="搜索文章"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} aria-label="清空搜索">
                      <X size={15} />
                    </button>
                  )}
                </label>
              </div>
              <div className="article-rows">
                {displayArticles.length === 0 ? (
                  <div className="empty">
                    <Search />
                    <h3>没有找到这篇文章</h3>
                    <p>换个关键词，或试试其他期刊和栏目。</p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setTopic("all");
                        setIssue("all");
                      }}
                    >
                      清除筛选
                    </button>
                  </div>
                ) : (
                  displayArticles.slice(0, limit).map((a, index) => (
                    <button
                      className="article-row"
                      key={a.id}
                      onClick={() => openArticle(a.id)}
                    >
                      <span className="row-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="row-main">
                        <h3>{a.title}</h3>
                        <span>{a.section}</span>
                        {a.deck && <p>{a.deck}</p>}
                      </div>
                      <div className="row-meta">
                        <span>{date(a.issueId)}</span>
                        <span>
                          {a.minutes} 分钟{" "}
                          {readStatus(a.id) === "completed" ? " / 已读" : ""}
                        </span>
                      </div>
                      <Icon name={ArrowUpRight} />
                    </button>
                  ))
                )}
              </div>
              {displayArticles.length > limit && (
                <button
                  className="quiet load-more"
                  onClick={() => setLimit(limit + 30)}
                >
                  继续浏览文章 <ChevronDown size={16} />
                </button>
              )}
            </section>
            <div className="coverage-note">
              已收录 3 期，{catalog.articles.length}{" "}
              篇文章。补读范围仅限这三期；文章与图片来自已导入期刊。你的笔记仅保存在此浏览器。
            </div>
          </div>
        )}
        {view === "reader" && article && (
          <div className="reader-page">
            <nav className="reading-toolbar" aria-label="阅读工具">
              <button className="text-button" onClick={() => go("library")}>
                <Icon name={ArrowLeft} /> 返回书架
              </button>
              <span>
                {date(article.issueId)}{" "}
                <span className="toolbar-divider">/</span> {article.section}
              </span>
              <div className="reader-settings">
                <button
                  aria-label="减小字号"
                  onClick={() => setFontSize(Math.max(16, fontSize - 1))}
                >
                  A−
                </button>
                <button
                  aria-label="增大字号"
                  onClick={() => setFontSize(Math.min(26, fontSize + 1))}
                >
                  A+
                </button>
                <button
                  className="text-button"
                  onClick={() =>
                    run(async () => {
                      await api("/reading", {
                        articleId: article.id,
                        status:
                          readStatus(article.id) === "completed"
                            ? "reading"
                            : "completed",
                      });
                      notify(
                        readStatus(article.id) === "completed"
                          ? "已重新打开"
                          : "已标记读完",
                      );
                    })
                  }
                >
                  <Icon name={CheckCheck} />
                  {readStatus(article.id) === "completed"
                    ? "已读完"
                    : "标记读完"}
                </button>
              </div>
            </nav>
            <div className="reader-layout">
              <article
                className="article-content"
                ref={reader}
                onMouseUp={selectText}
                onKeyUp={(e) => {
                  if (e.shiftKey) selectText();
                }}
                onTouchEnd={() => setTimeout(selectText, 100)}
                style={{ "--reader-size": fontSize + "px" }}
              >
                <div className="article-masthead">
                  <h1>{article.title}</h1>
                  {article.deck && (
                    <p className="article-deck">{article.deck}</p>
                  )}
                  <div className="story-meta">
                    <span>The Economist</span>
                    <span>{article.published || date(article.issueId)}</span>
                    <span>约 {article.minutes} 分钟</span>
                  </div>
                </div>
                {article.imageOnly && (
                  <p className="image-article-notice">本页为原刊数据图表，点击图片可放大；图中文字尚未转为可选文本。</p>
                )}
                <div className="article-body">
                  {(article.blocks || [
                    ...(article.images || []).map((src) => ({ type: "image", src })),
                    ...article.paragraphs.map((p) => ({ type: "paragraph", paragraphId: p.id })),
                  ]).map((block, blockIndex) => {
                    if (block.type === "image") return (
                      <ArticleFigure key={`image-${blockIndex}`} src={block.src}
                        alt={block.alt || `${article.title} · 原刊配图`} />
                    );
                    const p = article.paragraphs.find((p) => p.id === block.paragraphId);
                    if (!p) return null;
                    const i = article.paragraphs.indexOf(p);
                    const notes = state.notes.filter(
                      (n) =>
                        n.articleId === article.id &&
                        n.paragraphId === p.id &&
                        n.kind !== "reviewed",
                    );
                    const quotes = notes.map((n) => n.quote).filter(Boolean);
                    let content = [p.text];
                    for (const quote of quotes) {
                      content = content.flatMap((part) => {
                        if (typeof part !== "string") return [part];
                        const index = part.indexOf(quote);
                        return index < 0
                          ? [part]
                          : [
                              part.slice(0, index),
                              <mark key={quote}>{quote}</mark>,
                              part.slice(index + quote.length),
                            ];
                      });
                    }
                    return (
                      <React.Fragment key={p.id}>
                        <p id={p.id} data-paragraph={p.id}>
                          <span className="paragraph-number" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {content}
                        </p>
                        {notes
                          .filter((n) => n.text)
                          .map((n) => (
                            <aside className="inline-note" key={n.id}>
                              <Icon name={PenLine} size={15} />
                              <div>
                                <span>我的笔记 / {n.tag}</span>
                                <p>{n.text}</p>
                              </div>
                            </aside>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="article-end">
                  <span>本篇阅读到这里。</span>
                  <button className="primary" onClick={() => go("practice")}>
                    带着原句练一练 <Icon name={ArrowRight} />
                  </button>
                </div>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="source-link"
                  >
                    查看原文出处 <Icon name={ExternalLink} size={15} />
                  </a>
                )}
              </article>
              <aside className="companion">
                <div className="companion-top">
                  <span>阅读手边</span>
                  <span>
                    {
                      state.vocabulary.filter((v) => v.articleId === article.id)
                        .length
                    }{" "}
                    个已选词
                  </span>
                </div>
                <div className="companion-tabs">
                  {[
                    ["guide", "中文概括"],
                    ["translation", "查译词典"],
                    ["note", "笔记"],
                  ].map(([id, l]) => (
                    <button
                      key={id}
                      className={panel === id ? "active" : ""}
                      onClick={() => setPanel(id)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {panel === "guide" && (
                  <div className="guide-panel">
                    <ArticleSummary key={article.id} article={article} onLookup={lookup} saving={saving} vocabulary={state.vocabulary} onAddWords={words => run(async () => {
                      const result = await api("/vocabulary/batch", {words: words.map(w => ({...w, text: w.word, articleId: article.id}))});
                      notify(result.added ? `已加入 ${result.added} 个重点词汇，可在词汇练习中练习` : "这些重点词汇已在单词表中");
                    })} />
                    <div className="related-reading">
                      <h3>沿着这个主题</h3>
                      {recommendations.slice(0, 2).map((a) => (
                        <button key={a.id} onClick={() => openArticle(a.id)}>
                          <span>{a.section}</span>
                          <strong>{a.title}</strong>
                          <small>同栏目候选 / 已导入目录</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {panel === "translation" && <LookupPanel selection={selection} definition={definition} lookup={lookup} quickWord={quickWord} addWord={addWord} vocabulary={state.vocabulary} saving={saving} onNote={()=>{setPanel("note");setNoteText("");}} notify={notify}/>}
                {panel === "note" && (
                  <div className="note-composer">
                    <h2>此刻，你怎么想？</h2>
                    {selection ? (
                      <blockquote>{selection.text}</blockquote>
                    ) : (
                      <p>先选中一句正文，让想法有一个来处。</p>
                    )}
                    <label htmlFor="personal-note">我的原话</label>
                    <textarea
                      id="personal-note"
                      placeholder="可以是一句疑问，也可以是还没想清楚的半句话。"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <label className="tag-label">
                      归入主题
                      <select
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                      >
                        <option>阅读思考</option>
                        <option>词义与用法</option>
                        <option>不同意见</option>
                        <option>待验证</option>
                      </select>
                    </label>
                    <button
                      className="primary full"
                      disabled={!noteText.trim() || !selection || saving}
                      onClick={saveNote}
                    >
                      保存我的笔记 <Icon name={Check} />
                    </button>
                    <p className="composer-caption">
                      只保存你的原话。AI 整理会另存草稿，由你决定是否采纳。
                    </p>
                  </div>
                )}
              </aside>
            </div>
            {selection && (
              <div
                className="selection-bar"
                role="toolbar"
                aria-label="选区操作"
              >
                <span>
                  {selection.text.length > 22
                    ? selection.text.slice(0, 22) + "…"
                    : selection.text}
                </span>
                <button onClick={() => lookup()}>
                  <Icon name={Languages} />
                  翻译
                </button>
                <button onClick={saveHighlight} disabled={saving}>
                  <Icon name={Highlighter} />
                  划重点
                </button>
                <button
                  onClick={() => {
                    setPanel("note");
                    setNoteText("");
                  }}
                >
                  <Icon name={PenLine} />
                  记笔记
                </button>
                <button
                  onClick={() => setSelection(null)}
                  aria-label="取消选区"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>
        )}
        {view === "practice" && (
          <Practice
            state={state}
            sync={sync}
            notify={notify}
            openArticle={openArticle}
            go={go}
          />
        )}
        {view === "notes" && (
          <div className="notes-page page-wrap">
            <div className="page-heading">
              <div>
                <h1>把读过的，变成自己的。</h1>
                <p>原话留在这里。整理交给 AI，判断留给你。</p>
              </div>
              <button className="quiet" onClick={exportData}>
                <Icon name={Download} /> 导出笔记
              </button>
            </div>
            <div className="notes-tabs">
              <button
                onClick={() => setNoteTab("mine")}
                className={noteTab === "mine" ? "active" : ""}
              >
                我的笔记{" "}
                <span>
                  {state.notes.filter((n) => n.kind !== "reviewed").length}
                </span>
              </button>
              <button
                onClick={() => setNoteTab("review")}
                className={noteTab === "review" ? "active" : ""}
              >
                待我签核 <span>{pending}</span>
              </button>
              <button
                onClick={() => setNoteTab("accepted")}
                className={noteTab === "accepted" ? "active" : ""}
              >
                已确认整理{" "}
                <span>
                  {state.notes.filter((n) => n.kind === "reviewed").length}
                </span>
              </button>
            </div>
            {noteTab === "mine" && (
              <>
                <div className="notes-intro">
                  <Icon name={PenLine} />
                  <p>这里是你亲手留下的记录。AI 可以阅读，不能改写。</p>
                </div>
                {state.notes.filter((n) => n.kind !== "reviewed").length ===
                0 ? (
                  <EmptyNotes go={go} />
                ) : (
                  <div className="notebook-list">
                    {state.notes
                      .filter((n) => n.kind !== "reviewed")
                      .map((n) => (
                        <div className="notebook-entry" key={n.id}>
                          <div className="note-side">
                            <span className="note-type">
                              {n.kind === "highlight" ? "原文重点" : "我的原话"}
                            </span>
                            <span>
                              {new Date(n.createdAt).toLocaleDateString(
                                "zh-CN",
                              )}
                            </span>
                            <span className="tag">{n.tag}</span>
                          </div>
                          <div className="note-body">
                            <blockquote>{n.quote}</blockquote>
                            {n.text && <p>{n.text}</p>}
                            <a
                              className="note-source"
                              href={"#reader?article=" + n.articleId}
                              onClick={(e) => {
                                e.preventDefault();
                                jumpTo(n);
                              }}
                            >
                              <span>{n.articleTitle}</span>
                              <Icon name={ArrowUpRight} size={15} />
                            </a>
                            <div className="note-actions">
                              {n.text && (
                                <button
                                  className="quiet"
                                  disabled={saving}
                                  onClick={() => draftFrom(n)}
                                >
                                  <Icon name={FileText} /> 请 AI 整理
                                </button>
                              )}
                              <button
                                className="text-button"
                                onClick={() => jumpTo(n)}
                              >
                                回到原文
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
            {noteTab === "review" && (
              <>
                <div className="notes-intro">
                  <Icon name={Eye} />
                  <p>
                    对照你的原话，判断每一条是不是你的意思。未确认的内容不会进入个人库。
                  </p>
                </div>
                {state.drafts.filter((d) => d.status === "pending").length ===
                0 ? (
                  <div className="empty">
                    <CheckCheck size={30} />
                    <h2>没有待确认的整理</h2>
                    <p>从一条自己的笔记开始，按需生成整理草稿。</p>
                    <button
                      className="quiet"
                      onClick={() => setNoteTab("mine")}
                    >
                      查看我的笔记
                    </button>
                  </div>
                ) : (
                  state.drafts
                    .filter((d) => d.status === "pending")
                    .map((d) => (
                      <ReviewCard
                        key={d.id}
                        draft={d}
                        saving={saving}
                        onDecision={(decision, text) =>
                          run(async () => {
                            await api("/drafts/" + d.id + "/decision", {
                              version: d.version,
                              decision,
                              text,
                            });
                            notify(
                              decision === "reject"
                                ? "已拒绝，原始笔记不变"
                                : "已签核，原话和修改痕迹均已保留",
                            );
                          })
                        }
                      />
                    ))
                )}
              </>
            )}
            {noteTab === "accepted" && (
              <>
                <div className="notes-intro">
                  <Icon name={CheckCheck} />
                  <p>你确认过的整理保留 AI 辅助标记，并始终关联最初的原话。</p>
                </div>
                {state.notes.filter((n) => n.kind === "reviewed").length ===
                0 ? (
                  <div className="empty">
                    <FileText size={30} />
                    <h2>你的判断，等你确认</h2>
                    <p>采纳的整理将出现在这里，原始笔记始终保留。</p>
                  </div>
                ) : (
                  state.notes
                    .filter((n) => n.kind === "reviewed")
                    .map((n) => (
                      <div className="accepted-entry" key={n.id}>
                        <h3>{n.text}</h3>
                        <span className="approved-label">
                          <Check size={15} /> 我已确认 / AI 辅助
                        </span>
                        <p>
                          最初的原话：
                          {
                            state.notes.find((o) => o.id === n.originalNoteId)
                              ?.text
                          }
                        </p>
                        <button
                          className="text-button"
                          onClick={() => jumpTo(n)}
                        >
                          查看来源 <Icon name={ArrowUpRight} />
                        </button>
                        <button
                          className="text-button"
                          onClick={() =>
                            run(async () => {
                              await api("/drafts/" + n.draftId + "/decision", {
                                version: n.draftVersion,
                                decision: "revoke",
                              });
                              notify("已撤回采纳，原始笔记仍然保留");
                            })
                          }
                        >
                          <Icon name={RotateCcw} /> 撤回采纳
                        </button>
                      </div>
                    ))
                )}
              </>
            )}
            <p className="notes-footnote">
              笔记整理暂用预置模板；查词与翻译已接入 DeepSeek。笔记和练习记录仅保存在此浏览器。
            </p>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <span>
          旁读 <em>Margin</em>
          <span className="footer-separator">/</span> 阅读，留有余地。
        </span>
        <span>
          旁读 <span className="footer-separator">/</span>{" "}
          数据仅保存在此浏览器
        </span>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Icon name={Check} size={17} />
          {toast}
        </div>
      )}
      {busy && catalog && (
        <div className="loading-bar" aria-label="正在载入文章" />
      )}
    </>
  );
}
function EmptyNotes({ go }) {
  return (
    <div className="empty">
      <PenLine size={32} />
      <h2>第一条想法，不必完整。</h2>
      <p>阅读时选中一句话，写下理解、疑问，或不同意见。</p>
      <button className="primary" onClick={() => go("reader")}>
        去读一篇文章 <Icon name={ArrowRight} />
      </button>
    </div>
  );
}
function ReviewCard({ draft, saving, onDecision }) {
  const [text, setText] = useState(draft.text),
    [editing, setEditing] = useState(false);
  return (
    <section className="review-entry">
      <div className="review-header">
        <h2>一次整理，仍由你作判断。</h2>
        <span>待确认 / 版本 {draft.version}</span>
      </div>
      <div className="review-columns">
        <div>
          <span className="small-label">我的原话</span>
          <p className="original-thought">{draft.originalText}</p>
          <blockquote>{draft.quote}</blockquote>
          <span className="source-caption">{draft.articleTitle}</span>
        </div>
        <div>
          <span className="small-label">AI 整理候选 / 本地示例</span>
          {editing ? (
            <>
              <label className="sr-only" htmlFor={"edit-" + draft.id}>
                修改整理内容
              </label>
              <textarea
                id={"edit-" + draft.id}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </>
          ) : (
            <p className="draft-thought">{text}</p>
          )}
          <p className="draft-reason">
            这是一条整理建议。它可能改变语气或遗漏犹豫，请对照原话确认。
          </p>
          <button className="text-button" onClick={() => setEditing(!editing)}>
            <PenLine size={16} />
            {editing ? "结束编辑" : "先修改，再决定"}
          </button>
        </div>
      </div>
      <div className="review-actions">
        <button
          className="text-button"
          disabled={saving}
          onClick={() => onDecision("reject")}
        >
          拒绝这条
        </button>
        <span>原始笔记始终保留</span>
        <button
          className="primary"
          disabled={saving || !text.trim()}
          onClick={() => onDecision("accept", text)}
        >
          {saving ? <Loader size={17} /> : <Check size={17} />}{" "}
          {text !== draft.text ? "修改后采纳" : "这是我的意思，采纳"}
        </button>
      </div>
    </section>
  );
}
function Practice({ state, sync, notify, openArticle, go }) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [result, setResult] = useState(null),
    [hint, setHint] = useState(false),
    [showAnswer, setShowAnswer] = useState(false),
    [answerViewed, setAnswerViewed] = useState(false),
    [pasted, setPasted] = useState(false),
    [mode, setMode] = useState("cloze"),
    [submitting, setSubmitting] = useState(false),
    [done, setDone] = useState(false),
    [session, setSession] = useState([]);
  const input = useRef(null),
    group = useRef(crypto.randomUUID());
  const words = state.vocabulary;
  const word = words[index];
  const reset = ({ keepAnswerHistory = false } = {}) => {
    group.current = crypto.randomUUID();
    setAnswer("");
    setResult(null);
    setHint(false);
    setShowAnswer(false);
    if (!keepAnswerHistory) setAnswerViewed(false);
    setPasted(false);
    setTimeout(() => input.current?.focus(), 0);
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting || result?.correct) return;
    setSubmitting(true);
    try {
      const d = await api("/attempts", {
        vocabularyId: word.id,
        answer,
        mode,
        hinted: hint,
        revealed: answerViewed,
        pasted,
        group: group.current,
      });
      setResult(d);
      setSession((s) => [...s, d]);
      await sync();
    } catch (e) {
      notify(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const next = () => {
    if (index + 1 >= words.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    reset();
  };
  const exerciseContext = word
    ? word.context
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.find((s) => s.toLowerCase().includes(word.word.toLowerCase()))
        ?.trim() || word.context
    : "";
  const sentence = word
    ? exerciseContext.replace(
        new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
        " ______ ",
      )
    : "";
  return (
    <div className="practice-page page-wrap">
      <div className="page-heading">
        <div>
          <h1>让一个词，真正留下来。</h1>
          <p>从你读过的文章里，练习主动想起。</p>
        </div>
        <span className="practice-total">{words.length} 个语境词汇</span>
      </div>
      {words.length === 0 ? (
        <div className="empty practice-empty">
          <Keyboard size={36} />
          <h2>词汇本还留着空白。</h2>
          <p>回到文章，选一个你想记住的词，加入拼写练习。</p>
          <button className="primary" onClick={() => go("reader")}>
            从阅读中选词 <Icon name={ArrowRight} />
          </button>
        </div>
      ) : done ? (
        <div className="practice-finish">
          <CheckCheck size={36} />
          <h2>今天的练习，到这里。</h2>
          <p>练过 {words.length} 个词。下一次，在阅读里再遇见。</p>
          <div className="finish-stats">
            <div>
              <strong>{session.filter((a) => a.firstCorrect).length}</strong>
              <span>无提示首答正确</span>
            </div>
            <div>
              <strong>{session.filter((a) => a.assisted).length}</strong>
              <span>借助提示的提交</span>
            </div>
          </div>
          <p className="muted">
            这是本次表现，不代表永久掌握。答错的词会保留在复习计划中。
          </p>
          <button className="primary" onClick={() => go("reader")}>
            继续阅读 <Icon name={ArrowRight} />
          </button>
          <button
            className="text-button"
            onClick={() => {
              setIndex(0);
              setDone(false);
              setSession([]);
              reset();
            }}
          >
            再练一轮
          </button>
        </div>
      ) : (
        <div className="practice-layout">
          <aside className="practice-context">
            <h2>{word.articleTitle}</h2>
            <span className="small-label">词汇的来处</span>
            <span>{date(word.issueId)}</span>
            <blockquote>
              {mode === "copy" ? exerciseContext : sentence}
            </blockquote>
            <button
              className="text-button"
              onClick={() => openArticle(word.articleId)}
            >
              回到原文 <Icon name={ArrowUpRight} />
            </button>
            <div className="practice-modes">
              <span className="small-label">练习方式</span>
              {[
                ["cloze", "原句挖空"],
                ["meaning", "释义回忆"],
                ["copy", "看词拼写"],
              ].map(([id, l]) => (
                <button
                  key={id}
                  className={mode === id ? "active" : ""}
                  onClick={() => {
                    setMode(id);
                    reset({ keepAnswerHistory: true });
                  }}
                >
                  {l}
                  {mode === id && <Check size={16} />}
                </button>
              ))}
            </div>
          </aside>
          <section className="practice-sheet">
            <div className="practice-sheet-top">
              <span>
                {mode === "copy"
                  ? "熟悉练习"
                  : mode === "cloze"
                    ? "在原句里，补上这个词"
                    : "根据释义，想起英文"}
              </span>
              <span>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(words.length).padStart(2, "0")}
              </span>
            </div>
            <div className="progress-line">
              <span
                style={{ transform: `scaleX(${(index + 1) / words.length})` }}
              />
            </div>
            <div className="practice-question">
              {mode === "cloze" ? (
                <p className="cloze-sentence">{sentence}</p>
              ) : mode === "copy" ? (
                <h2>{word.word}</h2>
              ) : (
                <h2>
                  {word.meaning || "此词暂未补充释义，请切换原句挖空练习"}
                </h2>
              )}
              {mode !== "meaning" && (
                <p className="meaning-prompt">
                  {word.meaning || "结合原句，回忆这个词的拼写"}
                </p>
              )}
              <form onSubmit={submit}>
                <label htmlFor="spelling">输入英文单词</label>
                <div
                  className={
                    "spelling-field " +
                    (result ? (result.correct ? "correct" : "incorrect") : "")
                  }
                >
                  <input
                    id="spelling"
                    ref={input}
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onPaste={() => setPasted(true)}
                    spellCheck="false"
                    autoComplete="off"
                    autoCapitalize="none"
                    placeholder="在这里想起它…"
                    disabled={result?.correct}
                  />
                  <span>
                    <CornerDownLeft size={19} />
                  </span>
                </div>
                {hint && (
                  <p className="hint">
                    提示：{word.word[0]} 开头，共 {word.word.length} 个字母
                  </p>
                )}
                <div id="practice-answer" aria-live="polite" aria-atomic="true">
                  {showAnswer && (
                    <div className="answer-reveal">
                      <span>正确拼写</span>
                      <strong>{word.word}</strong>
                      {word.phonetic && <p>{word.phonetic}</p>}
                      <p>看过之后，再亲手拼写一次。</p>
                    </div>
                  )}
                </div>
                <div className="practice-feedback" aria-live="polite">
                  {result &&
                    (result.correct ? (
                      <>
                        <Check size={18} />
                        <span>
                          {result.assisted
                            ? "借助提示答对了，再试一次无提示回忆。"
                            : "拼写正确。这个词，又熟悉了一点。"}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={18} />
                        <span>还差一点。可以修改后再提交，或查看答案。</span>
                      </>
                    ))}
                </div>
                <div className="practice-buttons">
                  <div className="practice-help">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setHint(true)}
                      disabled={hint || result?.correct || submitting}
                    >
                      <Lightbulb size={17} /> 给我一点提示
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      aria-expanded={showAnswer}
                      aria-controls="practice-answer"
                      disabled={submitting}
                      onClick={() => {
                        setAnswerViewed(true);
                        setShowAnswer(!showAnswer);
                      }}
                    >
                      <Eye size={17} /> {showAnswer ? "收起答案" : "查看答案"}
                    </button>
                  </div>
                  {result?.correct ? (
                    <button type="button" className="primary" onClick={next}>
                      {index + 1 === words.length ? "完成本轮" : "下一个词"}
                      <Icon name={ArrowRight} />
                    </button>
                  ) : (
                    <button
                      className="primary"
                      type="submit"
                      disabled={!answer.trim() || submitting}
                    >
                      检查拼写 <CornerDownLeft size={17} />
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="practice-sheet-footer">
              {mode === "copy"
                ? "看词输入只计为熟悉练习。"
                : answerViewed
                  ? "本题已查看答案，后续作答记为借助提示。收起答案不会清除记录。"
                  : "无提示、首答正确与借助提示的结果会分别记录。"}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
