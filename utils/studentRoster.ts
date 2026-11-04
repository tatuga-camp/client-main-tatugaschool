type RosterStudent = {
  title?: string;
  firstName: string;
  lastName?: string | null;
  number: string;
  createAt: Date | string;
};

// Thai digits ๐-๙ (U+0E50-U+0E59) -> ASCII 0-9, so "๑๐" sorts as 10.
// `Number("๑")` is NaN, which is why Thai-numbered rosters never sorted.
const THAI_DIGIT_ZERO = 0x0e50;
export function normalizeStudentNumber(
  value: string | number | null | undefined,
): string {
  return String(value ?? "")
    .trim()
    .replace(/[\u0E50-\u0E59]/g, (d) =>
      String(d.charCodeAt(0) - THAI_DIGIT_ZERO),
    );
}

// Natural order ("2" before "10", "12A" after "12", "๓" between "2" and "4");
// blank numbers go last.
export function compareStudentNumber(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  const left = normalizeStudentNumber(a);
  const right = normalizeStudentNumber(b);
  if (!left || !right) return left ? -1 : right ? 1 : 0;
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/** Comparator for anything with a `number` field: roster order. */
export const byStudentNumber = (
  a: { number: string | number | null | undefined },
  b: { number: string | number | null | undefined },
): number => compareStudentNumber(a.number, b.number);

const time = (value: Date | string) => new Date(value).getTime();

export function sortStudents<T extends RosterStudent>(
  students: T[],
  sortBy: string,
): T[] {
  const list = [...students];
  switch (sortBy) {
    case "Newest":
      return list.sort((a, b) => time(b.createAt) - time(a.createAt));
    case "Oldest":
      return list.sort((a, b) => time(a.createAt) - time(b.createAt));
    case "AZ":
      return list.sort((a, b) => a.firstName.localeCompare(b.firstName, "th"));
    case "ZA":
      return list.sort((a, b) => b.firstName.localeCompare(a.firstName, "th"));
    default:
      return list.sort((a, b) => compareStudentNumber(a.number, b.number));
  }
}

export function filterStudents<T extends RosterStudent>(
  students: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return students;
  return students.filter((student) =>
    [
      student.title ?? "",
      student.firstName,
      student.lastName ?? "",
      student.number,
      `${student.firstName} ${student.lastName ?? ""}`,
    ].some((value) => value.toLowerCase().includes(q)),
  );
}

export function studentDisplayName(student: {
  title?: string;
  firstName: string;
  lastName?: string | null;
}): string {
  return [student.title, student.firstName, student.lastName]
    .filter((part) => part && part.trim())
    .join(" ");
}
