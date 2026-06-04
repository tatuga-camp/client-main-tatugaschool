export type Transform = { x: number; y: number; scale: number };

/**
 * Returns a new transform that changes `scale` to `nextScale` while keeping the
 * point (ax, ay) — given in viewport-local pixel coordinates — visually fixed.
 * Assumes the stage element uses `transform-origin: 0 0` (top-left).
 */
export function anchoredZoom(
  current: Transform,
  nextScale: number,
  ax: number,
  ay: number,
): Transform {
  const ratio = nextScale / current.scale;
  return {
    scale: nextScale,
    x: ax - (ax - current.x) * ratio,
    y: ay - (ay - current.y) * ratio,
  };
}

/** How strongly wheel movement maps to zoom; larger = more zoom per notch. */
const WHEEL_SENSITIVITY = 0.0015;

/** Convert a wheel `deltaY` into a multiplicative scale factor (>1 = zoom in). */
export function wheelScaleFactor(deltaY: number): number {
  return Math.exp(-deltaY * WHEEL_SENSITIVITY);
}
