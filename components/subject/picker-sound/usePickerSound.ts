import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSfx, SOUND_SETS, type SoundSet } from "./sfx";

export type PickerSound = "off" | SoundSet;

// One choice for every student picker: one classroom, one preference.
const SOUND_KEY = "picker:sound";
// Before sound sets existed the pickers only had a shared mute toggle.
const LEGACY_MUTE_KEY = "card-picker:muted";

export function readPickerSound(): PickerSound {
  try {
    const stored = localStorage.getItem(SOUND_KEY);
    if (stored === "off" || SOUND_SETS.includes(stored as SoundSet)) {
      return stored as PickerSound;
    }
    return localStorage.getItem(LEGACY_MUTE_KEY) === "1" ? "off" : "chime";
  } catch {
    return "chime";
  }
}

export type PickerSoundApi = {
  sound: PickerSound;
  /** Saves the choice and plays a short preview of it. */
  setSound: (next: PickerSound) => void;
  /** 0 → 1 over a spin or run: pitch/intensity climb toward the pick. */
  tick: (progress: number) => void;
  reveal: () => void;
  /** Call from a click/key handler so browsers allow audio to start. */
  unlock: () => void;
};

export function usePickerSound(): PickerSoundApi {
  const [sound, setSoundState] = useState<PickerSound>(readPickerSound);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const sfx = useMemo(() => createSfx(), []);
  const lastTick = useRef(0);
  const previewTimers = useRef<number[]>([]);

  useEffect(
    () => () => {
      previewTimers.current.forEach((t) => window.clearTimeout(t));
      sfx.close();
    },
    [sfx],
  );

  const tick = useCallback(
    (progress: number) => {
      const set = soundRef.current;
      if (set === "off") return;
      // Fast spins cross many pegs per frame: don't machine-gun, but never
      // swallow the last, slow ticks near the pick.
      const now = performance.now();
      if (now - lastTick.current < 45 && progress < 0.85) return;
      lastTick.current = now;
      sfx.cut(set, progress);
    },
    [sfx],
  );

  const reveal = useCallback(() => {
    const set = soundRef.current;
    if (set !== "off") sfx.reveal(set);
  }, [sfx]);

  const unlock = useCallback(() => sfx.unlock(), [sfx]);

  const setSound = useCallback(
    (next: PickerSound) => {
      setSoundState(next);
      soundRef.current = next;
      try {
        localStorage.setItem(SOUND_KEY, next);
      } catch {
        // Storage blocked: the choice still holds for this session.
      }
      previewTimers.current.forEach((t) => window.clearTimeout(t));
      previewTimers.current = [];
      if (next === "off") return;
      sfx.unlock();
      [0, 0.35, 0.7, 1].forEach((p, i) =>
        previewTimers.current.push(
          window.setTimeout(
            () => sfx.cut(next, p),
            i * 170 + (p === 1 ? 200 : 0),
          ),
        ),
      );
      previewTimers.current.push(
        window.setTimeout(() => sfx.reveal(next), 1150),
      );
    },
    [sfx],
  );

  return useMemo(
    () => ({ sound, setSound, tick, reveal, unlock }),
    [sound, setSound, tick, reveal, unlock],
  );
}
