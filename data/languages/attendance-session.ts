import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

// Shared copy for the take-attendance (AttendanceChecker) and
// QR-code attendance (AttendanceQRcode) popups.
export const attendanceSessionDataLanguage = {
  detailTitle: t("Attendance details", "รายละเอียดการเช็คชื่อ"),
  detailDescription: t(
    "Review or update what was recorded for this session.",
    "ตรวจสอบหรือแก้ไขการเช็คชื่อของคาบนี้",
  ),
  table: t("Attendance table", "ตารางเช็คชื่อ"),
  classTime: t("Class time", "เวลาเรียน"),
  startTime: t("Starts", "เวลาเริ่ม"),
  endTime: t("Ends", "เวลาจบ"),
  classTimeHint: t(
    "End time is set to one hour after the start. You can change it.",
    "เวลาจบจะตั้งเป็นหนึ่งชั่วโมงหลังเวลาเริ่มโดยอัตโนมัติ และแก้ไขได้",
  ),
  studentsTab: t("Students", "นักเรียน"),
  noteTab: t("Note", "โน้ต"),
  generalNote: t("General note", "โน้ตของคาบนี้"),
  generalNoteHint: t(
    "Shared note for this session, e.g. topic covered or announcements.",
    "โน้ตสำหรับคาบนี้ เช่น หัวข้อที่สอน หรือประกาศ",
  ),
  searchStudent: t("Search name or number", "ค้นหาชื่อหรือเลขที่"),
  markAll: t("Mark everyone as", "เช็คทุกคนเป็น"),
  marked: (marked: number, total: number) => (language: Language) =>
    language === "th"
      ? `เช็คแล้ว ${marked} จาก ${total} คน`
      : `${marked} of ${total} marked`,
  student: t("Student", "นักเรียน"),
  note: t("Note", "โน้ต"),
  notePlaceholder: t("Add a note", "เพิ่มโน้ต"),
  noStudents: t("No students yet", "ยังไม่มีนักเรียน"),
  noStudentsHint: t(
    "Students added to this subject will appear here.",
    "นักเรียนที่เพิ่มเข้ารายวิชานี้จะแสดงที่นี่",
  ),
  noMatch: t("No students match your search", "ไม่พบนักเรียนที่ค้นหา"),
  showQRCode: t("Show QR code", "แสดง QR Code"),
  cancel: t("Cancel", "ยกเลิก"),
  delete: t("Delete", "ลบ"),
  deleteConfirm: t(
    "Delete this attendance session? This cannot be undone.",
    "ต้องการลบการเช็คชื่อนี้ใช่ไหม? ไม่สามารถย้อนกลับได้",
  ),
  save: t("Save attendance", "บันทึกการเช็คชื่อ"),
  saveChanges: t("Save changes", "บันทึกการแก้ไข"),
  close: t("Close", "ปิด"),

  // QR code
  qrSettings: t("QR code settings", "ตั้งค่า QR Code"),
  scanWindow: t("Scanning window", "ช่วงเวลาสแกน"),
  scanWindowHint: t(
    "Students can only check in with the QR code during this window.",
    "นักเรียนสแกน QR Code เพื่อเช็คชื่อได้เฉพาะในช่วงเวลานี้",
  ),
  scanOpens: t("Opens at", "เปิดให้สแกน"),
  scanCloses: t("Closes at", "ปิดการสแกน"),
  // value comes from Intl.RelativeTimeFormat ("in 3 hours" / "ในอีก 3 ชั่วโมง")
  closesIn: (value: string) => (language: Language) =>
    language === "th" ? `ปิด${value}` : `Closes ${value}`,
  closed: t("This time has already passed", "เวลานี้ผ่านไปแล้ว"),
  multipleScans: t("Allow multiple scans", "สแกนได้หลายครั้ง"),
  multipleScansOn: t(
    "Students can scan again to update their check-in.",
    "นักเรียนสแกนซ้ำเพื่ออัปเดตการเช็คชื่อได้",
  ),
  multipleScansOff: t(
    "Each student can scan only once.",
    "นักเรียนแต่ละคนสแกนได้ครั้งเดียว",
  ),
  qrInfo: t(
    "After you create it, show the QR code on your screen. Students scan it with their phone to check in.",
    "หลังจากสร้างแล้ว ให้แสดง QR Code บนหน้าจอ นักเรียนใช้โทรศัพท์สแกนเพื่อเช็คชื่อ",
  ),
  createQRCode: t("Create QR code", "สร้าง QR Code"),
} as const;
