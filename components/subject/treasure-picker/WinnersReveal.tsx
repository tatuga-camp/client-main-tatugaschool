import { animated, useSpring, useTrail } from "@react-spring/web";
import { useEffect } from "react";
import { IoArrowForward, IoArrowUndo, IoStar } from "react-icons/io5";
import {
  CardPickerLanguage,
  TreasurePickerLanguage,
} from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import { mascotForPhoto, reactMascot } from "../../../utils/mascot";
import MascotAvatar from "../../student/MascotAvatar";
import { StudentPhoto } from "../card-picker/CardFace";

// Same blue spotlight as the card/slider/wheel pickers' reveal.
const SPOTLIGHT_BG =
  "radial-gradient(ellipse 60% 65% at 50% 45%, #2C7CD1 0%, #275d96 45%, #1b3f68 100%)";
const RAYS =
  "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.10) 0deg 9deg, transparent 9deg 22.5deg)";

type Props = {
  winners: StudentOnSubject[];
  lang: Language;
  reducedMotion: boolean;
  onGivePoints: (student: StudentOnSubject) => void;
  onPutBack: () => void;
  onDone: () => void;
};

export default function WinnersReveal({
  winners,
  lang,
  reducedMotion,
  onGivePoints,
  onPutBack,
  onDone,
}: Props) {
  const backdrop = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    immediate: reducedMotion,
  });
  const rays = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: !reducedMotion,
    config: { duration: 30000 },
    immediate: reducedMotion,
  });
  const title = useSpring({
    from: { opacity: 0, y: -16 },
    to: { opacity: 1, y: 0 },
    delay: 120,
    immediate: reducedMotion,
  });
  const trail = useTrail(winners.length, {
    from: { opacity: 0, scale: 0.4, y: 60 },
    to: { opacity: 1, scale: 1, y: 0 },
    delay: 220,
    config: { tension: 260, friction: 16 },
    immediate: reducedMotion,
  });

  const big = winners.length === 1;
  const tier = big ? "big" : winners.length <= 4 ? "mid" : "small";

  return (
    <animated.div
      style={{ ...backdrop, background: SPOTLIGHT_BG }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-16 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={TreasurePickerLanguage.reveal_label(lang)}
    >
      <animated.div
        aria-hidden
        style={{ rotate: rays.rotate, background: RAYS }}
        className="pointer-events-none absolute left-1/2 top-[45%] -ml-[90vmax] -mt-[90vmax] h-[180vmax] w-[180vmax] rounded-full"
      />
      <animated.div style={title} className="relative mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          {TreasurePickerLanguage.picked_kicker(lang, winners.length)}
        </p>
        <h2 className="text-3xl font-bold md:text-4xl">
          {TreasurePickerLanguage.congrats(lang, winners.length)}
        </h2>
      </animated.div>

      <div className="relative -m-6 flex max-h-[62vh] max-w-5xl flex-wrap items-center justify-center gap-3 overflow-y-auto p-6 md:gap-4">
        {trail.map((style, i) => {
          const s = winners[i];
          return (
            <animated.div
              key={s.id}
              style={style}
              className={`flex flex-col items-center rounded-3xl bg-white text-icon-color shadow-[0_10px_24px_rgba(0,0,0,0.22)] ${
                big ? "w-64 p-6 md:w-72" : "w-40 p-4 md:w-44"
              }`}
            >
              <WinnerAvatar
                student={s}
                tier={tier}
                // Cheer once the card has sprung in (the trail staggers them).
                cheerDelay={reducedMotion ? 0 : 450 + i * 90}
              />
              <span className="mt-3 rounded-full bg-primary-color/10 px-2 py-0.5 text-xs font-bold text-primary-color">
                {CardPickerLanguage.number_label(lang, s.number)}
              </span>
              <p
                className={`mt-1 line-clamp-2 text-center font-bold leading-tight ${
                  big ? "text-2xl" : "text-base"
                }`}
              >
                {s.firstName} {big ? s.lastName : ""}
              </p>
              <button
                type="button"
                onClick={() => onGivePoints(s)}
                className="mt-3 flex h-9 items-center gap-1.5 rounded-full bg-primary-color px-4 text-sm font-bold text-white transition hover:bg-primary-color-hover active:scale-95"
              >
                <IoStar /> {CardPickerLanguage.give_points(lang)}
              </button>
            </animated.div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-5 flex flex-wrap items-center justify-center gap-2 px-4 md:bottom-8 md:gap-3">
        <button
          type="button"
          onClick={onPutBack}
          className="flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95 md:h-12 md:px-5"
        >
          <IoArrowUndo /> {TreasurePickerLanguage.put_back(lang)}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-bold text-primary-color shadow-[0_6px_14px_rgba(0,0,0,0.2)] transition hover:scale-[1.03] active:scale-95 md:h-14 md:px-8"
        >
          <IoArrowForward /> {TreasurePickerLanguage.back_to_chest(lang)}
        </button>
      </div>
    </animated.div>
  );
}

const PHOTO_SIZE = {
  big: "h-32 w-32 text-5xl md:h-40 md:w-40",
  mid: "h-20 w-20 text-3xl md:h-24 md:w-24",
  small: "h-14 w-14 text-xl md:h-16 md:w-16",
} as const;
// Full-body mascots need more room than a round photo, like the card picker.
const MASCOT_SIZE = {
  big: { box: "w-44 md:w-52", sizes: "208px" },
  mid: { box: "w-28 md:w-32", sizes: "128px" },
  small: { box: "w-20 md:w-24", sizes: "96px" },
} as const;

/** Mascot students get their animated full-body mascot, others their photo. */
function WinnerAvatar({
  student,
  tier,
  cheerDelay,
}: {
  student: StudentOnSubject;
  tier: keyof typeof PHOTO_SIZE;
  cheerDelay: number;
}) {
  const mascot = mascotForPhoto(student.photo);

  useEffect(() => {
    if (!mascot) return;
    const t = window.setTimeout(
      () => reactMascot(student.id, "happy"),
      cheerDelay,
    );
    return () => window.clearTimeout(t);
  }, [mascot, student.id, cheerDelay]);

  if (!mascot) {
    return (
      <StudentPhoto
        student={student}
        className={`${PHOTO_SIZE[tier]} ring-4 ring-warning-color/80`}
      />
    );
  }
  return (
    <div className={`relative aspect-square ${MASCOT_SIZE[tier].box}`}>
      <span
        aria-hidden
        className="absolute inset-2 rounded-full bg-primary-color/10"
      />
      <MascotAvatar
        id={student.id}
        clips={mascot}
        alt={student.firstName}
        tapToPlay
        sizes={MASCOT_SIZE[tier].sizes}
      />
    </div>
  );
}
