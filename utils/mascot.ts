// Animated mascot avatars: which avatar photos have a mascot, how many cards
// may idle-animate at once, and a tiny bus so a score anywhere in the app can
// make that student's mascot react.

/**
 * One animation in both transparent formats: VP9 WebM for Chrome, Edge and
 * Firefox, HEVC-with-alpha MOV for Safari and every iOS browser.
 */
export type MascotClip = { webm: string; hevc: string };

export type MascotClips = {
  /** Still image shown until a clip is loaded, and between plays. */
  poster: string;
  /**
   * Celebration clips, also used for hover and idle plays. Every clip's first
   * and last frames match the poster.
   */
  happy: MascotClip[];
  /** Played for a negative score only; never on hover or idle. */
  sad: MascotClip[];
};

export type MascotMood = "happy" | "sad";

export type MascotVideoFormat = keyof MascotClip;

const clip = (folder: string, name: string): MascotClip => {
  const base = `/animation/${folder}/${encodeURIComponent(name)}`;
  return { webm: `${base}.webm`, hevc: `${base}.mov` };
};

// Test mapping: only avatar 16 has a mascot so far. Once the set is final the
// avatar photos can be migrated and this lookup keyed on something sturdier.
const MASCOTS: Record<string, MascotClips> = {
  "https://storage.tatugaschool.com/AVATAR/16.png": {
    poster: "/animation/mascot_16/original.png",
    happy: [
      clip("mascot_16", "Jumps for joy"),
      clip("mascot_16", "Laughs out loud"),
      clip("mascot_16", "Be quiet gesture"),
    ],
    sad: [clip("mascot_16", "Thumbs down gesture")],
  },
  "https://storage.tatugaschool.com/AVATAR/1.png": {
    poster: "/animation/mascot_1/original.png",
    happy: [
      clip("mascot_1", "Does a happy dance"),
      clip("mascot_1", "Waves hello"),
    ],
    sad: [clip("mascot_1", "Shakes its head no")],
  },
  "https://storage.tatugaschool.com/AVATAR/2.png": {
    poster: "/animation/mascot_2/original.png",
    happy: [
      clip("mascot_2", "Be quiet gesture"),
      clip("mascot_2", "Laughs out loud"),
    ],
    sad: [clip("mascot_2", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/3.png": {
    poster: "/animation/mascot_3/original.png",
    happy: [
      clip("mascot_3", "Does a happy dance"),
      clip("mascot_3", "Laughs out loud"),
    ],
    sad: [clip("mascot_3", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/4.png": {
    poster: "/animation/mascot_4/original.png",
    happy: [
      clip("mascot_4", "Does a happy dance"),
      clip("mascot_4", "Waves hello"),
    ],
    sad: [clip("mascot_4", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/5.png": {
    poster: "/animation/mascot_5/original.png",
    happy: [
      clip("mascot_5", "Does a happy dance"),
      clip("mascot_5", "Waves hello"),
    ],
    sad: [clip("mascot_5", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/6.png": {
    poster: "/animation/mascot_6/original.png",
    happy: [
      clip("mascot_6", "Does a happy dance"),
      clip("mascot_6", "Waves hello"),
    ],
    sad: [clip("mascot_6", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/7.png": {
    poster: "/animation/mascot_7/original.png",
    happy: [
      clip("mascot_7", "Does a happy dance"),
      clip("mascot_7", "Waves hello"),
    ],
    sad: [clip("mascot_7", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/8.png": {
    poster: "/animation/mascot_8/original.png",
    happy: [
      clip("mascot_8", "Does a happy dance"),
      clip("mascot_8", "Laughs out loud"),
    ],
    sad: [clip("mascot_8", "Shakes its head no")],
  },
  "https://storage.tatugaschool.com/AVATAR/9.png": {
    poster: "/animation/mascot_9/original.png",
    happy: [
      clip("mascot_9", "Does a happy dance"),
      clip("mascot_9", "Laughs out loud"),
    ],
    sad: [clip("mascot_9", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/10.png": {
    poster: "/animation/mascot_10/original.png",
    happy: [
      clip("mascot_10", "Does a happy dance"),
      clip("mascot_10", "Waves hello"),
    ],
    sad: [clip("mascot_10", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/11.png": {
    poster: "/animation/mascot_11/original.png",
    happy: [
      clip("mascot_11", "Does a funny dance"),
      clip("mascot_11", "Does smart show-off pose"),
    ],
    sad: [clip("mascot_11", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/12.png": {
    poster: "/animation/mascot_12/original.png",
    happy: [
      clip("mascot_12", "Does a happy dance"),
      clip("mascot_12", "Does cute pose"),
    ],
    sad: [clip("mascot_12", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/13.png": {
    poster: "/animation/mascot_13/original.png",
    happy: [
      clip("mascot_13", "Does a smart cool"),
      clip("mascot_13", "Jumps for joy"),
    ],
    sad: [clip("mascot_13", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/14.png": {
    poster: "/animation/mascot_14/original.png",
    happy: [
      clip("mascot_14", "Spin and say hello"),
      clip("mascot_14", "Does a happy dance"),
    ],
    sad: [clip("mascot_14", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/15.png": {
    poster: "/animation/mascot_15/original.png",
    happy: [
      clip("mascot_15", "Jumps for joy"),
      clip("mascot_15", "Laughs out loud"),
    ],
    sad: [clip("mascot_15", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/17.png": {
    poster: "/animation/mascot_17/original.png",
    happy: [
      clip("mascot_17", "Does a cute funny"),
      clip("mascot_17", "Nods yes with happy"),
    ],
    sad: [clip("mascot_17", "Thumbs down")],
  },
  "https://storage.tatugaschool.com/AVATAR/18.png": {
    poster: "/animation/mascot_18/original.png",
    happy: [
      clip("mascot_18", "Waves hello"),
      clip("mascot_18", "Does a cute dance"),
    ],
    sad: [clip("mascot_18", "Thumbs down")],
  },
};

export function mascotForPhoto(photo: string | undefined): MascotClips | null {
  if (!photo) return null;
  return MASCOTS[photo] ?? null;
}

/** Share of mascot cards allowed to idle-animate at the same time. */
export const IDLE_PLAY_RATIO = 0.2;

/**
 * Which idle cards to start this tick so no more than `ratio` of all mascot
 * cards play at once (always at least one when any exist).
 */
export function pickIdleToPlay(
  idleIds: string[],
  playingCount: number,
  totalCount: number,
  random: () => number = Math.random,
  ratio: number = IDLE_PLAY_RATIO,
): string[] {
  if (totalCount === 0) return [];
  const cap = Math.max(1, Math.floor(totalCount * ratio));
  const room = Math.min(cap - playingCount, idleIds.length);
  if (room <= 0) return [];
  const pool = [...idleIds];
  const picked: string[] = [];
  for (let i = 0; i < room; i++) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

/**
 * Which transparent format this browser can draw, or null to keep the still
 * picture. WebKit (Safari, and every browser on iOS/iPadOS) draws WebM alpha
 * as a black box but plays HEVC alpha; Chromium plays HEVC on some machines
 * yet ignores its alpha layer, so everything else gets WebM.
 *
 * @param canPlayHevc `video.canPlayType('video/mp4; codecs="hvc1"') !== ""`
 */
export function mascotVideoFormat(
  userAgent: string,
  canPlayHevc: boolean,
): MascotVideoFormat | null {
  const webKitOnly =
    /AppleWebKit/.test(userAgent) &&
    !/Chrome\/|Chromium\/|Edg\//.test(userAgent);
  if (!webKitOnly) return "webm";
  return canPlayHevc ? "hevc" : null;
}

type ReactListener = (studentOnSubjectId: string, mood: MascotMood) => void;
const reactListeners = new Set<ReactListener>();

export function onMascotReact(listener: ReactListener): () => void {
  reactListeners.add(listener);
  return () => {
    reactListeners.delete(listener);
  };
}

export function reactMascot(studentOnSubjectId: string, mood: MascotMood) {
  reactListeners.forEach((listener) => listener(studentOnSubjectId, mood));
}

/** The reaction a score earns: happy for points, sad for a deduction. */
export function moodForPoints(points: number): MascotMood | null {
  if (points > 0) return "happy";
  if (points < 0) return "sad";
  return null;
}
