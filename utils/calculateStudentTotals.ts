import { StudentOnSubject } from "../interfaces";
import { ResponseGetOverviewAssignmentService } from "../services";
import { calulateGrade, defaultGradeRule } from "./grade";
import {
  assignmentContribution,
  computeGroupTotals,
  specialContribution,
} from "./gradeColumns";

export type StudentTotal = {
  student: StudentOnSubject;
  totalScore: number;
  grade: string;
  rank: number;
  /** Assignments with status "REVIEWD" (graded). */
  gradedCount: number;
  /** Non-Material assignments the student is actually assigned. */
  assignmentCount: number;
  /** Round(gradedCount / assignmentCount * 100); null when assignmentCount === 0. */
  completionPercentage: number | null;
  /** Subtotal per tags[0] group, same math as totalScore. */
  groupTotals: Record<string, number>;
};

/**
 * Computes each active student's weighted total score and grade — the same
 * math the Grade table's "Total Score" column shows — and assigns
 * competition ranks (ties share a rank, the next rank is skipped: 1,2,2,4).
 * Ties keep student-number order. Result is sorted best rank first.
 */
export function calculateStudentTotals(
  overview: ResponseGetOverviewAssignmentService,
  studentOnSubjects: StudentOnSubject[],
): StudentTotal[] {
  const activeStudents = studentOnSubjects
    .filter((s) => s.isActive)
    .sort((a, b) => Number(a.number) - Number(b.number));

  const unranked = activeStudents.map((student) => {
    let totalScore = overview.assignments.reduce((prev, current) => {
      const score = current.students.find(
        (s) => s.studentOnSubjectId === student.id,
      )?.score;
      return (
        prev +
        assignmentContribution(
          score,
          current.assignment.maxScore,
          current.assignment.weight,
        )
      );
    }, 0);

    totalScore = overview.scoreOnSubjects.reduce((prev, scoreOnSubject) => {
      const sumRawScore = scoreOnSubject.students.reduce(
        (prev, studentOnScore) => {
          if (studentOnScore.studentOnSubjectId === student.id) {
            return (prev += studentOnScore.score);
          }
          return prev;
        },
        0,
      );

      return (
        prev +
        specialContribution(
          sumRawScore,
          scoreOnSubject.scoreOnSubject.maxScore,
          scoreOnSubject.scoreOnSubject.weight,
        )
      );
    }, totalScore);

    // Graded-completion: numerator = REVIEWD, denominator = assigned
    // non-Material assignments. scoreOnSubjects are excluded.
    let gradedCount = 0;
    let assignmentCount = 0;
    for (const current of overview.assignments) {
      if (current.assignment.type === "Material") continue;
      const studentOnAssignment = current.students.find(
        (s) => s.studentOnSubjectId === student.id,
      );
      if (!studentOnAssignment) continue; // "NO DATA" — not assigned, skip
      assignmentCount += 1;
      if (studentOnAssignment.status === "REVIEWD") {
        gradedCount += 1;
      }
    }
    const completionPercentage =
      assignmentCount === 0
        ? null
        : Math.round((gradedCount / assignmentCount) * 100);

    const grade = calulateGrade(
      overview.grade?.gradeRules ?? defaultGradeRule,
      totalScore,
    );

    return {
      student,
      totalScore,
      grade,
      gradedCount,
      assignmentCount,
      completionPercentage,
      groupTotals: computeGroupTotals(overview.assignments, student.id),
    };
  });

  // Stable sort by score desc; input is already number-ordered, so ties
  // keep student-number order. Competition ranking: 1, 2, 2, 4.
  // Ties compare at the 2-decimal precision the UI displays, so students
  // showing the same score always share a rank.
  const sorted = [...unranked].sort((a, b) => b.totalScore - a.totalScore);
  let previousScore: number | null = null;
  let previousRank = 0;
  return sorted.map((item, index) => {
    const displayScore = Number(item.totalScore.toFixed(2));
    const rank = displayScore === previousScore ? previousRank : index + 1;
    previousScore = displayScore;
    previousRank = rank;
    return { ...item, rank };
  });
}
