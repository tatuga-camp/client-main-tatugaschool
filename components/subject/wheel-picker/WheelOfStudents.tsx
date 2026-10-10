import { motion, MotionValue, useTransform } from "framer-motion";
import { memo, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { IoSync } from "react-icons/io5";
import { StudentOnSubject } from "../../../interfaces";
import {
  labelFontSize,
  pointerKick,
  segmentAngle,
  segmentColors,
  slicePath,
  truncateLabel,
  WHEEL_COLORS,
  WHEEL_MAX_PEGS,
  wheelLabels,
} from "../../../utils/wheel";

/** Room above the wheel for the pointer. */
export const POINTER_ROOM = 26;

/** Wheel diameter that fits the stage between the top bar and action bar. */
export function useWheelDiameter(): number {
  const [diameter, setDiameter] = useState(320);
  useEffect(() => {
    const update = () =>
      setDiameter(
        Math.round(
          Math.max(
            240,
            Math.min(window.innerWidth - 32, window.innerHeight - 230, 760),
          ),
        ),
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return diameter;
}

type Props = {
  students: StudentOnSubject[];
  version: number;
  rotation: MotionValue<number>;
  diameter: number;
  /** Slice under the pointer once the wheel has stopped. */
  landedIndex: number | null;
  spinning: boolean;
  hubLabel: string;
  hubDisabled: boolean;
  onHubClick: () => void;
  ariaLabel: string;
  /** Marks where the winner sits, so the spotlight card flies from there. */
  landingRef: RefObject<HTMLDivElement>;
};

export default function WheelOfStudents({
  students,
  version,
  rotation,
  diameter,
  landedIndex,
  spinning,
  hubLabel,
  hubDisabled,
  onHubClick,
  ariaLabel,
  landingRef,
}: Props) {
  const count = students.length;
  const hub = Math.max(44, Math.round(diameter * 0.13));

  // Read through a ref: the transformer only re-runs when rotation changes.
  const countRef = useRef(count);
  countRef.current = count;
  const kick = useTransform(rotation, (v) =>
    pointerKick(v, countRef.current, countRef.current > 40 ? 12 : 22),
  );

  return (
    <div
      className="relative shrink-0"
      style={{ width: diameter, height: diameter + POINTER_ROOM }}
      data-testid="wheel"
    >
      {/* Pointer: pivots at its top, kicked by the pegs as they pass. */}
      <motion.div
        className="absolute left-1/2 top-0 z-20"
        style={{
          x: "-50%",
          rotate: kick,
          transformOrigin: "50% 12px",
          width: 40,
          height: 52,
        }}
        aria-hidden
      >
        <svg viewBox="0 0 40 52" width={40} height={52}>
          <path
            d="M20 50 L6 20 A15 15 0 1 1 34 20 Z"
            fill="#2C7CD1"
            stroke="#fff"
            strokeWidth={3}
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 3px 4px rgba(39,93,150,0.35))" }}
          />
          <circle cx={20} cy={16} r={5} fill="#fff" />
        </svg>
      </motion.div>

      <div
        className="absolute left-0 rounded-full shadow-[0_18px_40px_rgba(39,93,150,0.25)]"
        style={{ top: POINTER_ROOM, width: diameter, height: diameter }}
      >
        {/* Only this layer moves: one composited transform per frame. */}
        <motion.div
          key={version}
          className="absolute inset-0 will-change-transform"
          style={{ rotate: rotation }}
          role="img"
          aria-label={ariaLabel}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <WheelFace students={students} diameter={diameter} hub={hub} />
          {landedIndex !== null && count > 1 && (
            <WinnerOverlay
              index={landedIndex}
              count={count}
              diameter={diameter}
            />
          )}
        </motion.div>

        <div
          ref={landingRef}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            top: diameter * 0.04,
            width: Math.max(48, diameter * 0.16),
            height: Math.max(66, diameter * 0.22),
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onHubClick}
          disabled={hubDisabled}
          aria-label={hubLabel}
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-color px-1 text-center font-Anuphan font-extrabold leading-tight text-white shadow-[0_6px_16px_rgba(39,93,150,0.45)] transition hover:bg-primary-color-hover active:scale-95 disabled:cursor-default disabled:hover:bg-primary-color"
          style={{
            width: hub * 2,
            height: hub * 2,
            fontSize: Math.max(13, Math.min(20, hub * 0.32)),
          }}
        >
          {spinning ? (
            <IoSync className="animate-spin text-[1.6em]" />
          ) : (
            hubLabel
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * The static artwork: slices, names, rim and pegs. Memoized on the roster and
 * size, so a spin never re-renders it — the parent layer just rotates.
 */
const WheelFace = memo(function WheelFace({
  students,
  diameter,
  hub,
}: {
  students: StudentOnSubject[];
  diameter: number;
  hub: number;
}) {
  const count = students.length;
  const c = diameter / 2;
  const rim = Math.max(8, Math.round(diameter * 0.028));
  const r = c - rim;

  const slices = useMemo(() => {
    const step = segmentAngle(count);
    const colors = segmentColors(count);
    const labels = wheelLabels(students);
    const font = labelFontSize(count, r);
    const pad = Math.max(10, r * 0.05);
    // Room from the hub to the rim, at roughly 0.58em per character.
    const room = r - pad - hub - 8;
    const maxChars = Math.max(3, Math.floor(room / (font * 0.58)));
    return students.map((s, i) => {
      const start = i * step;
      return {
        id: s.id,
        d: count === 1 ? null : slicePath(c, c, r, start, start + step),
        mid: start + step / 2,
        color: WHEEL_COLORS[colors[i]],
        label: truncateLabel(labels[i], maxChars),
        font,
        pad,
      };
    });
  }, [students, count, c, r, hub]);

  const pegs = count > 1 && count <= WHEEL_MAX_PEGS;
  const pegR = Math.max(2.5, rim * 0.28);

  return (
    <svg
      viewBox={`0 0 ${diameter} ${diameter}`}
      width={diameter}
      height={diameter}
      className="absolute inset-0 select-none"
      aria-hidden
    >
      <circle cx={c} cy={c} r={c} fill="#fff" />
      {slices.map((s) =>
        s.d ? (
          <path
            key={s.id}
            d={s.d}
            fill={s.color.fill}
            stroke="#fff"
            strokeWidth={count > WHEEL_MAX_PEGS ? 0.75 : 1.5}
          />
        ) : (
          <circle key={s.id} cx={c} cy={c} r={r} fill={s.color.fill} />
        ),
      )}
      {slices.map((s) => (
        <text
          key={`${s.id}-label`}
          x={c + r - s.pad}
          y={c}
          transform={`rotate(${s.mid - 90} ${c} ${c})`}
          textAnchor="end"
          dominantBaseline="central"
          fill={s.color.text}
          fontSize={s.font}
          fontWeight={700}
          fontFamily="Anuphan, sans-serif"
        >
          {s.label}
        </text>
      ))}
      {/* Rim + pegs on the slice boundaries (the pointer's "clicks"). */}
      <circle
        cx={c}
        cy={c}
        r={c - rim / 2}
        fill="none"
        stroke="#fff"
        strokeWidth={rim}
      />
      {pegs &&
        slices.map((s, i) => {
          const rad = ((i * segmentAngle(count) - 90) * Math.PI) / 180;
          const pr = c - rim / 2;
          return (
            <circle
              key={`${s.id}-peg`}
              cx={c + pr * Math.cos(rad)}
              cy={c + pr * Math.sin(rad)}
              r={pegR}
              fill="#275d96"
            />
          );
        })}
    </svg>
  );
});

/** Dims every slice except the winner and outlines the winning slice. */
function WinnerOverlay({
  index,
  count,
  diameter,
}: {
  index: number;
  count: number;
  diameter: number;
}) {
  const c = diameter / 2;
  const rim = Math.max(8, Math.round(diameter * 0.028));
  const r = c - rim;
  const step = segmentAngle(count);
  const slice = slicePath(c, c, r, index * step, (index + 1) * step);
  const disc = `M ${c - r} ${c} A ${r} ${r} 0 1 0 ${c + r} ${c} A ${r} ${r} 0 1 0 ${c - r} ${c} Z`;

  return (
    <motion.svg
      viewBox={`0 0 ${diameter} ${diameter}`}
      width={diameter}
      height={diameter}
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-hidden
    >
      <path
        d={`${disc} ${slice}`}
        fillRule="evenodd"
        fill="rgba(255,255,255,0.62)"
      />
      <path
        d={slice}
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
