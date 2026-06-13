import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbAlertTriangle,
  TbFileText,
  TbChevronDown,
  TbInfoCircle,
} from "react-icons/tb";
import { AtRiskStudent, Language } from "@/interfaces";
import { insightsDataLanguage as L } from "../../../data/languages/insights";
import { useGetStudentInsightDetail } from "../../../react-query/analytics";
import { containerStagger, fadeUp, tierBadge, tierBar } from "./insightsUi";
import Link from "next/link";

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
      <p className="py-3 pl-12 font-Anuphan text-xs text-gray-400">
        {L.loading(language)}
      </p>
    );
  }
  const missing = detail.data?.missingAssignments ?? [];
  if (missing.length === 0) {
    return (
      <p className="py-3 pl-12 font-Anuphan text-xs text-success-color">
        {L.noMissing(language)}
      </p>
    );
  }
  return (
    <ul className="space-y-1.5 py-2 pl-12 pr-2">
      {missing.map((m) => (
        <li
          key={m.assignmentId}
          className="flex items-center justify-between gap-2 rounded-lg border border-error-color/15 bg-error-color/5 px-3 py-1.5 font-Anuphan"
        >
          <span className="flex min-w-0 items-center gap-2">
            <TbFileText className="shrink-0 text-error-color" />
            <Link
              href={`/subject/${m.subjectId}/assignment/${m.assignmentId}?studentOnAssignmentId=${m.studentOnAssignmentId}&menu=studentwork`}
              className="truncate text-xs text-gray-800"
            >
              {m.title}
            </Link>
            <Link
              href={`/subject/${m.subjectId}`}
              className="shrink-0 rounded-full bg-secondary-color/15 px-2 py-0.5 text-[10px] font-medium text-primary-color hover:underline"
            >
              {m.subjectTitle}
            </Link>
          </span>
          {m.dueDate && (
            <span className="shrink-0 text-[10px] font-medium text-error-color">
              {L.due(language)} {new Date(m.dueDate).toLocaleDateString()}
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
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-success-color/30 bg-gradient-to-br from-success-color/10 to-white p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-color/15 text-2xl">
          🎉
        </span>
        <p className="font-Anuphan font-medium text-success-color">
          {L.noAtRisk(language)}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-error-color/10 to-transparent px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-error-color/15">
          <TbAlertTriangle className="text-error-color" />
        </span>
        <h3 className="font-Anuphan font-semibold text-icon-color">
          {L.atRiskStudents(language)}
        </h3>
        <button
          type="button"
          onClick={() => setShowLegend((v) => !v)}
          aria-label={L.riskScoreInfo(language)}
          aria-expanded={showLegend}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            showLegend
              ? "bg-primary-color/15 text-primary-color"
              : "text-gray-400 hover:bg-gray-100 hover:text-primary-color"
          }`}
        >
          <TbInfoCircle />
        </button>
        <span className="ml-auto font-Anuphan text-xs text-gray-400">
          {L.sortedByRisk(language)}
        </span>
      </div>

      {/* Risk score legend */}
      <AnimatePresence initial={false}>
        {showLegend && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-b border-gray-100 bg-gray-50/70"
          >
            <div className="px-4 py-3 font-Anuphan">
              <p className="text-xs font-semibold text-icon-color">
                {L.riskScoreTitle(language)}
              </p>
              <p className="mb-2 text-xs text-gray-500">
                {L.riskScoreScale(language)}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tierBadge("HIGH")}`}>
                    60–100
                  </span>
                  <span>
                    <span className="font-medium text-icon-color">
                      {L.riskHighLabel(language)}
                    </span>{" "}
                    — {L.riskHighDesc(language)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tierBadge("MEDIUM")}`}>
                    35–59
                  </span>
                  <span>
                    <span className="font-medium text-icon-color">
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
                    <span className="font-medium text-icon-color">
                      {L.riskLowLabel(language)}
                    </span>{" "}
                    — {L.riskLowDesc(language)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                {L.riskBasedOn(language)}: {L.factorMissing(language)} ·{" "}
                {L.factorScore(language)} · {L.factorAttendance(language)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.ul
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="divide-y divide-gray-50"
      >
        {students.map((st) => {
          const isOpen = expanded === st.studentId;
          return (
            <motion.li key={st.studentId} variants={fadeUp}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : st.studentId)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                  isOpen ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    {st.photo ? (
                      <Image
                        src={st.photo}
                        alt=""
                        width={36}
                        height={36}
                        className={`h-9 w-9 rounded-full object-cover ring-2 ${
                          st.tier === "HIGH"
                            ? "ring-error-color/40"
                            : "ring-warning-color/50"
                        }`}
                      />
                    ) : (
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 ring-2 ${
                          st.tier === "HIGH"
                            ? "ring-error-color/40"
                            : "ring-warning-color/50"
                        }`}
                      >
                        {st.firstName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-Anuphan text-sm font-medium text-gray-800">
                      #{st.number} {st.firstName} {st.lastName}
                    </p>
                    <Link
                      href={`/classroom/${st.classId}`}
                      className="truncate font-Anuphan text-xs text-blue-500 hover:underline"
                    >
                      {st.className}
                      {st.limitedData && (
                        <span className="ml-1 text-warning-color">
                          · {L.limitedData(language)}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden font-Anuphan text-xs text-gray-400 lg:inline">
                    {st.signals.missingCount} {L.missing(language)}
                    {st.signals.absentRate !== null &&
                      ` · ${st.signals.absentCount} ${L.absent(language)}`}
                  </span>
                  <span
                    className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl px-2 font-Anuphan text-sm font-bold ${tierBadge(
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
                    className="overflow-hidden bg-gray-50/60"
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
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
};

export default AtRiskTable;
