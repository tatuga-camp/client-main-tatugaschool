import React from "react";
import { IconType } from "react-icons";
import {
  TbAlertTriangle,
  TbClock,
  TbCalendarStats,
  TbStar,
} from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";

// Same shape as the stat cards on the school dashboard (components/school/Stats.tsx):
// white, thin border, rounded-2xl, label over value, single icon on the right.
const Card = ({
  label,
  value,
  suffix,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
  Icon: IconType;
}) => (
  <div className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border bg-white p-3 sm:p-4 xl:p-5">
    <div className="min-w-0">
      <p className="text-sm text-gray-600">{label}</p>
      <h2 className="mt-0.5 truncate text-xl font-bold text-gray-900 xl:text-2xl">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-gray-400">
            {suffix}
          </span>
        )}
      </h2>
      {sub && <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p>}
    </div>
    <Icon className="h-6 w-6 shrink-0 text-primary-color" />
  </div>
);

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

const InsightSummaryCards = ({
  data,
  language,
}: {
  data: SchoolAnalytics;
  language: Language;
}) => {
  const s = data.summary;
  // A score is out of 100, not a rate: show it as "72 / 100", or a dash when nothing is graded yet.
  const hasScore = s.avgScorePercent > 0;
  const score = Math.round(s.avgScorePercent * 10) / 10;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        label={L.atRiskStudents(language)}
        value={String(s.atRiskCount)}
        sub={
          s.atRiskCount > 0
            ? `${L.high(language)} ${s.highRiskCount}, ${L.medium(language)} ${s.mediumRiskCount}`
            : undefined
        }
        Icon={TbAlertTriangle}
      />
      <Card
        label={L.onTimeSubmission(language)}
        value={formatRate(s.onTimeSubmissionRate)}
        sub={`${s.awaitingGradingCount} ${L.awaitingGrading(language)}`}
        Icon={TbClock}
      />
      <Card
        label={L.attendanceRate(language)}
        value={formatRate(s.attendanceRate)}
        Icon={TbCalendarStats}
      />
      <Card
        label={L.averageScore(language)}
        value={hasScore ? String(score) : "—"}
        suffix={hasScore ? "/ 100" : undefined}
        sub={hasScore ? L.acrossGraded(language) : L.noGradedYet(language)}
        Icon={TbStar}
      />
    </div>
  );
};

export default InsightSummaryCards;
