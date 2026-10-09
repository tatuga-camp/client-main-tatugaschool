import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { loadYouTubeApi, YT_STATE, YTPlayer } from "../../utils/youtube";

export type YouTubeEmbedHandle = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  getTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
};

type Props = {
  videoId: string;
  /** Show YouTube's own controls. Off for students, who get Tatuga's controls. */
  controls?: boolean;
  className?: string;
  onReady?: (duration: number) => void;
  /** Called about four times a second with the playhead and duration. */
  onTime?: (seconds: number, duration: number) => void;
  onStateChange?: (state: number) => void;
  onError?: (code: number) => void;
  onLoadFailed?: () => void;
};

const POLL_MS = 250;

const YouTubeEmbed = forwardRef<YouTubeEmbedHandle, Props>(
  ({ videoId, controls = true, className = "", ...callbacks }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const readyRef = useRef(false);
    // YouTube starts playback when you seek a video that isn't playing yet;
    // this pauses it again the moment it does.
    const holdPausedRef = useRef(false);
    // Latest callbacks without re-creating the player on every render.
    const cb = useRef(callbacks);
    cb.current = callbacks;

    useImperativeHandle(ref, () => {
      const p = () => (readyRef.current ? playerRef.current : null);
      return {
        play: () => {
          holdPausedRef.current = false;
          p()?.playVideo();
        },
        pause: () => p()?.pauseVideo(),
        seek: (seconds) => {
          const player = p();
          if (!player) return;
          const playing = player.getPlayerState() === YT_STATE.PLAYING;
          holdPausedRef.current = !playing;
          player.seekTo(seconds, true);
          if (!playing) player.pauseVideo();
        },
        getTime: () => p()?.getCurrentTime() ?? 0,
        getDuration: () => p()?.getDuration() ?? 0,
        setVolume: (volume) => p()?.setVolume(Math.round(volume * 100)),
        setMuted: (muted) => (muted ? p()?.mute() : p()?.unMute()),
      };
    }, []);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      let cancelled = false;
      let timer: ReturnType<typeof setInterval> | undefined;
      // The API replaces this node with an iframe, so React must not own it.
      const mount = document.createElement("div");
      host.appendChild(mount);

      loadYouTubeApi()
        .then((YT) => {
          if (cancelled) return;
          playerRef.current = new YT.Player(mount, {
            videoId,
            width: "100%",
            height: "100%",
            playerVars: {
              controls: controls ? 1 : 0,
              disablekb: controls ? 0 : 1,
              fs: controls ? 1 : 0,
              rel: 0,
              playsinline: 1,
              iv_load_policy: 3,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (e) => {
                if (cancelled) return;
                readyRef.current = true;
                cb.current.onReady?.(e.target.getDuration() || 0);
                timer = setInterval(() => {
                  const player = playerRef.current;
                  if (!player || !readyRef.current) return;
                  cb.current.onTime?.(
                    player.getCurrentTime() || 0,
                    player.getDuration() || 0,
                  );
                }, POLL_MS);
              },
              onStateChange: (e) => {
                if (e.data === YT_STATE.PLAYING && holdPausedRef.current) {
                  holdPausedRef.current = false;
                  e.target.pauseVideo();
                  return;
                }
                cb.current.onStateChange?.(e.data);
              },
              onError: (e) => cb.current.onError?.(e.data),
            },
          });
        })
        .catch(() => {
          if (!cancelled) cb.current.onLoadFailed?.();
        });

      return () => {
        cancelled = true;
        readyRef.current = false;
        if (timer) clearInterval(timer);
        try {
          playerRef.current?.destroy();
        } catch {
          // The iframe may already be gone during fast refresh.
        }
        playerRef.current = null;
        host.replaceChildren();
      };
    }, [videoId, controls]);

    return (
      <div
        ref={hostRef}
        className={`relative [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full ${className}`}
      />
    );
  },
);

YouTubeEmbed.displayName = "YouTubeEmbed";

export default YouTubeEmbed;
