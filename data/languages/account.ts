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
  currentPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Current Password";
      case "th":
        return "รหัสผ่านปัจจุบัน";
      default:
        return "Current Password";
    }
  },
  newPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "New Password";
      case "th":
        return "รหัสผ่านใหม่";
      default:
        return "New Password";
    }
  },
  newConfirmPassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Confirm New Password";
      case "th":
        return "ยืนยันรหัสผ่านปัจจุบัน";
      default:
        return "Confirm New Password";
    }
  },
  googlePassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Your password is managed by google";
      case "th":
        return "รหัสผ่านของคุณถูกจัดการโดย Google";
      default:
        return "Your password is managed by google";
    }
  },
  successUpdatePassword: (language: Language) => {
    switch (language) {
      case "en":
        return "Password Updated Successfully";
      case "th":
        return "เปลี่ยนแปลงรหัสผ่านสำเร็จ";
      default:
        return "Password Updated Successfully";
    }
  },
  errorUpdatePassword: (language: Language) => {
    switch (language) {
      case "en":
        return "New Password and Confirm New Password must be the same";
      case "th":
        return "รหัสผ่านไม่ตรงกัน";
      default:
        return "New Password and Confirm New Password must be the same";
    }
  },
  buttonPassword: (language: Language) => {
    switch (language) {
      case "en":
        return " Change Password";
      case "th":
        return "เปลี่ยนรหัสผ่าน";
      default:
        return " Change Password";
    }
  },
  alreadyJoin: (language: Language) => {
    switch (language) {
      case "en":
        return "You have joined";
      case "th":
        return "เข้าร่วมเรียบร้อย";
      default:
        return "You have joined";
    }
  },
  accpet: (language: Language) => {
    switch (language) {
      case "en":
        return "Accept";
      case "th":
        return "เข้าร่วม";
      default:
        return "Accept";
    }
  },
  reject: (language: Language) => {
    switch (language) {
      case "en":
        return "Reject";
      case "th":
        return "ปฏิเสธ";
      default:
        return "Reject";
    }
  },
} as const;
