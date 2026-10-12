import { test } from "node:test";
import assert from "node:assert/strict";
import { pdfPageAtScroll } from "./pdfPageAtScroll";

// Six 1000 px pages with a 16 px gap, as laid out in PdfViewerSheet.
const pages = Array.from({ length: 6 }, (_, i) => ({ top: 16 + i * 1016, height: 1000 }));
const view = { viewportHeight: 800, scrollHeight: 16 + 6 * 1016 };

test("is page 1 at the top, even with the next pages inside a pre-render band", () => {
  assert.equal(pdfPageAtScroll({ pages, scrollTop: 0, ...view }), 1);
});

test("is page 1 at the top even when page 1 is short (landscape)", () => {
  const short = [{ top: 16, height: 150 }, ...pages.slice(1)];
  assert.equal(pdfPageAtScroll({ pages: short, scrollTop: 0, ...view }), 1);
});

test("is the page at the top of the viewport (QA repro: page 3 at top, not 4)", () => {
  assert.equal(pdfPageAtScroll({ pages, scrollTop: pages[2].top, ...view }), 3);
});

test("switches once a page crosses the line one third down the viewport", () => {
  const line = view.viewportHeight / 3;
  assert.equal(pdfPageAtScroll({ pages, scrollTop: pages[1].top - line - 1, ...view }), 1);
  assert.equal(pdfPageAtScroll({ pages, scrollTop: pages[1].top - line + 1, ...view }), 2);
});

test("a line in the gap between pages keeps the page above", () => {
  const line = view.viewportHeight / 3;
  const gapLine = pages[1].top - 8;
  assert.equal(pdfPageAtScroll({ pages, scrollTop: gapLine - line, ...view }), 1);
});

test("is the last page when scrolled to the bottom, even if it is short", () => {
  const short = [...pages.slice(0, 5), { top: pages[5].top, height: 200 }];
  const scrollHeight = short[5].top + 200 + 16;
  const scrollTop = scrollHeight - view.viewportHeight;
  assert.equal(
    pdfPageAtScroll({ pages: short, scrollTop, viewportHeight: view.viewportHeight, scrollHeight }),
    6,
  );
});

test("is 1 when there are no pages", () => {
  assert.equal(pdfPageAtScroll({ pages: [], scrollTop: 500, ...view }), 1);
});
