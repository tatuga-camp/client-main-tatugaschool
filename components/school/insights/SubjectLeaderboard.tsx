import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TbBook } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { containerStagger, fadeUp, ratePalette } from "./insightsUi";

const SubjectLeaderboard = ({
  subjects,
  language,
}: {
  subjects: SchoolAnalytics["subjectLeaderboard"];
  language: Language;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 font-Anuphan font-semibold text-icon-color">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-color/15">
        <TbBook className="text-secondary-color" />
      </span>
      {L.subjectAttendance(language)}
    </h3>
    <motion.ul
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {subjects.map((s) => {
        const pct = Math.round(s.attendanceRate * 100);
        const pal = ratePalette(s.attendanceRate);
        return (
          <motion.li key={s.subjectId} variants={fadeUp} className="font-Anuphan">
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
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.05 }}
                className={`h-full rounded-full ${pal.bar}`}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-1">
                <div className="flex -space-x-2">
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
                  {s.teachers.map((t) => `${t.firstName} ${t.lastName}`).join(", ") ||
                    "—"}
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
          </motion.li>
        );
      })}
    </motion.ul>
  </div>
);

export default SubjectLeaderboard;
