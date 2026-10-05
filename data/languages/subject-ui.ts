import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const subjectUiLanguage = {
  teacherFilter: (l: Language) => pick(l, "Teacher", "ครูผู้สอน"),
  classroomFilter: (l: Language) => pick(l, "Classroom", "ห้องเรียน"),
  allClassrooms: (l: Language) => pick(l, "All classrooms", "ทุกห้องเรียน"),
  showAllClassrooms: (l: Language) =>
    pick(l, "Show all classrooms", "แสดงทุกห้องเรียน"),
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
  nameLabel: (l: Language) => pick(l, "Subject name", "ชื่อวิชา"),
  namePlaceholder: (l: Language) =>
    pick(l, "e.g. Mathematics 1", "เช่น คณิตศาสตร์ 1"),
  descriptionLabel: (l: Language) => pick(l, "Description", "คำอธิบาย"),
  descriptionPlaceholder: (l: Language) =>
    pick(l, "What will students learn?", "เช่น รหัสรายวิชา"),
  pickClassroom: (l: Language) =>
    pick(l, "Choose a classroom", "เลือกห้องเรียน"),
  pickClassroomHint: (l: Language) =>
    pick(
      l,
      "The subject uses this classroom's student list.",
      "วิชานี้จะใช้รายชื่อนักเรียนจากห้องเรียนที่เลือก",
    ),
  searchClassrooms: (l: Language) =>
    pick(l, "Search classrooms", "ค้นหาห้องเรียน"),
  noClassroomMatch: (l: Language, query: string) =>
    pick(
      l,
      `No classrooms match “${query}”`,
      `ไม่พบห้องเรียนที่ตรงกับ “${query}”`,
    ),
  required: (l: Language) => pick(l, "Fill in this field", "กรุณากรอกช่องนี้"),
  classroomRequired: (l: Language) =>
    pick(
      l,
      "Choose a classroom for this subject",
      "กรุณาเลือกห้องเรียนของวิชานี้",
    ),
  created: (l: Language) => pick(l, "Subject created", "สร้างวิชาแล้ว"),
  creating: (l: Language) => pick(l, "Creating…", "กำลังสร้าง…"),
  goToClasses: (l: Language) =>
    pick(l, "Go to Classrooms", "ไปที่หน้าห้องเรียน"),
  classroomSubjectsHint: (l: Language) =>
    pick(
      l,
      "Subjects whose students come from this classroom.",
      "วิชาที่ใช้รายชื่อนักเรียนจากห้องเรียนนี้",
    ),
};
