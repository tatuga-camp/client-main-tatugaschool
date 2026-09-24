import { IssueStatus } from "../../../interfaces";

const styles: Record<IssueStatus, string> = {
  OPEN: "bg-error-color/10 text-error-color",
  RESOLVED: "bg-success-color/10 text-success-color",
};

const labels: Record<IssueStatus, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
};

export default function IssueStatusPill({ status }: { status: IssueStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
