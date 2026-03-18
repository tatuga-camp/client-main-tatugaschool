import { Language } from "../../interfaces";

export const navbarLanguageData = {
  school: (language: Language) => {
    switch (language) {
      case "en":
        return "List of School";
      case "th":
        return "รายชื่อโรงเรียน";
      default:
        return "List of School";
    }
  },
  report: (language: Language) => {
    switch (language) {
      case "en":
        return "Give a feedback";
      case "th":
        return "ให้ข้อเสนอแนะ";
      default:
        return "Give a feedback";
    }
  },
  account: (language: Language) => {
    switch (language) {
      case "en":
        return "Account";
      case "th":
        return "บัญชีของคุณ";
      default:
        return "Account";
    }
  },
  logoutButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Logout";
      case "th":
        return "ออกจากระบบ";
      default:
        return "Logout";
    }
  },
  profileSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Profile Settings";
      case "th":
        return "ตั้งค่าโปรไฟล์";
      default:
        return "Profile Settings";
    }
  },
  helpCenter: (language: Language) => {
    switch (language) {
      case "en":
        return "Help Center";
      case "th":
        return "ศูนย์ช่วยเหลือ";
      default:
        return "Help Center";
    }
  },
  darkMode: (language: Language) => {
    switch (language) {
      case "en":
        return "Dark Mode";
      case "th":
        return "โหมดกลางคืน";
      default:
        return "Dark Mode";
    }
  },
  upgradePlan: (language: Language) => {
    switch (language) {
      case "en":
        return "Upgrade Plan";
      case "th":
        return "อัปเกรดแผน";
      default:
        return "Upgrade Plan";
    }
  },
} as const;
