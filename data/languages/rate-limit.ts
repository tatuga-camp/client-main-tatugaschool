import { Language } from "../../interfaces";

export const rateLimitLanguageData = {
  generalTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "ช้าลงสักนิดนะ";
      default:
        return "Slow down a little";
    }
  },
  generalBody: (language: Language) => {
    switch (language) {
      case "th":
        return "มีคำขอจากคุณเข้ามาจำนวนมากในเวลาสั้น ๆ งานที่ทำอยู่ในหน้านี้ยังอยู่ครบ ไม่ต้องรีเฟรชหน้า";
      default:
        return "We received a lot of requests from you in a short time. Your work on this page is safe, no need to refresh.";
    }
  },
  authTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "ลองหลายครั้งเกินไป";
      default:
        return "Too many attempts";
    }
  },
  authBody: (language: Language) => {
    switch (language) {
      case "th":
        return "เพื่อความปลอดภัยของบัญชี กรุณารอสักครู่ก่อนลองอีกครั้ง";
      default:
        return "To keep your account safe, please wait before trying again.";
    }
  },
  generalCountdown: (language: Language) => {
    switch (language) {
      case "th":
        return "ใช้งานต่อได้ในอีก";
      default:
        return "You can continue in";
    }
  },
  authCountdown: (language: Language) => {
    switch (language) {
      case "th":
        return "ลองอีกครั้งได้ในอีก";
      default:
        return "Try again in";
    }
  },
  dismiss: (language: Language) => {
    switch (language) {
      case "th":
        return "เข้าใจแล้ว";
      default:
        return "Got it";
    }
  },
};
