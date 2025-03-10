import { Language } from "../../interfaces";

export const homepageDataLanguage = {
  welcome: (language: Language) => {
    switch (language) {
      case "en":
        return "Welcome Back";
      case "th":
        return "ยินดีต้อนรับกลับมา";
      default:
        return "Welcome Back";
    }
  },
  welcomeDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "This is your Homepage Schools Dashboard.";
      case "th":
        return "นี่คือหน้ารายชื่อของโรงเรียนทั้งหมดที่คุณเป็นสมาชิก";
      default:
        return "This is your Homepage Schools Dashboard.";
    }
  },
  selectSchool: (language: Language) => {
    switch (language) {
      case "en":
        return "Select Your School";
      case "th":
        return "เลือกโรงเรียนของคุณ";
      default:
        return "Select Your School";
    }
  },
  selectSchoolDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Lists of your school";
      case "th":
        return "รายชื่อโรงเรียนของคุณ";
      default:
        return "Lists of your school";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create School";
      case "th":
        return "สร้างโรงเรียน";
      default:
        return "Create School";
    }
  },
  join: (language: Language) => {
    switch (language) {
      case "en":
        return "Join School";
      case "th":
        return "เข้าร่วมโรงเรียน";
      default:
        return "Join School";
    }
  },
} as const;
