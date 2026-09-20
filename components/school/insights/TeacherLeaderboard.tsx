import React from "react";
import Image from "next/image";
import { TbTrophy } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { rankBadge, ratePalette } from "./insightsUi";
import { Panel, EmptyState } from "./InsightPanel";

const TeacherLeaderboard = ({
  teachers,
  language,
}: {
  teachers: SchoolAnalytics["teacherLeaderboard"];
  language: Language;
}) => (
  <Panel
    Icon={TbTrophy}
    title={L.bestTeachers(language)}
    bodyClassName={teachers.length === 0 ? "" : "p-2"}
  >
    {teachers.length === 0 ? (
      <EmptyState
        Icon={TbTrophy}
        title={L.noTeachers(language)}
        hint={L.noTeachersHint(language)}
      />
    ) : (
      <ul className="space-y-1">
        {teachers.map((t, i) => {
          // lower at-risk rate is better -> invert for the palette
          const pal = ratePalette(1 - t.atRiskRate);
          return (
            <li
              key={t.userId}
              className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50"
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
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {t.firstName} {t.lastName}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {t.subjectCount} {L.subjects(language)}, {t.studentCount}{" "}
                    {L.students(language)}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${pal.chip} ${pal.text}`}
              >
                {Math.round(t.atRiskRate * 100)}% {L.atRisk(language)}
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </Panel>
);

export default TeacherLeaderboard;
