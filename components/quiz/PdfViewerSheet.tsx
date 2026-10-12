import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdAdd, MdClose, MdRemove } from "react-icons/md";
import { Document, Page, pdfjs } from "react-pdf";
import { quizLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { pdfPageAtScroll } from "../../utils/pdfPageAtScroll";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Stable identity (react-pdf reloads when `options` changes). Range requests
// keep a 200 MB PDF from downloading in full before page 1 shows.
const PDF_OPTIONS = { disableAutoFetch: true, disableStream: false };
const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

type Props = {
  url: string;
  name: string;
  language: Language;
  onClose: () => void;
};

/** Full-screen in-page PDF reader: never navigates, so quiz test mode records nothing. */
export default function PdfViewerSheet({ url, name, language, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [visible, setVisible] = useState<Set<number>>(() => new Set([1]));
  const [zoomIndex, setZoomIndex] = useState(1);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.min(entry.contentRect.width - 32, 900)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lazy rendering only: render pages as they come within 600px of the viewport.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || numPages === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = new Set(prev);
          for (const e of entries) {
            if (e.isIntersecting) next.add(Number((e.target as HTMLElement).dataset.page));
          }
          return next;
        });
      },
      { root, rootMargin: "600px 0px" },
    );
    root.querySelectorAll("[data-page]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, attempt]);

  // The page counter, from the scroll position (rAF-throttled), independent of
  // the pre-render band above.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || numPages === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rootTop = root.getBoundingClientRect().top;
      const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-page]")).map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top - rootTop + root.scrollTop, height: rect.height };
      });
      setCurrent(
        pdfPageAtScroll({
          pages,
          scrollTop: root.scrollTop,
          viewportHeight: root.clientHeight,
          scrollHeight: root.scrollHeight,
        }),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [numPages, attempt, zoomIndex, width]);

  const zoom = ZOOMS[zoomIndex];
  const pageWidth = Math.max(width, 200) * zoom;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      className="fixed inset-0 z-[1000] flex flex-col bg-icon-color/95 font-Anuphan"
    >
      <header className="flex items-center gap-3 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h2 className="min-w-0 flex-1 truncate font-semibold text-icon-color">{name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={quizLanguage.closePdf(language)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-icon-color hover:bg-primary-color/10"
        >
          <MdClose />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4">
        {error ? (
          <div className="mx-auto mt-16 flex max-w-xs flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center">
            <p className="text-icon-color">{quizLanguage.pdfLoadError(language)}</p>
            <button
              type="button"
              onClick={() => {
                setError(false);
                setNumPages(0);
                setVisible(new Set([1]));
                setAttempt((n) => n + 1);
              }}
              className="rounded-xl bg-primary-color px-4 py-2 text-white hover:bg-primary-color-hover"
            >
              {quizLanguage.retry(language)}
            </button>
          </div>
        ) : (
          <Document
            key={attempt}
            file={url}
            options={PDF_OPTIONS}
            onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
            onLoadError={() => setError(true)}
            loading={
              <div className="mx-auto mt-16 h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            }
            className="flex flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                data-page={n}
                style={{ width: pageWidth, minHeight: visible.has(n) ? undefined : pageWidth * 1.3 }}
                className="bg-white shadow-lg"
              >
                {visible.has(n) && (
                  <Page
                    pageNumber={n}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                )}
              </div>
            ))}
          </Document>
        )}
      </div>

      {numPages > 0 && !error && (
        <footer className="flex items-center justify-center gap-4 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((z) => z - 1)}
            aria-label={quizLanguage.zoomOut(language)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color hover:bg-primary-color/10 disabled:opacity-30"
          >
            <MdRemove />
          </button>
          <span className="min-w-28 text-center text-sm text-icon-color" aria-live="polite">
            {quizLanguage.pdfPage(language, current, numPages)}
          </span>
          <button
            type="button"
            disabled={zoomIndex === ZOOMS.length - 1}
            onClick={() => setZoomIndex((z) => z + 1)}
            aria-label={quizLanguage.zoomIn(language)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color hover:bg-primary-color/10 disabled:opacity-30"
          >
            <MdAdd />
          </button>
        </footer>
      )}
    </div>,
    document.body,
  );
}
