import { Language } from "../../interfaces";

export const sidebarDataLanguage = {
  school: (language: Language) => {
    switch (language) {
      case "en":
        return "School";
      case "th":
        return "โรงเรียน";
      default:
        return "School";
    }
  },
  classes: (language: Language) => {
    switch (language) {
      case "en":
        return "Classes";
      case "th":
        return "ชั้นเรียน";
      default:
        return "Classes";
    }
  },
  subjects: (language: Language) => {
    switch (language) {
      case "en":
        return "Subjects";
      case "th":
        return "รายวิชา";
      default:
        return "Subjects";
    }
  },
  homepage: (language: Language) => {
    switch (language) {
      case "en":
        return "Homepage";
      case "th":
        return "กลับสู่หน้าหลัก";
      default:
        return "Homepage";
    }
  },
  subject: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject";
      case "th":
        return "รายวิชา";
      default:
        return "Subject";
    }
  },
  classwork: (language: Language) => {
    switch (language) {
      case "en":
        return "Classwork";
      case "th":
        return "มอบหมายงาน";
      default:
        return "Classwork";
    }
  },
  attendance: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance";
      case "th":
        return "เช็คชื่อ";
      default:
        return "Attendance";
    }
  },
  grade: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade";
      case "th":
        return "คะแนนรวม";
      default:
        return "Grade";
    }
  },
  settingsubject: (language: Language) => {
    switch (language) {
      case "en":
        return "Setting Subject";
      case "th":
        return "ตั้งค่ารายวิชา";
      default:
        return "Setting Subject";
    }
  },
} as const;
