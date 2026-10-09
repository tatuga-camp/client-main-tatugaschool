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
