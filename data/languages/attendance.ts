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
