import { Language } from "../../interfaces";

export const createSchoolDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Create your School here!";
      case "th":
        return "สร้างโรงเรียนของคุณที่นี่!";
      default:
        return "Create your School here!";
    }
  },
  profile: (language: Language) => {
    switch (language) {
      case "en":
        return "Profile";
      case "th":
        return "ประวัติโดยย่อ";
      default:
        return "Profile";
    }
  },
  address: (language: Language) => {
    switch (language) {
      case "en":
        return "Address";
      case "th":
        return "ที่อยู่";
      default:
        return "Address";
    }
  },
  invite: (language: Language) => {
    switch (language) {
      case "en":
        return "Invite";
      case "th":
        return "เชิญสมาชิก";
      default:
        return "Invite";
    }
  },
  uploadTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Click to upload or drag and drop";
      case "th":
        return "คลิกเพื่ออัพโหลดหรือลากและวาง";
      default:
        return "Click to upload or drag and drop";
    }
  },
  school: (language: Language) => {
    switch (language) {
      case "en":
        return "School";
      case "th":
        return "ใส่ชื่อโรงเรียน";
      default:
        return "School";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Description";
      case "th":
        return "ใส่คำอธิบาย";
      default:
        return "Description";
    }
  },
  button: (language: Language) => {
    switch (language) {
      case "en":
        return "Next";
      case "th":
        return "ต่อไป";
      default:
        return "Next";
    }
  },
  inviteTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Invite your friends to join your school";
      case "th":
        return "เชิญคนอื่นมาร่วม โรงเรียนของคุณกัน";
      default:
        return "Invite your friends to join your school";
    }
  },
  inviteDone: (language: Language) => {
    switch (language) {
      case "en":
        return "Finish";
      case "th":
        return "สำเร็จ";
      default:
        return "Finish";
    }
  },
};
