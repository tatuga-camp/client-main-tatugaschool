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

// A friendly icon guessed from the subject title (English or Thai). Order
// matters: "วิทยาการคำนวณ" (computing) contains "วิทยา" (science).
const SUBJECT_EMOJI: { pattern: RegExp; emoji: string }[] = [
  { pattern: /\b(computer|computing|coding|programming|technology|ict)\b|คอมพิวเตอร์|วิทยาการคำนวณ|เทคโนโลยี/i, emoji: "💻" },
  { pattern: /\b(math|maths|mathematics|algebra|geometry|calculus)\b|คณิต/i, emoji: "📐" },
  { pattern: /\b(science|physics|chemistry|biology)\b|วิทยาศาสตร์|ฟิสิกส์|เคมี|ชีว/i, emoji: "🔬" },
  { pattern: /\b(english|reading|writing|grammar)\b|ภาษาอังกฤษ/i, emoji: "🔤" },
  { pattern: /\bthai\b|ภาษาไทย/i, emoji: "📖" },
  { pattern: /\b(chinese|japanese|korean|french|german|spanish)\b|ภาษาจีน|ภาษาญี่ปุ่น|ภาษาเกาหลี|ภาษาฝรั่งเศส/i, emoji: "🗣️" },
  { pattern: /\b(art|arts|drawing|painting|design)\b|ศิลป|ทัศนศิลป์/i, emoji: "🎨" },
  { pattern: /\b(music|band|choir)\b|ดนตรี|นาฏศิลป์/i, emoji: "🎵" },
  { pattern: /\b(pe|physical education|sport|sports|health)\b|พลศึกษา|สุขศึกษา|กีฬา/i, emoji: "⚽" },
  { pattern: /\b(social|history|geography|civics)\b|สังคม|ประวัติศาสตร์|ภูมิศาสตร์/i, emoji: "🌏" },
  { pattern: /\b(career|cooking|home economics)\b|การงานอาชีพ/i, emoji: "🧰" },
];

export function subjectEmoji(title: string): string {
  return SUBJECT_EMOJI.find((rule) => rule.pattern.test(title))?.emoji ?? "📚";
}

// Soft header tints from the theme palette; stable for a given subject.
const SUBJECT_TINTS = [
  "bg-primary-color/10",
  "bg-success-color/15",
  "bg-warning-color/25",
  "bg-secondary-color/20",
  "bg-error-color/10",
  "bg-icon-color/10",
];

export function subjectTint(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SUBJECT_TINTS[hash % SUBJECT_TINTS.length];
}
