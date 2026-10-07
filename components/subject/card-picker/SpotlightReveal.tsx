import { animate, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { IoArrowForward, IoArrowUndo, IoStar } from "react-icons/io5";
import { CardPickerLanguage } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import CardBack, { CARD_SIZE } from "./CardBack";
import CardFace from "./CardFace";
import type { CardOrigin } from "./CardStack";

const SPOTLIGHT_BG =
  "radial-gradient(ellipse 60% 65% at 50% 45%, #2C7CD1 0%, #275d96 45%, #1b3f68 100%)";

const GHOST =
  "flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-50 md:h-12 md:px-5";
const MAIN =
  "flex h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-bold text-primary-color shadow-[0_6px_14px_rgba(0,0,0,0.2)] transition hover:scale-[1.03] active:scale-95 disabled:opacity-50 md:h-14 md:px-8";

type Props = {
  student: StudentOnSubject;
  origin: CardOrigin | null;
  lang: Language;
  isLast: boolean;
  reducedMotion: boolean;
  onFlipStart: () => void;
  onRevealed: () => void;
  onPutBack: () => void;
  onGivePoints: () => void;
  onDrawNext: () => void;
};

export default function SpotlightReveal({
  student,
  origin,
  lang,
  isLast,
  reducedMotion,
  onFlipStart,
  onRevealed,
  onPutBack,
  onGivePoints,
  onDrawNext,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // Fly from where the card actually was (drag release or top of the pile)
  // to the resting slot, then flip. Measured before paint, so no flash.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const flip = flipRef.current;
    if (!card || !flip) return;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      setShown(true);
      onRevealed();
    };

    if (reducedMotion) {
      flip.style.transform = "rotateY(180deg)";
      finish();
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      if (origin) {
        const rest = card.getBoundingClientRect();
        const dx = origin.x - (rest.left + rest.width / 2);
        const dy = origin.y - (rest.top + rest.height / 2);
        const scale = rest.width > 0 ? origin.width / rest.width : 1;
        await animate(
          card,
          { x: [dx, 0], y: [dy, 0], scale: [scale, 1], rotate: [0, -3] },
          { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        );
      }
      if (cancelled) return;
      onFlipStart();
      await animate(
        flip,
        { rotateY: [0, 180] },
        { duration: 0.5, ease: "easeInOut" },
      );
      finish();
    };
    run();

    return () => {
      cancelled = true;
    };
    // Runs once per mounted student (the parent keys us by student id).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center overflow-hidden px-4 pb-32 pt-20 font-Anuphan">
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ background: SPOTLIGHT_BG }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />

      <motion.div
        className="flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:justify-center md:gap-12"
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
      >
        <div
          ref={cardRef}
          className={`${CARD_SIZE} shrink-0 [perspective:1200px]`}
        >
          <div
            ref={flipRef}
            className="relative h-full w-full [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <CardBack />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <CardFace student={student} lang={lang} />
            </div>
          </div>
        </div>

        <motion.div
          className="min-w-0 max-w-md text-center text-white md:text-left"
          initial={{ opacity: 0, y: 12 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-bold tracking-[0.12em] text-warning-color md:text-sm">
            🎉 {CardPickerLanguage.picked_label(lang)}
          </p>
          <h2
            data-testid="spotlight-name"
            className="mt-1 text-4xl font-extrabold leading-tight [overflow-wrap:anywhere] md:text-6xl"
          >
            {student.firstName}
            <br />
            {student.lastName}
          </h2>
          <p className="mt-2 text-base text-white/80 md:text-lg">
            {student.title} ·{" "}
            {CardPickerLanguage.number_label(lang, student.number)}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-5 z-10 flex flex-wrap items-center justify-center gap-2 px-4 md:bottom-8 md:gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          type="button"
          disabled={!shown}
          onClick={onPutBack}
          className={GHOST}
        >
          <IoArrowUndo /> {CardPickerLanguage.put_back(lang)}
        </button>
        <button
          type="button"
          disabled={!shown}
          onClick={onGivePoints}
          className={MAIN}
        >
          <IoStar /> {CardPickerLanguage.give_points(lang)}
        </button>
        <button
          type="button"
          disabled={!shown}
          onClick={onDrawNext}
          className={GHOST}
        >
          {isLast
            ? CardPickerLanguage.finish(lang)
            : CardPickerLanguage.draw_next(lang)}{" "}
          <IoArrowForward />
        </button>
      </motion.div>
    </div>
  );
}
