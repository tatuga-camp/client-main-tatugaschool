import { Language } from "../../interfaces";

export const waitVerifyEmailLanguageData = {
  swalSuccessTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Success";
      case "th":
        return "สำเร็จ";
      default:
        return "Success";
    }
  },
  swalSuccessTextResend: (language: Language) => {
    switch (language) {
      case "en":
        return "Verification Email Sent";
      case "th":
        return "ส่งอีเมลยืนยันแล้ว";
      default:
        return "Verification Email Sent";
    }
  },
  swalSuccessTextUpdate: (language: Language) => {
    switch (language) {
      case "en":
        return "Email Updated Successfully";
      case "th":
        return "อัปเดตอีเมลสำเร็จ";
      default:
        return "Email Updated Successfully";
    }
  },
  alreadyVerified: (language: Language) => {
    switch (language) {
      case "en":
        return "Your Account Email has already been verified";
      case "th":
        return "อีเมลบัญชีของคุณได้รับการยืนยันเรียบร้อยแล้ว";
      default:
        return "Your Account Email has already been verified";
    }
  },
  enterDashboard: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter Dashboard";
      case "th":
        return "เข้าสู่หน้าหลัก";
      default:
        return "Enter Dashboard";
    }
  },
  updateEmailTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Your Email Address";
      case "th":
        return "อัปเดตที่อยู่อีเมลของคุณ";
      default:
        return "Update Your Email Address";
    }
  },
  updateEmailDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "after updating your email address, we will send a verification link to your new email address";
      case "th":
        return "หลังจากอัปเดตที่อยู่อีเมลของคุณ เราจะส่งลิงก์ยืนยันไปยังที่อยู่อีเมลใหม่ของคุณ";
      default:
        return "after updating your email address, we will send a verification link to your new email address";
    }
  },
  emailPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "E-mail";
      case "th":
        return "อีเมล";
      default:
        return "E-mail";
    }
  },
  updateEmailButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Email";
      case "th":
        return "อัปเดตอีเมล";
      default:
        return "Update Email";
    }
  },
  backToVerifyEmail: (language: Language) => {
    switch (language) {
      case "en":
        return "Back to Verify Email";
      case "th":
        return "กลับไปหน้ายืนยันอีเมล";
      default:
        return "Back to Verify Email";
    }
  },
  pleaseVerifyTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Please Verify Your Email";
      case "th":
        return "กรุณายืนยันอีเมลของคุณ";
      default:
        return "Please Verify Your Email";
    }
  },
  verifyDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "We have sent a verification link to your email address. Please check your email and click on the link to verify your email address.";
      case "th":
        return "เราได้ส่งลิงก์ยืนยันไปยังที่อยู่อีเมลของคุณ กรุณาตรวจสอบอีเมลของคุณและคลิกที่ลิงก์เพื่อยืนยันที่อยู่อีเมลของคุณ";
      default:
        return "We have sent a verification link to your email address. Please check your email and click on the link to verify your email address.";
    }
  },
  resendButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Resend Verification Email";
      case "th":
        return "ส่งอีเมลยืนยันอีกครั้ง";
      default:
        return "Resend Verification Email";
    }
  },
  changeEmailPrompt: (language: Language) => {
    switch (language) {
      case "en":
        return "Want to change your email address?";
      case "th":
        return "ต้องการเปลี่ยนที่อยู่อีเมลของคุณ?";
      default:
        return "Want to change your email address?";
    }
  },
} as const;
