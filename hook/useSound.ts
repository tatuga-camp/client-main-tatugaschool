export function useSound(url: string): HTMLAudioElement {
  const audio = new Audio(url);

  return audio;
}
