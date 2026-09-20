import React from "react";
import { TbChartBar } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { bucketBar } from "./insightsUi";
import { Panel, EmptyState } from "./InsightPanel";

const MAX_BAR_PX = 104; // tallest bar in pixels

const ScoreDistributionBar = ({
  distribution,
  language,
}: {
  distribution: SchoolAnalytics["scoreDistribution"];
  language: Language;
}) => {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <Panel
      Icon={TbChartBar}
      title={L.scoreDistribution(language)}
      bodyClassName={total === 0 ? "" : "p-4"}
    >
      {total === 0 ? (
        <EmptyState
          Icon={TbChartBar}
          title={L.noScores(language)}
          hint={L.noScoresHint(language)}
        />
      ) : (
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
                className="flex flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-xs font-semibold text-gray-600">
                  {d.count}
                </span>
                <div
                  className={`w-full rounded-t-md ${
                    d.count > 0 ? bucketBar(d.bucket) : "bg-gray-200"
                  }`}
                  style={{ height: barPx }}
                />
                <span className="text-[10px] text-gray-400">{d.bucket}</span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

export default ScoreDistributionBar;
