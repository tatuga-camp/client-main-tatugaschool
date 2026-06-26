export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type PixelBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Estimate a tight head region from a whole-body person box. The detector
 * returns full-body (or upper-body) boxes; the picker wants the head, so we
 * take a slice from the top-centre — roughly the top third, half the width,
 * horizontally centred. It's a heuristic (no facial landmarks), but it tracks
 * the head well enough for highlighting and the winner crop, and it scales
 * down naturally for distant students because their whole box is smaller.
 * The result is clamped to the frame so edge boxes never crop out of bounds.
 */
export function headRegion(box: NormalizedBox): NormalizedBox {
  const headWidth = box.width * 0.5;
  const headHeight = box.height * 0.3;
  const x = clamp01(box.x + (box.width - headWidth) / 2);
  const y = clamp01(box.y);
  return {
    x,
    y,
    width: clamp01(x + headWidth) - x,
    height: clamp01(y + headHeight) - y,
  };
}

/**
 * Convert a normalized (0..1) detector box into pixel coordinates for an
 * element of `renderWidth × renderHeight`. When `mirrored`, flip horizontally
 * so boxes line up with a selfie-view (CSS-mirrored) <video>.
 */
export function toPixelBox(
  box: NormalizedBox,
  renderWidth: number,
  renderHeight: number,
  mirrored: boolean,
): PixelBox {
  const width = box.width * renderWidth;
  const height = box.height * renderHeight;
  const top = box.y * renderHeight;
  const left = mirrored
    ? renderWidth - (box.x + box.width) * renderWidth
    : box.x * renderWidth;
  return { left, top, width, height };
}
