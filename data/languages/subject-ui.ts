import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const subjectUiLanguage = {
  teacherFilter: (l: Language) => pick(l, "Teacher", "ครูผู้สอน"),
  emptyYear: (l: Language, year: string) =>
    pick(l, `No subjects in ${year}`, `ยังไม่มีวิชาในปีการศึกษา ${year}`),
  emptyYearBody: (l: Language) =>
    pick(
      l,
      "Create a subject, or switch the education year.",
      "สร้างวิชาใหม่ หรือเปลี่ยนปีการศึกษา",
    ),
  emptyTeacher: (l: Language, year: string) =>
    pick(
      l,
      `No subjects for this teacher in ${year}`,
      `ครูท่านนี้ยังไม่มีวิชาในปีการศึกษา ${year}`,
    ),
  noMatch: (l: Language, query: string) =>
    pick(l, `No subjects match “${query}”`, `ไม่พบวิชาที่ตรงกับ “${query}”`),
  reorderOff: (l: Language) =>
    pick(
      l,
      "Set sort to Default to drag subjects into a new order.",
      "เปลี่ยนการเรียงเป็น “ค่าเริ่มต้น” เพื่อลากจัดลำดับวิชา",
    ),
  duplicate: (l: Language) => pick(l, "Duplicate subject", "ทำสำเนาวิชา"),
  locked: (l: Language) => pick(l, "Locked", "ล็อกอยู่"),
  educationYear: (l: Language, year: string) =>
    pick(l, `Year ${year}`, `ปีการศึกษา ${year}`),
  subjectsHeading: (l: Language, n: number) =>
    pick(l, `Subjects (${n})`, `วิชาเรียน (${n})`),
  classroomEmpty: (l: Language, year: string) =>
    pick(
      l,
      `No subjects for this classroom in ${year}`,
      `ห้องเรียนนี้ยังไม่มีวิชาในปีการศึกษา ${year}`,
    ),
  classroomEmptyBody: (l: Language) =>
    pick(
      l,
      "Create a subject for this classroom, or switch the education year.",
      "สร้างวิชาให้ห้องเรียนนี้ หรือเปลี่ยนปีการศึกษา",
    ),
  classroomSubjectsHint: (l: Language) =>
    pick(
      l,
      "Subjects whose students come from this classroom.",
      "วิชาที่ใช้รายชื่อนักเรียนจากห้องเรียนนี้",
    ),
};
