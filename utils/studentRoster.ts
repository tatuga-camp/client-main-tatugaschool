type RosterStudent = {
  title?: string;
  firstName: string;
  lastName?: string | null;
  number: string;
  createAt: Date | string;
};

// Natural order ("2" before "10", "12A" after "12"); blank numbers go last.
export function compareStudentNumber(a: string, b: string): number {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) return left ? -1 : right ? 1 : 0;
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

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
