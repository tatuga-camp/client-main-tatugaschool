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
  deleteTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Are you sure?";
      case "th":
        return "คุณแน่ใจใช่ไหม ?";
      default:
        return "Are you sure?";
    }
  },
  deleteInstruction1: (language: Language) => {
    switch (language) {
      case "en":
        return "To confirm, type";
      case "th":
        return "กรุณาพิมพ์คำว่า ";
      default:
        return "To confirm, type";
    }
  },
  deleteInstruction2: (language: Language) => {
    switch (language) {
      case "en":
        return "in the box below";
      case "th":
        return "เพื่อเป็นการยืนยัน";
      default:
        return "in the box below";
    }
  },
  deleteError: (language: Language) => {
    switch (language) {
      case "en":
        return "Please Type Correctly";
      case "th":
        return "กรุณาพิมพ์ให้ถูกต้อง";
      default:
        return "Please Type Correctly";
    }
  },
  deleteFooter: (language: Language) => {
    switch (language) {
      case "en":
        return "This action is irreversible and destructive. Please be careful.";
      case "th":
        return "การกระทำนี้ไม่สามารถกู้คืนใดๆ ได้โปรดตัดสินใจอย่างระมัดระวัง";
      default:
        return "This action is irreversible and destructive. Please be careful.";
    }
  },
} as const;
