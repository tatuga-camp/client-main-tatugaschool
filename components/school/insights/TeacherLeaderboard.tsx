import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TbTrophy } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { containerStagger, fadeUp, rankBadge, ratePalette } from "./insightsUi";

const TeacherLeaderboard = ({
  teachers,
  language,
}: {
  teachers: SchoolAnalytics["teacherLeaderboard"];
  language: Language;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 font-Anuphan font-semibold text-icon-color">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-color/25">
        <TbTrophy className="text-icon-color" />
      </span>
      {L.bestTeachers(language)}
    </h3>
    <motion.ul
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {teachers.map((t, i) => {
        // lower at-risk rate is better -> invert for the palette
        const pal = ratePalette(1 - t.atRiskRate);
        return (
          <motion.li
            key={t.userId}
            variants={fadeUp}
            className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 font-Anuphan transition-colors hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadge(
                  i,
                )}`}
              >
                {i + 1}
              </span>
              {t.photo ? (
                <Image
                  src={t.photo}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-color/20"
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-primary-color/20" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {t.firstName} {t.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {t.subjectCount} {L.subjects(language)} · {t.studentCount}{" "}
                  {L.students(language)}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${pal.chip} ${pal.text}`}
            >
              {Math.round(t.atRiskRate * 100)}% {L.atRisk(language)}
            </span>
          </motion.li>
        );
      })}
    </motion.ul>
  </div>
);

export default TeacherLeaderboard;
