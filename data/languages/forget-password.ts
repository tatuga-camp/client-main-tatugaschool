import { Language } from "../../interfaces";

export const forgetPasswordLanguageData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Forget Password ?";
      case "th":
        return "คุณลืมรหัสผ่านใช่ไหม ?";
      default:
        return "Forget Password ?";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter your email address and we will send you a link to reset your password";
      case "th":
        return "กรอกที่อยู่อีเมลของคุณ และเราจะส่งจดหมายไปให้ เพื่อให้คุณดำเนินการเปลี่ยนรหัสผ่านใหม่ต่อไป";
      default:
        return "Enter your email address and we will send you a link to reset your password";
    }
  },
  inputEmail: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your Email here";
      case "th":
        return "กรอกอีเมลของคุณได้ที่นี้";
      default:
        return "Enter Your Email here";
    }
  },
  button: (language: Language) => {
    switch (language) {
      case "en":
        return "Send Email";
      case "th":
        return "ยืนยันคำขอ";
      default:
        return "Send Email";
    }
  },
} as const;
