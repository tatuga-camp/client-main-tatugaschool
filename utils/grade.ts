import { GradeRule } from "../interfaces";

export function calulateGrade(
  gradeRule: GradeRule[] | undefined,
  totalScore: number
): string {
  const grade =
    gradeRule?.find((rule) => totalScore >= rule.min && totalScore <= rule.max)
      ?.grade || "N/A"; // Default grade if not found

  return grade;
}

export const defaultGradeRule = [
  {
    min: 80,
    max: 100,
    grade: "4",
  },
  {
    min: 75,
    max: 79,
    grade: "3.5",
  },
  {
    min: 70,
    max: 74,
    grade: "3",
  },
  {
    min: 65,
    max: 69,
    grade: "2.5",
  },
  {
    min: 60,
    max: 64,
    grade: "2",
  },
  {
    min: 55,
    max: 59,
    grade: "1.5",
  },
  {
    min: 50,
    max: 54,
    grade: "1",
  },
  {
    min: 0,
    max: 49,
    grade: "0",
  },
];
