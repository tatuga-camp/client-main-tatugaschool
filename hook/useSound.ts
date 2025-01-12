type ListURL =
  | "/sounds/ding.mp3"
  | "/sounds/clock.mp3"
  | "/sounds/cheering.mp3"
  | "/sounds/fail.mp3"
  | "/sounds/ringing.mp3";
export function useSound(url: ListURL): HTMLAudioElement | void {
  if (typeof window !== "undefined") {
    const audio = new Audio(url);
    return audio;
  }
}
