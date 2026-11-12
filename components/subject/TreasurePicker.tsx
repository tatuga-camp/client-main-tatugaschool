import confetti from "canvas-confetti";
import { useReducedMotion } from "framer-motion";
import { Toast } from "primereact/toast";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IoAdd,
  IoClose,
  IoGift,
  IoMenu,
  IoPeopleOutline,
  IoPlaySkipForward,
  IoRefresh,
  IoRemove,
} from "react-icons/io5";
import {
  CardPickerLanguage,
  SliderPickerLanguage,
  TreasurePickerLanguage,
} from "../../data/languages";
import { StudentOnSubject } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import {
  clampKeep,
  planSingles,
  type PickSpeed,
} from "../../utils/treasure-picker";
import PopupLayout from "../layout/PopupLayout";
import DeckDrawer from "./card-picker/DeckDrawer";
import { useCardDeck } from "./card-picker/useCardDeck";
import SoundMenu from "./picker-sound/SoundMenu";
import { usePickerSound } from "./picker-sound/usePickerSound";
import PopUpStudent from "./PopUpStudent";
import { useEliminationRun } from "./treasure-picker/useEliminationRun";
import TreasureChest from "./treasure-picker/TreasureChest";
import VaultGrid, { CHEST_LEAD_IN_MS } from "./treasure-picker/VaultGrid";
import WinnersReveal from "./treasure-picker/WinnersReveal";

interface TreasurePickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
}

const SPEED_KEY = "treasure-picker:speed";
const COUNT_KEY = "treasure-picker:count";

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const PILL_LIGHT =
  "border-gray-200 bg-white text-icon-color hover:border-primary-color hover:text-primary-color";
const PILL_DARK = "border-white/25 bg-white/10 text-white hover:bg-white/20";
const SECONDARY =
  "flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-icon-color transition hover:border-primary-color hover:text-primary-color active:scale-95 disabled:opacity-50 md:h-12 md:px-5";
const PRIMARY =
  "flex h-12 min-w-36 items-center justify-center gap-2 rounded-full bg-primary-color px-6 text-base font-bold text-white shadow-[0_6px_14px_rgba(44,124,209,0.35)] transition hover:bg-primary-color-hover active:scale-95 disabled:opacity-60 md:h-14 md:px-8";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const TreasurePicker = ({
  students,
  subjectId,
  onClose,
  toast,
}: TreasurePickerProps) => {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const reducedMotion = useReducedMotion() ?? false;
  const sound = usePickerSound();

  const activeStudents = useMemo(
    () => students.filter((s) => s.isActive),
    [students],
  );
  const activeIds = useMemo(
    () => activeStudents.map((s) => s.id),
    [activeStudents],
  );
  const byId = useMemo(
    () => new Map(activeStudents.map((s) => [s.id, s])),
    [activeStudents],
  );

  // Same pool + storage as the card, slider and wheel pickers, so "picked"
  // carries across all of them.
  const { state, actions } = useCardDeck(subjectId, activeIds);
  // The chest shows the waiting students in roster order (by number), not
  // in the deck's shuffled order.
  const pool = useMemo(() => {
    const waiting = new Set(state.deck);
    return activeStudents.filter((s) => waiting.has(s.id));
  }, [activeStudents, state.deck]);
  const poolIds = useMemo(() => pool.map((s) => s.id), [pool]);

  const [speed, setSpeed] = useState<PickSpeed>(() =>
    readStored(SPEED_KEY) === "dramatic" ? "dramatic" : "quick",
  );
  const [keep, setKeep] = useState(() => {
    const n = Number(readStored(COUNT_KEY));
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });
  const k = clampKeep(keep, pool.length);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scoreStudentId, setScoreStudentId] = useState<string | null>(null);
  // Who is in the chest for the current run (frozen while it plays, since
  // the winners leave the pool the moment they are revealed).
  const [stage, setStage] = useState<StudentOnSubject[]>(pool);

  const run = useEliminationRun(poolIds, {
    reducedMotion,
    leadIn: CHEST_LEAD_IN_MS,
    onStep: (progress) => sound.tick(progress),
    onDone: (winners) => {
      // Count them as picked right away, like the other pickers do with the
      // student in the spotlight, so closing now still remembers them.
      winners.forEach((id) => actions.moveToPicked(id));
      sound.reveal();
      if (!reducedMotion) {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.45 },
          colors: ["#FFCD1B", "#FFE680", "#E0A200", "#569DF8", "#ffffff"],
        });
      }
    },
  });
  const { phase, reset } = run;

  // Idle: the chest follows the live pool (roster changes, drawer moves).
  const poolKey = poolIds.join(",");
  const poolRef = useRef({ pool, poolIds });
  poolRef.current = { pool, poolIds };
  useEffect(() => {
    if (phase !== "idle") return;
    setStage(poolRef.current.pool);
    reset(poolRef.current.poolIds);
  }, [poolKey, phase, reset]);

  // Lock page scroll while open; stop confetti on close.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      confetti.reset();
      document.body.style.overflow = "auto";
    };
  }, []);

  // PopUpStudent and PopupLayout reset overflow to "auto" synchronously after
  // calling onClose; re-lock in an effect, which runs after those writes.
  useEffect(() => {
    if (scoreStudentId === null) document.body.style.overflow = "hidden";
  }, [scoreStudentId]);

  const winners = run.winners
    .map((id) => byId.get(id))
    .filter((s): s is StudentOnSubject => !!s);
  const scoreStudent = scoreStudentId
    ? (byId.get(scoreStudentId) ?? null)
    : null;
  const pickedStudents = state.picked
    .map((id) => byId.get(id))
    .filter((s): s is StudentOnSubject => !!s);
  const deckEmpty = pool.length === 0;
  const running = phase === "running";
  const revealed = phase === "done" && winners.length > 0;

  const open = useCallback(() => {
    const { poolIds: ids } = poolRef.current;
    if (phase !== "idle" || ids.length === 0) return;
    sound.unlock(); // inside the click / key gesture so audio may start
    setStage(poolRef.current.pool);
    run.start(planSingles(ids, k, speed), ids);
  }, [phase, sound, run, k, speed]);

  // Keep the winners picked and refill the chest with whoever is waiting.
  const backToChest = useCallback(() => {
    if (phase !== "done") return;
    confetti.reset();
    reset(poolRef.current.poolIds);
  }, [phase, reset]);

  const putBack = useCallback(() => {
    if (phase !== "done") return;
    confetti.reset();
    run.winners.forEach((id) => actions.moveToDeck(id));
    // The pool updates next render; the idle effect then refills the chest.
    reset([]);
  }, [phase, run.winners, actions, reset]);

  const restart = () => {
    if (phase !== "idle") return;
    actions.restart();
  };

  const changeKeep = (next: number) => {
    const n = clampKeep(next, pool.length);
    setKeep(n);
    writeStored(COUNT_KEY, String(n));
  };

  const changeSpeed = (next: PickSpeed) => {
    setSpeed(next);
    writeStored(SPEED_KEY, next);
  };

  const closeScore = useCallback(() => setScoreStudentId(null), []);

  const close = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  // Keyboard: capture phase on document so Esc can be consumed before the
  // page-level PopupLayout's window listener closes the whole picker.
  const keys = useRef({
    scoreOpen: false,
    drawerOpen: false,
    phase,
    open,
    skip: run.skip,
    backToChest,
    putBack,
    closeScore,
  });
  keys.current = {
    scoreOpen: scoreStudentId !== null,
    drawerOpen,
    phase,
    open,
    skip: run.skip,
    backToChest,
    putBack,
    closeScore,
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const k = keys.current;
      if (event.key === "Escape") {
        if (k.scoreOpen) {
          event.stopPropagation();
          k.closeScore();
        } else if (k.drawerOpen) {
          event.stopPropagation();
          setDrawerOpen(false);
        }
        return; // otherwise the page PopupLayout closes the picker
      }
      if (k.scoreOpen || k.drawerOpen || isTypingTarget(event.target)) return;
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        if (event.repeat) return;
        if (k.phase === "idle") k.open();
        else if (k.phase === "running") k.skip();
        else k.backToChest();
        return;
      }
      // Match physical keys: on a Thai layout `event.key` is "ิ".
      if (k.phase === "done" && event.code === "KeyB") {
        event.preventDefault();
        k.putBack();
      }
    };
    // A focused button would also "click" on Space keyup — suppress that.
    const onKeyUp = (event: KeyboardEvent) => {
      const k = keys.current;
      if (
        (event.code === "Space" || event.key === " ") &&
        !k.scoreOpen &&
        !k.drawerOpen &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

  // Dark glass on the vault and on the reveal.
  const pill = PILL_DARK;
  const showVault = stage.length > 0 && (!deckEmpty || phase !== "idle");

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#1b3f68] font-Anuphan text-icon-color">
      {activeStudents.length === 0 || !showVault ? (
        <div className="flex h-full w-full items-center justify-center bg-background-color px-4 pb-28 pt-16">
          {activeStudents.length === 0 ? (
            <EmptyState
              icon={<IoPeopleOutline />}
              title={CardPickerLanguage.no_students_title(lang)}
              hint={TreasurePickerLanguage.no_students_hint(lang)}
            />
          ) : (
            <EmptyState
              art={
                <TreasureChest
                  open
                  empty
                  reducedMotion={reducedMotion}
                  className="mb-2 h-32 w-36"
                />
              }
              title={CardPickerLanguage.empty_deck_title(lang)}
              hint={TreasurePickerLanguage.empty_hint(lang)}
            />
          )}
        </div>
      ) : (
        <VaultGrid
          students={stage}
          alive={run.alive}
          doomed={run.doomed}
          phase={phase}
          reducedMotion={reducedMotion}
          ariaLabel={TreasurePickerLanguage.vault_label(lang, stage.length)}
          caption={TreasurePickerLanguage.inside(lang, stage.length)}
          hint={TreasurePickerLanguage.open_hint(lang)}
          openLabel={TreasurePickerLanguage.open_chest(lang)}
          onOpen={open}
        />
      )}

      {revealed && (
        <WinnersReveal
          winners={winners}
          lang={lang}
          reducedMotion={reducedMotion}
          onGivePoints={(s) => setScoreStudentId(s.id)}
          onPutBack={putBack}
          onDone={backToChest}
        />
      )}

      {/* Top bar — glass on the dark vault and the reveal. */}
      <div className="absolute inset-x-3 top-3 z-30 flex items-center justify-between gap-2 md:inset-x-5 md:top-5">
        {(() => {
          const onLight = !showVault && !revealed;
          const barPill = onLight ? PILL_LIGHT : pill;
          const accent = onLight ? "text-primary-color" : "text-white";
          return (
            <>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                disabled={running}
                aria-label={SliderPickerLanguage.open_list(lang)}
                className={`flex h-10 min-w-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition disabled:opacity-60 ${barPill}`}
              >
                <IoMenu className="shrink-0 text-lg" />
                <span className="truncate">
                  {SliderPickerLanguage.waiting(lang)}{" "}
                  <b className={accent}>{pool.length}</b>
                  <span className="mx-1.5 opacity-40">·</span>
                  {CardPickerLanguage.picked(lang)}{" "}
                  <b className={accent}>{state.picked.length}</b>
                </span>
              </button>
              <div className="flex shrink-0 gap-2">
                <SoundMenu
                  sound={sound.sound}
                  onChange={sound.setSound}
                  lang={lang}
                  buttonClassName={barPill}
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label={CardPickerLanguage.close(lang)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl transition ${barPill}`}
                >
                  <IoClose />
                </button>
              </div>
            </>
          );
        })()}
      </div>

      {/* Bottom bar (the reveal brings its own). */}
      {!revealed && activeStudents.length > 0 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex flex-wrap items-center justify-center gap-2 px-4 md:bottom-8 md:gap-3">
          {running ? (
            <button type="button" onClick={run.skip} className={SECONDARY}>
              <IoPlaySkipForward /> {TreasurePickerLanguage.skip(lang)}
            </button>
          ) : deckEmpty ? (
            <button type="button" onClick={restart} className={PRIMARY}>
              <IoRefresh /> {CardPickerLanguage.restart(lang)}
            </button>
          ) : (
            <>
              <div
                role="group"
                aria-label={TreasurePickerLanguage.count_label(lang)}
                className="flex h-11 items-center gap-0.5 rounded-full border border-gray-200 bg-white p-1 pl-4 md:h-12"
              >
                <span className="mr-1 text-sm font-semibold text-icon-color/70">
                  {TreasurePickerLanguage.pick_label(lang)}
                </span>
                <button
                  type="button"
                  aria-label={TreasurePickerLanguage.fewer(lang)}
                  disabled={k <= 1}
                  onClick={() => changeKeep(k - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-icon-color transition hover:bg-primary-color/10 hover:text-primary-color disabled:opacity-30 md:h-10 md:w-10"
                >
                  <IoRemove />
                </button>
                <span
                  aria-live="polite"
                  className="min-w-8 text-center text-xl font-bold tabular-nums text-primary-color"
                >
                  {k}
                </span>
                <button
                  type="button"
                  aria-label={TreasurePickerLanguage.more(lang)}
                  disabled={k >= pool.length}
                  onClick={() => changeKeep(k + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-icon-color transition hover:bg-primary-color/10 hover:text-primary-color disabled:opacity-30 md:h-10 md:w-10"
                >
                  <IoAdd />
                </button>
                <span className="pr-3 text-sm font-semibold text-icon-color/70">
                  {TreasurePickerLanguage.pick_unit(lang, k)}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label={SliderPickerLanguage.speed_label(lang)}
                className="flex h-11 items-center rounded-full border border-gray-200 bg-white p-1 md:h-12"
              >
                {(["quick", "dramatic"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={speed === key}
                    onClick={() => changeSpeed(key)}
                    className={`h-full rounded-full px-3 text-sm font-semibold transition md:px-4 ${
                      speed === key
                        ? "bg-primary-color/10 text-primary-color"
                        : "text-icon-color/70 hover:text-icon-color"
                    }`}
                  >
                    {key === "quick"
                      ? SliderPickerLanguage.speed_quick(lang)
                      : SliderPickerLanguage.speed_dramatic(lang)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={restart}
                disabled={state.picked.length === 0}
                className={`order-3 md:order-none ${SECONDARY}`}
              >
                <IoRefresh /> {CardPickerLanguage.restart(lang)}
              </button>
              <button
                type="button"
                onClick={open}
                className={`order-4 ${PRIMARY}`}
              >
                <IoGift /> {TreasurePickerLanguage.open_chest(lang)}
              </button>
            </>
          )}
        </div>
      )}

      <DeckDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        deck={pool}
        picked={pickedStudents}
        revealed={null}
        lang={lang}
        labels={{
          pool: SliderPickerLanguage.waiting(lang),
          moveToPool: TreasurePickerLanguage.put_back(lang),
        }}
        onMoveToPicked={actions.moveToPicked}
        onMoveToDeck={actions.moveToDeck}
      />

      {scoreStudent && (
        <PopupLayout onClose={closeScore}>
          <PopUpStudent
            student={scoreStudent}
            toast={toast}
            onClose={closeScore}
          />
        </PopupLayout>
      )}
    </div>
  );
};

function EmptyState({
  icon,
  art,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  art?: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex max-w-sm flex-col items-center px-4 text-center">
      {art ?? (
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-bold text-icon-color">{title}</h3>
      <p className="mt-1 text-sm text-icon-color/60">{hint}</p>
    </div>
  );
}

export default TreasurePicker;
