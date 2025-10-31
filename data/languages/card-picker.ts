import { Language } from "../../interfaces";

export const CardPickerLanguage = {
  restart: (language: Language) => {
    switch (language) {
      case "en":
        return "restart";
      case "th":
        return "เริ่มใหม่";
      default:
        return "restart";
    }
  },
  shuffle: (language: Language) => {
    switch (language) {
      case "en":
        return "shuffle";
      case "th":
        return "สับการ์ด";
      default:
        return "shuffle";
    }
  },
  delete_name: (language: Language) => {
    switch (language) {
      case "en":
        return "delete";
      case "th":
        return "ลบชื่อ";
      default:
        return "delete";
    }
  },
  give_score: (language: Language) => {
    switch (language) {
      case "en":
        return "give score";
      case "th":
        return "ให้คะแนน";
      default:
        return "give score";
    }
  },
  cancel: (language: Language) => {
    switch (language) {
      case "en":
        return "cancel";
      case "th":
        return "ออก";
      default:
        return "cancel";
    }
  },
} as const;
