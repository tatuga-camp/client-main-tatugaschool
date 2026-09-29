import { Language } from "../../interfaces";

export const attendanceTableSettingLanguage = {
  generalSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "General Settings";
      case "th":
        return "การตั้งค่าทั่วไป";
      default:
        return "General Settings";
    }
  },
  manageGeneralSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your general settings";
      case "th":
        return "จัดการการตั้งค่าทั่วไปของคุณ";
      default:
        return "Manage your general settings";
    }
  },
  subjectInformation: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Information";
      case "th":
        return "ข้อมูลรายวิชา";
      default:
        return "Subject Information";
    }
  },
  tableName: (language: Language) => {
    switch (language) {
      case "en":
        return "Table Name:";
      case "th":
        return "ชื่อตาราง:";
      default:
        return "Table Name:";
    }
  },
  tableNamePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Table Name";
      case "th":
        return "ชื่อตาราง";
      default:
        return "Table Name";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Description:";
      case "th":
        return "คำอธิบาย:";
      default:
        return "Description:";
    }
  },
  descriptionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Description";
      case "th":
        return "คำอธิบาย";
      default:
        return "Description";
    }
  },
  saveChanges: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Changes";
      case "th":
        return "บันทึกการเปลี่ยนแปลง";
      default:
        return "Save Changes";
    }
  },
  attendanceStatus: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status";
      case "th":
        return "สถานะการเช็คชื่อ";
      default:
        return "Attendance Status";
    }
  },
  customizeStatus: (language: Language) => {
    switch (language) {
      case "en":
        return "Customize your attendance status here";
      case "th":
        return "ปรับแต่งสถานะการเช็คชื่อของคุณที่นี่";
      default:
        return "Customize your attendance status here";
    }
  },
  name: (language: Language) => {
    switch (language) {
      case "en":
        return "Name";
      case "th":
        return "ชื่อ";
      default:
        return "Name";
    }
  },
  color: (language: Language) => {
    switch (language) {
      case "en":
        return "Color";
      case "th":
        return "สี";
      default:
        return "Color";
    }
  },
  value: (language: Language) => {
    switch (language) {
      case "en":
        return "Value";
      case "th":
        return "ค่า";
      default:
        return "Value";
    }
  },
  status: (language: Language) => {
    switch (language) {
      case "en":
        return "Status";
      case "th":
        return "สถานะ";
      default:
        return "Status";
    }
  },
  dangerZone: (language: Language) => {
    switch (language) {
      case "en":
        return "Danger zone";
      case "th":
        return "พื้นที่อันตราย";
      default:
        return "Danger zone";
    }
  },
  irreversibleAction: (language: Language) => {
    switch (language) {
      case "en":
        return "Irreversible and destructive actions";
      case "th":
        return "การกระทำที่ไม่สามารถย้อนกลับได้และเป็นอันตราย";
      default:
        return "Irreversible and destructive actions";
    }
  },
  deleteTable: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Attendance Table";
      case "th":
        return "ลบตารางการเช็คชื่อนี้";
      default:
        return "Delete This Attendance Table";
    }
  },
  deleteTableWarning: (language: Language) => {
    switch (language) {
      case "en":
        return "This action is irreversible and will delete all attendance data associated with this table. Cannot be undone.";
      case "th":
        return "การดำเนินการนี้ไม่สามารถย้อนกลับได้และจะลบข้อมูลการเช็คชื่อทั้งหมดที่เกี่ยวข้องกับตารางนี้ ไม่สามารถกู้คืนได้";
      default:
        return "This action is irreversible and will delete all attendance data associated with this table. Cannot be undone.";
    }
  },
  deleteTableButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Table";
      case "th":
        return "ลบตารางนี้";
      default:
        return "Delete This Table";
    }
  },
  updated: (language: Language) => {
    switch (language) {
      case "en":
        return "Updated";
      case "th":
        return "อัปเดตแล้ว";
      default:
        return "Updated";
    }
  },
  attendanceTableUpdated: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Table Updated";
      case "th":
        return "อัปเดตตารางเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Table Updated";
    }
  },
  somethingWentWrong: (language: Language) => {
    switch (language) {
      case "en":
        return "Something Went Wrong";
      case "th":
        return "เกิดข้อผิดพลาด";
      default:
        return "Something Went Wrong";
    }
  },
  deleteConfirm: (language: Language) => {
    switch (language) {
      case "en":
        return "To confirm, type";
      case "th":
        return "เพื่อยืนยัน พิมพ์";
      default:
        return "To confirm, type";
    }
  },
  inTheBoxBelow: (language: Language) => {
    switch (language) {
      case "en":
        return "in the box below";
      case "th":
        return "ในช่องด้านล่าง";
      default:
        return "in the box below";
    }
  },
  areYouSure: (language: Language) => {
    switch (language) {
      case "en":
        return "Are you sure?";
      case "th":
        return "คุณแน่ใจหรือไม่?";
      default:
        return "Are you sure?";
    }
  },
  actionIrreversible: (language: Language) => {
    switch (language) {
      case "en":
        return "This action is irreversible and destructive. Please be careful.";
      case "th":
        return "การกระทำนี้ไม่สามารถย้อนกลับได้และเป็นอันตราย โปรดระมัดระวัง";
      default:
        return "This action is irreversible and destructive. Please be careful.";
    }
  },
  typeCorrectly: (language: Language) => {
    switch (language) {
      case "en":
        return "Please Type Correctly";
      case "th":
        return "กรุณาพิมพ์ให้ถูกต้อง";
      default:
        return "Please Type Correctly";
    }
  },
  deleting: (language: Language) => {
    switch (language) {
      case "en":
        return "Deleting...";
      case "th":
        return "กำลังลบ...";
      default:
        return "Deleting...";
    }
  },
  loading: (language: Language) => {
    switch (language) {
      case "en":
        return "Loading....";
      case "th":
        return "กำลังโหลด....";
      default:
        return "Loading....";
    }
  },
  deleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Deleted";
      case "th":
        return "ลบแล้ว";
      default:
        return "Deleted";
    }
  },
  attendanceTableDeleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Table Deleted";
      case "th":
        return "ลบตารางเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Table Deleted";
    }
  },
  attendanceStatusDeleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status Deleted";
      case "th":
        return "ลบสถานะการเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Status Deleted";
    }
  },
  delete: (language: Language) => {
    switch (language) {
      case "en":
        return "DELETE";
      case "th":
        return "ลบ";
      default:
        return "DELETE";
    }
  },
  requiredFields: (language: Language) => {
    switch (language) {
      case "en":
        return "Title, Color and Value is required";
      case "th":
        return "จำเป็นต้องระบุชื่อ สี และค่า";
      default:
        return "Title, Color and Value is required";
    }
  },
  created: (language: Language) => {
    switch (language) {
      case "en":
        return "Created";
      case "th":
        return "สร้างแล้ว";
      default:
        return "Created";
    }
  },
  attendanceStatusCreated: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status Created";
      case "th":
        return "สร้างสถานะการเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Status Created";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create";
      case "th":
        return "สร้าง";
      default:
        return "Create";
    }
  },
} as const;

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

// Table settings, create-table modal and single-record editor
export const attendanceTableUiLanguage = {
  // settings
  generalHint: t(
    "Name and describe this table so it is easy to find.",
    "ตั้งชื่อและคำอธิบายเพื่อให้ค้นหาตารางนี้ได้ง่าย",
  ),
  statusesHint: t(
    "Statuses teachers can pick when taking attendance. Changes save automatically.",
    "สถานะที่เลือกได้ตอนเช็คชื่อ การแก้ไขจะบันทึกอัตโนมัติ",
  ),
  valueHint: t(
    "Value counts toward Total present, e.g. Present = 1, Late = 0.5, Absent = 0.",
    "ค่าคะแนนใช้คำนวณรวมการมาเรียน เช่น มา = 1, สาย = 0.5, ขาด = 0",
  ),
  addStatus: t("Add status", "เพิ่มสถานะ"),
  newStatusPlaceholder: t("New status name", "ชื่อสถานะใหม่"),
  chooseColor: t("Choose color", "เลือกสี"),
  custom: t("Custom", "กำหนดเอง"),
  hidden: t("Hidden", "ซ่อนอยู่"),
  saving: t("Saving…", "กำลังบันทึก…"),
  deleteStatusTitle: t("Delete this status?", "ลบสถานะนี้ใช่ไหม?"),
  deleteStatusText: t(
    "Teachers will no longer be able to pick it. This cannot be undone.",
    "จะไม่สามารถเลือกสถานะนี้ได้อีก และไม่สามารถย้อนกลับได้",
  ),
  cancel: t("Cancel", "ยกเลิก"),
  dangerHint: t(
    "Deleting a table removes all of its attendance records.",
    "การลบตารางจะลบข้อมูลการเช็คชื่อทั้งหมดในตารางนี้",
  ),
  // create modal
  createTitle: t("New attendance table", "สร้างตารางเช็คชื่อใหม่"),
  createDescription: t(
    "Use separate tables for different kinds of sessions, e.g. Homeroom or Lab.",
    "แยกตารางตามประเภทของคาบ เช่น โฮมรูม หรือ คาบปฏิบัติการ",
  ),
  titleLabel: t("Title", "ชื่อตาราง"),
  titlePlaceholder: t("e.g. Homeroom", "เช่น โฮมรูม"),
  descriptionLabel: t("Description", "คำอธิบาย"),
  descriptionPlaceholder: t(
    "What is this table for?",
    "ตารางนี้ใช้สำหรับอะไร?",
  ),
  createButton: t("Create table", "สร้างตาราง"),
  // single record editor
  recordTitle: t("Attendance record", "ข้อมูลการเช็คชื่อ"),
  number: t("No.", "เลขที่"),
  notRecorded: t("Not recorded yet", "ยังไม่ได้เช็คชื่อ"),
  statusLabel: t("Status", "สถานะ"),
  noteLabel: t("Note", "โน้ต"),
  noteHint: t("Optional", "ไม่บังคับ"),
  save: t("Save", "บันทึก"),
  pickStatus: t("Pick a status first", "กรุณาเลือกสถานะ"),
} as const;
