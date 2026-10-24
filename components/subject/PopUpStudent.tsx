import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { memo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoStar } from "react-icons/io5";
import { MdImage } from "react-icons/md";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import { studentPointsLanguage } from "../../data/languages";
import {
  ErrorMessages,
  Language,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import { useCreateScoreOnStudent, useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { mascotForPhoto, moodForPoints } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";
import AvatarSetting from "./AvatarSetting";
import ScorePanel from "./ScorePanel";

type Props = {
  onClose: () => void;
  student: StudentOnSubject;
  toast: React.RefObject<Toast>;
};

type ScoreResult = { score: ScoreOnSubject; points: number; total: number };

function PopUpStudent({ student, onClose, toast }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [triggerAvartar, setSetTriggerAvatar] = useState<boolean>(false);
  const createScoreOnStudent = useCreateScoreOnStudent();
  const [image, setImage] = useState<string>(student.photo);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const [totalScore, setTotalScore] = React.useState<number>(
    student.totalSpeicalScore,
  );

  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });

  const handleCreateScore = async ({
    score,
    inputScore,
  }: {
    score: ScoreOnSubject;
    inputScore: number;
  }) => {
    try {
      const data = await createScoreOnStudent.mutateAsync({
        studentOnSubjectId: student.id,
        scoreOnSubjectId: score.id,
        score: inputScore,
      });

      const total = totalScore + data.score;
      setTotalScore(total);

      const oneShotSound = new Audio(
        data.score >= 0 ? "/sounds/ding.mp3" : "/sounds/fail.mp3",
      );
      oneShotSound.play().catch(() => {});
      setResult({ score, points: data.score, total });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleCloseModal = () => {
    if (!isModalOpen) return;
    setIsModalOpen(false);
    onClose();
    document.body.style.overflow = "auto";
  };

  if (!isModalOpen) return null;

  const mascot = mascotForPhoto(image);

  return (
    <section
      className={`relative m-4 flex flex-col overflow-hidden rounded-2xl bg-white font-Anuphan shadow-xl md:flex-row ${
        result
          ? "w-[min(28rem,calc(100vw-2rem))]"
          : "w-[min(54rem,calc(100vw-2rem))]"
      }`}
    >
      <button
        type="button"
        onClick={handleCloseModal}
        aria-label={studentPointsLanguage.close(lang)}
        title={studentPointsLanguage.close(lang)}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-background-color hover:text-icon-color"
      >
        <IoMdClose />
      </button>

      {result ? (
        <ScoreResultView
          student={student}
          photo={image}
          result={result}
          lang={lang}
          onDone={handleCloseModal}
        />
      ) : (
        <>
          <aside
            className="flex items-center gap-4 border-b border-gray-100 bg-background-color/60 p-4 pr-14 md:w-60 md:shrink-0 md:flex-col md:justify-center md:gap-3 md:border-b-0 md:border-r md:p-6 md:text-center"
          >
            {/* The mask is a no-op that makes Safari clip a playing video
                (or any transformed child) to the rounded corners. */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-white [mask-image:radial-gradient(white,black)] md:h-32 md:w-32">
              {mascot ? (
                // Zoomed from the top so head and shoulders fill the circle;
                // the legs, and the head when it jumps, slip under the edge.
                <span className="absolute inset-0 origin-[50%_2%] scale-[1.5]">
                  <MascotAvatar
                    id={student.id}
                    clips={mascot}
                    alt={student.firstName}
                    tapToPlay
                    greetOnMount
                    sizes="192px"
                  />
                </span>
              ) : (
                <Image
                  src={image}
                  alt={student.firstName}
                  fill
                  sizes="128px"
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    student.blurHash ?? defaultBlurHash,
                  )}
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col items-start gap-1.5 md:items-center">
              <div className="flex min-w-0 flex-col md:items-center">
                {student.title && (
                  <span className="max-w-full truncate text-xs text-gray-400">
                    {student.title}
                  </span>
                )}
                <span className="line-clamp-2 break-words text-base font-semibold leading-snug text-icon-color md:text-lg">
                  {student.firstName} {student.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {studentPointsLanguage.number(lang)} {student.number}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ring-1 ${
                  totalScore > 0
                    ? "bg-success-color/10 text-success-color ring-success-color/30"
                    : totalScore < 0
                      ? "bg-error-color/10 text-error-color ring-error-color/30"
                      : "bg-white text-gray-500 ring-gray-200"
                }`}
              >
                {totalScore} {studentPointsLanguage.points(lang)}
              </span>
              <button
                type="button"
                aria-pressed={triggerAvartar}
                onClick={() => setSetTriggerAvatar((prev) => !prev)}
                className={`mt-1 flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition ${
                  triggerAvartar
                    ? "border-primary-color bg-primary-color/5 text-primary-color"
                    : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
                }`}
              >
                <MdImage /> {studentPointsLanguage.changeAvatar(lang)}
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {triggerAvartar === false && (
              <ScorePanel
                subjectId={student.subjectId}
                onSelectScore={({ inputScore, score }) => {
                  setSelectScore({ inputScore, score });
                }}
                selectScore={{
                  score: selectScore?.score,
                  inputScore: selectScore?.inputScore,
                }}
                isLoading={createScoreOnStudent.isPending}
                onCreateScore={handleCreateScore}
              />
            )}
            {triggerAvartar === true && (
              <div className="p-5">
                <AvatarSetting
                  onUpdatePhoto={(url) => setImage(url)}
                  toast={toast}
                  studentOnSubject={student}
                  onClose={() => setSetTriggerAvatar(false)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default memo(PopUpStudent);

// Stars that burst around the mascot on a positive score: [left %, top %, delay s].
const SPARKLES = [
  [14, 18, 0.1],
  [82, 14, 0.25],
  [8, 52, 0.4],
  [90, 46, 0.15],
  [22, 80, 0.3],
  [78, 76, 0.45],
  [50, 6, 0.55],
] as const;

type ScoreResultViewProps = {
  student: StudentOnSubject;
  photo: string;
  result: ScoreResult;
  lang: Language;
  onDone: () => void;
};

/**
 * Replaces the points panel after a score is given: the student (mascot
 * jumping for joy or giving a thumbs-down, or their photo) with the points,
 * then closes by itself once the bar on the Done button runs out (long enough
 * for either clip to land).
 */
function ScoreResultView({
  student,
  photo,
  result,
  lang,
  onDone,
}: ScoreResultViewProps) {
  const reduceMotion = useReducedMotion();
  const positive = result.points > 0;
  const mascot = mascotForPhoto(photo);
  const closed = useRef(false);
  const done = () => {
    if (closed.current) return;
    closed.current = true;
    onDone();
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-2 overflow-hidden px-6 pb-6 pt-10 text-center">
      {positive &&
        !reduceMotion &&
        SPARKLES.map(([left, top, delay], index) => (
          <motion.span
            key={index}
            aria-hidden
            className={`pointer-events-none absolute text-xl ${
              index % 2 ? "text-primary-color" : "text-warning-color"
            }`}
            style={{ left: `${left}%`, top: `${top}%` }}
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{
              scale: [0, 1.2, 0.9],
              opacity: [0, 1, 0],
              rotate: 20,
            }}
            transition={{ duration: 1.6, delay, ease: "easeOut" }}
          >
            <IoStar />
          </motion.span>
        ))}

      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className={`relative ${mascot ? "h-56 w-56" : "h-40 w-40"}`}
      >
        {mascot ? (
          <>
            <span
              aria-hidden
              className={`absolute inset-6 rounded-full ${
                positive ? "bg-primary-color/10" : "bg-background-color"
              }`}
            />
            <MascotAvatar
              id={student.id}
              clips={mascot}
              alt={student.firstName}
              reactOnMount={moodForPoints(result.points) ?? undefined}
              sizes="224px"
            />
          </>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-full bg-background-color ring-4 ring-background-color">
            <Image
              src={photo}
              alt={student.firstName}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        )}
        <motion.span
          initial={reduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 14,
            delay: 0.25,
          }}
          className={`absolute bottom-3 right-0 flex h-12 min-w-12 items-center justify-center rounded-full px-3 text-lg font-bold tabular-nums text-white shadow-md ring-4 ring-white ${
            positive ? "bg-success-color" : "bg-error-color"
          }`}
        >
          {positive ? `+${result.points}` : result.points}
        </motion.span>
      </motion.div>

      <h2 className="mt-2 text-2xl font-semibold text-icon-color">
        {positive
          ? studentPointsLanguage.greatJob(student.firstName)(lang)
          : studentPointsLanguage.keepGoing(student.firstName)(lang)}
      </h2>
      <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <span className="relative h-6 w-6 shrink-0">
          <Image
            src={result.score.icon}
            alt=""
            fill
            sizes="24px"
            className="object-contain"
          />
        </span>
        {result.score.title}
      </p>
      <p className="text-sm text-gray-500">
        {studentPointsLanguage.totalPoints(lang)}{" "}
        <span className="font-semibold tabular-nums text-icon-color">
          {result.total}
        </span>
      </p>

      <button
        type="button"
        onClick={done}
        className="relative mt-4 h-11 w-full max-w-xs overflow-hidden rounded-xl bg-primary-color text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98]"
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-white/20"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          onAnimationComplete={done}
        />
        <span className="relative">{studentPointsLanguage.done(lang)}</span>
      </button>
    </div>
  );
}
