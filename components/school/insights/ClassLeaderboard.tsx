import React from "react";
import { motion } from "framer-motion";
import { TbUsers } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { containerStagger, fadeUp, ratePalette } from "./insightsUi";

const ClassLeaderboard = ({
  classes,
  language,
}: {
  classes: SchoolAnalytics["classLeaderboard"];
  language: Language;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 font-Anuphan font-semibold text-icon-color">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info-color/15">
        <TbUsers className="text-info-color" />
      </span>
      {L.classLeaderboard(language)}
    </h3>
    <motion.ul
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-2.5"
    >
      {classes.map((c) => {
        const riskShare = c.studentCount > 0 ? c.atRiskCount / c.studentCount : 0;
        const scorePal = ratePalette(c.avgScorePercent / 100);
        const pct = Math.round(riskShare * 100);
        return (
          <motion.li key={c.classId} variants={fadeUp} className="font-Anuphan">
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-gray-800">{c.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${scorePal.chip} ${scorePal.text}`}
                >
                  {c.avgScorePercent}%
                </span>
                <span
                  className={`text-xs font-medium ${
                    c.atRiskCount > 0 ? "text-error-color" : "text-success-color"
                  }`}
                >
                  {c.atRiskCount} {L.atRisk(language)}
                </span>
              </div>
            </div>
            {/* share of class that is at-risk */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="h-full rounded-full bg-gradient-to-r from-error-color to-warning-color"
              />
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  </div>
);

export default ClassLeaderboard;
