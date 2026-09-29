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
  const shortLabel =
    status === "IMPROVED" ? gradeData.need_improvement_short(language) : label;
  return (
    <span
      title={label}
      className={`inline-flex max-w-full items-center text-center text-[10px] font-medium leading-tight md:w-max md:rounded-full md:px-2 md:py-0.5 md:text-xs`}
    >
      <span className="md:hidden">{shortLabel}</span>
      <span className="hidden md:inline">{label}</span>
    </span>
  );
}

export default GradeStatusPill;
