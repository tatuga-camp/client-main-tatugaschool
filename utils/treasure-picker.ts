/**
 * Pure planning for the treasure picker: everyone starts in the chest, the
 * not-chosen disappear one by one, and `keep` winners remain. Winners are
 * decided up front (uniformly at random); the steps are only the show.
 */
export type EliminationStep = {
  /** Students who vanish at this step. */
  ids: string[];
  /** Wait before this step happens, in ms. */
  delay: number;
};

export type EliminationPlan = {
  winners: string[];
  steps: EliminationStep[];
};

export type PickSpeed = "quick" | "dramatic";

/** Clamp the requested winner count into [1, pool size]. */
export function clampKeep(keep: number, poolSize: number): number {
  if (poolSize <= 0) return 0;
  if (!Number.isFinite(keep)) return 1;
  return Math.min(poolSize, Math.max(1, Math.floor(keep)));
}

function shuffled(ids: string[], random: () => number): string[] {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const PACE: Record<PickSpeed, { min: number; max: number; budget: number }> = {
  quick: { min: 45, max: 650, budget: 3800 },
  dramatic: { min: 80, max: 1250, budget: 7500 },
};

/**
 * Delay for the i-th of n single eliminations: fast at the start, a long
 * crawl for the last few (where the tension is). The whole run is squeezed
 * into the speed's budget so a 45-student class doesn't take a minute.
 */
export function stepDelays(n: number, speed: PickSpeed): number[] {
  if (n <= 0) return [];
  const { min, max, budget } = PACE[speed];
  const raw = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : i / (n - 1);
    return min + (max - min) * Math.pow(t, 5);
  });
  const total = raw.reduce((a, b) => a + b, 0);
  if (total <= budget) return raw.map(Math.round);
  // Shrink the fast part first; keep the final crawl intact where possible.
  const scale = budget / total;
  return raw.map((d) => Math.round(Math.max(min * 0.6, d * scale)));
}

/** One student disappears per step. */
export function planSingles(
  ids: string[],
  keep: number,
  speed: PickSpeed,
  random: () => number = Math.random,
): EliminationPlan {
  const k = clampKeep(keep, ids.length);
  const order = shuffled(ids, random);
  const winners = order.slice(0, k);
  const losers = order.slice(k);
  const delays = stepDelays(losers.length, speed);
  return {
    winners,
    steps: losers.map((id, i) => ({ ids: [id], delay: delays[i] })),
  };
}
