import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbAlertTriangle,
  TbFileText,
  TbChevronDown,
  TbInfoCircle,
  TbShieldCheck,
} from "react-icons/tb";
import { AtRiskStudent, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { useGetStudentInsightDetail } from "../../../react-query/analytics";
import { tierBadge } from "./insightsUi";
import { Panel, EmptyState } from "./InsightPanel";

const ExpandedDetail = ({
  schoolId,
  studentId,
  educationYear,
  language,
}: {
  schoolId: string;
  studentId: string;
  educationYear: string;
  language: Language;
}) => {
  const detail = useGetStudentInsightDetail({
    schoolId,
    studentId,
    educationYear,
    enabled: true,
  });

  if (detail.isLoading) {
    return (
      <p className="py-3 pl-4 text-xs text-gray-400 sm:pl-16">
        {L.loading(language)}
      </p>
    );
  }
  const missing = detail.data?.missingAssignments ?? [];
  if (missing.length === 0) {
    return (
      <p className="py-3 pl-4 text-xs text-success-color sm:pl-16">
        {L.noMissing(language)}
      </p>
    );
  }
  return (
    <ul className="space-y-1.5 px-4 py-2 sm:pl-16">
      {missing.map((m) => (
        <li
          key={m.assignmentId}
          className="flex flex-col gap-1 rounded-lg border bg-white px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
        >
          <span className="flex min-w-0 items-center gap-2">
            <TbFileText className="shrink-0 text-error-color" />
            <Link
              target="_blank"
              href={`/subject/${m.subjectId}/assignment/${m.assignmentId}?studentOnAssignmentId=${m.studentOnAssignmentId}&menu=studentwork`}
              className="truncate text-xs text-gray-800 hover:underline"
            >
              {m.title}
            </Link>
            <Link
              target="_blank"
              href={`/subject/${m.subjectId}`}
              className="shrink-0 rounded-full bg-primary-color/10 px-2 py-0.5 text-[10px] font-medium text-primary-color hover:underline"
            >
              {m.subjectTitle}
            </Link>
          </span>
          {m.dueDate && (
            <span className="shrink-0 pl-6 text-[10px] font-medium text-error-color sm:pl-0">
              {L.due(language)}{" "}
              {new Date(m.dueDate).toLocaleDateString(
                language === "th" ? "th-TH" : "en-GB",
              )}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const AtRiskTable = ({
  students,
  schoolId,
  educationYear,
  language,
}: {
  students: AtRiskStudent[];
  schoolId: string;
  educationYear: string;
  language: Language;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  if (students.length === 0) {
    return (
      <Panel
        Icon={TbAlertTriangle}
        title={L.atRiskStudents(language)}
        bodyClassName=""
      >
        <EmptyState
          Icon={TbShieldCheck}
          title={L.noAtRisk(language)}
          hint={L.noAtRiskHint(language)}
        />
      </Panel>
    );
  }

  return (
    <Panel
      Icon={TbAlertTriangle}
      title={L.atRiskStudents(language)}
      bodyClassName=""
      aside={
        <>
          <span className="hidden text-xs text-gray-400 sm:inline">
            {L.sortedByRisk(language)}
          </span>
          <button
            type="button"
            onClick={() => setShowLegend((v) => !v)}
            aria-label={L.riskScoreInfo(language)}
            aria-expanded={showLegend}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              showLegend
                ? "bg-primary-color/10 text-primary-color"
                : "text-gray-400 hover:bg-gray-100 hover:text-primary-color"
            }`}
          >
            <TbInfoCircle className="text-lg" />
          </button>
        </>
      }
    >
      {/* Risk score legend */}
      <AnimatePresence initial={false}>
        {showLegend && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-b bg-gray-50"
          >
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-gray-900">
                {L.riskScoreTitle(language)}
              </p>
              <p className="mb-2 text-xs text-gray-500">
                {L.riskScoreScale(language)}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tierBadge("HIGH")}`}
                  >
                    60–100
                  </span>
                  <span>
                    <span className="font-medium text-gray-900">
                      {L.riskHighLabel(language)}
                    </span>{" "}
                    — {L.riskHighDesc(language)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tierBadge("MEDIUM")}`}
                  >
                    35–59
                  </span>
                  <span>
                    <span className="font-medium text-gray-900">
                      {L.riskMediumLabel(language)}
                    </span>{" "}
                    — {L.riskMediumDesc(language)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                    0–34
                  </span>
                  <span>
                    <span className="font-medium text-gray-900">
                      {L.riskLowLabel(language)}
                    </span>{" "}
                    — {L.riskLowDesc(language)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                {L.riskBasedOn(language)}: {L.factorMissing(language)},{" "}
                {L.factorScore(language)}, {L.factorAttendance(language)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="divide-y">
        {students.map((st) => {
          const isOpen = expanded === st.studentId;
          return (
            <li key={st.studentId}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : st.studentId)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 sm:px-4 ${
                  isOpen ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {st.photo ? (
                    <Image
                      src={st.photo}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {st.firstName.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      #{st.number} {st.firstName} {st.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      <Link
                        target="_blank"
                        href={`/classroom/${st.classId}`}
                        className="text-primary-color hover:underline"
                      >
                        {st.className}
                      </Link>
                      {st.limitedData && (
                        <span className="ml-1">
                          ({L.limitedData(language)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <span className="hidden text-xs text-gray-400 lg:inline">
                    {st.signals.missingCount} {L.missing(language)}
                    {st.signals.absentRate !== null &&
                      `, ${st.signals.absentCount} ${L.absent(language)}`}
                  </span>
                  <span
                    className={`flex h-8 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-bold ${tierBadge(
                      st.tier,
                    )}`}
                  >
                    {st.riskScore}
                  </span>
                  <TbChevronDown
                    className={`text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden bg-gray-50"
                  >
                    <ExpandedDetail
                      schoolId={schoolId}
                      studentId={st.studentId}
                      educationYear={educationYear}
                      language={language}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default AtRiskTable;
