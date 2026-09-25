import { gradeData } from "../../../data/languages";
import { Language, StudentAssignmentStatus } from "../../../interfaces";
import { PendingStatus } from "./GradeCells";

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
      className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-medium`}
    >
      {label}
    </span>
  );
}

export default GradeStatusPill;
