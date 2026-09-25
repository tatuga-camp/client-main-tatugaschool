import { Language } from "../../interfaces";

const text = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

export const gradeTableData = {
  byAssignment: text("By assignment", "แยกตามงาน"),
  byTagGroup: text("By tag group", "แยกตามกลุ่มแท็ก"),
  student: text("Student", "นักเรียน"),
  number: text("No.", "เลขที่"),
  points: text("pts", "คะแนน"),
  special: text("Special", "คะแนนพิเศษ"),
  total: text("Total", "คะแนนรวม"),
  grade: text("Grade", "เกรด"),
  groupTotal: text("total", "รวม"),
  assignmentsCount: (language: Language, count: number) =>
    language === "th"
      ? `${count} งาน`
      : `${count} ${count === 1 ? "assignment" : "assignments"}`,
  notAssigned: text("Not assigned", "ไม่ได้มอบหมาย"),
  scoreHiddenFromStudents: text(
    "Score hidden from students",
    "ซ่อนคะแนนจากนักเรียน",
  ),
  report: text("Report", "รายงาน"),
  collapseGroup: text("Collapse group", "ย่อกลุ่ม"),
  expandGroup: text("Expand group", "ขยายกลุ่ม"),
  share: text("Share", "แชร์"),
  shared: text("Shared", "กำลังแชร์"),
  shareTitle: text("Share progress link", "แชร์ลิงก์ติดตามความคืบหน้า"),
  shareDescription: text(
    "Anyone with the link can see this class's progress — no sign-in needed.",
    "ทุกคนที่มีลิงก์สามารถดูความคืบหน้าของห้องเรียนนี้ได้ โดยไม่ต้องเข้าสู่ระบบ",
  ),
  linkLabel: text("Share link", "ลิงก์สำหรับแชร์"),
  visibility: text("What people can see", "สิ่งที่ผู้ชมจะเห็น"),
  levelStatus: text("Status only", "สถานะเท่านั้น"),
  levelStatusHint: text(
    "Submitted / waiting review / no work.",
    "ส่งแล้ว / รอตรวจ / ยังไม่ส่ง",
  ),
  levelScore: text("Scores", "คะแนน"),
  levelScoreHint: text(
    "Also shows scores, tag subtotals and total. Hidden scores stay hidden.",
    "แสดงคะแนน คะแนนรวมแต่ละกลุ่ม และคะแนนรวมด้วย คะแนนที่ซ่อนไว้จะยังถูกซ่อน",
  ),
  levelGrade: text("Scores + Grade", "คะแนน + เกรด"),
  levelGradeHint: text(
    "Also shows each student's final grade.",
    "แสดงเกรดของนักเรียนแต่ละคนด้วย",
  ),
  createLink: text("Create link", "สร้างลิงก์"),
  copy: text("Copy", "คัดลอก"),
  copied: text("Link copied", "คัดลอกลิงก์แล้ว"),
  copyFailed: text("Could not copy the link", "คัดลอกลิงก์ไม่สำเร็จ"),
  open: text("Open", "เปิด"),
  levelSaved: text("Visibility updated", "อัปเดตการแสดงผลแล้ว"),
  stopSharing: text("Stop sharing", "หยุดแชร์"),
  stopSharingConfirm: text(
    "The current link will stop working. Sharing again creates a new link.",
    "ลิงก์ปัจจุบันจะใช้งานไม่ได้ทันที หากแชร์อีกครั้งจะได้ลิงก์ใหม่",
  ),
  cancel: text("Cancel", "ยกเลิก"),
  close: text("Close", "ปิด"),
};
