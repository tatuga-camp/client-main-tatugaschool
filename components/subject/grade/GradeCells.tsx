import { gradeTableData } from "../../../data/languages";
import {
  Language,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../../interfaces";
import {
  AssignmentEntry,
  assignmentContribution,
  formatScore,
  SpecialEntry,
  specialContribution,
} from "../../../utils";
import GradeStatusPill from "./GradeStatusPill";

const CELL_BUTTON =
  "flex h-14 w-full flex-col items-center justify-center gap-0.5 px-2 transition-colors ";

export type PendingStatus = Exclude<StudentAssignmentStatus, "REVIEWD">;

export const STYLES_GRADE_STATUS: Record<PendingStatus, string> = {
  SUBMITTED: "bg-info-color/10 text-info-color",
  IMPROVED: "bg-warning-color/20 text-amber-700",
  PENDDING: "bg-error-color text-white",
};

export function GradeAssignmentCell({
  entry,
  studentOnAssignment,
  language,
  onClick,
}: {
  entry: AssignmentEntry;
  studentOnAssignment?: StudentOnAssignment;
  language: Language;
  onClick: () => void;
}) {
  if (!studentOnAssignment) {
    return (
      <div
        title={gradeTableData.notAssigned(language)}
        className="flex h-14 items-center justify-center text-sm text-gray-300"
      >
        —
      </div>
    );
  }
  const { assignment } = entry;
  const weighted = assignment.weight !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CELL_BUTTON} ${studentOnAssignment.status !== "REVIEWD" && STYLES_GRADE_STATUS[studentOnAssignment.status]} `}
    >
      {studentOnAssignment.status === "REVIEWD" ? (
        <>
          <span className="text-sm font-semibold tabular-nums text-icon-color">
            {formatScore(
              assignmentContribution(
                studentOnAssignment.score,
                assignment.maxScore,
                assignment.weight,
              ),
            )}
          </span>
          {weighted && (
            <span className="text-[11px] tabular-nums text-gray-400">
              ({formatScore(studentOnAssignment.score ?? 0)})
            </span>
          )}
        </>
      ) : (
        <GradeStatusPill
          status={studentOnAssignment.status}
          language={language}
        />
      )}
    </button>
  );
}

export function GradeSpecialCell({
  entry,
  studentOnSubjectId,
  onClick,
}: {
  entry: SpecialEntry;
  studentOnSubjectId: string;
  onClick: () => void;
}) {
  const scores = entry.students.filter(
    (s) => s.studentOnSubjectId === studentOnSubjectId,
  );
  if (scores.length === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${CELL_BUTTON} text-sm text-gray-300`}
      >
        —
      </button>
    );
  }
  const sumRaw = scores.reduce((sum, s) => sum + s.score, 0);
  const { maxScore, weight } = entry.scoreOnSubject;
  return (
    <button type="button" onClick={onClick} className={CELL_BUTTON}>
      <span className="text-sm font-semibold tabular-nums text-icon-color">
        {formatScore(specialContribution(sumRaw, maxScore, weight))}
      </span>
      {weight !== null && (
        <span className="text-[11px] tabular-nums text-gray-400">
          ({formatScore(sumRaw)})
        </span>
      )}
    </button>
  );
}
