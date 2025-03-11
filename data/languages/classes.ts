import { Language } from "../../interfaces";

export const classesDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Classrooms";
      case "th":
        return "ชั้นเรียนทั้งหมด";
      default:
        return "Classrooms";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "This section is for managing classes. You can create, edit, and delete classes here.";
      case "th":
        return "ในส่วนนี้คุณสามารถจัดการเกี่ยวกับชั้นเรียนได้ ไม่ว่าจะเป็น การสร้างชั้นเรียน แก้ไข หรือ ลบชั้นเรียนนั้นๆ ทึ้ง";
      default:
        return "This section is for managing classes. You can create, edit, and delete classes here.";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Class";
      case "th":
        return "สร้างชั้นเรียน";
      default:
        return "Create Class";
    }
  },
  search: (language: Language) => {
    switch (language) {
      case "en":
        return "Search";
      case "th":
        return "ค้นหา";
      default:
        return "Search";
    }
  },
  searchPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Search for classroom";
      case "th":
        return "ค้นห้าชั้นเรียน เช่น email ครูผู้สอน ชั้นเรียน และข้อมูลต่างๆ ";
      default:
        return "Search for classroom";
    }
  },
  selectClassStatus: (language: Language) => {
    switch (language) {
      case "en":
        return "Select";
      case "th":
        return "เลือก";
      default:
        return "Select";
    }
  },
  activeClass: (language: Language) => {
    switch (language) {
      case "en":
        return "Active Classrooms";
      case "th":
        return "ชั้นเรียนปัจจุบัน";
      default:
        return "Active Classrooms";
    }
  },
  inactiveClass: (language: Language) => {
    switch (language) {
      case "en":
        return "Inactive Classrooms";
      case "th":
        return "ชั้นเรียนที่ไม่ได้ใช้งาน";
      default:
        return "Inactive Classrooms";
    }
  },
  sort: (language: Language) => {
    switch (language) {
      case "en":
        return "Sort By";
      case "th":
        return "เรียงตาม";
      default:
        return "Sort By";
    }
  },
} as const;

export const sortByOptionsDataLanguage = {
  default: (language: Language) => {
    switch (language) {
      case "en":
        return "Default";
      case "th":
        return "ค่าเริ่มต้น";
      default:
        return "Default";
    }
  },
  newest: (language: Language) => {
    switch (language) {
      case "en":
        return "Newest";
      case "th":
        return "สร้างล่าสุด";
      default:
        return "Newest";
    }
  },
  oldest: (language: Language) => {
    switch (language) {
      case "en":
        return "Oldest";
      case "th":
        return "สร้างเก่าสุด";
      default:
        return "Oldest";
    }
  },
  az: (language: Language) => {
    switch (language) {
      case "en":
        return "A-Z";
      case "th":
        return "ก-ฮ";
      default:
        return "A-Z";
    }
  },
  za: (language: Language) => {
    switch (language) {
      case "en":
        return "Z-A";
      case "th":
        return "ฮ-ก";
      default:
        return "Z-A";
    }
  },
};
