import { Language } from "../../interfaces";

export const accountDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Account";
      case "th":
        return "บัญชีของคุณ";
      default:
        return "Account";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your account and personal information";
      case "th":
        return "จัดการบัญชีและข้อมูลส่วนตัวของคุณ";
      default:
        return "Manage your account and personal information";
    }
  },
  general: (language: Language) => {
    switch (language) {
      case "en":
        return "General";
      case "th":
        return "ทั่วไป";
      default:
        return "General";
    }
  },
  password: (language: Language) => {
    switch (language) {
      case "en":
        return "Change Password";
      case "th":
        return "เปลี่ยนรหัสผ่าน";
      default:
        return "Change Password";
    }
  },
  invitations: (language: Language) => {
    switch (language) {
      case "en":
        return "Invitations";
      case "th":
        return "คำเชิญ";
      default:
        return "Invitations";
    }
  },
  upload: (language: Language) => {
    switch (language) {
      case "en":
        return "Allowed *.jpeg, *.jpg, *.png Max size of 3.1 MB";
      case "th":
        return "รองรับไฟล์ *.jpeg, *.jpg, *.png ขนาดสูงสุด 3.1 MB";
      default:
        return "Allowed *.jpeg, *.jpg, *.png Max size of 3.1 MB";
    }
  },
  save: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Changes";
      case "th":
        return "บันทึกการเปลี่ยนแปลง";
      default:
        return "Save Changes";
    }
  },
} as const;
