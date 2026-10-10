/**
 * Pure geometry for the wheel picker. Angles are degrees, measured clockwise
 * from 12 o'clock (where the pointer sits). Segment `i` of `n` spans
 * [i * 360/n, (i + 1) * 360/n] on the wheel; turning the wheel clockwise by
 * `rotation` puts wheel angle `-rotation` under the pointer. Randomness
 * arrives as an argument so the functions stay testable.
 */

/** How long a spin runs and how many full turns it makes before landing. */
export const WHEEL_SPIN_PROFILES = {
  quick: { turns: 5, duration: 4 },
  dramatic: { turns: 9, duration: 8 },
} as const;

/** Above this many students the rim drops its pegs — they'd merge into a line. */
export const WHEEL_MAX_PEGS = 60;

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function segmentAngle(count: number): number {
  return count > 0 ? 360 / count : 360;
}

/** Index of the segment under the pointer at `rotation` (0 when empty). */
export function segmentAt(rotation: number, count: number): number {
  if (count <= 0) return 0;
  const step = segmentAngle(count);
  // Float noise right on a boundary can floor to `count`; wrap it.
  return Math.floor(mod(-rotation, 360) / step) % count;
}

/**
 * Final rotation for a spin that lands segment `index` under the pointer,
 * at least `turns` full turns clockwise past `current`. `random` in [0, 1)
 * nudges the landing spot within the middle 70% of the segment so the wheel
 * doesn't always stop dead center, but never on a boundary.
 */
export function landingRotation(
  current: number,
  index: number,
  count: number,
  turns: number,
  random: number,
): number {
  const step = segmentAngle(count);
  const offset = (random - 0.5) * 0.7 * step;
  const wanted = mod(-((index + 0.5) * step + offset), 360);
  const base = current + turns * 360;
  return base + mod(wanted - base, 360);
}

/**
 * Pointer deflection (degrees, negative = tip pushed clockwise) as pegs pass.
 * A peg kicks the tip right after a boundary crosses and it eases back over
 * the first `settle` fraction of the next segment.
 */
export function pointerKick(
  rotation: number,
  count: number,
  maxTilt: number,
  settle = 0.35,
): number {
  if (count <= 1) return 0;
  const step = segmentAngle(count);
  // Spinning clockwise, -rotation decreases: the fraction left in the
  // segment (1 → 0) runs backwards, so "since the last peg" is 1 - frac.
  const frac = mod(-rotation, step) / step;
  const since = 1 - frac;
  if (since >= settle) return 0;
  return -maxTilt * (1 - since / settle);
}

/** SVG path for a pie slice between wheel angles `start` and `end`. */
export function slicePath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
): string {
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${round(cx + r * Math.cos(rad))} ${round(cy + r * Math.sin(rad))}`;
  };
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${point(start)} A ${r} ${r} 0 ${large} 1 ${point(end)} Z`;
}

const round = (v: number) => Math.round(v * 100) / 100;

/** Brand fills, cycled around the wheel, with readable text on each. */
export const WHEEL_COLORS = [
  { fill: "#2C7CD1", text: "#FFFFFF" }, // primary-color
  { fill: "#FFCD1B", text: "#383767" }, // warning-color / icon-color
  { fill: "#275d96", text: "#FFFFFF" }, // primary-color-focus
  { fill: "#569DF8", text: "#383767" }, // secondary-color
] as const;

/** Palette index per segment; the last never matches the first it touches. */
export function segmentColors(count: number): number[] {
  const n = WHEEL_COLORS.length;
  const out = Array.from({ length: count }, (_, i) => i % n);
  if (count > 2 && out[count - 1] === out[0]) {
    // Pick a color unlike both neighbours.
    const prev = out[count - 2];
    out[count - 1] = [1, 2, 3].find((c) => c !== prev && c !== out[0]) ?? 1;
  }
  return out;
}

/** Label font size (px) for a wheel of `radius` split into `count` slices. */
export function labelFontSize(count: number, radius: number): number {
  // Slice height at ~72% of the radius, where the label's middle sits.
  const slice = (2 * Math.PI * radius * 0.72) / Math.max(count, 1);
  return Math.max(8, Math.min(radius * 0.085, slice * 0.62, 22));
}

/**
 * Shorten `text` to roughly `maxChars` user-perceived characters, keeping Thai
 * vowel and tone marks attached to their consonant.
 */
export function truncateLabel(text: string, maxChars: number): string {
  const chars = graphemes(text);
  if (chars.length <= maxChars) return text;
  if (maxChars <= 1) return chars.slice(0, 1).join("");
  return chars.slice(0, maxChars - 1).join("") + "…";
}

function graphemes(text: string): string[] {
  const Segmenter = (
    Intl as unknown as {
      Segmenter?: new (
        locale?: string,
        options?: { granularity: "grapheme" },
      ) => { segment: (s: string) => Iterable<{ segment: string }> };
    }
  ).Segmenter;
  if (Segmenter) {
    return Array.from(
      new Segmenter(undefined, { granularity: "grapheme" }).segment(text),
      (s) => s.segment,
    );
  }
  // Fallback: glue combining marks (Thai U+0E31, U+0E34–0E3A, U+0E47–0E4E)
  // onto the previous character.
  const out: string[] = [];
  for (const ch of Array.from(text)) {
    if (out.length > 0 && /[ัิ-ฺ็-๎̀-ͯ]/.test(ch)) {
      out[out.length - 1] += ch;
    } else {
      out.push(ch);
    }
  }
  return out;
}

/**
 * Wheel labels: first names, with a last-name initial added only where two
 * students in the wheel share a first name.
 */
export function wheelLabels(
  students: { firstName: string; lastName: string }[],
): string[] {
  const counts = new Map<string, number>();
  for (const s of students) {
    const key = s.firstName.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return students.map((s) => {
    const first = s.firstName.trim();
    if ((counts.get(first) ?? 0) < 2) return first;
    // Base letter only: "รั" → "ร" (an initial with a dangling mark reads oddly).
    const initial = Array.from(s.lastName.trim().replace(/^[เแโใไ]/, ""))[0];
    return initial ? `${first} ${initial}.` : first;
  });
}
