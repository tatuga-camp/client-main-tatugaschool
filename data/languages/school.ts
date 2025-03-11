import { Language } from "../../interfaces";

export const schoolDataLanguage = {
  memberPlan: (language: Language) => {
    switch (language) {
      case "en":
        return "Member Plan";
      case "th":
        return "ระดับสมาชิก";
      default:
        return "Member Plan";
    }
  },
  totalTeacher: (language: Language) => {
    switch (language) {
      case "en":
        return "Total teachers in school";
      case "th":
        return "จำนวนคุณครูในโรงเรียนทั้งหมด";
      default:
        return "Total teachers in school";
    }
  },
  totalClassroom: (language: Language) => {
    switch (language) {
      case "en":
        return "Total Classroom";
      case "th":
        return "จำนวนชั้นเรียนทั้งหมด";
      default:
        return "Total Classroom";
    }
  },
  totalSubject: (language: Language) => {
    switch (language) {
      case "en":
        return "Total subjects";
      case "th":
        return "จำนวนรายวิชาทั้งหมด";
      default:
        return "Total subjects";
    }
  },
  totalStorage: (language: Language) => {
    switch (language) {
      case "en":
        return "Total Storage";
      case "th":
        return "จำนวนความจุข้อมูลทั้งหมด";
      default:
        return "Total Storage";
    }
  },
  inviteTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Invite to Join School";
      case "th":
        return "เชิญคนอื่นมาร่วมโรงเรียนของคุณ";
      default:
        return "Invite to Join School";
    }
  },
  inviteButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Invite";
      case "th":
        return "เชิญ";
      default:
        return "Invite";
    }
  },

  members: (language: Language) => {
    switch (language) {
      case "en":
        return "Members";
      case "th":
        return "ครูในโรงเรียน";
      default:
        return "Members";
    }
  },

  basicInfo: (language: Language) => {
    switch (language) {
      case "en":
        return "Basic Information";
      case "th":
        return "ข้อมูลพื้นฐาน";
      default:
        return "Basic Information";
    }
  },
  billing: (language: Language) => {
    switch (language) {
      case "en":
        return "Billing & Plan";
      case "th":
        return "ระบบสมาชิก";
      default:
        return "Billing & Plan";
    }
  },
  dangerZoneTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Danger zone";
      case "th":
        return "พื้นที่อันตราย";
      default:
        return "Danger zone";
    }
  },
  dangerZoneDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Irreversible and destructive actions";
      case "th":
        return "การกระทำนี้ไม่สามารถกู้คืนใดๆ ได้";
      default:
        return "Irreversible and destructive actions";
    }
  },
  deleteSchool: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This School";
      case "th":
        return "คุณต้องการลบโรงเรียน ?";
      default:
        return "Delete This School";
    }
  },
  deleteSchoolDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Once you delete this school, all data will be lost and cannot be recovered. Please be careful.";
      case "th":
        return "เมื่อคนลบโรงเรียนนี้แล้ว ข้อมูลทั้งหมดที่เกี่ยวของกับโรงเรียนจะถูกลบทึ้งด้วยและไม่สามารถกู้คืนใดๆ ได้";
      default:
        return "Once you delete this school, all data will be lost and cannot be recovered. Please be careful.";
    }
  },
  deleteButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบโรงเรียน";
      default:
        return "Delete";
    }
  },
  manageSubTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage Your Subscription";
      case "th":
        return "จัดการระบบสมาชิก";
      default:
        return "Manage Your Subscription";
    }
  },
  manageSubDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "You can dowload invoice, recipet or manage your subscription here";
      case "th":
        return "คุณสามารถดาวโหลด ใบเสร็จ ใบเจ้งหนี้ หรือ เปลี่ยนที่อยู่และจัดการระบบสมาชิกได้ที่นี้";
      default:
        return "You can dowload invoice, recipet or manage your subscription here";
    }
  },
  billingManagerTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage A Billing Manager";
      case "th":
        return "ตั้งค่าบัญชีจัดการ ระบบสมาชิก";
      default:
        return "Manage A Billing Manager";
    }
  },
  billingManagerDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "A billing manager is the only account who can manage a subscription. (Only Admin can change a billing manager)";
      case "th":
        return "บัญชีจัดการระบบสมาชิก เป็นบุคคลเดียวในโรงเรียนที่สามารถจัดการระบบสมาชิกได้ ( Admin เท่านั้นที่จะสามารถเปลี่ยนแปลง บัญชีจัดการระบบสมาชิกได้ )";
      default:
        return "A billing manager is the only account who can manage a subscription. (Only Admin can change a billing manager)";
    }
  },
  billingButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Billing Setting";
      case "th":
        return "ตั้งค่าระบบสมาชิก";
      default:
        return "Billing Setting";
    }
  },
} as const;

export const sidebarSchoolDataLanguage = {
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
} as const;
