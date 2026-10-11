import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
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
    // Seeking a video that has never played makes YouTube start it. Pausing
    // straight away — or the browser blocking unmuted autoplay — leaves the
    // iframe black because no frame was ever decoded. So "prime" instead:
    // let it start muted, and on the first PLAYING pause, land on the exact
    // target and restore the sound.
    const primingRef = useRef<{ target: number; wasMuted: boolean } | null>(
      null,
    );
    const startedRef = useRef(false);
    // Latest callbacks without re-creating the player on every render.
    const cb = useRef(callbacks);
    cb.current = callbacks;

    useImperativeHandle(ref, () => {
      const p = () => (readyRef.current ? playerRef.current : null);
      return {
        play: () => {
          const player = p();
          if (!player) return;
          const priming = primingRef.current;
          if (priming) {
            primingRef.current = null;
            if (!priming.wasMuted) player.unMute();
          }
          player.playVideo();
        },
        pause: () => {
          const player = p();
          if (!player) return;
          // Pausing mid-prime: keep priming so it still settles on a frame.
          if (primingRef.current) return;
          player.pauseVideo();
        },
        seek: (seconds) => {
          const player = p();
          if (!player) return;
          const state = player.getPlayerState();
          // A started video that is playing or paused keeps its state.
          if (
            !primingRef.current &&
            startedRef.current &&
            state !== YT_STATE.ENDED
          ) {
            player.seekTo(seconds, true);
            return;
          }
          if (primingRef.current) {
            primingRef.current.target = seconds;
          } else {
            primingRef.current = {
              target: seconds,
              wasMuted: player.isMuted(),
            };
            player.mute();
          }
          player.seekTo(seconds, true);
          player.playVideo();
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
                if (e.data === YT_STATE.PLAYING) startedRef.current = true;
                const priming = primingRef.current;
                if (e.data === YT_STATE.PLAYING && priming) {
                  primingRef.current = null;
                  e.target.pauseVideo();
                  e.target.seekTo(priming.target, true);
                  if (!priming.wasMuted) e.target.unMute();
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
        startedRef.current = false;
        primingRef.current = null;
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
