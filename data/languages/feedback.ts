import { Language } from "../../interfaces";

export const feedbackLanguageData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Feedback & Support";
      case "th":
        return "แจ้งปัญหาและเสนอแนะ";
      default:
        return "Feedback & Support";
    }
  },
  subtitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Help us improve Tatuga School by providing your feedback or reporting bugs.";
      case "th":
        return "ช่วยเราพัฒนา Tatuga School โดยการให้คำติชมหรือแจ้งปัญหา";
      default:
        return "Help us improve Tatuga School by providing your feedback or reporting bugs.";
    }
  },
  bodyPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Tell us what you think or what's wrong...";
      case "th":
        return "บอกเราเกี่ยวกับสิ่งที่คุณคิดหรือปัญหาที่พบ...";
      default:
        return "Tell us what you think or what's wrong...";
    }
  },
  tagLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "Type";
      case "th":
        return "ประเภท";
      default:
        return "Type";
    }
  },
  tags: {
    COMPLIMENT: (language: Language) => {
      switch (language) {
        case "en":
          return "Compliment";
        case "th":
          return "คำชม";
        default:
          return "Compliment";
      }
    },
    BUG: (language: Language) => {
      switch (language) {
        case "en":
          return "Bug Report";
        case "th":
          return "แจ้งปัญหา";
        default:
          return "Bug Report";
      }
    },
    REQUEST_FEATURE: (language: Language) => {
      switch (language) {
        case "en":
          return "Feature Request";
        case "th":
          return "เสนอแนะฟีเจอร์ใหม่";
        default:
          return "Feature Request";
      }
    },
  },
  incognitoMode: (language: Language) => {
    switch (language) {
      case "en":
        return "Submit anonymously (Do not include your user info)";
      case "th":
        return "ส่งแบบไม่ระบุตัวตน (ไม่ส่งข้อมูลผู้ใช้ของคุณ)";
      default:
        return "Submit anonymously (Do not include your user info)";
    }
  },
  attachFiles: (language: Language) => {
    switch (language) {
      case "en":
        return "Attach files (Max 5MB per file)";
      case "th":
        return "แนบไฟล์ (สูงสุด 5MB ต่อไฟล์)";
      default:
        return "Attach files (Max 5MB per file)";
    }
  },
  submit: (language: Language) => {
    switch (language) {
      case "en":
        return "Submit Feedback";
      case "th":
        return "ส่งคำติชม";
      default:
        return "Submit Feedback";
    }
  },
  submitting: (language: Language) => {
    switch (language) {
      case "en":
        return "Submitting...";
      case "th":
        return "กำลังส่ง...";
      default:
        return "Submitting...";
    }
  },
  successTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Thank you!";
      case "th":
        return "ขอบคุณ!";
      default:
        return "Thank you!";
    }
  },
  successMessage: (language: Language) => {
    switch (language) {
      case "en":
        return "Your feedback has been successfully submitted.";
      case "th":
        return "เราได้รับคำติชมของคุณแล้ว ขอบคุณที่ช่วยเราพัฒนา!";
      default:
        return "Your feedback has been successfully submitted.";
    }
  },
  errorRequiredBody: (language: Language) => {
    switch (language) {
      case "en":
        return "Please enter your feedback.";
      case "th":
        return "กรุณาระบุรายละเอียด";
      default:
        return "Please enter your feedback.";
    }
  },
  errorRequiredTag: (language: Language) => {
    switch (language) {
      case "en":
        return "Please select a feedback type.";
      case "th":
        return "กรุณาเลือกประเภท";
      default:
        return "Please select a feedback type.";
    }
  },
  close: (language: Language) => {
    switch (language) {
      case "en":
        return "Close";
      case "th":
        return "ปิด";
      default:
        return "Close";
    }
  },
};
