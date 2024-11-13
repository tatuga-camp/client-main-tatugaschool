export function useSound(url: string): HTMLAudioElement | void {
  if (typeof window !== "undefined") {
    const audio = new Audio(url);
    return audio;
  }
}
