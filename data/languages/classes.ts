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
  notify: (language: Language) => {
    switch (language) {
      case "en":
        return "After creating a classroom, you need to create subjects inside it to start teaching.";
      case "th":
        return "หลังจากที่สร้างชั้นเรียน คุณครูต้องสร้างรายวิชาเพื่อทำการสอนต่อไป";
      default:
        return "After creating a classroom, you need to create subjects inside it to start teaching.";
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
        return "ค้นห้าชั้นเรียน";
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
  successTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Classroom is ready";
      case "th":
        return "สร้างชั้นเรียนสำเร็จ";
      default:
        return "Classroom is ready";
    }
  },
  successCalloutBody: (language: Language) => {
    switch (language) {
      case "en":
        return "In Tatuga School, classrooms hold multiple subjects (Math, Science, English…) — like a real school. Next, create a subject inside this classroom to start teaching.";
      case "th":
        return "ใน Tatuga School ชั้นเรียนหนึ่งสามารถมีหลายรายวิชาได้ เช่น คณิตศาสตร์ วิทยาศาสตร์ ภาษาอังกฤษ เหมือนโรงเรียนจริง ต่อไปกรุณาสร้างรายวิชาในชั้นเรียนนี้เพื่อเริ่มสอน";
      default:
        return "In Tatuga School, classrooms hold multiple subjects (Math, Science, English…) — like a real school. Next, create a subject inside this classroom to start teaching.";
    }
  },
  successCreateSubject: (language: Language) => {
    switch (language) {
      case "en":
        return "Go to Subjects";
      case "th":
        return "ไปที่รายวิชา";
      default:
        return "Go to Subjects";
    }
  },
  successSkip: (language: Language) => {
    switch (language) {
      case "en":
        return "Later";
      case "th":
        return "ภายหลัง";
      default:
        return "Later";
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
