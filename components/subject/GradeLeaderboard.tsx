import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { defaultBlurHash } from "../../data";
import { gradeData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas, StudentTotal } from "../../utils";

type Props = {
  studentTotals: StudentTotal[];
};

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Podium column style by rank. Ties can produce e.g. two rank-1 columns —
// both render gold at full height, which is intended.
const PODIUM_STYLE: Record<
  number,
  { height: string; bg: string; delay: number }
> = {
  1: { height: "h-36", bg: "bg-warning-color", delay: 0.8 },
  2: { height: "h-24", bg: "bg-gray-300", delay: 0.45 },
  3: { height: "h-16", bg: "bg-orange-200", delay: 0.1 },
};

function GradeLeaderboard({ studentTotals }: Props) {
  const language = useGetLanguage();
  const [hideScores, setHideScores] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isFullscreen]);

  const podium = studentTotals.slice(0, 3);
  const rest = studentTotals.slice(3);
  const leaderScore = studentTotals[0]?.totalScore ?? 0;

  // Visual arrangement 2nd–1st–3rd; missing slots (fewer than 3 students)
  // simply drop out.
  const podiumSlots = [podium[1], podium[0], podium[2]].filter(
    (slot): slot is StudentTotal => Boolean(slot),
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col gap-5 overflow-auto bg-background-color p-4 font-Anuphan md:p-8"
          : "mt-5 flex w-full flex-col gap-5 rounded-2xl bg-white p-4 font-Anuphan md:p-6"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-icon-color md:text-2xl">
          🏆 {gradeData.leaderboard(language.data ?? "en")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideScores((prev) => !prev)}
            className="second-button flex items-center justify-center gap-1 border text-sm"
          >
            {hideScores ? <FaEye /> : <FaEyeSlash />}
            {hideScores
              ? gradeData.show_scores(language.data ?? "en")
              : gradeData.hide_scores(language.data ?? "en")}
          </button>
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="second-button flex items-center justify-center gap-1 border text-sm"
          >
            {isFullscreen ? <BiCollapse /> : <BiExpand />}
            {isFullscreen
              ? gradeData.exit_fullscreen(language.data ?? "en")
              : gradeData.fullscreen(language.data ?? "en")}
          </button>
        </div>
      </div>

      {podiumSlots.length > 0 && (
        <div className="flex items-end justify-center gap-3 md:gap-6">
          {podiumSlots.map((item) => {
            const style = PODIUM_STYLE[item.rank] ?? PODIUM_STYLE[3];
            return (
              <motion.div
                key={item.student.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: style.delay,
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-white md:h-16 md:w-16">
                  <Image
                    src={item.student.photo}
                    alt={item.student.firstName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      item.student.blurHash ?? defaultBlurHash,
                    )}
                    className="object-cover"
                  />
                </div>
                <span className="max-w-24 truncate text-xs font-semibold text-icon-color md:max-w-32 md:text-sm">
                  {item.student.firstName} {item.student.lastName}
                </span>
                <div
                  className={`flex w-20 flex-col items-center justify-start rounded-t-2xl pt-2 md:w-28 ${style.height} ${style.bg}`}
                >
                  <span className="text-2xl md:text-3xl">
                    {MEDALS[item.rank]}
                  </span>
                  {!hideScores && (
                    <span className="text-sm font-bold text-icon-color">
                      {item.totalScore.toFixed(2)}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((item, index) => {
            const percent =
              leaderScore > 0
                ? Math.max(8, (item.totalScore / leaderScore) * 100)
                : 8;
            return (
              <div
                key={item.student.id}
                className="flex items-center gap-2 md:gap-3"
              >
                <span className="w-7 text-center text-sm font-semibold text-icon-color">
                  {item.rank}
                </span>
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-2xl ring-1">
                  <Image
                    src={item.student.photo}
                    alt={item.student.firstName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      item.student.blurHash ?? defaultBlurHash,
                    )}
                    className="object-cover"
                  />
                </div>
                <span className="w-28 truncate text-xs font-semibold text-icon-color md:w-44 md:text-sm">
                  {item.student.firstName} {item.student.lastName}
                </span>
                <div className="relative h-8 flex-1 overflow-hidden rounded-2xl bg-primary-color/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 1 + index * 0.05,
                    }}
                    className="flex h-full items-center justify-end rounded-2xl bg-gradient-to-r from-primary-color to-secondary-color px-3"
                  >
                    {!hideScores && (
                      <span className="text-xs font-bold text-white">
                        {item.totalScore.toFixed(2)}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GradeLeaderboard;
