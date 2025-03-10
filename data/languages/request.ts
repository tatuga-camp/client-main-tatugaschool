import { Language } from "../../interfaces";

export const requestData = {
  loadingTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Please wait...";
      case "th":
        return "กรุณารอสักครู่";
      default:
        return "Please wait...";
    }
  },
  loadingDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "We are processing your request";
      case "th":
        return "เรากำลังดำเนินการ";
      default:
        return "We are processing your request";
    }
  },
  successTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Success!";
      case "th":
        return "สำเร็จ";
      default:
        return "Success!";
    }
  },
  successDesciption: (language: Language) => {
    switch (language) {
      case "en":
        return "We have successfully processed your request";
      case "th":
        return "เราดำเนินการคำขอของคุณสำเร็จ";
      default:
        return "We have successfully processed your request";
    }
  },
  successForgetPasswordDesciption: (language: Language) => {
    switch (language) {
      case "en":
        return "Please check your email for reset password link";
      case "th":
        return "โปรดเช็คที่อีเมลของคุณ เพื่อดำเนินการเปลี่ยนรหัสผ่านต่อไป";
      default:
        return "Please check your email for reset password link";
    }
  },
  successSignUp: (language: Language) => {
    switch (language) {
      case "en":
        return "Please check your email for verification.";
      case "th":
        return "โปรดตรวจสอบอีเมลของคุณเพื่อดำเนินการยืนยันอีเมลก่อนใช้งาน";
      default:
        return "Please check your email for verification.";
    }
  },
} as const;
