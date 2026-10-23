import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  MascotClips,
  MascotMood,
  mascotVideoFormat,
  onMascotReact,
  pickIdleToPlay,
} from "../../utils/mascot";

/** A score reaction (happy/sad) or an ambient play (hover/idle, happy only). */
type PlayReason = MascotMood | "hover" | "idle";

type Props = {
  clips: MascotClips;
  alt: string;
  /** Matches `reactMascot(id, mood)` calls, e.g. the StudentOnSubject id. */
  id: string;
  /** Keep looping while true (the card is hovered). */
  active?: boolean;
  /** Load right away and play this reaction as soon as the clips are ready. */
  reactOnMount?: MascotMood;
  /** `sizes` for the poster image; match the rendered width. */
  sizes?: string;
};

// Each clip is fetched once per page and shared by every card as a blob URL,
// so 40 cards with the same mascot cost one download and play instantly.
const clipCache = new Map<string, Promise<string>>();

function loadClip(url: string): Promise<string> {
  let pending = clipCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Mascot clip ${res.status}`);
        return res.blob();
      })
      .then((blob) => URL.createObjectURL(blob));
    pending.catch(() => clipCache.delete(url));
    clipCache.set(url, pending);
  }
  return pending;
}

function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, 500);
  return () => window.clearTimeout(handle);
}

// Idle scheduler shared by all mascots: every tick, top up the on-screen
// mascots that are playing to IDLE_PLAY_RATIO of the visible ones.
type IdleEntry = {
  visible: boolean;
  isBusy: () => boolean;
  /** Mark as busy until the staggered `play` call below fires. */
  reserve: () => void;
  play: (reason: PlayReason) => void;
};
const idleEntries = new Map<string, IdleEntry>();
const IDLE_TICK_MS = 3500;
let idleTimer: number | null = null;

function idleTick() {
  if (document.hidden) return;
  const visible = [...idleEntries].filter(([, entry]) => entry.visible);
  const busy = visible.filter(([, entry]) => entry.isBusy());
  const idle = visible
    .filter(([, entry]) => !entry.isBusy())
    .map(([key]) => key);
  pickIdleToPlay(idle, busy.length, visible.length).forEach((key) => {
    const entry = idleEntries.get(key);
    if (!entry) return;
    entry.reserve();
    // Stagger starts across the tick so the class doesn't move in unison.
    window.setTimeout(() => entry.play("idle"), Math.random() * IDLE_TICK_MS);
  });
}

function registerIdle(key: string, entry: IdleEntry): () => void {
  idleEntries.set(key, entry);
  if (idleTimer === null) {
    idleTimer = window.setInterval(idleTick, IDLE_TICK_MS);
  }
  return () => {
    idleEntries.delete(key);
    if (idleEntries.size === 0 && idleTimer !== null) {
      window.clearInterval(idleTimer);
      idleTimer = null;
    }
  };
}

const LOOPS: Record<PlayReason, number> = {
  happy: 2,
  sad: 1,
  hover: 1,
  idle: 1,
};

type Sources = Record<MascotMood, string[]>;

/**
 * Mascot avatar: the still poster renders immediately; the clips preload in
 * the background and, once ready, react to a score (happy or sad), and play
 * a happy clip on hover or at random.
 * The video only mounts while playing and swaps in after its first frame is
 * painted, and every clip starts and ends on the poster pose, so the switch
 * is invisible.
 */
function MascotAvatar({
  clips,
  alt,
  id,
  active = false,
  reactOnMount,
  sizes = "80px",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<Sources | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const loopsLeft = useRef(0);
  const activeRef = useRef(active);
  const pendingMood = useRef<MascotMood | null>(reactOnMount ?? null);
  const reason = useRef<PlayReason | null>(null);
  // A reserved idle start counts as busy so the scheduler won't pick it twice.
  const reserved = useRef(false);

  const playRef = useRef<(reason: PlayReason) => void>(() => {});
  playRef.current = (next) => {
    const isScore = next === "happy" || next === "sad";
    if (!sources) {
      if (isScore) pendingMood.current = next;
      return;
    }
    reserved.current = false;
    // A new score swaps in its own clip; anything else just extends the play.
    if (playing && !(isScore && next !== reason.current)) {
      loopsLeft.current = Math.max(loopsLeft.current, LOOPS[next]);
      return;
    }
    if (next === "idle" && activeRef.current) return;
    const pool = next === "sad" ? sources.sad : sources.happy;
    if (pool.length === 0) return;
    reason.current = next;
    loopsLeft.current = LOOPS[next];
    setShown(false);
    setPlaying(
      next === "happy" ? pool[0] : pool[Math.floor(Math.random() * pool.length)],
    );
  };

  // Preload once the page has settled, in the transparent format this
  // browser can draw (WebM, or HEVC on Safari/iOS); none keeps the poster.
  useEffect(() => {
    const format = mascotVideoFormat(
      navigator.userAgent,
      document.createElement("video").canPlayType('video/mp4; codecs="hvc1"') !==
        "",
    );
    if (!format) return;
    let cancelled = false;
    const schedule = reactOnMount
      ? (load: () => void) => {
          load();
          return () => {};
        }
      : whenIdle;
    const cancelIdle = schedule(() => {
      const load = (list: MascotClips["happy"]) =>
        Promise.all(list.map((clip) => loadClip(clip[format])));
      Promise.all([load(clips.happy), load(clips.sad)])
        .then(([happy, sad]) => {
          if (!cancelled) setSources({ happy, sad });
        })
        .catch((error) => console.error(error));
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [clips, reactOnMount]);

  useEffect(() => {
    if (sources && pendingMood.current) {
      const mood = pendingMood.current;
      pendingMood.current = null;
      playRef.current(mood);
    }
  }, [sources]);

  useEffect(
    () =>
      onMascotReact((studentId, mood) => {
        if (studentId === id) playRef.current(mood);
      }),
    [id],
  );

  useEffect(() => {
    activeRef.current = active;
    if (active) playRef.current("hover");
  }, [active]);

  const isBusy = useRef<() => boolean>(() => false);
  isBusy.current = () => reserved.current || playing !== null;

  // Join the random idle rotation while ready, on screen and motion is OK.
  useEffect(() => {
    const node = wrapperRef.current;
    if (!sources || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const entry: IdleEntry = {
      visible: false,
      isBusy: () => isBusy.current(),
      reserve: () => {
        reserved.current = true;
      },
      play: (reason) => playRef.current(reason),
    };
    const unregister = registerIdle(`${id}:${Math.random()}`, entry);
    const observer = new IntersectionObserver(([record]) => {
      entry.visible = record.isIntersecting;
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      unregister();
    };
  }, [sources, id]);

  const stop = () => {
    loopsLeft.current = 0;
    reason.current = null;
    setShown(false);
    setPlaying(null);
  };

  // Loop by hand so playback always stops on the last frame (the poster pose).
  const handleEnded = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    loopsLeft.current -= 1;
    // Hovering keeps a happy clip looping; a thumbs-down plays just once.
    if (
      loopsLeft.current > 0 ||
      (activeRef.current && reason.current !== "sad")
    ) {
      const video = event.currentTarget;
      video.currentTime = 0;
      video.play().catch(stop);
      return;
    }
    stop();
  };

  // Start each clip by hand rather than with `autoPlay`: if the browser
  // refuses (iOS Low Power Mode blocks even muted autoplay) the card drops
  // back to the poster instead of staying "busy" forever.
  useEffect(() => {
    const video = videoRef.current;
    if (!playing || !video) return;
    video.muted = true;
    video.play().catch(stop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      <Image
        fill
        sizes={sizes}
        src={clips.poster}
        alt={alt}
        className={`object-cover ${shown ? "opacity-0" : "opacity-100"}`}
      />
      {playing && (
        <video
          key={playing}
          ref={videoRef}
          src={playing}
          muted
          playsInline
          aria-hidden
          onPlaying={() => setShown(true)}
          onEnded={handleEnded}
          onError={stop}
          className={`absolute inset-0 h-full w-full object-cover ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

export default MascotAvatar;
