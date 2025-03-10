import { Language } from "../../interfaces";

export const signInData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Login";
      case "th":
        return "เข้าสู่ระบบ";
      default:
        return "Login";
    }
  },
  teacherOnly: (language: Language) => {
    switch (language) {
      case "en":
        return "For Only Teacher";
      case "th":
        return "สำหรับครูเท่านั้น";
      default:
        return "For Only Teacher";
    }
  },
  inputEmail: (language: Language) => {
    switch (language) {
      case "en":
        return "E-mail";
      case "th":
        return "อีเมล";
      default:
        return "E-mail";
    }
  },
  inputPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Password";
      case "th":
        return "รหัสผ่าน";
      default:
        return "Password";
    }
  },
  forgetPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Forget password?";
      case "th":
        return "ลืมรหัสผ่าน ?";
      default:
        return "Forget password?";
    }
  },
  loginButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Log in";
      case "th":
        return "เข้าสู่ระบบ";
      default:
        return "Log in";
    }
  },
  googleButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Log in with Google";
      case "th":
        return "เข้าสู่ระบบด้วย Google";
      default:
        return "Log in with Google";
    }
  },
  noAccountButton: (language: Language) => {
    switch (language) {
      case "en":
        return "No Account?";
      case "th":
        return "ยังไม่มีบัญชี ?";
      default:
        return "No Account?";
    }
  },
} as const;
