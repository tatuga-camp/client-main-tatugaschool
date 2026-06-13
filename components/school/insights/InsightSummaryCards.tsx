import React from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import {
  TbAlertTriangle,
  TbClock,
  TbCalendarStats,
  TbStar,
} from "react-icons/tb";
import { SchoolAnalytics, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { containerStagger, fadeUp } from "./insightsUi";

type Accent = {
  ring: string; // card border + gradient tint
  grad: string; // soft gradient background
  chip: string; // icon chip background
  icon: string; // icon color
  value: string; // big number color
};

const ACCENTS: Record<string, Accent> = {
  error: {
    ring: "border-error-color/30",
    grad: "from-error-color/10 via-white to-white",
    chip: "bg-error-color/15",
    icon: "text-error-color",
    value: "text-error-color",
  },
  info: {
    ring: "border-info-color/30",
    grad: "from-info-color/10 via-white to-white",
    chip: "bg-info-color/15",
    icon: "text-info-color",
    value: "text-info-color",
  },
  success: {
    ring: "border-success-color/30",
    grad: "from-success-color/10 via-white to-white",
    chip: "bg-success-color/15",
    icon: "text-success-color",
    value: "text-success-color",
  },
  primary: {
    ring: "border-primary-color/30",
    grad: "from-primary-color/10 via-white to-white",
    chip: "bg-primary-color/15",
    icon: "text-primary-color",
    value: "text-primary-color",
  },
};

const Card = ({
  label,
  value,
  sub,
  Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: IconType;
  accent: Accent;
}) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${accent.ring} ${accent.grad}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-Anuphan text-sm text-gray-600">{label}</p>
        <h3 className={`font-Anuphan text-3xl font-bold ${accent.value}`}>
          {value}
        </h3>
      </div>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}
      >
        <Icon className={`text-xl ${accent.icon}`} />
      </span>
    </div>
    {sub && (
      <p className="mt-1 font-Anuphan text-xs text-gray-500">{sub}</p>
    )}
    {/* decorative corner glow */}
    <span
      className={`pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full ${accent.chip} blur-2xl`}
    />
  </motion.div>
);

const InsightSummaryCards = ({
  data,
  language,
}: {
  data: SchoolAnalytics;
  language: Language;
}) => {
  const s = data.summary;
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card
        label={L.atRiskStudents(language)}
        value={String(s.atRiskCount)}
        sub={`${s.highRiskCount} ${L.high(language)} · ${s.mediumRiskCount} ${L.medium(language)}`}
        Icon={TbAlertTriangle}
        accent={ACCENTS.error}
      />
      <Card
        label={L.onTimeSubmission(language)}
        value={`${Math.round(s.onTimeSubmissionRate * 100)}%`}
        sub={`${s.awaitingGradingCount} ${L.awaitingGrading(language)}`}
        Icon={TbClock}
        accent={ACCENTS.info}
      />
      <Card
        label={L.attendanceRate(language)}
        value={`${Math.round(s.attendanceRate * 100)}%`}
        Icon={TbCalendarStats}
        accent={ACCENTS.success}
      />
      <Card
        label={L.averageScore(language)}
        value={`${s.avgScorePercent}%`}
        sub={L.acrossGraded(language)}
        Icon={TbStar}
        accent={ACCENTS.primary}
      />
    </motion.div>
  );
};

export default InsightSummaryCards;
