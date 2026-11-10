import { animated, to, useSprings } from "@react-spring/web";
import { useRef } from "react";
import { StudentOnSubject } from "../../../interfaces";
import { StudentPhoto } from "../card-picker/CardFace";
import { gridFit, useStageSize } from "./stage";
import type { RunPhase } from "./useEliminationRun";

type Props = {
  students: StudentOnSubject[];
  alive: Set<string>;
  doomed: Set<string>;
  phase: RunPhase;
  reducedMotion: boolean;
  ariaLabel: string;
};

const VAULT_BG =
  "radial-gradient(ellipse 70% 70% at 50% 40%, #275d96 0%, #1b3f68 60%, #12304f 100%)";

/**
 * The vault: everyone sits in a treasure grid on a dark stage. A
 * gold light lands on a student, then they burst away in place; the gaps
 * stay, so you can see the vault emptying until the winners shine.
 */
export default function VaultGrid({
  students,
  alive,
  doomed,
  phase,
  reducedMotion,
  ariaLabel,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { w, h } = useStageSize(stageRef);
  const { cols, tile } = gridFit(students.length, w, h, 10);

  const [springs] = useSprings(
    students.length,
    (i) => {
      const id = students[i].id;
      const gone = !alive.has(id);
      const lit = doomed.has(id);
      const won = phase === "done" && !gone;
      // A little random spin per student so the burst doesn't look uniform.
      const spin = ((i * 37) % 40) - 20;
      const pose = gone
        ? { opacity: 0, scale: 0.25, y: -36, rotate: spin, glow: 0 }
        : lit
          ? { opacity: 1, scale: 1.12, y: -4, rotate: 0, glow: 1 }
          : won
            ? { opacity: 1, scale: 1.18, y: 0, rotate: 0, glow: 1 }
            : { opacity: 1, scale: 1, y: 0, rotate: 0, glow: 0 };
      return { ...pose, immediate: reducedMotion };
    },
    [students, alive, doomed, phase, reducedMotion],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: VAULT_BG }}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-4 bottom-40 top-20 flex items-center justify-center md:inset-x-10 md:bottom-32"
      >
        <div
          role="list"
          aria-label={ariaLabel}
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
            gap: 10,
          }}
        >
          {springs.map((s, i) => {
            const st = students[i];
            return (
              <animated.div
                key={st.id}
                role="listitem"
                aria-hidden={!alive.has(st.id)}
                data-student={st.id}
                data-alive={alive.has(st.id) ? "1" : "0"}
                style={{
                  width: tile,
                  height: tile,
                  opacity: s.opacity,
                  transform: to(
                    [s.scale, s.y, s.rotate],
                    (sc, y, r) =>
                      `translateY(${y}px) scale(${sc}) rotate(${r}deg)`,
                  ),
                  boxShadow: s.glow.to(
                    (g) =>
                      `0 0 ${28 * g}px ${6 * g}px rgba(255,205,27,${0.85 * g})`,
                  ),
                  borderColor: s.glow.to(
                    (g) => `rgba(255,205,27,${0.25 + 0.75 * g})`,
                  ),
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white/10 p-1 text-white backdrop-blur-sm"
              >
                <StudentPhoto
                  student={st}
                  className="aspect-square w-[58%] bg-white text-lg"
                />
                {tile >= 64 && (
                  <span className="w-full truncate px-1 text-center text-[11px] font-semibold leading-tight md:text-xs">
                    {st.firstName}
                  </span>
                )}
              </animated.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
