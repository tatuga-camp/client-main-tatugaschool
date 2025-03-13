import { Language } from "../../interfaces";

export const classroomDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "CLASSROOM";
      case "th":
        return "ชั้นเรียน";
      default:
        return "CLASSROOM";
    }
  },
  achieved: (language: Language) => {
    switch (language) {
      case "en":
        return "ACHIEVED";
      case "th":
        return "ชั้นเรียนไม่ได้ใช้งาน";
      default:
        return "ACHIEVED";
    }
  },
  student: (language: Language) => {
    switch (language) {
      case "en":
        return "Students";
      case "th":
        return "นักเรียน";
      default:
        return "Students";
    }
  },
  createAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Create At";
      case "th":
        return "สร้างเมื่อ";
      default:
        return "Create At";
    }
  },
  updateAt: (language: Language) => {
    switch (language) {
      case "en":
        return "Last Update";
      case "th":
        return "แก้ไขล่าสุด";
      default:
        return "Last Update";
    }
  },
  info: (language: Language) => {
    switch (language) {
      case "en":
        return "More Info & Edit";
      case "th":
        return "ข้อมูลเพิ่มเติม และแก้ไข";
      default:
        return "More Info & Edit";
    }
  },
} as const;

export const studentOnClassDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Students";
      case "th":
        return "นักเรียนในชั้นเรียน";
      default:
        return "Students";
    }
  },

  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your students in a classroom here. You can create, edit, and delete students.";
      case "th":
        return "จัดการนักเรียนในชั้นเรียนของคุณได้ที่นี้ เช่น แก้ไขชื่อ รูปภาพ หรือลบนักเรียน";
      default:
        return "Manage your students in a classroom here. You can create, edit, and delete students.";
    }
  },

  search: (language: Language) => {
    switch (language) {
      case "en":
        return "Search";
      case "th":
        return "ค้นหานักเรียน";
      default:
        return "Search";
    }
  },

  searchPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Search for students";
      case "th":
        return "ค้นหานักเรียนโดยใช้ ชื่อ นามสกุล หรือเลขที่";
      default:
        return "Search for students";
    }
  },

  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Student";
      case "th":
        return "สร้างนักเรียน";
      default:
        return "Create Student";
    }
  },

  studentData: {
    password: (language: Language) => {
      switch (language) {
        case "en":
          return "Student Password";
        case "th":
          return "รหัสผ่านของนักเรียน";
        default:
          return "Student Password";
      }
    },
    resetPassword: (language: Language) => {
      switch (language) {
        case "en":
          return "Reset Password";
        case "th":
          return "ลบรหัสผ่านนักเรียน";
        default:
          return "Reset Password";
      }
    },
    passwordDescription: (language: Language) => {
      switch (language) {
        case "en":
          return "** Password is hashed that mean you cant see the password only reset them. Even the admin doesn&lsquo;t know the password. **";
        case "th":
          return "นักเรียนเท่านั้นที่สามารถรู้รหัสผ่านของตัวเอง คุณครูมีสิทธิ์เพียงรีเซ็ทได้เท่านั้น ไม่สามารถเห็นรหัสผ่านนักเรียนได้";
        default:
          return "** Password is hashed that mean you cant see the password only reset them. Even the admin doesn&lsquo;t know the password. **";
      }
    },
  },
  createStudent: {
    title: (language: Language) => {
      switch (language) {
        case "en":
          return "Title";
        case "th":
          return "คำนำหน้า";
        default:
          return "Title";
      }
    },
    firstName: (language: Language) => {
      switch (language) {
        case "en":
          return "First Name";
        case "th":
          return "ชื่อจริง";
        default:
          return "First Name";
      }
    },
    lastName: (language: Language) => {
      switch (language) {
        case "en":
          return "Last Name";
        case "th":
          return "นามสกุล";
        default:
          return "Last Name";
      }
    },
    number: (language: Language) => {
      switch (language) {
        case "en":
          return "Number";
        case "th":
          return "เลขที่";
        default:
          return "Number";
      }
    },
    photo: (language: Language) => {
      switch (language) {
        case "en":
          return "Upload Student Image (Optional)";
        case "th":
          return "อัปโหลดรูปภาพ (ไม่บังคับ)";
        default:
          return "Upload Student Image (Optional)";
      }
    },
    excel: (language: Language) => {
      switch (language) {
        case "en":
          return "Add By Excel";
        case "th":
          return "เพิ่มนักเรียนจาก excel";
        default:
          return "Add By Excel";
      }
    },
    cancel: (language: Language) => {
      switch (language) {
        case "en":
          return "UNDO";
        case "th":
          return "ยกเลิก";
        default:
          return "UNDO";
      }
    },
    excelDescription: (language: Language) => {
      switch (language) {
        case "en":
          return "**Please make sure the data is in the correct format. The data must be in the following format: Number, Title, First Name, Last Name.";
        case "th":
          return "กรุณาแน่ใจว่าข้อมูลใน excel ที่ copy มา อยู่ในฟอร์มต่อไปนี้ เลขที่ คำนำหน้า ชื่อจริง และ นามสกุล";
        default:
          return "**Please make sure the data is in the correct format. The data must be in the following format: Number, Title, First Name, Last Name.";
      }
    },
  },
} as const;

export const gradeOnClassroomDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade Summary Report";
      case "th":
        return "คะแนนรวมของของนักเรียน";
      default:
        return "Grade Summary Report";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "This is the summary of the grade report of the students in the class.";
      case "th":
        return "ส่วนนี้คือผลคะแนนรวมของนักเรียนในชั้นเรียน ของแต่ละรายวิชา";
      default:
        return "This is the summary of the grade report of the students in the class.";
    }
  },
} as const;

export const settingOnClassroomDataLangugae = {
  general: (language: Language) => {
    switch (language) {
      case "en":
        return "General Settings";
      case "th":
        return "การตั้งค่าทั่วไป";
      default:
        return "General Settings";
    }
  },
  geernalDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your general settings";
      case "th":
        return "จัดการการตั้งค่าชั้นเรียนของคุณ";
      default:
        return "Manage your general settings";
    }
  },
  classroomInfo: (language: Language) => {
    switch (language) {
      case "en":
        return "Classroom Infomation";
      case "th":
        return "ข้อมูลห้องเรียน";
      default:
        return "Classroom Infomation";
    }
  },
  classroomId: (language: Language) => {
    switch (language) {
      case "en":
        return "Classroom ID";
      case "th":
        return "รหัสห้องเรียน";
      default:
        return "Classroom ID";
    }
  },
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Title";
      case "th":
        return "ชื่อห้อง";
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
  classLevel: (language: Language) => {
    switch (language) {
      case "en":
        return "Class Level";
      case "th":
        return "ระดับการศึกษา";
      default:
        return "Class Level";
    }
  },
  achieved: (language: Language) => {
    switch (language) {
      case "en":
        return "You want to achieve this classroom?";
      case "th":
        return "คุณต้องการจัดเก็บห้องเรียน?";
      default:
        return "You want to achieve this classroom?";
    }
  },
  acheveidDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Achieve this classroom to make its data that is relate to this classroom read-only for all user. You can undo this action at anytime.";
      case "th":
        return "การจัดเก็บห้องเรียนนี้ จะทำให้ข้อมูลที่เกี่ยวข้องกับชั้นเรียนนี้เป็นแบบอ่านอย่างเดียวสำหรับผู้ใช้ทุกคน คุณสามารถยกเลิกการกระทำนี้ได้ตลอดเวลา";
      default:
        return "Achieve this classroom to make its data that is relate to this classroom read-only for all user. You can undo this action at anytime.";
    }
  },
  saveButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Changes";
      case "th":
        return "บันทึกการเปลี่ยนแปลง";
      default:
        return "Save Changes";
    }
  },
  danger: (language: Language) => {
    switch (language) {
      case "en":
        return "Danger zone";
      case "th":
        return "พื้นที่อันตราย";
      default:
        return "Danger zone";
    }
  },
  dangerDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Irreversible and destructive actions";
      case "th":
        return "การกระทำดังต่อไปนี้ไม่สามารถกู้คืนใดๆ ได้";
      default:
        return "Irreversible and destructive actions";
    }
  },
  deleteTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Classroom";
      case "th":
        return "ลบชั้นเรียนนี้";
      default:
        return "Delete This Classroom";
    }
  },
  deleteDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "once you delete this classroom, all data that related to this classroom will be deleted and cannot be recovered such as subject, students, assignments, and grades.";
      case "th":
        return "เมื่อคุณลบชั้นเรียนนี้ ข้อมูลทั้งหมดที่เกี่ยวข้องกับชั้นเรียนนี้จะถูกลบและไม่สามารถกู้คืนได้ เช่น วิชา นักเรียน งานที่มอบหมาย และคะแนน";
      default:
        return "once you delete this classroom, all data that related to this classroom will be deleted and cannot be recovered such as subject, students, assignments, and grades.";
    }
  },
  deleteButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete Classroom";
      case "th":
        return "ลบชั้นเรียน";
      default:
        return "Delete Classroom";
    }
  },
} as const;
