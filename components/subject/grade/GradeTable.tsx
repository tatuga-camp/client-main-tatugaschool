import React from "react";
import { TbChevronDown, TbChevronRight, TbEyeOff } from "react-icons/tb";
import { gradeTableData } from "../../../data/languages";
import {
  Assignment,
  Language,
  ScoreOnSubject,
  StudentOnAssignment,
  StudentOnSubject,
} from "../../../interfaces";
import {
  formatScore,
  GradeColumn,
  GradeSegment,
  StudentTotal,
} from "../../../utils";
import { GradeAssignmentCell, GradeSpecialCell } from "./GradeCells";
import GradeStudentCell from "./GradeStudentCell";

// Opaque equivalent of bg-primary-color/5 over white (#2C7CD1 @ 5%) —
// sticky cells must be opaque or scrolled content shows through.
const TINT = "bg-[#F4F8FD]";
const HEAD =
  "border-b border-r border-gray-100 bg-background-color p-0 text-left align-bottom font-normal";

type Props = {
  subjectId: string;
  language: Language;
  segments: GradeSegment[];
  columns: GradeColumn[];
  students: StudentOnSubject[];
  totalsByStudentId: Map<string, StudentTotal>;
  totalMax: number;
  loading: boolean;
  onToggleGroup: (tag: string) => void;
  onOpenAssignment: (
    assignment: Assignment,
    studentOnAssignment?: StudentOnAssignment,
  ) => void;
  onOpenSpecial: (
    scoreOnSubject: ScoreOnSubject,
    student?: StudentOnSubject,
  ) => void;
};

function GradeTable({
  subjectId,
  language,
  segments,
  columns,
  students,
  totalsByStudentId,
  totalMax,
  loading,
  onToggleGroup,
  onOpenAssignment,
  onOpenSpecial,
}: Props) {
  const hasGroups = segments.some((s) => s.kind === "group");
  const headRowSpan = hasGroups ? 2 : 1;

  const renderColumnHeader = (column: GradeColumn, rowSpan: number) => {
    if (column.kind === "assignment") {
      const { assignment } = column.entry;
      const hidden = assignment.allowStudentViewScore === false;
      return (
        <th key={column.key} rowSpan={rowSpan} className={HEAD}>
          <button
            type="button"
            onClick={() => onOpenAssignment(assignment)}
            className="flex w-40 flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-gray-100"
          >
            <span className="flex w-full items-center gap-1 text-xs font-semibold text-icon-color">
              <span className="truncate" title={assignment.title}>
                {assignment.title}
              </span>
              {hidden && (
                <TbEyeOff
                  title={gradeTableData.scoreHiddenFromStudents(language)}
                  className="shrink-0 text-gray-400"
                />
              )}
            </span>
            <span className="text-[11px] tabular-nums text-gray-500">
              {assignment.maxScore} {gradeTableData.points(language)}
              {assignment.weight !== null && ` · ${assignment.weight}%`}
            </span>
          </button>
        </th>
      );
    }
    if (column.kind === "special") {
      const { scoreOnSubject } = column.entry;
      return (
        <th key={column.key} rowSpan={rowSpan} className={HEAD}>
          <button
            type="button"
            onClick={() => onOpenSpecial(scoreOnSubject)}
            className="flex w-36 flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-gray-100"
          >
            <span
              className="w-full truncate text-xs font-semibold text-icon-color"
              title={scoreOnSubject.title}
            >
              {scoreOnSubject.title}
            </span>
            <span className="text-[11px] text-gray-500">
              {gradeTableData.special(language)}
              {scoreOnSubject.maxScore !== null &&
                ` · ${scoreOnSubject.maxScore} ${gradeTableData.points(language)}`}
              {scoreOnSubject.weight !== null && ` · ${scoreOnSubject.weight}%`}
            </span>
          </button>
        </th>
      );
    }
    return (
      <th
        key={column.key}
        rowSpan={rowSpan}
        className={`border-b border-r border-gray-100 p-0 text-left align-bottom font-normal ${TINT}`}
      >
        <div className="flex w-32 flex-col items-start gap-0.5 px-3 py-2">
          <span
            className="w-full truncate text-xs font-semibold text-primary-color"
            title={column.tag}
          >
            {column.tag} {gradeTableData.groupTotal(language)}
          </span>
          <span className="text-[11px] tabular-nums text-gray-500">
            {formatScore(column.maxTotal)} {gradeTableData.points(language)}
          </span>
        </div>
      </th>
    );
  };

  const renderBodyCell = (column: GradeColumn, student: StudentOnSubject) => {
    if (column.kind === "subtotal") {
      const value =
        totalsByStudentId.get(student.id)?.groupTotals[column.tag] ?? 0;
      return (
        <td
          key={column.key}
          className={`border-b border-r border-gray-100 p-0 ${TINT}`}
        >
          <div className="flex h-14 items-center justify-center text-sm font-semibold tabular-nums text-primary-color">
            {formatScore(value)}
          </div>
        </td>
      );
    }
    return (
      <td
        key={column.key}
        className="border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color"
      >
        {column.kind === "assignment" ? (
          <GradeAssignmentCell
            entry={column.entry}
            studentOnAssignment={column.entry.students.find(
              (s) => s.studentOnSubjectId === student.id,
            )}
            language={language}
            onClick={() => {
              const studentOnAssignment = column.entry.students.find(
                (s) => s.studentOnSubjectId === student.id,
              );
              onOpenAssignment(column.entry.assignment, studentOnAssignment);
            }}
          />
        ) : (
          <GradeSpecialCell
            entry={column.entry}
            studentOnSubjectId={student.id}
            onClick={() => onOpenSpecial(column.entry.scoreOnSubject, student)}
          />
        )}
      </td>
    );
  };

  return (
    <div className="relative h-[30rem] w-full overflow-auto rounded-2xl border border-gray-200 bg-white 2xl:h-[40rem]">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-30">
          <tr>
            <th
              rowSpan={headRowSpan}
              className={`sticky left-0 z-40 ${HEAD} px-3 py-2 align-middle text-xs font-medium text-gray-500`}
            >
              {gradeTableData.student(language)}
            </th>
            {segments.map((segment) =>
              segment.kind === "single" ? (
                renderColumnHeader(segment.column, headRowSpan)
              ) : (
                <th
                  key={`band:${segment.tag}`}
                  colSpan={segment.columns.length}
                  className="border-b border-r border-gray-100 bg-background-color p-0 text-left font-normal"
                >
                  <button
                    type="button"
                    onClick={() => onToggleGroup(segment.tag)}
                    aria-expanded={!segment.collapsed}
                    title={
                      segment.collapsed
                        ? gradeTableData.expandGroup(language)
                        : gradeTableData.collapseGroup(language)
                    }
                    className="flex w-full items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-color hover:bg-gray-100"
                  >
                    {segment.collapsed ? <TbChevronRight /> : <TbChevronDown />}
                    <span className="truncate">{segment.tag}</span>
                    <span className="shrink-0 font-normal text-gray-500">
                      ·{" "}
                      {gradeTableData.assignmentsCount(
                        language,
                        segment.assignmentCount,
                      )}
                    </span>
                  </button>
                </th>
              ),
            )}
            <th
              rowSpan={headRowSpan}
              className={`z-30 border-b border-r border-gray-100 px-3 py-2 text-left align-bottom font-normal lg:sticky lg:right-20 ${TINT}`}
            >
              <div className="flex w-24 flex-col gap-0.5">
                <span className="text-xs font-semibold text-icon-color">
                  {gradeTableData.total(language)}
                </span>
                <span className="text-[11px] tabular-nums text-gray-500">
                  {formatScore(totalMax)} {gradeTableData.points(language)}
                </span>
              </div>
            </th>
            <th
              rowSpan={headRowSpan}
              className={`z-30 w-20 min-w-20 border-b border-gray-100 px-3 py-2 text-left align-bottom text-xs font-semibold text-icon-color lg:sticky lg:right-0 ${TINT}`}
            >
              {gradeTableData.grade(language)}
            </th>
          </tr>
          {hasGroups && (
            <tr>
              {segments.flatMap((segment) =>
                segment.kind === "group"
                  ? segment.columns.map((column) =>
                      renderColumnHeader(column, 1),
                    )
                  : [],
              )}
            </tr>
          )}
        </thead>
        <tbody>
          {loading
            ? [...Array(8)].map((_, row) => (
                <tr key={row}>
                  {[...Array(7)].map((__, cell) => (
                    <td key={cell} className="border-b border-gray-100 p-2">
                      <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            : students.map((student) => {
                const totals = totalsByStudentId.get(student.id);
                return (
                  <tr key={student.id} className="group">
                    <GradeStudentCell
                      student={student}
                      subjectId={subjectId}
                      completionPercentage={
                        totals?.completionPercentage ?? null
                      }
                      language={language}
                    />
                    {columns.map((column) => renderBodyCell(column, student))}
                    <td
                      className={`z-20 border-b border-r border-gray-100 p-0 lg:sticky lg:right-20 ${TINT}`}
                    >
                      <div className="flex h-14 w-24 items-center justify-center text-sm font-semibold tabular-nums text-icon-color">
                        {formatScore(totals?.totalScore ?? 0)}
                      </div>
                    </td>
                    <td
                      className={`z-20 w-20 min-w-20 border-b border-gray-100 p-0 lg:sticky lg:right-0 ${TINT}`}
                    >
                      <div className="flex h-14 items-center justify-center text-sm font-semibold text-icon-color">
                        {totals?.grade ?? "N/A"}
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

export default GradeTable;
