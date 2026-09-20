import React from "react";
import { TbUsers } from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { ratePalette } from "./insightsUi";
import { Panel, EmptyState } from "./InsightPanel";

const ClassLeaderboard = ({
  classes,
  schoolId,
  language,
}: {
  classes: SchoolAnalytics["classLeaderboard"];
  schoolId: string;
  language: Language;
}) => (
  <Panel
    Icon={TbUsers}
    title={L.classLeaderboard(language)}
    bodyClassName={classes.length === 0 ? "" : "p-4"}
  >
    {classes.length === 0 ? (
      <EmptyState
        Icon={TbUsers}
        title={L.noClasses(language)}
        hint={L.noClassesHint(language)}
        action={{
          label: L.goToClasses(language),
          href: `/school/${schoolId}?menu=Classes`,
        }}
      />
    ) : (
      <ul className="space-y-3">
        {classes.map((c) => {
          const riskShare =
            c.studentCount > 0 ? c.atRiskCount / c.studentCount : 0;
          const scorePal = ratePalette(c.avgScorePercent / 100);
          const pct = Math.round(riskShare * 100);
          return (
            <li key={c.classId}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-gray-800">
                  {c.title}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${scorePal.chip} ${scorePal.text}`}
                  >
                    {c.avgScorePercent}%
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      c.atRiskCount > 0
                        ? "text-error-color"
                        : "text-success-color"
                    }`}
                  >
                    {c.atRiskCount} {L.atRisk(language)}
                  </span>
                </div>
              </div>
              {/* share of the class that is at-risk */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-error-color"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </Panel>
);

export default ClassLeaderboard;
