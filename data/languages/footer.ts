import { Language } from "../../interfaces";

export const footerData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Your School Today!";
      case "th":
        return "สร้างโรงเรียนของคุณได้วันนี้!";
      default:
        return "Create Your School Today!";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Tatuga School is a platform that provides a variety of learning methods and materials for students.";
      case "th":
        return "Tatuga School เป็นแพลตฟอร์มที่ให้บริการวิธีการเรียนรู้และสื่อการสอนที่หลากหลายสำหรับนักเรียน";
      default:
        return "Tatuga School is a platform that provides a variety of learning methods and materials for students.";
    }
  },
  coppyright: (language: Language) => {
    switch (language) {
      case "en":
        return "© 2024 Tatuga Camp LP. All rights reserved.";
      case "th":
        return "© 2024 Tatuga Camp LP. สงวนลิขสิทธิ์";
      default:
        return "© 2024 Tatuga Camp LP. All rights reserved.";
    }
  },
} as const;
