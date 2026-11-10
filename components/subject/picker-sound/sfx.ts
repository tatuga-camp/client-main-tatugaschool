/**
 * Synthesized student-picker sounds (Web Audio, no files), shared by every
 * picker. Every voice takes a context + output + start time so the same code
 * can render offline for tests. `progress` runs 0 → 1 over a spin / an
 * elimination run, so pitch and intensity climb toward the pick.
 */
export type SoundSet = "chime" | "arcade" | "drumroll";
export const SOUND_SETS: SoundSet[] = ["chime", "arcade", "drumroll"];

type Ctx = BaseAudioContext;

function env(
  ctx: Ctx,
  out: AudioNode,
  t: number,
  peak: number,
  attack: number,
  decay: number,
) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(out);
  return g;
}

function tone(
  ctx: Ctx,
  out: AudioNode,
  t: number,
  freq: number,
  type: OscillatorType,
  peak: number,
  decay: number,
  attack = 0.005,
) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.connect(env(ctx, out, t, peak, attack, decay));
  o.start(t);
  o.stop(t + attack + decay + 0.05);
  return o;
}

let noiseBuf: AudioBuffer | null = null;
function noise(ctx: Ctx) {
  if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = b;
  return b;
}

function noiseHit(
  ctx: Ctx,
  out: AudioNode,
  t: number,
  filter: BiquadFilterType,
  freq: number,
  peak: number,
  decay: number,
) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  src.connect(f);
  f.connect(env(ctx, out, t, peak, 0.002, decay));
  src.start(t);
  src.stop(t + decay + 0.05);
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
// Major pentatonic from C5 upward: never sounds "wrong" whatever lands next.
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const penta = (progress: number, base = 72) =>
  midi(base + PENTA[Math.round(progress * (PENTA.length - 1))]);

/** A tick: a student vanishes, a peg/card passes the pointer, a card flips. */
export function playCut(
  set: SoundSet,
  ctx: Ctx,
  out: AudioNode,
  t: number,
  progress: number,
) {
  const p = Math.min(1, Math.max(0, progress));
  switch (set) {
    case "chime": {
      // Soft marimba-ish pluck climbing the pentatonic scale.
      const f = penta(p);
      tone(ctx, out, t, f, "sine", 0.22, 0.28);
      tone(ctx, out, t, f * 2, "triangle", 0.05, 0.12);
      break;
    }
    case "arcade": {
      // 8-bit blip with a quick upward chirp; higher as the chest empties.
      const o = tone(ctx, out, t, 300 + 900 * p, "square", 0.18, 0.07);
      o.frequency.exponentialRampToValueAtTime(420 + 1300 * p, t + 0.06);
      break;
    }
    case "drumroll": {
      // Snare tap getting louder; the last few add a low heartbeat thump.
      noiseHit(ctx, out, t, "highpass", 1800, 0.2 + 0.2 * p, 0.09);
      if (p > 0.82) {
        const k = tone(ctx, out, t, 110, "sine", 0.55, 0.22);
        k.frequency.exponentialRampToValueAtTime(45, t + 0.2);
      }
      break;
    }
  }
}

/** The winners are revealed. */
export function playReveal(set: SoundSet, ctx: Ctx, out: AudioNode, t: number) {
  switch (set) {
    case "chime": {
      // Rising arpeggio, then a sparkle and a warm held chord.
      [72, 76, 79, 84].forEach((n, i) =>
        tone(ctx, out, t + i * 0.09, midi(n), "sine", 0.3, 0.6),
      );
      for (let i = 0; i < 8; i++) {
        tone(
          ctx,
          out,
          t + 0.4 + i * 0.06,
          midi(96 + PENTA[(i * 3) % 8]),
          "sine",
          0.05,
          0.25,
        );
      }
      [60, 64, 67, 72].forEach((n) =>
        tone(ctx, out, t + 0.36, midi(n), "triangle", 0.1, 1.6, 0.04),
      );
      break;
    }
    case "arcade": {
      // Short original victory jingle on square waves.
      const notes: [number, number, number][] = [
        [67, 0, 0.1],
        [72, 0.1, 0.1],
        [76, 0.2, 0.1],
        [79, 0.3, 0.18],
        [76, 0.5, 0.08],
        [79, 0.58, 0.08],
        [84, 0.66, 0.5],
      ];
      notes.forEach(([n, at, d]) =>
        tone(ctx, out, t + at, midi(n), "square", 0.17, d),
      );
      tone(ctx, out, t + 0.66, midi(48), "triangle", 0.18, 0.55);
      break;
    }
    case "drumroll": {
      // Crash cymbal + bright major "brass" stab.
      noiseHit(ctx, out, t, "highpass", 5000, 0.35, 1.6);
      const k = tone(ctx, out, t, 120, "sine", 0.45, 0.35);
      k.frequency.exponentialRampToValueAtTime(40, t + 0.3);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(900, t);
      lp.frequency.exponentialRampToValueAtTime(3200, t + 0.15);
      lp.connect(out);
      [60, 64, 67, 72].forEach((n) =>
        tone(ctx, lp, t, midi(n), "sawtooth", 0.07, 1.2, 0.03),
      );
      break;
    }
  }
}

/** Live player for the page: one shared context, resumed on first gesture. */
export function createSfx() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      // iOS mutes Web Audio with the ringer switch unless the session is
      // "playback" (Safari 16.4+); a classroom picker should be heard.
      const nav = navigator as Navigator & {
        audioSession?: { type: string };
      };
      if (nav.audioSession) {
        try {
          nav.audioSession.type = "playback";
        } catch {
          // ignore
        }
      }
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };
  return {
    /** Call from a click/key handler so browsers allow audio. */
    unlock: () => void ensure(),
    cut: (set: SoundSet, progress: number) => {
      const c = ensure();
      if (c && master) playCut(set, c, master, c.currentTime + 0.01, progress);
    },
    reveal: (set: SoundSet) => {
      const c = ensure();
      if (c && master) playReveal(set, c, master, c.currentTime + 0.01);
    },
    close: () => {
      ctx?.close().catch(() => {});
      ctx = null;
      master = null;
    },
  };
}
