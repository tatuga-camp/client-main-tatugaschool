import Image from "next/image";
import React, { useState } from "react";
import { quizLanguage } from "../../data/languages";
import { Language, QuizMonitorRow, QuizMonitorStatus } from "../../interfaces";
import { useGetLanguage, useGetQuizMonitor } from "../../react-query";
import { formatDuration, monitorStats, riskBand, sortMonitorRows } from "../../utils/quizMonitor";
import QuizStudentPanel from "./QuizStudentPanel";

const STATUS_CLASS: Record<QuizMonitorStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  ANSWERING: "bg-primary-color/10 text-primary-color",
  AWAY: "bg-error-color/10 text-error-color",
  SUBMITTED: "bg-success-color/10 text-success-color",
};

export function RiskBadge({ score, language }: { score: number | null; language: Language }) {
  const band = riskBand(score);
  if (band === null) return <span className="text-sm text-icon-color/40">–</span>;
  const cls =
    band === "HIGH"
      ? "bg-error-color/10 text-error-color"
      : band === "MEDIUM"
        ? "bg-warning-color/10 text-warning-color"
        : "bg-success-color/10 text-success-color";
  const label =
    band === "HIGH" ? quizLanguage.riskHigh(language) : band === "MEDIUM" ? quizLanguage.riskMedium(language) : quizLanguage.riskLow(language);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {Math.round(score as number)}% · {label}
    </span>
  );
}

function lastSeen(row: QuizMonitorRow, serverNow: string): string {
  if (!row.lastSeenAt) return "–";
  return formatDuration(new Date(serverNow).getTime() - new Date(row.lastSeenAt).getTime());
}

export default function QuizMonitor({ assignmentId }: { assignmentId: string }) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const monitor = useGetQuizMonitor({ assignmentId, enabled: true, poll: true });
  const [selected, setSelected] = useState<string | null>(null);

  const view = monitor.data;
  const rows = view ? sortMonitorRows(view.rows) : [];
  const stats = monitorStats(rows);
  const testMode = !!view?.testMode;

  const stat = (label: string, value: string, tone = "text-icon-color") => (
    <div className="rounded-2xl border border-gray-100 bg-white p-3">
      <div className="text-xs text-icon-color/60">{label}</div>
      <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 font-Anuphan md:p-6">
      <div className={`grid grid-cols-2 gap-3 ${testMode ? "md:grid-cols-5" : "md:grid-cols-3"}`}>
        {stat(quizLanguage.statStarted(lang), `${stats.started}/${stats.total}`)}
        {stat(quizLanguage.statAnswering(lang), String(stats.answering), "text-primary-color")}
        {testMode && stat(quizLanguage.statAway(lang), String(stats.away), "text-error-color")}
        {stat(quizLanguage.statSubmitted(lang), String(stats.submitted), "text-success-color")}
        {testMode && stat(quizLanguage.statHighRisk(lang), String(stats.highRisk), "text-error-color")}
      </div>
      <p className="text-xs text-icon-color/50">{quizLanguage.refreshing(lang)}</p>

      {monitor.isError && !view ? (
        <div role="alert" className="rounded-2xl border border-error-color/30 bg-error-color/5 p-10 text-center text-error-color">
          {quizLanguage.loadFailed(lang)}
        </div>
      ) : rows.length === 0 && !monitor.isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-icon-color/60">
          {quizLanguage.noStudents(lang)}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <li className="hidden grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-3 px-4 py-2 text-xs font-medium uppercase text-icon-color/50 md:grid">
            <span>{quizLanguage.colStudent(lang)}</span>
            <span>{quizLanguage.colStatus(lang)}</span>
            <span>{quizLanguage.colProgress(lang)}</span>
            <span>{testMode ? quizLanguage.colRisk(lang) : ""}</span>
            <span>{quizLanguage.colLastSeen(lang)}</span>
          </li>
          {rows.map((row) => {
            const pct = row.questionCount ? Math.round((row.answeredCount / row.questionCount) * 100) : 0;
            return (
              <li key={row.studentOnAssignmentId}>
                <button
                  type="button"
                  onClick={() => setSelected(row.studentOnAssignmentId)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-background-color md:grid-cols-[2fr_1fr_1.5fr_1fr_1fr]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Image
                      src={row.photo}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-icon-color">
                        {row.firstName} {row.lastName}
                      </span>
                      <span className="text-xs text-icon-color/50">#{row.number}</span>
                    </span>
                  </span>
                  <span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[row.status]}`}>
                      {quizLanguage.status(lang, row.status)}
                    </span>
                  </span>
                  <span className="col-span-2 flex items-center gap-2 md:col-span-1">
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <span className="block h-full rounded-full bg-primary-color" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-12 text-right text-xs text-icon-color/60">
                      {row.answeredCount}/{row.questionCount}
                    </span>
                  </span>
                  <span>{testMode && <RiskBadge score={row.riskScore} language={lang} />}</span>
                  <span className="text-sm text-icon-color/60">{view ? lastSeen(row, view.serverNow) : "–"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <QuizStudentPanel
          assignmentId={assignmentId}
          studentOnAssignmentId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
