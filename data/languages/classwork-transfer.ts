import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

// Copying classwork between subjects: Export (this → others) and Import (other → this).
export const classworkTransferLanguage = {
  // Shared subject picker
  subjects: (l: Language) => pick(l, "Subjects", "รายวิชา"),
  noSubjects: (l: Language, year: string) =>
    pick(
      l,
      `No other subjects in ${year}`,
      `ไม่มีรายวิชาอื่นในปีการศึกษา ${year}`,
    ),
  noSubjectsBody: (l: Language) =>
    pick(
      l,
      "Try another education year or show every teacher's subjects.",
      "ลองเปลี่ยนปีการศึกษา หรือแสดงรายวิชาของครูทุกคน",
    ),
  showAllTeachers: (l: Language) =>
    pick(l, "Show all teachers", "แสดงครูทุกคน"),
  clearSearch: (l: Language) => pick(l, "Clear search", "ล้างคำค้นหา"),

  // Export
  exportHeading: (l: Language) =>
    pick(l, "Copy to other subjects", "คัดลอกไปยังรายวิชาอื่น"),
  exportBodyQuiz: (l: Language) =>
    pick(
      l,
      "Each subject gets its own copy of this quiz with every question and setting. Copies start as Draft, so nothing reaches students until you publish them.",
      "แต่ละรายวิชาจะได้สำเนาแบบทดสอบนี้ พร้อมคำถามและการตั้งค่าทั้งหมด สำเนาจะเป็นแบบร่าง นักเรียนจะยังไม่เห็นจนกว่าคุณจะเผยแพร่",
    ),
  exportBody: (l: Language) =>
    pick(
      l,
      "Each subject gets its own copy with the same files and questions, assigned to every student in that subject.",
      "แต่ละรายวิชาจะได้สำเนางานนี้ พร้อมไฟล์และคำถามเดียวกัน และมอบหมายให้นักเรียนทุกคนในรายวิชานั้น",
    ),
  selectAllShown: (l: Language) =>
    pick(l, "Select all shown", "เลือกทั้งหมดที่แสดง"),
  selected: (l: Language, count: number) =>
    pick(l, `${count} selected`, `เลือกแล้ว ${count} วิชา`),
  clearSelection: (l: Language) => pick(l, "Clear", "ล้าง"),
  selectHint: (l: Language) =>
    pick(l, "Choose the subjects to copy to", "เลือกรายวิชาที่ต้องการคัดลอกไป"),
  copyTo: (l: Language, count: number) =>
    count === 0
      ? pick(l, "Copy", "คัดลอก")
      : pick(
          l,
          `Copy to ${count} subject${count === 1 ? "" : "s"}`,
          `คัดลอกไป ${count} วิชา`,
        ),
  copying: (l: Language) => pick(l, "Copying…", "กำลังคัดลอก…"),

  // Import
  importTitle: (l: Language) => pick(l, "Import classwork", "นำเข้างาน"),
  importStep: (l: Language, step: number) =>
    pick(l, `Step ${step} of 2`, `ขั้นตอนที่ ${step} จาก 2`),
  importPickSubject: (l: Language) =>
    pick(
      l,
      "Choose the subject to copy classwork from",
      "เลือกรายวิชาที่ต้องการคัดลอกงานมา",
    ),
  importPickClasswork: (l: Language) =>
    pick(l, "Choose one classwork to copy", "เลือกงานที่ต้องการคัดลอก 1 ชิ้น"),
  back: (l: Language) => pick(l, "Back", "ย้อนกลับ"),
  close: (l: Language) => pick(l, "Close", "ปิด"),
  importButton: (l: Language) => pick(l, "Import", "นำเข้า"),
  searchClasswork: (l: Language) =>
    pick(l, "Search classwork", "ค้นหางาน"),
  noClasswork: (l: Language) =>
    pick(l, "This subject has no classwork yet", "รายวิชานี้ยังไม่มีงาน"),
  noClassworkMatch: (l: Language, query: string) =>
    pick(l, `No classwork matches “${query}”`, `ไม่พบงานที่ตรงกับ “${query}”`),
  loadFailed: (l: Language) =>
    pick(l, "Could not load classwork", "โหลดรายการงานไม่สำเร็จ"),
  quizDraftHint: (l: Language) =>
    pick(
      l,
      "The quiz is copied as Draft. You will open it next to review and publish.",
      "แบบทดสอบจะถูกคัดลอกเป็นแบบร่าง และจะเปิดให้ตรวจทานก่อนเผยแพร่",
    ),
  classworkHint: (l: Language) =>
    pick(
      l,
      "Files and questions come along. You will choose which students to assign next.",
      "ไฟล์และคำถามจะถูกคัดลอกไปด้วย จากนั้นคุณจะเลือกนักเรียนที่ต้องการมอบหมาย",
    ),
  imported: (l: Language) =>
    pick(l, "Classwork imported", "นำเข้างานเรียบร้อย"),
  files: (l: Language, count: number) =>
    pick(l, `${count} file${count === 1 ? "" : "s"}`, `${count} ไฟล์`),
  questions: (l: Language, count: number) =>
    pick(l, `${count} question${count === 1 ? "" : "s"}`, `${count} คำถาม`),
  due: (l: Language, date: string) => pick(l, `Due ${date}`, `กำหนดส่ง ${date}`),
};
