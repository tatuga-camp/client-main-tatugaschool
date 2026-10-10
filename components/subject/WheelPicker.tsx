import confetti from "canvas-confetti";
import {
  animate,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Toast } from "primereact/toast";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IoClose,
  IoMenu,
  IoPeopleOutline,
  IoRefresh,
  IoSparkles,
  IoSync,
  IoVolumeHigh,
  IoVolumeMute,
} from "react-icons/io5";
import {
  CardPickerLanguage,
  SliderPickerLanguage,
  WheelPickerLanguage,
} from "../../data/languages";
import { useSound } from "../../hook";
import { StudentOnSubject } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import type { SpinSpeed } from "../../utils/slider-reel";
import {
  landingRotation,
  segmentAngle,
  segmentAt,
  WHEEL_SPIN_PROFILES,
} from "../../utils/wheel";
import PopupLayout from "../layout/PopupLayout";
import { rectToOrigin, type CardOrigin } from "./card-picker/CardFan";
import DeckDrawer from "./card-picker/DeckDrawer";
import SpotlightReveal from "./card-picker/SpotlightReveal";
import { useCardDeck } from "./card-picker/useCardDeck";
import PopUpStudent from "./PopUpStudent";
import WheelOfStudents, {
  useWheelDiameter,
} from "./wheel-picker/WheelOfStudents";

interface WheelPickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
}

// Mute is shared with the card and slider pickers: one classroom, one preference.
const MUTE_KEY = "card-picker:muted";
const SPEED_KEY = "wheel-picker:speed";

const readStored = <T extends string>(key: string, fallback: T, ok: T[]) => {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value && ok.includes(value) ? value : fallback;
  } catch {
    return fallback;
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

const mod360 = (v: number) => ((v % 360) + 360) % 360;

const WheelPicker = ({
  students,
  subjectId,
  onClose,
  toast,
}: WheelPickerProps) => {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const reducedMotion = useReducedMotion() ?? false;

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

  // Same pool + storage as the card and slider pickers, so "picked" carries
  // across all three.
  const { state, actions } = useCardDeck(subjectId, activeIds);
  // The wheel's slices: a snapshot of the deck, frozen while a spin or a
  // reveal is on screen so the winner's slice stays under the pointer.
  const [wheelIds, setWheelIds] = useState<string[]>(() => state.deck);
  const [wheelVersion, setWheelVersion] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<CardOrigin | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [drawSeq, setDrawSeq] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scoreStudentId, setScoreStudentId] = useState<string | null>(null);
  const [muted, setMuted] = useState(
    () => readStored(MUTE_KEY, "0", ["0", "1"]) === "1",
  );
  const [speed, setSpeed] = useState<SpinSpeed>(() =>
    readStored<SpinSpeed>(SPEED_KEY, "quick", ["quick", "dramatic"]),
  );

  const diameter = useWheelDiameter();
  const rotation = useMotionValue(0);
  const landingRef = useRef<HTMLDivElement>(null);

  // Synchronous guards: state updates land a render later, refs don't.
  const busyRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const wheelIdsRef = useRef(wheelIds);
  wheelIdsRef.current = wheelIds;
  const spinAnim = useRef<{ stop: () => void } | null>(null);
  const timers = useRef<number[]>([]);

  const ding = useSound("/sounds/ding.mp3");
  const cheering = useSound("/sounds/cheering.mp3");
  const play = useCallback(
    (audio: HTMLAudioElement | null, volume = 1) => {
      if (muted || !audio) return;
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    [muted],
  );
  const playRef = useRef({ play, ding });
  playRef.current = { play, ding };

  const wheelStudents = useMemo(
    () =>
      wheelIds
        .map((id) => byId.get(id))
        .filter((s): s is StudentOnSubject => !!s),
    [wheelIds, byId],
  );
  const revealedStudent = state.revealedId
    ? (byId.get(state.revealedId) ?? null)
    : null;
  const scoreStudent = scoreStudentId
    ? (byId.get(scoreStudentId) ?? null)
    : null;
  const deckStudents = state.deck
    .map((id) => byId.get(id))
    .filter((s): s is StudentOnSubject => !!s);
  const pickedStudents = state.picked
    .map((id) => byId.get(id))
    .filter((s): s is StudentOnSubject => !!s);
  const pickedCount = state.picked.length + (state.revealedId ? 1 : 0);
  const isRevealed = state.revealedId !== null;
  const deckEmpty = state.deck.length === 0;

  // Lock page scroll while open; stop confetti, timers and the spin on close.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      confetti.reset();
      const running = spinAnim.current;
      spinAnim.current = null; // tells an in-flight spin() to bail out
      running?.stop();
      timers.current.forEach((t) => window.clearTimeout(t));
      document.body.style.overflow = "auto";
    };
  }, []);

  // Rebuild the slices whenever the pool changes — but never mid-spin, and
  // not while the winner is in the spotlight.
  const deckKey = state.deck.join(",");
  useEffect(() => {
    if (spinning || isRevealed) return;
    const deck = stateRef.current.deck;
    if (deck.join(",") !== wheelIdsRef.current.join(",")) {
      setWheelIds(deck);
      setWheelVersion((v) => v + 1);
    }
    setLandedIndex(null);
    // Same pose, smaller number: keeps float precision over many spins.
    rotation.set(mod360(rotation.get()));
  }, [deckKey, spinning, isRevealed, rotation]);

  // If the revealed student vanishes mid-reveal, release the guard.
  useEffect(() => {
    if (state.revealedId === null) {
      setRevealing(false);
      if (!spinAnim.current) busyRef.current = false;
    }
  }, [state.revealedId]);

  // Tick each time a peg passes the pointer (throttled for fast spins).
  useEffect(() => {
    const count = () => wheelIdsRef.current.length;
    let last = segmentAt(rotation.get(), count());
    let lastAt = 0;
    return rotation.on("change", (v) => {
      const index = segmentAt(v, count());
      if (index === last) return;
      last = index;
      // Rebuilds re-normalize the rotation; only a real spin should tick.
      if (!busyRef.current) return;
      const now = performance.now();
      if (now - lastAt < 55) return;
      lastAt = now;
      playRef.current.play(playRef.current.ding, 0.35);
    });
  }, [rotation]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const spin = useCallback(async () => {
    const { deck, revealedId } = stateRef.current;
    const ids = wheelIdsRef.current;
    if (busyRef.current || revealedId !== null || deck.length === 0) return;
    // Uniform over who is actually waiting; the wheel is just the show.
    const candidates = deck.filter((id) => ids.includes(id));
    if (candidates.length === 0) return;
    busyRef.current = true;

    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    const index = ids.indexOf(winner);
    const profile = WHEEL_SPIN_PROFILES[speed];
    const start = rotation.get();
    const end = landingRotation(
      start,
      index,
      ids.length,
      profile.turns,
      Math.random(),
    );
    setLandedIndex(null);
    setSpinning(true);

    if (reducedMotion) {
      rotation.set(end);
    } else {
      // A short wind-up against the spin, then a long ease-out crawl.
      const windUp = animate(
        rotation,
        start - Math.min(14, segmentAngle(ids.length) * 0.6 + 4),
        { duration: 0.22, ease: "easeOut" },
      );
      spinAnim.current = windUp;
      await windUp;
      if (spinAnim.current !== windUp) return; // stopped (closed)
      const run = animate(rotation, end, {
        duration: profile.duration,
        ease: [0.3, 0.05, 0.1, 1],
      });
      spinAnim.current = run;
      await run;
      if (spinAnim.current !== run) return;
      spinAnim.current = null;
    }

    setLandedIndex(index);
    later(
      () => {
        // The roster may have changed during the spin.
        if (!stateRef.current.deck.includes(winner)) {
          busyRef.current = false;
          setSpinning(false);
          setLandedIndex(null);
          return;
        }
        const rect = landingRef.current?.getBoundingClientRect();
        setOrigin(rect ? rectToOrigin(rect) : null);
        setRevealing(true);
        setDrawSeq((n) => n + 1);
        actions.draw(winner);
        setSpinning(false);
      },
      reducedMotion ? 0 : 700,
    );
  }, [actions, reducedMotion, speed, rotation]);

  const handleRevealed = useCallback(() => {
    busyRef.current = false;
    setRevealing(false);
    play(cheering);
    if (!reducedMotion) {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 } });
    }
  }, [play, cheering, reducedMotion]);

  const backToWheel = useCallback(() => {
    if (busyRef.current || stateRef.current.revealedId === null) return;
    actions.confirm();
  }, [actions]);

  const putBack = useCallback(() => {
    if (busyRef.current || stateRef.current.revealedId === null) return;
    actions.putBack();
  }, [actions]);

  const givePoints = useCallback(() => {
    if (busyRef.current || stateRef.current.revealedId === null) return;
    setScoreStudentId(stateRef.current.revealedId);
  }, []);

  const closeScore = useCallback(() => setScoreStudentId(null), []);

  // PopUpStudent and PopupLayout reset overflow to "auto" synchronously after
  // calling onClose; re-lock in an effect, which runs after those writes.
  useEffect(() => {
    if (scoreStudentId === null) document.body.style.overflow = "hidden";
  }, [scoreStudentId]);

  const restart = () => {
    if (busyRef.current) return;
    actions.restart();
  };

  const changeSpeed = (next: SpinSpeed) => {
    setSpeed(next);
    writeStored(SPEED_KEY, next);
  };

  const toggleMute = () => {
    setMuted((m) => {
      writeStored(MUTE_KEY, m ? "0" : "1");
      return !m;
    });
  };

  const close = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  // Keyboard: capture phase on document so Esc can be consumed before the
  // page-level PopupLayout's window listener closes the whole picker.
  const keys = useRef({
    scoreOpen: false,
    drawerOpen: false,
    isRevealed: false,
    closeScore,
    closeDrawer: () => setDrawerOpen(false),
    spin,
    backToWheel,
    putBack,
    givePoints,
  });
  keys.current = {
    scoreOpen: scoreStudentId !== null,
    drawerOpen,
    isRevealed,
    closeScore,
    closeDrawer: () => setDrawerOpen(false),
    spin,
    backToWheel,
    putBack,
    givePoints,
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
          k.closeDrawer();
        }
        return; // otherwise the page PopupLayout closes the picker
      }
      if (k.scoreOpen || k.drawerOpen || isTypingTarget(event.target)) return;
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        if (event.repeat) return;
        if (k.isRevealed) k.backToWheel();
        else k.spin();
        return;
      }
      if (!k.isRevealed) return;
      // Match physical keys: on a Thai layout `event.key` is "ย" / "ิ".
      if (event.code === "KeyP") {
        event.preventDefault();
        k.givePoints();
      } else if (event.code === "KeyB") {
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

  const pill = isRevealed ? PILL_DARK : PILL_LIGHT;
  const busy = spinning || revealing;
  // While spinning or revealing, the frozen slices stay on screen even though
  // the deck may already be empty.
  const showWheel =
    wheelStudents.length > 0 && (!deckEmpty || spinning || isRevealed);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-background-color font-Anuphan text-icon-color">
      {/* Top bar — stays above the spotlight and switches to glass on dark. */}
      <div className="absolute inset-x-3 top-3 z-30 flex items-center justify-between gap-2 md:inset-x-5 md:top-5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={SliderPickerLanguage.open_list(lang)}
          className={`flex h-10 min-w-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${pill}`}
        >
          <IoMenu className="shrink-0 text-lg" />
          <span className="truncate">
            {SliderPickerLanguage.waiting(lang)}{" "}
            <b className={isRevealed ? "text-white" : "text-primary-color"}>
              {state.deck.length}
            </b>
            <span className="mx-1.5 opacity-40">·</span>
            {CardPickerLanguage.picked(lang)}{" "}
            <b className={isRevealed ? "text-white" : "text-primary-color"}>
              {pickedCount}
            </b>
          </span>
        </button>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              muted
                ? CardPickerLanguage.sound_on(lang)
                : CardPickerLanguage.sound_off(lang)
            }
            title={
              muted
                ? CardPickerLanguage.sound_on(lang)
                : CardPickerLanguage.sound_off(lang)
            }
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${pill}`}
          >
            {muted ? <IoVolumeMute /> : <IoVolumeHigh />}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label={CardPickerLanguage.close(lang)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl transition ${pill}`}
          >
            <IoClose />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 pb-28 pt-16">
        {activeStudents.length === 0 ? (
          <EmptyState
            icon={<IoPeopleOutline />}
            title={CardPickerLanguage.no_students_title(lang)}
            hint={WheelPickerLanguage.no_students_hint(lang)}
          />
        ) : !showWheel ? (
          <EmptyState
            icon={<IoSparkles />}
            title={CardPickerLanguage.empty_deck_title(lang)}
            hint={SliderPickerLanguage.empty_hint(lang)}
          />
        ) : (
          <>
            <WheelOfStudents
              students={wheelStudents}
              version={wheelVersion}
              rotation={rotation}
              diameter={diameter}
              landedIndex={landedIndex}
              spinning={spinning}
              hubLabel={SliderPickerLanguage.spin(lang)}
              hubDisabled={busy || isRevealed}
              onHubClick={spin}
              ariaLabel={WheelPickerLanguage.wheel_label(
                lang,
                wheelStudents.length,
              )}
              landingRef={landingRef}
            />
            <p className="hidden items-center gap-1.5 text-xs text-icon-color/55 sm:flex">
              {SliderPickerLanguage.spin_hint(lang)}
              <kbd className="rounded-md border border-b-2 border-gray-300 bg-white px-1.5 font-Anuphan text-[10px]">
                Space
              </kbd>
            </p>
          </>
        )}
      </div>

      {/* Idle action bar */}
      {!isRevealed && activeStudents.length > 0 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex flex-wrap items-center justify-center gap-2 px-4 md:bottom-8 md:gap-3">
          {deckEmpty && !spinning ? (
            <button type="button" onClick={restart} className={PRIMARY}>
              <IoRefresh /> {CardPickerLanguage.restart(lang)}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={restart}
                disabled={busy}
                className={SECONDARY}
              >
                <IoRefresh /> {CardPickerLanguage.restart(lang)}
              </button>
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
                    disabled={busy}
                    onClick={() => changeSpeed(key)}
                    className={`h-full rounded-full px-3 text-sm font-semibold transition disabled:opacity-60 md:px-4 ${
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
                onClick={spin}
                disabled={busy}
                className={PRIMARY}
              >
                <IoSync className={spinning ? "animate-spin" : ""} />
                {spinning
                  ? SliderPickerLanguage.spinning(lang)
                  : SliderPickerLanguage.spin(lang)}
              </button>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {revealedStudent && (
          <SpotlightReveal
            key={`${revealedStudent.id}:${drawSeq}`}
            student={revealedStudent}
            origin={origin}
            lang={lang}
            isLast={deckEmpty}
            reducedMotion={reducedMotion}
            faceUp
            labels={{
              putBack: SliderPickerLanguage.put_back(lang),
              backToDeck: WheelPickerLanguage.back_to_wheel(lang),
            }}
            onFlipStart={() => {}}
            onRevealed={handleRevealed}
            onPutBack={putBack}
            onGivePoints={givePoints}
            onBackToDeck={backToWheel}
          />
        )}
      </AnimatePresence>

      <DeckDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        deck={deckStudents}
        picked={pickedStudents}
        revealed={revealedStudent}
        lang={lang}
        labels={{
          pool: SliderPickerLanguage.waiting(lang),
          moveToPool: SliderPickerLanguage.put_back(lang),
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
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex max-w-sm flex-col items-center px-4 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-icon-color">{title}</h3>
      <p className="mt-1 text-sm text-icon-color/60">{hint}</p>
    </div>
  );
}

export default WheelPicker;
