import { QuizMonitorRow, QuizMonitorStatus } from "../interfaces";

export type RiskBand = "LOW" | "MEDIUM" | "HIGH";

export function riskBand(score: number | null): RiskBand | null {
  if (score === null || score === undefined) return null;
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

const STATUS_PRIORITY: Record<QuizMonitorStatus, number> = {
  AWAY: 0,
  ANSWERING: 1,
  SUBMITTED: 2,
  NOT_STARTED: 3,
};

export function sortMonitorRows(rows: QuizMonitorRow[]): QuizMonitorRow[] {
  return [...rows].sort((a, b) => {
    const ra = a.riskScore ?? -1;
    const rb = b.riskScore ?? -1;
    if (ra !== rb) return rb - ra;
    const sa = STATUS_PRIORITY[a.status];
    const sb = STATUS_PRIORITY[b.status];
    if (sa !== sb) return sa - sb;
    return (Number(a.number) || 0) - (Number(b.number) || 0);
  });
}

export type MonitorStats = {
  total: number;
  started: number;
  answering: number;
  away: number;
  submitted: number;
  highRisk: number;
};

export function monitorStats(rows: QuizMonitorRow[]): MonitorStats {
  return {
    total: rows.length,
    started: rows.filter((r) => r.status !== "NOT_STARTED").length,
    answering: rows.filter((r) => r.status === "ANSWERING").length,
    away: rows.filter((r) => r.status === "AWAY").length,
    submitted: rows.filter((r) => r.status === "SUBMITTED").length,
    highRisk: rows.filter((r) => riskBand(r.riskScore) === "HIGH").length,
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

/**
 * Lock state for the question editor. The server decides (`locked` on the monitor view): any started
 * attempt locks questions, assigned or not. While the monitor is still loading, the editor is
 * read-only but shows no banner yet.
 */
export function editorLockState(
  serverLocked: boolean | undefined,
  isLoading: boolean,
): { locked: boolean; readOnly: boolean } {
  const locked = serverLocked === true;
  return { locked, readOnly: locked || isLoading };
}

/**
 * What a score override should send when the teacher leaves the score input, or null to send nothing.
 * Nothing is sent for an ungraded answer (score null: the student is still answering, and an override
 * would stop auto-grading at submit), for blank/invalid input, or when the clamped value is unchanged.
 * The value is clamped to 0..max so the request never exceeds the question's points.
 */
export function scoreToSave(raw: string, max: number, current: number | null): number | null {
  if (current === null) return null;
  const trimmed = raw.trim();
  const n = Number(trimmed);
  if (trimmed === "" || !Number.isFinite(n)) return null;
  const score = Math.min(max, Math.max(0, n));
  return score === current ? null : score;
}

export type QuizEditorLoadState = "loading" | "error" | "notQuiz" | "ready";

/** What the quiz editor page shows for its assignment query: never spin forever on an error or a non-quiz. */
export function quizEditorLoadState(query: {
  data: { type: string } | undefined;
  isError: boolean;
}): QuizEditorLoadState {
  if (query.data) return query.data.type === "Quiz" ? "ready" : "notQuiz";
  return query.isError ? "error" : "loading";
}
