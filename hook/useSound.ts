import { useEffect, useState } from "react";

type ListURL =
  | "/sounds/ding.mp3"
  | "/sounds/clock.mp3"
  | "/sounds/cheering.mp3"
  | "/sounds/fail.mp3"
  | "/sounds/ringing.mp3";

/**
 * Returns a single, reusable <audio> element for the given sound.
 *
 * The element is created once per mount (and only when the url changes),
 * then released on unmount. Creating a `new Audio()` on every render leaks
 * Chromium WebMediaPlayers and quickly hits the per-frame cap
 * (crbug.com/1144736) — especially in components that re-render rapidly.
 *
 * Returns `null` on the server and on the first render before the element
 * is created; callers should guard with optional chaining (`sound?.play()`).
 */
export function useSound(url: ListURL): HTMLAudioElement | null {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const element = new Audio(url);
    setAudio(element);

    return () => {
      // Clearing the source and calling load() frees the WebMediaPlayer.
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [url]);

  return audio;
}
