import { motion, MotionValue, useTransform } from "framer-motion";
import { memo, MutableRefObject, useEffect, useState } from "react";
import { CardPickerLanguage } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import { distanceFromCenter } from "../../../utils/slider-reel";
import { StudentPhoto } from "../card-picker/CardFace";

/** Same footprint as the card picker's fan cards (h-44 w-32 / h-56 w-40). */
const SIZES = {
  sm: { w: 128, h: 176, gap: 16 },
  md: { w: 160, h: 224, gap: 20 },
} as const;

export type ReelSize = (typeof SIZES)[keyof typeof SIZES];

export function useReelSize(): ReelSize {
  const [md, setMd] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setMd(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return md ? SIZES.md : SIZES.sm;
}

// Room above/below the strip for the pointer and the selection frame.
const FRAME_INSET = 10;
const PAD_Y = 28;

type Props = {
  reel: string[];
  version: number;
  byId: Map<string, StudentOnSubject>;
  x: MotionValue<number>;
  size: ReelSize;
  landed: boolean;
  lang: Language;
  itemRefs: MutableRefObject<Map<number, HTMLDivElement>>;
};

export default function SliderReel({
  reel,
  version,
  byId,
  x,
  size,
  landed,
  lang,
  itemRefs,
}: Props) {
  const step = size.w + size.gap;

  return (
    <div
      className="relative w-full"
      style={{ height: size.h + PAD_Y * 2 }}
      data-testid="slider-reel"
    >
      {/* Edge fade keeps attention on the pointer. */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0, #000 18%, #000 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0, #000 18%, #000 82%, transparent 100%)",
        }}
      >
        <motion.div
          // Remount on breakpoint change so item transforms pick up the new step.
          key={`${version}-${size.w}`}
          className="absolute flex"
          style={{
            x,
            left: "50%",
            top: PAD_Y,
            marginLeft: -size.w / 2,
            gap: size.gap,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {reel.map((id, index) => {
            const student = byId.get(id);
            if (!student) {
              return (
                <div
                  key={index}
                  style={{ width: size.w, height: size.h }}
                  className="shrink-0"
                />
              );
            }
            return (
              <ReelItem
                key={index}
                index={index}
                student={student}
                x={x}
                step={step}
                size={size}
                lang={lang}
                itemRefs={itemRefs}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Selection frame + pointer, fixed at the center. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 z-10 rounded-[22px] border-4 border-primary-color"
        style={{
          // Centered via style: animating scale would wipe a Tailwind translate.
          x: "-50%",
          top: PAD_Y - FRAME_INSET,
          width: size.w + FRAME_INSET * 2,
          height: size.h + FRAME_INSET * 2,
        }}
        animate={
          landed
            ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  "0 0 0 0 rgba(44,124,209,0.45)",
                  "0 0 0 14px rgba(44,124,209,0)",
                ],
              }
            : { scale: 1, boxShadow: "0 0 0 0 rgba(44,124,209,0)" }
        }
        transition={{ duration: 0.5 }}
      >
        <span className="absolute -top-[18px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[13px] border-x-transparent border-t-primary-color" />
        <span className="absolute -bottom-[18px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[11px] border-b-[13px] border-x-transparent border-b-primary-color" />
      </motion.div>
    </div>
  );
}

const ReelItem = memo(function ReelItem({
  index,
  student,
  x,
  step,
  size,
  lang,
  itemRefs,
}: {
  index: number;
  student: StudentOnSubject;
  x: MotionValue<number>;
  step: number;
  size: ReelSize;
  lang: Language;
  itemRefs: MutableRefObject<Map<number, HTMLDivElement>>;
}) {
  // Center card full size, neighbours recede (Emergent / TIDE carousels).
  const scale = useTransform(x, (v) =>
    Math.max(0.8, 1 - 0.1 * distanceFromCenter(v, index, step)),
  );
  const opacity = useTransform(x, (v) =>
    Math.max(0.4, 1 - 0.25 * distanceFromCenter(v, index, step)),
  );

  return (
    <motion.div
      ref={(node) => {
        if (node) itemRefs.current.set(index, node);
        else itemRefs.current.delete(index);
      }}
      data-testid="reel-item"
      style={{ width: size.w, height: size.h, scale, opacity }}
      className="flex shrink-0 flex-col items-center rounded-2xl border-4 border-white bg-white px-2 pb-3 pt-4 shadow-[0_10px_24px_rgba(39,93,150,0.18)]"
    >
      <StudentPhoto
        student={student}
        className="h-16 w-16 border-4 border-primary-color/15 text-2xl md:h-24 md:w-24 md:text-3xl"
      />
      <span className="mt-2 line-clamp-2 w-full text-balance break-words text-center text-sm font-bold leading-tight text-icon-color md:mt-3 md:text-base">
        {student.firstName} {student.lastName}
      </span>
      <span className="mt-auto text-xs text-icon-color/60">
        {CardPickerLanguage.number_label(lang, student.number)}
      </span>
    </motion.div>
  );
});
