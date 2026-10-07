/**
 * Pure geometry and sequencing for the slider picker reel. The reel is a
 * horizontal strip of student ids; item `i` sits under the center pointer when
 * the strip's x offset is `-i * step`. Randomness arrives as an argument so the
 * functions stay testable.
 */

/** Items on each side of the pointer while idle — enough to fill a wide screen. */
export const REEL_PAD = 8;

/** Spin profiles: how many cards fly past and for how long. */
export const SPIN_PROFILES = {
  quick: { lead: 26, duration: 2.6 },
  dramatic: { lead: 48, duration: 5.5 },
} as const;

export type SpinSpeed = keyof typeof SPIN_PROFILES;

/**
 * `length` ids drawn from `pool`, never the same id twice in a row (unless the
 * pool has a single student) and, when given, never equal to `after` first.
 */
export function fillReel(
  pool: string[],
  length: number,
  random: () => number = Math.random,
  after?: string,
): string[] {
  if (pool.length === 0 || length <= 0) return [];
  const out: string[] = [];
  let prev = after;
  for (let i = 0; i < length; i++) {
    const choices =
      pool.length > 1 && prev !== undefined
        ? pool.filter((id) => id !== prev)
        : pool;
    const id = choices[Math.floor(random() * choices.length)];
    out.push(id);
    prev = id;
  }
  return out;
}

/** Idle strip: REEL_PAD cards each side of the center (index REEL_PAD). */
export function buildIdleReel(
  pool: string[],
  random: () => number = Math.random,
): string[] {
  return fillReel(pool, REEL_PAD * 2 + 1, random);
}

/**
 * Extend the idle strip so the winner lands under the pointer. The idle strip
 * is kept as the prefix, so the visible cards don't jump when the spin starts.
 * Returns the new strip and the winner's index in it.
 */
export function buildSpinReel(
  idle: string[],
  pool: string[],
  winnerId: string,
  lead: number,
  random: () => number = Math.random,
): { reel: string[]; target: number } {
  const filler = fillReel(pool, lead, random, idle[idle.length - 1]);
  // Keep the winner from sitting next to a copy of itself.
  if (pool.length > 1 && filler[filler.length - 1] === winnerId) {
    const others = pool.filter(
      (id) => id !== winnerId && id !== filler[filler.length - 2],
    );
    if (others.length > 0) {
      filler[filler.length - 1] = others[Math.floor(random() * others.length)];
    } else {
      // Two students alternate strictly; one card shorter breaks the tie.
      filler.pop();
    }
  }
  const tail = fillReel(pool, REEL_PAD, random, winnerId);
  const reel = [...idle, ...filler, winnerId, ...tail];
  return { reel, target: idle.length + filler.length };
}

/** Index of the card under the pointer for strip offset `x`. */
export function centerIndexAt(x: number, step: number): number {
  return Math.round(-x / step) || 0; // avoid -0
}

/**
 * How far item `index` is from the pointer, in cards (0 = centered). Drives
 * the scale/opacity falloff of the side cards.
 */
export function distanceFromCenter(
  x: number,
  index: number,
  step: number,
): number {
  return Math.abs(x + index * step) / step;
}
