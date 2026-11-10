import { useLayoutEffect, useState, type RefObject } from "react";

export function useStageSize(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Columns that give the biggest square tile for n items in a w×h box. */
export function gridFit(n: number, w: number, h: number, gap = 8) {
  if (n <= 0 || w <= 0 || h <= 0) return { cols: 1, tile: 0 };
  let best = { cols: 1, tile: 0 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const tile = Math.min(
      (w - gap * (cols - 1)) / cols,
      (h - gap * (rows - 1)) / rows,
    );
    if (tile > best.tile) best = { cols, tile };
  }
  return { cols: best.cols, tile: Math.floor(Math.min(best.tile, 132)) };
}
