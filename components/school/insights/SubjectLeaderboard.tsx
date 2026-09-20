import React from "react";
import Image from "next/image";
import { TbBook } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { ratePalette } from "./insightsUi";
import { Panel, EmptyState } from "./InsightPanel";

const SubjectLeaderboard = ({
  subjects,
  schoolId,
  language,
}: {
  subjects: SchoolAnalytics["subjectLeaderboard"];
  schoolId: string;
  language: Language;
}) => (
  <Panel
    Icon={TbBook}
    title={L.subjectAttendance(language)}
    bodyClassName={subjects.length === 0 ? "" : "p-4"}
  >
    {subjects.length === 0 ? (
      <EmptyState
        Icon={TbBook}
        title={L.noSubjects(language)}
        hint={L.noSubjectsHint(language)}
        action={{
          label: L.goToSubjects(language),
          href: `/school/${schoolId}?menu=Subjects`,
        }}
      />
    ) : (
      <ul className="space-y-3">
        {subjects.map((s) => {
          const pct = Math.round(s.attendanceRate * 100);
          const pal = ratePalette(s.attendanceRate);
          return (
            <li key={s.subjectId}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-gray-800">
                  {s.title}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${pal.chip} ${pal.text}`}
                >
                  {pct}%
                </span>
              </div>
              {/* attendance progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${pal.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1">
                  <div className="flex shrink-0 -space-x-2">
                    {s.teachers.slice(0, 4).map((t) =>
                      t.photo ? (
                        <Image
                          key={t.userId}
                          src={t.photo}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-full border border-white object-cover"
                        />
                      ) : (
                        <span
                          key={t.userId}
                          className="h-5 w-5 rounded-full border border-white bg-gray-200"
                        />
                      ),
                    )}
                  </div>
                  <span className="truncate text-xs text-gray-400">
                    {s.teachers
                      .map((t) => `${t.firstName} ${t.lastName}`)
                      .join(", ") || "—"}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    s.atRiskCount > 0 ? "text-error-color" : "text-success-color"
                  }`}
                >
                  {s.atRiskCount} {L.atRisk(language)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </Panel>
);

export default SubjectLeaderboard;
