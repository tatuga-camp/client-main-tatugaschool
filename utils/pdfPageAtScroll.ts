export type PdfPageBox = {
  /** Offset of the page's top edge inside the scroll content, in px. */
  top: number;
  height: number;
};

type Input = {
  /** Page boxes in page order (index 0 = page 1). */
  pages: PdfPageBox[];
  scrollTop: number;
  viewportHeight: number;
  scrollHeight: number;
};

/**
 * The 1-based page the reader is on: the page under the line one third down
 * the viewport (in a gap, the page above it). Pinned to page 1 at the very
 * top and to the last page at the very bottom, so short first/last pages are
 * still reachable. Same file in the teacher and student apps.
 */
export function pdfPageAtScroll({ pages, scrollTop, viewportHeight, scrollHeight }: Input): number {
  if (pages.length === 0 || scrollTop <= 1) return 1;
  if (scrollTop + viewportHeight >= scrollHeight - 1) return pages.length;
  const line = scrollTop + viewportHeight / 3;
  let page = 1;
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].top <= line) page = i + 1;
    else break;
  }
  return page;
}
