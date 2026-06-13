import React from "react";
import { motion } from "framer-motion";
import { TbChartBar } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { bucketGradient } from "./insightsUi";

const MAX_BAR_PX = 104; // tallest bar in pixels

const ScoreDistributionBar = ({
  distribution,
  language,
}: {
  distribution: SchoolAnalytics["scoreDistribution"];
  language: Language;
}) => {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-Anuphan font-semibold text-icon-color">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-color/10">
          <TbChartBar className="text-primary-color" />
        </span>
        {L.scoreDistribution(language)}
      </h3>
      <div className="flex items-end justify-between gap-2">
        {distribution.map((d) => {
          // pixel height so the bar renders without a definite-height parent
          const barPx =
            d.count > 0
              ? Math.max(6, Math.round((d.count / max) * MAX_BAR_PX))
              : 3;
          return (
            <div
              key={d.bucket}
              className="group flex flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="font-Anuphan text-xs font-semibold text-gray-600">
                {d.count}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barPx }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  delay: 0.1,
                }}
                className={`w-full rounded-t-lg bg-gradient-to-t ${bucketGradient(
                  d.bucket,
                )} shadow-sm transition-transform group-hover:scale-y-105`}
                style={{ transformOrigin: "bottom" }}
              />
              <span className="font-Anuphan text-[10px] text-gray-400">
                {d.bucket}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreDistributionBar;
