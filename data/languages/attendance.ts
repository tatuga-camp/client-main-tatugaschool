import { Language } from "../../interfaces";

export const attendanceLanguageData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Data";
      case "th":
        return "ข้อมูลการเช็คชื่อ";
      default:
        return "Attendance Data";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "You can view the attendance data of this subject here.";
      case "th":
        return "คุณสามารถตรวจดูข้อมูลการเช็คชื่อได้ที่นี้";
      default:
        return "You can view the attendance data of this subject here.";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Table";
      case "th":
        return "สร้างตารางใหม่";
      default:
        return "Create Table";
    }
  },
  export: (language: Language) => {
    switch (language) {
      case "en":
        return "Export";
      case "th":
        return "ดาวโหลดข้อมูล";
      default:
        return "Export";
    }
  },
  edit: (language: Language) => {
    switch (language) {
      case "en":
        return "Customize / Edit";
      case "th":
        return "ปรับแต่ง / ตั้งค่า";
      default:
        return "Customize / Edit";
    }
  },
  view: (language: Language) => {
    switch (language) {
      case "en":
        return "View Table";
      case "th":
        return "ดูตารางข้อมูล";
      default:
        return "View Table";
    }
  },
  attendance_data: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendances";
      case "th":
        return "ข้อมูล";
      default:
        return "Attendances";
    }
  },
  attendance_summary: (language: Language) => {
    switch (language) {
      case "en":
        return "Summary";
      case "th":
        return "สรุป";
      default:
        return "Summary";
    }
  },
  export_excel: (language: Language) => {
    switch (language) {
      case "en":
        return "Download as Excel";
      case "th":
        return "ดาวน์โหลดเป็น Excel";
      default:
        return "Download as Excel";
    }
  },
  save_image: (language: Language) => {
    switch (language) {
      case "en":
        return "Save as Image";
      case "th":
        return "บันทึกเป็นรูปภาพ";
      default:
        return "Save as Image";
    }
  },
} as const;

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

// Attendance overview page (Attendance.tsx)
export const attendanceOverviewData = {
  student: t("Student", "นักเรียน"),
  number: t("No.", "เลขที่"),
  today: t("Today", "วันนี้"),
  sessions: (count: number) => (language: Language) =>
    language === "th"
      ? `${count} ครั้ง`
      : `${count} ${count === 1 ? "session" : "sessions"}`,
  total: t("Total", "รวม"),
  totalPresents: t("Total present", "รวมการมาเรียน"),
  totalPresentsHint: t("Sum of status values", "ผลรวมคะแนนสถานะ"),
  notRecorded: t(
    "Not recorded — click to add",
    "ยังไม่มีข้อมูล คลิกเพื่อเพิ่ม",
  ),
  openSession: t("Open this session", "เปิดการเช็คชื่อนี้"),
  hasNote: t("Has a note", "มีโน้ต"),
  scanSession: t("QR code check-in", "เช็คชื่อด้วย QR Code"),
  noTables: t("No attendance tables yet", "ยังไม่มีตารางเช็คชื่อ"),
  noTablesHint: t(
    "Create a table to start taking attendance for this subject.",
    "สร้างตารางเพื่อเริ่มเช็คชื่อในรายวิชานี้",
  ),
  noSessions: t("No attendance taken yet", "ยังไม่มีการเช็คชื่อ"),
  noSessionsHint: t(
    "Use Attendance or QR code attendance at the bottom of the subject page to add the first session.",
    "ใช้ปุ่มเช็คชื่อหรือเช็คชื่อด้วย QR Code ด้านล่างของหน้ารายวิชาเพื่อเริ่มเช็คชื่อครั้งแรก",
  ),
  noMatch: t("No students match your search", "ไม่พบนักเรียนที่ค้นหา"),
  searchStudent: t("Search name or number", "ค้นหาชื่อหรือเลขที่"),
} as const;
