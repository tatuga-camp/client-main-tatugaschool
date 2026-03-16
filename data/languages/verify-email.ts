import { Language } from "../../interfaces";

export const verifyEmailLanguageData = {
  headTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Verify Email";
      case "th":
        return "ยืนยันอีเมล";
      default:
        return "Verify Email";
    }
  },
  swalSuccessTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Email Verified";
      case "th":
        return "ยืนยันอีเมลสำเร็จ";
      default:
        return "Email Verified";
    }
  },
  swalSuccessText: (language: Language) => {
    switch (language) {
      case "en":
        return "Your email has been verified successfully";
      case "th":
        return "อีเมลของคุณได้รับการยืนยันเรียบร้อยแล้ว";
      default:
        return "Your email has been verified successfully";
    }
  },
  swalErrorTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Something Went Wrong";
      case "th":
        return "เกิดข้อผิดพลาด";
      default:
        return "Something Went Wrong";
    }
  },
  swalErrorCode: (language: Language) => {
    switch (language) {
      case "en":
        return "Code Error: ";
      case "th":
        return "รหัสข้อผิดพลาด: ";
      default:
        return "Code Error: ";
    }
  },
  successTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Your Email Has Been Verified";
      case "th":
        return "อีเมลของคุณได้รับการยืนยันแล้ว";
      default:
        return "Your Email Has Been Verified";
    }
  },
  successDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Please click the button below to sign in again.";
      case "th":
        return "กรุณาคลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบอีกครั้ง";
      default:
        return "Please click the button below to sign in again.";
    }
  },
  signInButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Sign In";
      case "th":
        return "เข้าสู่ระบบ";
      default:
        return "Sign In";
    }
  },
  pendingTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Verifying Your Email..";
      case "th":
        return "กำลังยืนยันอีเมลของคุณ..";
      default:
        return "Verifying Your Email..";
    }
  },
  pendingDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Please wait while we verify your email.";
      case "th":
        return "กรุณารอสักครู่ในขณะที่เรายืนยันอีเมลของคุณ";
      default:
        return "Please wait while we verify your email.";
    }
  },
  noTokenTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "No Token Found";
      case "th":
        return "ไม่พบโทเค็น";
      default:
        return "No Token Found";
    }
  },
  failTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Email Validation Fail";
      case "th":
        return "การยืนยันอีเมลล้มเหลว";
      default:
        return "Email Validation Fail";
    }
  },
  errorDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Please resend the email again or contact admin.";
      case "th":
        return "กรุณาส่งอีเมลอีกครั้งหรือติดต่อผู้ดูแลระบบ";
      default:
        return "Please resend the email again or contact admin.";
    }
  },
} as const;
