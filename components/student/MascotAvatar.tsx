import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  MascotClip,
  MascotClips,
  MascotMood,
  MascotVideoFormat,
  MAX_IDLE_PLAYING,
  createPlaySlots,
  mascotVideoFormat,
  onMascotReact,
  pickIdleToPlay,
} from "../../utils/mascot";

/**
 * A score reaction (happy/sad), a happy play someone asked for (a tap, or a
 * greeting on mount), or an ambient idle play (happy only).
 */
type PlayReason = MascotMood | "tap" | "idle";

type Props = {
  clips: MascotClips;
  alt: string;
  /** Matches `reactMascot(id, mood)` calls, e.g. the StudentOnSubject id. */
  id: string;
  /**
   * Make the mascot a button that plays a happy clip when tapped or clicked
   * (mouse, touch, pen and keyboard alike). Leave off where a tap already
   * means something else, like opening the student.
   */
  tapToPlay?: boolean;
  /** Play a happy clip once on mount, e.g. as a greeting in a popup. */
  greetOnMount?: boolean;
  /** Play this reaction on mount (the score event fired before mounting). */
  reactOnMount?: MascotMood;
  /** `sizes` for the poster image; match the rendered width. */
  sizes?: string;
};

// Each clip is fetched on first play and shared by every card as a blob URL,
// so 40 cards with the same mascot cost one download and replay instantly.
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

let detectedFormat: MascotVideoFormat | null | undefined;

/**
 * The transparent format this browser can draw (WebM, or HEVC on
 * Safari/iOS), detected once per page; null keeps the poster.
 */
function videoFormat(): MascotVideoFormat | null {
  if (detectedFormat === undefined) {
    detectedFormat = mascotVideoFormat(
      navigator.userAgent,
      document.createElement("video").canPlayType('video/mp4; codecs="hvc1"') !==
        "",
    );
  }
  return detectedFormat;
}

const randomItem = <T,>(list: T[]) =>
  list[Math.floor(Math.random() * list.length)];

function pickClip(
  reason: PlayReason,
  pool: MascotClip[],
  format: MascotVideoFormat,
): MascotClip {
  if (reason === "happy") return pool[0];
  if (reason === "idle") {
    // Idle plays reuse a clip that is already downloaded, so ambient motion
    // costs at most one download per mascot instead of the whole set.
    const ready = pool.filter((clip) => clipCache.has(clip[format]));
    return ready.length > 0 ? randomItem(ready) : pool[0];
  }
  return randomItem(pool);
}

// Every mascot on the page shares one budget of playing videos.
const slots = createPlaySlots();

// Idle scheduler shared by all mascots: every tick, top up the on-screen
// mascots that are playing to the idle cap.
type IdleEntry = {
  visible: boolean;
  isBusy: () => boolean;
  isReserved: () => boolean;
  /** Mark as busy until the staggered `play` call below fires. */
  reserve: () => void;
  play: (reason: PlayReason) => void;
};
const idleEntries = new Map<string, IdleEntry>();
const IDLE_TICK_MS = 3500;
let idleTimer: number | null = null;

function idleTick() {
  if (document.hidden) return;
  const entries = [...idleEntries];
  const visible = entries.filter(([, entry]) => entry.visible);
  const reservedCount = entries.filter(([, entry]) =>
    entry.isReserved(),
  ).length;
  const idle = visible
    .filter(([, entry]) => !entry.isBusy())
    .map(([key]) => key);
  pickIdleToPlay(idle, slots.playing + reservedCount, visible.length).forEach(
    (key) => {
      const entry = idleEntries.get(key);
      if (!entry) return;
      entry.reserve();
      // Stagger starts across the tick so the class doesn't move in unison.
      window.setTimeout(() => entry.play("idle"), Math.random() * IDLE_TICK_MS);
    },
  );
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
  tap: 1,
  idle: 1,
};

/**
 * Mascot avatar: the still poster renders immediately; a clip is downloaded
 * only when it is first needed (a score reaction, a tap, a greeting or an
 * idle play). At most MAX_PLAYING videos play page-wide; reactions beyond
 * that wait for a free slot, and idle plays only fill spare ones.
 * The video only mounts while playing and swaps in after its first frame is
 * painted, and every clip starts and ends on the poster pose, so the switch
 * is invisible.
 */
function MascotAvatar({
  clips,
  alt,
  id,
  tapToPlay = false,
  greetOnMount = false,
  reactOnMount,
  sizes = "80px",
}: Props) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const loopsLeft = useRef(0);
  const reason = useRef<PlayReason | null>(null);
  // A reserved idle start counts as busy so the scheduler won't pick it twice.
  const reserved = useRef(false);
  // Holds one of the page-wide slots from the start request until stop.
  const hasSlot = useRef(false);
  // Cancels a queued request while waiting for a free slot.
  const waiting = useRef<(() => void) | null>(null);
  // Bumped on every start and stop so a clip that loads late is dropped.
  const request = useRef(0);

  const releaseSlot = () => {
    if (!hasSlot.current) return;
    hasSlot.current = false;
    slots.release();
  };

  const stop = () => {
    request.current += 1;
    loopsLeft.current = 0;
    reason.current = null;
    setShown(false);
    setPlaying(null);
    releaseSlot();
  };

  const startClip = (clip: MascotClip, format: MascotVideoFormat) => {
    const token = ++request.current;
    loadClip(clip[format])
      .then((url) => {
        if (token !== request.current) return;
        // Same clip already on screen (e.g. a cheer during an idle play):
        // it just keeps going with the new loop count.
        if (url === playingRef.current) return;
        setShown(false);
        setPlaying(url);
      })
      .catch((error) => {
        console.error(error);
        if (token === request.current) stop();
      });
  };

  const playRef = useRef<(reason: PlayReason) => void>(() => {});
  playRef.current = (next) => {
    reserved.current = false;
    const format = videoFormat();
    if (!format) return;
    const isScore = next === "happy" || next === "sad";
    // A new score swaps in its own clip; anything else just extends the play
    // (a second tap adds one more loop, never more; a thumbs-down plays once).
    if (
      (hasSlot.current || waiting.current) &&
      !(isScore && next !== reason.current)
    ) {
      if (reason.current === "sad") return;
      loopsLeft.current = Math.max(
        loopsLeft.current,
        next === "tap" ? 2 : LOOPS[next],
      );
      return;
    }
    const pool = next === "sad" ? clips.sad : clips.happy;
    if (pool.length === 0) return;
    const clip = pickClip(next, pool, format);
    reason.current = next;
    loopsLeft.current = LOOPS[next];
    if (hasSlot.current) {
      startClip(clip, format);
      return;
    }
    waiting.current?.();
    waiting.current = null;
    if (next === "idle") {
      if (!slots.tryAcquire(MAX_IDLE_PLAYING)) {
        reason.current = null;
        return;
      }
      hasSlot.current = true;
      startClip(clip, format);
      return;
    }
    const cancel = slots.acquire(
      () => {
        waiting.current = null;
        hasSlot.current = true;
        startClip(clip, format);
      },
      () => {
        waiting.current = null;
        reason.current = null;
      },
    );
    if (!hasSlot.current) waiting.current = cancel;
  };

  useEffect(() => {
    const mood = reactOnMount ?? (greetOnMount ? "tap" : null);
    if (mood) playRef.current(mood);
    // Mount-only: a later prop change is not a new event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Give back the slot (or the queued request) when unmounted.
  useEffect(
    () => () => {
      request.current += 1;
      waiting.current?.();
      waiting.current = null;
      releaseSlot();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () =>
      onMascotReact((studentId, mood) => {
        if (studentId === id) playRef.current(mood);
      }),
    [id],
  );

  // Join the random idle rotation while on screen and motion is OK.
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !videoFormat()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const entry: IdleEntry = {
      visible: false,
      isBusy: () =>
        reserved.current || hasSlot.current || waiting.current !== null,
      isReserved: () => reserved.current,
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
      reserved.current = false;
    };
  }, [id]);

  // Loop by hand so playback always stops on the last frame (the poster pose).
  const handleEnded = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    loopsLeft.current -= 1;
    if (loopsLeft.current > 0) {
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

  const content = (
    <>
      <Image
        fill
        sizes={sizes}
        src={clips.poster}
        alt={alt}
        draggable={false}
        className={`object-cover ${shown ? "opacity-0" : "opacity-100"}`}
      />
      {playing && (
        <video
          key={playing}
          ref={videoRef}
          src={playing}
          muted
          playsInline
          disablePictureInPicture
          aria-hidden
          onPlaying={() => setShown(true)}
          onEnded={handleEnded}
          onError={stop}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );

  const setWrapper = (node: HTMLElement | null) => {
    wrapperRef.current = node;
  };

  if (tapToPlay) {
    return (
      <button
        type="button"
        ref={setWrapper}
        onClick={() => playRef.current("tap")}
        className="absolute inset-0 block cursor-pointer touch-manipulation select-none rounded-[inherit] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-color"
      >
        {content}
      </button>
    );
  }

  return (
    <div ref={setWrapper} className="absolute inset-0">
      {content}
    </div>
  );
}

export default MascotAvatar;
