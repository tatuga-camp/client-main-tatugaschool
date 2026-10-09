// YouTube links for video quizzes: parse what teachers paste, and load the
// IFrame Player API (https://developers.google.com/youtube/iframe_api_reference).

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

/** The 11-character video id from a YouTube link, or null for anything else. */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;

  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    const [, kind, value] = url.pathname.split("/");
    if (["shorts", "embed", "live", "v"].includes(kind)) id = value ?? null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
}

export const isYouTubeUrl = (url: string | null | undefined) =>
  !!url && parseYouTubeId(url) !== null;

export const youTubeWatchUrl = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;

export type YouTubeErrorKind = "embedBlocked" | "notFound" | "other";

/** onError codes: 100 = removed or private, 101/150 = owner blocks embedding. */
export function youTubeErrorKind(code: number): YouTubeErrorKind {
  if (code === 101 || code === 150) return "embedBlocked";
  if (code === 100) return "notFound";
  return "other";
}

// --- Player API (browser only) ---

export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
};

/** YT.PlayerState values. */
export const YT_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads https://www.youtube.com/iframe_api once and resolves with window.YT. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("YouTube player needs a browser"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      script.remove();
      reject(new Error("Couldn't load the YouTube player"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
