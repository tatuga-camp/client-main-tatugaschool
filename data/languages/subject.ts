import { Language } from "../../interfaces";

export const subjectDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Subjects";
      case "th":
        return "รายวิชาทั้งหมด";
      default:
        return "Subjects";
    }
  },
  descriptiom: (language: Language) => {
    switch (language) {
      case "en":
        return "You can create and manage subjects here.";
      case "th":
        return "คุณสามารถสร้าง แก้ไข และจัดการรายวิชาทั้งหมดได้ที่นี้";
      default:
        return "You can create and manage subjects here.";
    }
  },
  search: (language: Language) => {
    switch (language) {
      case "en":
        return "Search";
      case "th":
        return "ค้นหารายวิชา";
      default:
        return "Search";
    }
  },
  searchPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Search for subjects";
      case "th":
        return "ค้นหารายวิชา เช่น email ครูผู้สอน ชั้นเรียน และข้อมูลต่างๆ ";
      default:
        return "Search for subjects";
    }
  },
  educationYear: (language: Language) => {
    switch (language) {
      case "en":
        return "Education Year";
      case "th":
        return "ปีการศึกษา";
      default:
        return "Education Year";
    }
  },
  sortBy: (language: Language) => {
    switch (language) {
      case "en":
        return "Sort By";
      case "th":
        return "เรียงลำดับ";
      default:
        return "Sort By";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Subject";
      case "th":
        return "สร้างรายวิชา";
      default:
        return "Create Subject";
    }
  },
  selectClass: (language: Language) => {
    switch (language) {
      case "en":
        return "Select Classroom for subject";
      case "th":
        return "เลือกชั้นเรียนให้กับรายวิชา";
      default:
        return "Select Classroom for subject";
    }
  },
} as const;
