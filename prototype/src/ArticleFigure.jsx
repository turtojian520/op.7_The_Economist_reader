import React, { useEffect, useRef, useState } from "react";

// Native modal supplies focus trapping, Escape dismissal and focus restoration.
export function ArticleFigure({ src, alt }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (open) dialog.current.showModal();
  }, [open]);
  const close = () => dialog.current.close();
  return (
    <figure className="article-figure">
      <button className="figure-trigger" onClick={() => setOpen(true)} aria-label={`放大查看：${alt}`}>
        <img src={src} alt={alt} loading="lazy" />
        <span>点击放大查看</span>
      </button>
      <figcaption>原刊配图 · 保持完整比例</figcaption>
      <dialog ref={dialog} className="figure-dialog" aria-label={alt}
        onClose={() => { setOpen(false); setZoomed(false); }}
        onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        {open && <div className="figure-viewer">
          <div className="figure-toolbar">
            <span>{alt}</span>
            <button onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? "适应窗口" : "放大 2 倍"}</button>
            <a href={src} target="_blank" rel="noreferrer">打开原图</a>
            <button onClick={close} autoFocus aria-label="关闭图片">关闭 ×</button>
          </div>
          <div className="figure-viewport" tabIndex={0} aria-label="图片浏览区域，可滚动查看细节">
            <img className={zoomed ? "is-zoomed" : ""} src={src} alt={alt} />
          </div>
        </div>}
      </dialog>
    </figure>
  );
}
