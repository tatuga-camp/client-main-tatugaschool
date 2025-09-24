import { Language } from "../../interfaces";

export const classworkCardDataLanguage = {
  Published: (language: Language) => {
    switch (language) {
      case "en":
        return "Published";
      case "th":
        return "เผยแพร่";
      default:
        return "Published";
    }
  },
  Draft: (language: Language) => {
    switch (language) {
      case "en":
        return "Draft";
      case "th":
        return "แบบร่าง";
      default:
        return "Draft";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "Score";
      case "th":
        return "คะแนน";
      default:
        return "Score";
    }
  },
  weight: (language: Language) => {
    switch (language) {
      case "en":
        return "Weight";
      case "th":
        return "ค่าน้ำหนักชิ้นงาน";
      default:
        return "Weight";
    }
  },
  Deadline: (language: Language) => {
    switch (language) {
      case "en":
        return "Deadline";
      case "th":
        return "กำหนดส่ง";
      default:
        return "Deadline";
    }
  },
  NoWork: (language: Language) => {
    switch (language) {
      case "en":
        return "No Work";
      case "th":
        return "ไม่ได้ส่งงาน";
      default:
        return "No Work";
    }
  },
  WaitReview: (language: Language) => {
    switch (language) {
      case "en":
        return "Wait Review";
      case "th":
        return "รอตรวจ";
      default:
        return "Wait Review";
    }
  },
  Reviewed: (language: Language) => {
    switch (language) {
      case "en":
        return "Reviewed";
      case "th":
        return "ตรวจแล้ว";
      default:
        return "Reviewed";
    }
  },
} as const;

export const classworkHeadMenuBarDataLanguage = {
  title: {
    classwork: (language: Language) => {
      switch (language) {
        case "en":
          return "Classwork";
        case "th":
          return "ชิ้นงาน";
        default:
          return "Classwork";
      }
    },
    studentwork: (language: Language) => {
      switch (language) {
        case "en":
          return "Student Work";
        case "th":
          return "งานผู้เรียน";
        default:
          return "Student Work";
      }
    },
    manageassigning: (language: Language) => {
      switch (language) {
        case "en":
          return "Assign Student";
        case "th":
          return "การมอบหมาย";
        default:
          return "Assign Student";
      }
    },
  },
  description: {
    classwork: (language: Language) => {
      switch (language) {
        case "en":
          return "Manage the setting of your classwork here";
        case "th":
          return "แก้ไขและจัดการรายละเอียดของชิ้นงาน";
        default:
          return "Manage the setting of your classwork here";
      }
    },
    studentwork: (language: Language) => {
      switch (language) {
        case "en":
          return "View and Assign student work here";
        case "th":
          return "ดูและตรวจสอบงานของผู้เรียน";
        default:
          return "View and Assign student work here";
      }
    },
    manageassigning: (language: Language) => {
      switch (language) {
        case "en":
          return "Manage the assigning of student work here";
        case "th":
          return "จัดการการมอบหมายงานให้นักเรียนในรายวิชา";
        default:
          return "Manage the assigning of student work here";
      }
    },
  },
  button: {
    publish: (language: Language) => {
      switch (language) {
        case "en":
          return "Publish";
        case "th":
          return "เผยแพร่";
        default:
          return "Publish";
      }
    },
    markAsDraft: (language: Language) => {
      switch (language) {
        case "en":
          return "Mark as Draft";
        case "th":
          return "แบบร่าง";
        default:
          return "Mark as Draft";
      }
    },
    saveChange: (language: Language) => {
      switch (language) {
        case "en":
          return "Save Change";
        case "th":
          return "บันทึกการเปลี่ยนแปลง";
        default:
          return "Save Change";
      }
    },
    duplicate: (language: Language) => {
      switch (language) {
        case "en":
          return "Duplicate";
        case "th":
          return "คัดลอกชิ้นงาน";
        default:
          return "Duplicate";
      }
    },
    delete: (language: Language) => {
      switch (language) {
        case "en":
          return "Delete";
        case "th":
          return "ลบชิ้นงาน";
        default:
          return "Delete";
      }
    },
  },
} as const;

export const classworkViewDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Title";
      case "th":
        return "หัวข้อ";
      default:
        return "Title";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Description";
      case "th":
        return "คำอธิบาย";
      default:
        return "Description";
    }
  },

  fileTilte: (language: Language) => {
    switch (language) {
      case "en":
        return "Attach File";
      case "th":
        return "แนบไฟล์";
      default:
        return "Attach File";
    }
  },
  fileDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Attach file to your classwork, you can attach multiple files.";
      case "th":
        return "แนบไฟล์ไว้กับชิ้นงานได้ โดยคุณสามารถแนบไฟล์หลายๆ ไฟล์ได้";
      default:
        return "Attach file to your classwork, you can attach multiple files.";
    }
  },
  uploadButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Upload";
      case "th":
        return "อัปโหลด";
      default:
        return "Upload";
    }
  },
  settingTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Classwork setting";
      case "th":
        return "ตั้งค่าชิ้นงาน";
      default:
        return "Classwork setting";
    }
  },
  settingDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage the setting of your classwork here";
      case "th":
        return "จัดการการตั้งค่าของชิ้นงานได้ที่นี้";
      default:
        return "Manage the setting of your classwork here";
    }
  },
  published: (language: Language) => {
    switch (language) {
      case "en":
        return "Published";
      case "th":
        return "เผยแพร่แล้ว";
      default:
        return "Published";
    }
  },
  draft: (language: Language) => {
    switch (language) {
      case "en":
        return "Draft";
      case "th":
        return "แบบร่าง";
      default:
        return "Draft";
    }
  },
  type: (language: Language) => {
    switch (language) {
      case "en":
        return "Choose Type of Classword";
      case "th":
        return "เลือกประเภทของชิ้นงาน";
      default:
        return "Choose Type of Classword";
    }
  },
  assignAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Assign At";
      case "th":
        return "มอบหมายเมื่อ";
      default:
        return "Assign At";
    }
  },
  deadLine: (language: Language) => {
    switch (language) {
      case "en":
        return "Deadline";
      case "th":
        return "กำหนดส่ง";
      default:
        return "Deadline";
    }
  },
  maxScore: (language: Language) => {
    switch (language) {
      case "en":
        return "Max Score";
      case "th":
        return "คะแนนเต็ม";
      default:
        return "Max Score";
    }
  },
  allowWeight: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow Weight of Classwork";
      case "th":
        return "อนุญาตให้มีน้ำหนักชิ้นงาน";
      default:
        return "Allow Weight of Classwork";
    }
  },
  weight: (language: Language) => {
    switch (language) {
      case "en":
        return "Weight of Classwork (Optional)";
      case "th":
        return "เปอร์เซ็นนำหนักของชิ้นงาน (ไม่บังคับ)";
      default:
        return "Weight of Classwork (Optional)";
    }
  },
} as const;

export const studentWorkDataLanguage = {
  student: (language: Language) => {
    switch (language) {
      case "en":
        return "Student";
      case "th":
        return "นักเรียน";
      default:
        return "Student";
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
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "Score";
      case "th":
        return "คะแนน";
      default:
        return "Score";
    }
  },
  viewWork: (language: Language) => {
    switch (language) {
      case "en":
        return "View Work";
      case "th":
        return "ดูชิ้นงาน";
      default:
        return "View Work";
    }
  },
  notGrade: (language: Language) => {
    switch (language) {
      case "en":
        return "Not Graded";
      case "th":
        return "ไม่ได้ให้คะแนนน";
      default:
        return "Not Graded";
    }
  },
  reviewed: (language: Language) => {
    switch (language) {
      case "en":
        return "Reviewed";
      case "th":
        return "ตรวจแล้ว";
      default:
        return "Reviewed";
    }
  },
  noWork: (language: Language) => {
    switch (language) {
      case "en":
        return "No Work";
      case "th":
        return "ไม่มีงาน";
      default:
        return "No Work";
    }
  },
  improve: (language: Language) => {
    switch (language) {
      case "en":
        return "Need Improvement";
      case "th":
        return "ต้องการปรับปรุง";
      default:
        return "Need Improvement";
    }
  },
  waitForReview: (language: Language) => {
    switch (language) {
      case "en":
        return "Wait to review";
      case "th":
        return "รอตรวจ";
      default:
        return "Wait to review";
    }
  },
  pleaseSelectStudent: (language: Language) => {
    switch (language) {
      case "en":
        return "Please Select A Student";
      case "th":
        return "กรุณาเลือกนักเรียน";
      default:
        return "Please Select A Student";
    }
  },
  noFileAdded: (language: Language) => {
    switch (language) {
      case "en":
        return "Student has not upload any files";
      case "th":
        return "นักเรียนไม่ได้อัปโหลดไฟล์";
      default:
        return "Student has not upload any files";
    }
  },
  works: (language: Language) => {
    switch (language) {
      case "en":
        return "Works";
      case "th":
        return "ชิ้นงาน";
      default:
        return "Works";
    }
  },
  comments: (language: Language) => {
    switch (language) {
      case "en":
        return "Comment";
      case "th":
        return "ความคิดเห็น";
      default:
        return "Comment";
    }
  },

  summit_at: (language: Language) => {
    switch (language) {
      case "en":
        return "Summit Work At";
      case "th":
        return "นักเรียนส่งงานเมื่อ";
      default:
        return "Summit Work At";
    }
  },
  summit_at_status_late: (language: Language) => {
    switch (language) {
      case "en":
        return "WORK LATE";
      case "th":
        return "ส่งงานเลยกำหนด";
      default:
        return "WORK LATE";
    }
  },
  summit_at_status_on_time: (language: Language) => {
    switch (language) {
      case "en":
        return "WORK ON TIME";
      case "th":
        return "ส่งงานตามกำหนด";
      default:
        return "WORK ON TIME";
    }
  },

  review_work_at: (language: Language) => {
    switch (language) {
      case "en":
        return "Review Work At";
      case "th":
        return "ตรวจงานเมื่อ";
      default:
        return "Review Work At";
    }
  },
} as const;

export const dropdownStatusStudentOnAssignmentLanguage = {
  review: (language: Language) => {
    switch (language) {
      case "en":
        return "Review Work";
      case "th":
        return "ตรวจงาน";
      default:
        return "Review Work";
    }
  },
  improve: (language: Language) => {
    switch (language) {
      case "en":
        return "Need Improvement";
      case "th":
        return "แจ้งนักเรียนแก้ไข";
      default:
        return "Need Improvement";
    }
  },
  delete: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete Work";
      case "th":
        return "ลบงานนักเรียน";
      default:
        return "Delete Work";
    }
  },
} as const;
