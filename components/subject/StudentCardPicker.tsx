import confetti from "canvas-confetti";
import { AnimatePresence, useReducedMotion } from "framer-motion";
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
  IoShuffle,
  IoSparkles,
  IoVolumeHigh,
  IoVolumeMute,
} from "react-icons/io5";
import { CardPickerLanguage } from "../../data/languages";
import { useSound } from "../../hook";
import { StudentOnSubject } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import PopupLayout from "../layout/PopupLayout";
import CardStack, {
  rectToOrigin,
  type CardOrigin,
} from "./card-picker/CardStack";
import DeckDrawer from "./card-picker/DeckDrawer";
import SpotlightReveal from "./card-picker/SpotlightReveal";
import { useCardDeck } from "./card-picker/useCardDeck";
import PopUpStudent from "./PopUpStudent";

interface StudentCardPickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  onNominate: (student: StudentOnSubject) => void;
  onClose: () => void;
  toast: React.RefObject<Toast>;
}

const MUTE_KEY = "card-picker:muted";

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};

const PILL_LIGHT =
  "border-gray-200 bg-white text-icon-color hover:border-primary-color hover:text-primary-color";
const PILL_DARK = "border-white/25 bg-white/10 text-white hover:bg-white/20";
const SECONDARY =
  "flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-icon-color transition hover:border-primary-color hover:text-primary-color active:scale-95 disabled:opacity-50 md:h-12 md:px-5";
const PRIMARY =
  "flex h-12 items-center gap-2 rounded-full bg-primary-color px-6 text-base font-bold text-white shadow-[0_6px_14px_rgba(44,124,209,0.35)] transition hover:bg-primary-color-hover active:scale-95 disabled:opacity-50 md:h-14 md:px-8";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const StudentCardPicker: React.FC<StudentCardPickerProps> = ({
  students,
  subjectId,
  onClose,
  toast,
}) => {
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

  const { state, actions } = useCardDeck(subjectId, activeIds);
  const [origin, setOrigin] = useState<CardOrigin | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scoreStudentId, setScoreStudentId] = useState<string | null>(null);
  const [shuffleTick, setShuffleTick] = useState(0);
  const [muted, setMuted] = useState(readMuted);

  const topCardRef = useRef<HTMLDivElement | null>(null);
  // Synchronous guards: state updates land a render later, refs don't.
  const revealingRef = useRef(false);
  const pendingDrawRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const ding = useSound("/sounds/ding.mp3");
  const cheering = useSound("/sounds/cheering.mp3");
  const play = useCallback(
    (audio: HTMLAudioElement | null) => {
      if (muted || !audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    [muted],
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

  // Lock page scroll while open; stop confetti on close.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      confetti.reset();
      document.body.style.overflow = "auto";
    };
  }, []);

  // If the revealed student vanishes (deactivated mid-reveal), the spotlight
  // unmounts before onRevealed fires — release the busy guard so we never
  // get stuck.
  useEffect(() => {
    if (state.revealedId === null) {
      revealingRef.current = false;
      setRevealing(false);
    }
  }, [state.revealedId]);

  const drawId = useCallback(
    (id: string, from: CardOrigin | null) => {
      const current = stateRef.current;
      if (
        revealingRef.current ||
        current.revealedId !== null ||
        !current.deck.includes(id)
      ) {
        return;
      }
      revealingRef.current = true;
      setRevealing(true);
      setOrigin(from);
      actions.draw(id);
    },
    [actions],
  );

  const drawTop = useCallback(() => {
    const id = stateRef.current.deck[0];
    if (!id) return;
    const rect = topCardRef.current?.getBoundingClientRect();
    drawId(id, rect ? rectToOrigin(rect) : null);
  }, [drawId]);

  const handleRevealed = useCallback(() => {
    revealingRef.current = false;
    setRevealing(false);
    play(cheering);
    if (!reducedMotion) {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 } });
    }
  }, [play, cheering, reducedMotion]);

  const drawNext = useCallback(() => {
    if (revealingRef.current || stateRef.current.revealedId === null) return;
    // Draw the next card only after the spotlight has faded out, so it can
    // launch from the real top-of-pile position.
    pendingDrawRef.current = stateRef.current.deck.length > 0;
    actions.confirm();
  }, [actions]);

  const putBack = useCallback(() => {
    if (revealingRef.current || stateRef.current.revealedId === null) return;
    actions.putBack();
  }, [actions]);

  const givePoints = useCallback(() => {
    if (revealingRef.current || stateRef.current.revealedId === null) return;
    setScoreStudentId(stateRef.current.revealedId);
  }, []);

  const closeScore = useCallback(() => {
    setScoreStudentId(null);
    // PopupLayout's backdrop resets overflow to auto; we're still open.
    document.body.style.overflow = "hidden";
  }, []);

  const shuffle = () => {
    actions.shuffle();
    setShuffleTick((t) => t + 1);
  };

  const restart = () => {
    pendingDrawRef.current = false;
    actions.restart();
    setShuffleTick((t) => t + 1);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
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
    drawTop,
    drawNext,
    putBack,
    givePoints,
  });
  keys.current = {
    scoreOpen: scoreStudentId !== null,
    drawerOpen,
    isRevealed,
    closeScore,
    closeDrawer: () => setDrawerOpen(false),
    drawTop,
    drawNext,
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
        if (k.isRevealed) k.drawNext();
        else k.drawTop();
        return;
      }
      if (!k.isRevealed) return;
      const key = event.key.toLowerCase();
      if (key === "p") {
        event.preventDefault();
        k.givePoints();
      } else if (key === "b") {
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
  const deckEmpty = state.deck.length === 0;

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-background-color font-Anuphan text-icon-color">
      {/* Top bar — stays above the spotlight and switches to glass on dark. */}
      <div className="absolute inset-x-3 top-3 z-30 flex items-center justify-between gap-2 md:inset-x-5 md:top-5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={CardPickerLanguage.open_list(lang)}
          className={`flex h-10 min-w-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${pill}`}
        >
          <IoMenu className="shrink-0 text-lg" />
          <span className="truncate">
            {CardPickerLanguage.in_deck(lang)}{" "}
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
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4 pb-28 pt-20">
        {activeStudents.length === 0 ? (
          <EmptyState
            icon={<IoPeopleOutline />}
            title={CardPickerLanguage.no_students_title(lang)}
            hint={CardPickerLanguage.no_students_hint(lang)}
          />
        ) : deckEmpty && !isRevealed ? (
          <EmptyState
            icon={<IoSparkles />}
            title={CardPickerLanguage.empty_deck_title(lang)}
            hint={CardPickerLanguage.empty_deck_hint(lang)}
          />
        ) : (
          <>
            <CardStack
              deckIds={state.deck}
              revealedId={state.revealedId}
              canDrag={!isRevealed && !revealing}
              shuffleTick={shuffleTick}
              topCardRef={topCardRef}
              onDraw={drawId}
            />
            <p className="hidden items-center gap-1.5 text-xs text-icon-color/55 sm:flex">
              {CardPickerLanguage.drag_hint(lang)}
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
          {deckEmpty ? (
            <button type="button" onClick={restart} className={PRIMARY}>
              <IoRefresh /> {CardPickerLanguage.restart(lang)}
            </button>
          ) : (
            <>
              <button type="button" onClick={restart} className={SECONDARY}>
                <IoRefresh /> {CardPickerLanguage.restart(lang)}
              </button>
              <button
                type="button"
                onClick={shuffle}
                disabled={state.deck.length < 2 || revealing}
                className={SECONDARY}
              >
                <IoShuffle /> {CardPickerLanguage.shuffle(lang)}
              </button>
              <button
                type="button"
                onClick={drawTop}
                disabled={revealing}
                className={PRIMARY}
              >
                {CardPickerLanguage.draw_card(lang)}
              </button>
            </>
          )}
        </div>
      )}

      <AnimatePresence
        onExitComplete={() => {
          if (pendingDrawRef.current) {
            pendingDrawRef.current = false;
            drawTop();
          }
        }}
      >
        {revealedStudent && (
          <SpotlightReveal
            key={revealedStudent.id}
            student={revealedStudent}
            origin={origin}
            lang={lang}
            isLast={deckEmpty}
            reducedMotion={reducedMotion}
            onFlipStart={() => play(ding)}
            onRevealed={handleRevealed}
            onPutBack={putBack}
            onGivePoints={givePoints}
            onDrawNext={drawNext}
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
    <div className="flex max-w-sm flex-col items-center text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-icon-color">{title}</h3>
      <p className="mt-1 text-sm text-icon-color/60">{hint}</p>
    </div>
  );
}

export default StudentCardPicker;
