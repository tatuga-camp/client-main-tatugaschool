import { Language } from "../../interfaces";

export const subjectIsLockedDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "This subject is locked";
      case "th":
        return "รายวิชาถูกล็อค";
      default:
        return "This subject is locked";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "You can view data but cannot make any changes.";
      case "th":
        return "คุณสามารถดูข้อมูลได้ แต่ไม่สามารถแก้ไขหรือทำการเปลี่ยนแปลงใดๆได้";
      default:
        return "You can view data but cannot make any changes.";
    }
  },
  description2: (language: Language) => {
    switch (language) {
      case "en":
        return "Student are not affected by the locking subject ";
      case "th":
        return "การล็อครายวิชาไม่ส่งผลต่อนักเรียน นักเรียนยังคงใช้งานได้ปกติ";
      default:
        return "Student are not affected by the locking subject ";
    }
  },
  toUnlock: (language: Language) => {
    switch (language) {
      case "en":
        return "To unlock, please renew your subscription.";
      case "th":
        return "เพื่อที่จำทำการปลดล็อคกรุณาต่อระบบสมาชิก";
      default:
        return "To unlock, please renew your subscription.";
    }
  },
  renewButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Renew Subscription";
      case "th":
        return "สมัครสมาชิก";
      default:
        return "Renew Subscription";
    }
  },
  understandButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Click to confirm";
      case "th":
        return "ฉันเข้าใจ";
      default:
        return "Click to confirm";
    }
  },
} as const;
