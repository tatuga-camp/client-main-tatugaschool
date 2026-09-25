import { gradeData } from "../../../data/languages";
import { Language, StudentAssignmentStatus } from "../../../interfaces";

type PendingStatus = Exclude<StudentAssignmentStatus, "REVIEWD">;

const STYLES: Record<PendingStatus, string> = {
  SUBMITTED: "bg-info-color/10 text-info-color",
  IMPROVED: "bg-warning-color/20 text-amber-700",
  PENDDING: "bg-error-color/10 text-error-color",
};

function GradeStatusPill({
  status,
  language,
}: {
  status: PendingStatus;
  language: Language;
}) {
  const label =
    status === "SUBMITTED"
      ? gradeData.wait_reviewed(language)
      : status === "IMPROVED"
        ? gradeData.need_improvement(language)
        : gradeData.no_work(language);
  return (
    <span
      className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}

export default GradeStatusPill;
