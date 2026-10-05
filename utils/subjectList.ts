type ListSubject = {
  title: string;
  description?: string | null;
  educationYear: string;
  classId: string;
  order?: number | null;
  createAt: Date | string;
  teachers: { userId: string; firstName: string; lastName: string; email: string }[];
  class: { title: string; level: string; description?: string | null };
};

export type SubjectFilter = {
  query?: string;
  // "all" or undefined shows every teacher's subjects.
  teacherId?: string;
  classId?: string;
};

// All filters apply together, so searching never drops the teacher filter.
export function filterSubjects<T extends ListSubject>(
  subjects: T[],
  { query = "", teacherId, classId }: SubjectFilter,
): T[] {
  const q = query.trim().toLowerCase();
  return subjects.filter((subject) => {
    if (teacherId && teacherId !== "all") {
      if (!subject.teachers.some((teacher) => teacher.userId === teacherId)) {
        return false;
      }
    }
    if (classId && subject.classId !== classId) return false;
    if (!q) return true;
    return [
      subject.title,
      subject.description ?? "",
      subject.educationYear,
      subject.class.title,
      subject.class.level,
      subject.class.description ?? "",
      ...subject.teachers.flatMap((teacher) => [
        teacher.firstName,
        teacher.lastName,
        teacher.email,
      ]),
    ].some((value) => value.toLowerCase().includes(q));
  });
}

const time = (value: Date | string) => new Date(value).getTime();

export function sortSubjects<T extends ListSubject>(
  subjects: T[],
  sortBy: string,
): T[] {
  const list = [...subjects];
  switch (sortBy) {
    case "Newest":
      return list.sort((a, b) => time(b.createAt) - time(a.createAt));
    case "Oldest":
      return list.sort((a, b) => time(a.createAt) - time(b.createAt));
    case "AZ":
      return list.sort((a, b) => a.title.localeCompare(b.title, "th"));
    case "ZA":
      return list.sort((a, b) => b.title.localeCompare(a.title, "th"));
    default:
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

// Dragging only makes sense while cards show in their stored order.
export function canReorderSubjects(sortBy: string): boolean {
  return sortBy === "Default";
}
