export type RouletteStep = { index: number; delayMs: number };

type RouletteOptions = {
  minHops?: number;
  extraHopsRange?: number;
  startDelayMs?: number;
  endDelayMs?: number;
};

const DEFAULTS: Required<RouletteOptions> = {
  minHops: 15,
  extraHopsRange: 10,
  startDelayMs: 60,
  endDelayMs: 400,
};

/**
 * Build a decelerating "roulette" hop sequence over `count` faces.
 * The last step's index is the winner. Consecutive indices never repeat, so
 * the highlight visibly moves. `random` is injectable for deterministic tests.
 */
export function buildRouletteSequence(
  count: number,
  options?: RouletteOptions,
  random: () => number = Math.random,
): RouletteStep[] {
  if (count <= 0) return [];
  if (count === 1) return [{ index: 0, delayMs: 0 }];

  const { minHops, extraHopsRange, startDelayMs, endDelayMs } = {
    ...DEFAULTS,
    ...options,
  };

  const hops = minHops + Math.floor(random() * extraHopsRange);
  const steps: RouletteStep[] = [];
  let prev = 0;

  for (let i = 0; i < hops; i++) {
    const next = (prev + 1 + Math.floor(random() * (count - 1))) % count;
    const t = hops === 1 ? 1 : i / (hops - 1);
    const delayMs = Math.round(startDelayMs + (endDelayMs - startDelayMs) * t);
    steps.push({ index: next, delayMs });
    prev = next;
  }

  return steps;
}
