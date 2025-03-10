import { Language } from "../../interfaces";

export const signUpLanguageData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Account";
      case "th":
        return "สร้างบัญชี";
      default:
        return "Create Account";
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
  firstNameTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "First Name";
      case "th":
        return "ชื่อจริง";
      default:
        return "First Name";
    }
  },
  firstNamePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your First Name";
      case "th":
        return "กรอกชื่อจริง";
      default:
        return "Enter Your First Name";
    }
  },
  lastNameTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Last Name";
      case "th":
        return "นามสกุล";
      default:
        return "Last Name";
    }
  },
  lastNamePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your Last Name";
      case "th":
        return "กรอกนามสกุล";
      default:
        return "Enter Your Last Name";
    }
  },
  phone: (language: Language) => {
    switch (language) {
      case "en":
        return "Phone Number";
      case "th":
        return "เบอร์โทรศัพท์";
      default:
        return "Phone Number";
    }
  },
  email: (language: Language) => {
    switch (language) {
      case "en":
        return "Email Adress";
      case "th":
        return "อีเมล";
      default:
        return "Email Adress";
    }
  },
  emailPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your Email Adress";
      case "th":
        return "กรอกอีเมล";
      default:
        return "Enter Your Email Adress";
    }
  },
  password: (language: Language) => {
    switch (language) {
      case "en":
        return "Password";
      case "th":
        return "รหัสผ่าน";
      default:
        return "Password";
    }
  },
  passwordPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your Password";
      case "th":
        return "กรอกรหัสผ่าน";
      default:
        return "Enter Your Password";
    }
  },
  confirmPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Confirm Password";
      case "th":
        return "ยืนยันรหัสผ่าน";
      default:
        return "Confirm Password";
    }
  },
  confirmPasswordPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Your Confirm Password";
      case "th":
        return "กรอกยืนยันรหัสผ่าน";
      default:
        return "Enter Your Confirm Password";
    }
  },
  acceptPolicy: (language: Language) => {
    switch (language) {
      case "en":
        return "I agree to the Terms of Service and Privacy Policy";
      case "th":
        return "ฉัน ยอมรับ ข้อตกลงเงื่อนไขการบริการและนโยบายความปลอดภัย";
      default:
        return "I agree to the Terms of Service and Privacy Policy";
    }
  },
  createAccount: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Account";
      case "th":
        return "สร้างบัญชีผู้ใช้";
      default:
        return "Create Account";
    }
  },
  createAccountGoogle: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Account With Google";
      case "th":
        return "สร้างบัญชีผู้ใช้โดยใช้ Google";
      default:
        return "Create Account With Google";
    }
  },

  nowCreateAccountOnGoogle: (language: Language) => {
    switch (language) {
      case "en":
        return "You are creating account with Google";
      case "th":
        return "คุณกำลังสร้างบัญชีผู้ใช้โดยใช้ Google";
      default:
        return "You are creating account with Google";
    }
  },
};
