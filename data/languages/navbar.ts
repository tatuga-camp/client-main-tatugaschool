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
} as const;
