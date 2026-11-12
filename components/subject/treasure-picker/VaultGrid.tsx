import { animated, to, useSpring, useSprings } from "@react-spring/web";
import { useRef } from "react";
import { StudentOnSubject } from "../../../interfaces";
import { StudentPhoto } from "../card-picker/CardFace";
import { gridFit, useStageSize } from "./stage";
import TreasureChest, { Sunburst } from "./TreasureChest";
import type { RunPhase } from "./useEliminationRun";

type Props = {
  students: StudentOnSubject[];
  alive: Set<string>;
  doomed: Set<string>;
  phase: RunPhase;
  reducedMotion: boolean;
  ariaLabel: string;
  /** Under the closed chest: how many are inside, and how to open it. */
  caption: string;
  hint: string;
  openLabel: string;
  onOpen: () => void;
};

/** How long the lid + fly-out take before the first student drops back in. */
export const CHEST_LEAD_IN_MS = 1650;
// The lid opens on the big chest first, then the chest steps down and the
// coins fly out of it.
const STEP_DOWN_MS = 340;
const FLY_OUT_MS = 620;

const VAULT_BG =
  "radial-gradient(ellipse 75% 70% at 50% 55%, #275d96 0%, #1b3f68 55%, #12304f 100%)";
const COIN_RIM =
  "linear-gradient(145deg, #FFE680 0%, #FFCD1B 45%, #E0A200 100%)";
const CHEST_RATIO = 220 / 240; // height / width of the chest drawing
const GAP = 10;

/**
 * The vault: a closed treasure chest waits on a dark stage. Opening it
 * throws every student out as a gold coin; a light lands on a coin and it
 * drops back into the chest, until only the winners are left shining.
 */
export default function VaultGrid({
  students,
  alive,
  doomed,
  phase,
  reducedMotion,
  ariaLabel,
  caption,
  hint,
  openLabel,
  onOpen,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { w, h } = useStageSize(stageRef);
  const n = students.length;
  const idle = phase === "idle";

  // Closed chest: big and centred. Open chest: small, at the bottom, with
  // the coins laid out above it.
  const idleW = Math.max(0, Math.min(w * 0.8, (h * 0.66) / CHEST_RATIO, 400));
  const idleH = idleW * CHEST_RATIO;
  const idleTop = Math.max(0, (h - idleH) / 2 - 28);
  const runH = Math.min(190, Math.max(84, h * 0.25));
  const runScale = idleH > 0 ? runH / idleH : 1;

  const areaH = Math.max(0, h - runH - 8);
  const { cols, tile } = gridFit(n, w, areaH, GAP);
  const rows = Math.ceil(n / Math.max(1, cols));
  const pitch = tile + GAP;
  const gridH = rows * pitch - GAP;
  const top0 = (areaH - gridH) / 2;
  const coin = Math.round(tile >= 64 ? tile * 0.7 : tile * 0.92);
  const mouth = { x: w / 2 - tile / 2, y: h - runH * 0.62 - tile / 2 };

  const slot = (i: number) => {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? n - row * cols : cols; // centre a short last row
    const rowW = inRow * pitch - GAP;
    return {
      x: (w - rowW) / 2 + (i % cols) * pitch,
      y: top0 + row * pitch,
    };
  };

  const glowSize = Math.max(w, h) * 1.3;

  const flyingOut = phase === "running" && alive.size === n && doomed.size === 0;
  const stagger = Math.min(34, 520 / Math.max(1, n));

  const [springs] = useSprings(
    n,
    (i) => {
      const id = students[i].id;
      const inChest = idle || !alive.has(id);
      const lit = doomed.has(id);
      const won = phase === "done" && !inChest;
      const pos = inChest ? mouth : slot(i);
      return {
        x: pos.x,
        y: lit ? pos.y - 6 : pos.y,
        scale: inChest ? 0.15 : lit ? 1.16 : won ? 1.2 : 1,
        opacity: inChest ? 0 : 1,
        glow: lit || won ? 1 : 0,
        // Spread the coins out of the chest in a quick fan, not all at once.
        delay: flyingOut ? FLY_OUT_MS + ((i * 7) % n) * stagger : 0,
        immediate: reducedMotion || idle || w === 0,
        config: inChest
          ? { tension: 210, friction: 22 }
          : { tension: 220, friction: 19 },
      };
    },
    [students, alive, doomed, phase, reducedMotion, w, h],
  );

  const chest = useSpring({
    y: idle ? 0 : h - (idleTop + idleH),
    scale: idle ? 1 : runScale,
    immediate: reducedMotion || w === 0,
    delay: idle ? 0 : STEP_DOWN_MS,
    config: { tension: 200, friction: 22 },
  });
  const light = useSpring({
    aura: idle ? 1 : 0,
    beam: idle ? 0 : 1,
    immediate: reducedMotion || w === 0,
  });

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: VAULT_BG }}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-4 bottom-44 top-20 md:inset-x-10 md:bottom-28"
      >
        {w > 0 && (
          <>
            {/* Gold light rising from the open chest over the coins. */}
            <animated.div
              aria-hidden
              style={{
                opacity: light.beam,
                width: glowSize,
                height: glowSize,
                left: (w - glowSize) / 2,
                top: h - runH * 0.6 - glowSize / 2,
                background:
                  "radial-gradient(circle, rgba(255,230,128,0.38) 0%, rgba(86,157,248,0.24) 16%, rgba(86,157,248,0.10) 38%, transparent 64%)",
              }}
              className="pointer-events-none absolute"
            />

            <animated.div
              aria-hidden
              style={{
                opacity: light.aura,
                width: idleW * 1.9,
                height: idleW * 1.9,
                left: (w - idleW * 1.9) / 2,
                top: idleTop + idleH / 2 - (idleW * 1.9) / 2,
              }}
              className="pointer-events-none absolute"
            >
              <Sunburst
                reducedMotion={reducedMotion}
                className="h-full w-full"
              />
            </animated.div>

            <animated.button
              type="button"
              onClick={onOpen}
              disabled={!idle}
              aria-label={openLabel}
              data-chest
              style={{
                width: idleW,
                height: idleH,
                left: (w - idleW) / 2,
                top: idleTop,
                transformOrigin: "50% 100%",
                transform: to(
                  [chest.y, chest.scale],
                  (y, s) => `translateY(${y}px) scale(${s})`,
                ),
              }}
              className="group absolute rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-warning-color/70 enabled:cursor-pointer"
            >
              <TreasureChest
                open={!idle}
                pulse={idle ? 0 : n - alive.size}
                rattle
                reducedMotion={reducedMotion}
                className="h-full w-full transition-transform duration-200 group-enabled:group-hover:scale-105 group-enabled:group-active:scale-95"
              />
            </animated.button>

            <animated.div
              style={{
                opacity: light.aura,
                top: idleTop + idleH + 4,
              }}
              className="pointer-events-none absolute inset-x-0 text-center text-white"
            >
              <p className="text-xl font-bold md:text-2xl">{caption}</p>
              <p className="mt-0.5 text-sm font-medium text-white/70">{hint}</p>
            </animated.div>

            <div role="list" aria-label={ariaLabel}>
              {springs.map((s, i) => {
                const st = students[i];
                const out = !idle && alive.has(st.id);
                return (
                  <animated.div
                    key={st.id}
                    role="listitem"
                    aria-hidden={!out}
                    data-student={st.id}
                    data-alive={alive.has(st.id) ? "1" : "0"}
                    style={{
                      width: tile,
                      height: tile,
                      opacity: s.opacity,
                      transform: to(
                        [s.x, s.y, s.scale],
                        (x, y, sc) =>
                          `translate3d(${x}px, ${y}px, 0) scale(${sc})`,
                      ),
                    }}
                    className="pointer-events-none absolute left-0 top-0 flex flex-col items-center justify-center gap-0.5 text-white"
                  >
                    <animated.div
                      style={{
                        width: coin,
                        height: coin,
                        background: COIN_RIM,
                        padding: Math.max(2, Math.round(coin * 0.07)),
                        boxShadow: s.glow.to(
                          (g) =>
                            `0 3px 0 rgba(138,82,16,0.55), 0 0 ${30 * g}px ${8 * g}px rgba(255,230,128,${0.9 * g})`,
                        ),
                      }}
                      className="shrink-0 rounded-full"
                    >
                      <StudentPhoto
                        student={st}
                        className="h-full w-full bg-white text-lg"
                      />
                    </animated.div>
                    {tile >= 64 && (
                      <span
                        className={`w-full truncate px-0.5 text-center font-semibold leading-tight ${
                          tile >= 96 ? "text-sm" : "text-[11px]"
                        }`}
                      >
                        {st.firstName}
                      </span>
                    )}
                  </animated.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
