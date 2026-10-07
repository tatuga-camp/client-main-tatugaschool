/**
 * Geometry for the face-down card fan: cards sit on an arc whose center is
 * below the fan, like a hand of cards. Poses are offsets from the fan's
 * top-center anchor; index 0 is the leftmost card.
 */
export type FanPose = { x: number; y: number; rotate: number };

export const FAN_MAX_SPREAD_DEG = 110;
export const FAN_STEP_DEG = 7;
export const FAN_MAX_RADIUS = 700;
export const FAN_SIDE_GUTTER = 16;

export function fanPoses(
  count: number,
  viewportWidth: number,
  cardWidth: number,
  cardHeight: number,
): FanPose[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 0, y: 0, rotate: 0 }];

  const spread = Math.min(FAN_MAX_SPREAD_DEG, FAN_STEP_DEG * (count - 1));
  const half = ((spread / 2) * Math.PI) / 180;
  // Largest radius whose outermost (most tilted) card still fits: a w×h card
  // rotated by θ is (w/2)cosθ + (h/2)sinθ wide on each side of its center.
  const edgeHalfWidth =
    (cardWidth / 2) * Math.cos(half) + (cardHeight / 2) * Math.sin(half);
  const available = viewportWidth / 2 - FAN_SIDE_GUTTER - edgeHalfWidth;
  const radius = Math.max(0, Math.min(FAN_MAX_RADIUS, available / Math.sin(half)));

  return Array.from({ length: count }, (_, i) => {
    const deg = -spread / 2 + (i * spread) / (count - 1);
    const rad = (deg * Math.PI) / 180;
    // `+ 0` turns -0 (radius 0 × negative sine) into 0.
    return {
      x: radius * Math.sin(rad) + 0,
      y: radius * (1 - Math.cos(rad)) + 0,
      rotate: deg,
    };
  });
}
