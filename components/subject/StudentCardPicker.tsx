import {
  animated,
  interpolate,
  useSpring,
  useSprings,
  useTransition,
} from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoMdClose, IoMdRefresh, IoMdShuffle, IoMdStar } from "react-icons/io";
import { useWindowSize } from "react-use";
import { Language, StudentOnSubject } from "../../interfaces";
import {
  localStorageGetRemoveRandomStudents,
  localStorageSetRemoveRandomStudents,
} from "../../utils";
import { useGetLanguage } from "../../react-query";
import { CardPickerLanguage } from "../../data/languages";
import PopupLayout from "../layout/PopupLayout";
import PopUpStudent from "./PopUpStudent";
import { Toast } from "primereact/toast";

interface StudentCardPickerProps {
  students: StudentOnSubject[];
  subjectId: string;
  onNominate: (student: StudentOnSubject) => void;
  onClose: () => void;
  toast: React.RefObject<Toast>;
}

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 80,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const CONFETTI_COLORS = [
  "#fde68a",
  "#fca5a5",
  "#a5b4fc",
  "#86efac",
  "#f0abfc",
  "#fcd34d",
  "#7dd3fc",
];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 10,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.8,
        sway: -120 + Math.random() * 240,
        rotate: -360 + Math.random() * 720,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--sway" as string]: `${p.sway}px`,
              ["--rot" as string]: `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          border-radius: 2px;
          opacity: 0.95;
          transform-origin: center;
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--sway), 110vh, 0) rotate(var(--rot));
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

function WinnerReveal({
  student,
  language,
  onCancel,
  onDelete,
  onGiveScore,
}: {
  student: StudentOnSubject;
  language: Language;
  onCancel: () => void;
  onDelete: () => void;
  onGiveScore: () => void;
}) {
  const enter = useSpring({
    from: { scale: 0.6, opacity: 0, y: 30 },
    to: { scale: 1, opacity: 1, y: 0 },
    config: { tension: 260, friction: 18 },
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onCancel}
    >
      <ConfettiBurst />
      <animated.div
        style={enter}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[90%] max-w-md flex-col items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50 to-rose-50 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
      >
        <span className="winner-shine pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-2 text-amber-500">
          <IoMdStar className="text-2xl drop-shadow" />
          <span className="text-sm font-semibold uppercase tracking-[0.3em]">
            Winner
          </span>
          <IoMdStar className="text-2xl drop-shadow" />
        </div>
        <div className="relative">
          <div className="absolute -inset-2 animate-pulse rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-violet-400 opacity-80 blur-md" />
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image
              fill
              sizes="120px"
              src={student.photo}
              alt={student.firstName}
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            เลขที่ {student.number}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-800">
            {student.firstName} {student.lastName}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            ยินดีด้วยย คุณคือผู้ถูกเลือก
          </p>
        </div>
        <div className="relative grid w-full grid-cols-1 gap-2">
          <button
            onClick={onDelete}
            className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:brightness-110 active:scale-[0.98]"
          >
            {CardPickerLanguage.delete_name(language)}
          </button>
          <button
            onClick={onGiveScore}
            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:brightness-110 active:scale-[0.98]"
          >
            {CardPickerLanguage.give_score(language)}
          </button>
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            {CardPickerLanguage.cancel(language)}
          </button>
        </div>
        <style jsx>{`
          .winner-shine {
            background: linear-gradient(
              115deg,
              transparent 30%,
              rgba(255, 255, 255, 0.6) 50%,
              transparent 70%
            );
            background-size: 200% 100%;
            animation: shine 3s linear infinite;
          }
          @keyframes shine {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -100% 0;
            }
          }
        `}</style>
      </animated.div>
    </div>
  );
}

function SidePanelItem({
  student,
  onClick,
}: {
  student: StudentOnSubject;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl bg-white/85 p-2 text-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/70">
        <Image
          fill
          sizes="40px"
          src={student.photo}
          alt={student.firstName}
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-slate-700">
          {student.firstName} {student.lastName}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          # {student.number}
        </span>
      </div>
    </div>
  );
}

function DeckPanel({
  title,
  count,
  items,
  onItemClick,
  tone,
}: {
  title: string;
  count: number;
  items: StudentOnSubject[];
  onItemClick: (s: StudentOnSubject) => void;
  tone: "emerald" | "rose";
}) {
  const palette =
    tone === "emerald"
      ? {
          gradient: "from-emerald-500/70 via-teal-500/60 to-cyan-500/50",
          chip: "bg-emerald-400/90 text-white",
          glow: "shadow-emerald-500/30",
          ring: "ring-emerald-300/40",
        }
      : {
          gradient: "from-rose-500/70 via-fuchsia-500/60 to-pink-500/50",
          chip: "bg-rose-400/90 text-white",
          glow: "shadow-rose-500/30",
          ring: "ring-rose-300/40",
        };

  const transitions = useTransition(items, {
    keys: (s: StudentOnSubject) => s.id,
    from: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    leave: { opacity: 0, x: 20 },
    config: { tension: 260, friction: 22 },
  });

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${palette.gradient} p-3 shadow-xl ${palette.glow} ring-1 ${palette.ring} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between px-1 pb-2 text-white">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] drop-shadow">
          {title}
        </h2>
        <span
          className={`min-w-7 rounded-full ${palette.chip} px-2 py-0.5 text-center text-xs font-bold shadow ring-1 ring-white/40`}
        >
          {count}
        </span>
      </div>
      <div className="flex w-full flex-1 flex-col gap-2 overflow-auto pr-1">
        {transitions((style, student) => (
          <animated.div style={style} className="w-full">
            <SidePanelItem
              student={student}
              onClick={() => onItemClick(student)}
            />
          </animated.div>
        ))}
        {items.length === 0 && (
          <div className="mt-2 w-full rounded-xl bg-white/15 px-3 py-4 text-center text-xs text-white/80">
            —
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  gradient,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  gradient: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex w-44 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br ${gradient} px-5 py-3 text-base font-semibold text-white shadow-xl shadow-black/20 transition hover:scale-[1.04] active:scale-95 disabled:opacity-50`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

function Deck({
  students,
  onNominate,
  toast,
  subjectId,
}: StudentCardPickerProps) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const sound = {
    cards: "https://storage.googleapis.com/tatugacamp.com/sound/card.mp3",
    sheer: "https://storage.googleapis.com/tatugacamp.com/sound/sheer.mp3",
    shuffle: "https://storage.googleapis.com/tatugacamp.com/sound/shuffle.aac",
  };
  const [gone] = useState<Set<string>>(() => new Set());
  const [shuffledStudents, setShuffledStudents] = useState<StudentOnSubject[]>(
    [],
  );

  const [loading] = useState(false);
  const { width, height } = useWindowSize();
  const [selectedStudent, setSelectedStudent] =
    useState<StudentOnSubject | null>(null);
  const [pickedStudent, setPickedStudent] = useState<StudentOnSubject | null>(
    null,
  );
  const prevSelectedStudent = useRef<StudentOnSubject | null>(null);
  const [, setActiveCongrest] = useState(false);
  const [audioSheer] = useState<HTMLAudioElement>(() => new Audio(sound.sheer));
  const [audioCard] = useState<HTMLAudioElement>(() => new Audio(sound.cards));
  const [audioShuffle] = useState<HTMLAudioElement>(
    () => new Audio(sound.shuffle),
  );

  function shuffleArray(array: StudentOnSubject[]) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleTakeOff = () => {
    setShuffledStudents((prev) => prev.filter((a) => !gone.has(a.id)));
    localStorageSetRemoveRandomStudents({
      subjectId: subjectId,
      studentIds: Array.from(gone.values()).map((a) => ({ id: a })),
    });
  };

  const handleTakeIn = (student: StudentOnSubject) => {
    setShuffledStudents((prev) => [...prev, student]);
  };

  const [props, api] = useSprings(shuffledStudents.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useDrag(
    ({
      args: [number, student],
      down,
      movement: [mx],
      direction: [xDir],
      velocity,
      first,
      last,
    }) => {
      const index = number as number;
      const value = student as StudentOnSubject;

      if (first) {
        audioCard.play();
      } else if (last) {
        audioCard.pause();
        audioCard.currentTime = 0;
      }
      const triggerThreshold = 200;
      const trigger = Math.abs(mx) > triggerThreshold;
      const dir = xDir < 0 ? -1 : 1;
      if (!down && trigger) {
        handleShowWinner(value);
      }
      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.has(value.id) || (!down && trigger);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
        const rot =
          mx / 100 + (isGone ? dir * 10 * (velocity[0] + velocity[1]) : 0);
        const scale = down ? 1.1 : 1;
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });
    },
  );

  const handleShowWinner = (student: StudentOnSubject) => {
    setActiveCongrest(true);
    setPickedStudent(student);
  };

  const handleWinnerDelete = () => {
    if (!pickedStudent) return;
    fadeOut(audioSheer, 2000);
    moveStudentOutOfDeck(pickedStudent);
    setActiveCongrest(false);
    setPickedStudent(null);
  };

  const handleWinnerCancel = () => {
    fadeOut(audioSheer, 2000);
    setActiveCongrest(false);
    setPickedStudent(null);
  };

  const handleWinnerGiveScore = () => {
    if (!pickedStudent) return;
    fadeOut(audioSheer, 2000);
    setActiveCongrest(false);
    setSelectedStudent(pickedStudent);
    setPickedStudent(null);
  };

  function fadeOut(audioElement: HTMLAudioElement, duration: number) {
    const initialVolume = audioElement.volume;
    const volumeStep = initialVolume / (duration / 100);

    const fadeOutInterval = setInterval(() => {
      if (audioElement.volume > 0) {
        audioElement.volume = Math.max(audioElement.volume - volumeStep, 0);
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
        clearInterval(fadeOutInterval);
      }
    }, 100);
  }

  const moveStudentToDeck = (student: StudentOnSubject) => {
    gone.delete(student.id);
    handleTakeIn(student);
    const studentIndex = shuffledStudents.findIndex((s) => s.id === student.id);
    if (studentIndex !== -1) {
      api.start((i) => {
        if (i === studentIndex) {
          return to(i);
        }
      });
    }
  };

  const moveStudentOutOfDeck = (student: StudentOnSubject) => {
    gone.add(student.id);
    handleTakeOff();

    const studentIndex = shuffledStudents.findIndex((s) => s.id === student.id);
    if (studentIndex !== -1) {
      api.start((i) => {
        if (i === studentIndex) {
          return {
            x: window.innerWidth + 200,
            rot: 30,
            config: { friction: 50, tension: 200 },
          };
        }
      });
    }
  };

  const restart = () => {
    setShuffledStudents(() => shuffleArray(students));
    gone.clear();
    api.start((i) => from(i));
    api.start((i) => to(i));
    localStorageSetRemoveRandomStudents({
      subjectId: subjectId,
      studentIds: [],
    });
  };

  const shuffle = () => {
    setShuffledStudents((prev) => shuffleArray(prev));
    audioShuffle.play();
    // Lift, swirl, restack — cinematic stagger
    api.start((i) => ({
      y: -180 - i * 6,
      rot: -25 + Math.random() * 50,
      scale: 1.08,
      delay: i * 30,
      config: { friction: 26, tension: 320 },
    }));
    setTimeout(() => {
      audioShuffle.pause();
      audioShuffle.currentTime = 0;
      api.start((i) => ({
        ...to(i),
        delay: i * 40,
      }));
    }, 500);
  };

  // first render only
  useEffect(() => {
    setShuffledStudents(() => shuffleArray(students));
    const remove_studnets =
      localStorageGetRemoveRandomStudents({ subjectId: subjectId }) ?? [];
    for (const studentId of remove_studnets) {
      const studnet = students.find((a) => a.id === studentId.id);
      if (!studnet) continue;
      moveStudentOutOfDeck(studnet);
    }
  }, []);

  useEffect(() => {
    if (prevSelectedStudent.current && !selectedStudent) {
      handleShowWinner(prevSelectedStudent.current);
    }
    prevSelectedStudent.current = selectedStudent;
  }, [selectedStudent]);

  const inDeckList = shuffledStudents.filter((s) => !gone.has(s.id));
  const outOfDeckList = Array.from(gone)
    .map((id) => students.find((s) => s.id === id))
    .filter((s): s is StudentOnSubject => Boolean(s));

  return (
    <>
      {selectedStudent && (
        <PopupLayout onClose={() => setSelectedStudent(null)}>
          <PopUpStudent
            student={selectedStudent}
            toast={toast}
            onClose={() => setSelectedStudent(null)}
          />
        </PopupLayout>
      )}
      {pickedStudent && (
        <WinnerReveal
          student={pickedStudent}
          language={lang}
          onCancel={handleWinnerCancel}
          onDelete={handleWinnerDelete}
          onGiveScore={handleWinnerGiveScore}
        />
      )}
      <div className="relative h-screen w-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(236,72,153,0.22),transparent_55%)]" />

        <aside className="absolute left-5 top-5 z-10 flex h-[calc(100vh-2.5rem)] w-80 flex-col gap-5">
          <DeckPanel
            title="In Deck"
            count={inDeckList.length}
            items={inDeckList}
            onItemClick={moveStudentOutOfDeck}
            tone="emerald"
          />
          <DeckPanel
            title="Out of Deck"
            count={outOfDeckList.length}
            items={outOfDeckList}
            onItemClick={moveStudentToDeck}
            tone="rose"
          />
        </aside>

        <div className="card-container">
          {props.map(({ x, y, rot, scale }, i) => (
            <animated.div className="card-deck" key={i} style={{ x, y }}>
              <animated.div
                {...bind(i, shuffledStudents[i])}
                className="group relative flex h-64 w-44 touch-none select-none flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-4 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.55)] backdrop-blur active:scale-[1.04]"
                style={{
                  transform: interpolate([rot, scale], trans),
                }}
              >
                {/* Holographic sheen */}
                <span className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Frosted back face — clears on hover/press */}
                <button className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-md transition duration-300 group-hover:bg-white/0 group-hover:backdrop-blur-none group-active:bg-white/0 group-active:backdrop-blur-none">
                  <span className="rounded-full border border-white/70 bg-white/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-700 shadow-sm transition group-hover:opacity-0">
                    Reveal
                  </span>
                </button>

                {/* Score badge */}
                <div className="absolute -top-2 left-0 right-0 z-30 m-auto flex h-10 w-max min-w-12 max-w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 px-3 text-white shadow-lg shadow-amber-400/40 ring-2 ring-white">
                  <IoMdStar className="mr-1 text-sm" />
                  <span className="max-w-14 truncate text-sm font-bold">
                    {shuffledStudents[i].totalSpeicalScore}
                  </span>
                </div>

                {/* Photo with rainbow glow */}
                <div className="relative mt-3">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-400 via-fuchsia-400 to-amber-300 opacity-90 blur-sm" />
                  <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white">
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={shuffledStudents[i].photo}
                      alt="Student"
                      className="pointer-events-none h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="flex w-full select-none flex-col items-center justify-center gap-0 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    {shuffledStudents[i].title}
                  </span>
                  <h2 className="w-11/12 truncate text-center text-base font-bold text-slate-800">
                    {shuffledStudents[i].firstName}{" "}
                    {shuffledStudents[i].lastName}
                  </h2>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Number {shuffledStudents[i].number}
                  </span>
                </div>
              </animated.div>
            </animated.div>
          ))}
        </div>

        <div className="absolute bottom-6 left-0 z-10 w-full">
          <div className="flex w-full items-center justify-center gap-4">
            <ActionButton
              onClick={restart}
              disabled={loading}
              gradient="from-indigo-500 to-blue-600"
              icon={<IoMdRefresh className="text-xl" />}
              label={CardPickerLanguage.restart(lang)}
            />
            <ActionButton
              onClick={shuffle}
              disabled={loading}
              gradient="from-amber-500 to-pink-500"
              icon={<IoMdShuffle className="text-xl" />}
              label={CardPickerLanguage.shuffle(lang)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const StudentCardPicker: React.FC<StudentCardPickerProps> = ({
  students,
  onNominate,
  subjectId,
  toast,
  onClose,
}) => {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <button
        type="button"
        onClick={() => {
          document.body.style.overflow = "auto";
          onClose();
        }}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:rotate-90 hover:bg-white/20"
        aria-label="Close"
      >
        <IoMdClose className="text-xl" />
      </button>
      <Deck
        toast={toast}
        onClose={() => {}}
        students={students}
        onNominate={() => {}}
        subjectId={subjectId}
      />
    </div>
  );
};

export default StudentCardPicker;
