import { Language } from "../../interfaces";

export const wordCloudLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Word Cloud";
      case "th":
        return "เวิร์ดคลาวด์";
      default:
        return "Word Cloud";
    }
  },
  questionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Ask a question…";
      case "th":
        return "ตั้งคำถาม…";
      default:
        return "Ask a question…";
    }
  },
  audience: (language: Language) => {
    switch (language) {
      case "en":
        return "Audience:";
      case "th":
        return "ผู้ตอบ:";
      default:
        return "Audience:";
    }
  },
  audiencePublic: (language: Language) => {
    switch (language) {
      case "en":
        return "Anyone";
      case "th":
        return "ทุกคน";
      default:
        return "Anyone";
    }
  },
  audienceStudents: (language: Language) => {
    switch (language) {
      case "en":
        return "Students only";
      case "th":
        return "เฉพาะนักเรียน";
      default:
        return "Students only";
    }
  },
  allowMultiple: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow multiple answers per browser";
      case "th":
        return "อนุญาตให้ตอบได้หลายครั้งต่อเบราว์เซอร์";
      default:
        return "Allow multiple answers per browser";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create";
      case "th":
        return "สร้าง";
      default:
        return "Create";
    }
  },
  loading: (language: Language) => {
    switch (language) {
      case "en":
        return "Loading…";
      case "th":
        return "กำลังโหลด…";
      default:
        return "Loading…";
    }
  },
  emptyList: (language: Language) => {
    switch (language) {
      case "en":
        return "No word clouds yet. Create one above.";
      case "th":
        return "ยังไม่มีเมฆคำตอบ สร้างอันใหม่ด้านบน";
      default:
        return "No word clouds yet. Create one above.";
    }
  },
  open: (language: Language) => {
    switch (language) {
      case "en":
        return "Open";
      case "th":
        return "เปิด";
      default:
        return "Open";
    }
  },
  closed: (language: Language) => {
    switch (language) {
      case "en":
        return "Closed";
      case "th":
        return "ปิด";
      default:
        return "Closed";
    }
  },
  answers: (language: Language) => {
    switch (language) {
      case "en":
        return "answers";
      case "th":
        return "คำตอบ";
      default:
        return "answers";
    }
  },
  cloudView: (language: Language) => {
    switch (language) {
      case "en":
        return "Cloud";
      case "th":
        return "เมฆคำ";
      default:
        return "Cloud";
    }
  },
  barsView: (language: Language) => {
    switch (language) {
      case "en":
        return "Bars";
      case "th":
        return "แท่ง";
      default:
        return "Bars";
    }
  },
  closeActivity: (language: Language) => {
    switch (language) {
      case "en":
        return "Close activity";
      case "th":
        return "ปิดกิจกรรม";
      default:
        return "Close activity";
    }
  },
  reopenActivity: (language: Language) => {
    switch (language) {
      case "en":
        return "Reopen activity";
      case "th":
        return "เปิดกิจกรรมอีกครั้ง";
      default:
        return "Reopen activity";
    }
  },
  refreshNow: (language: Language) => {
    switch (language) {
      case "en":
        return "Refresh now";
      case "th":
        return "รีเฟรชตอนนี้";
      default:
        return "Refresh now";
    }
  },
  deleteAction: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบ";
      default:
        return "Delete";
    }
  },
  noAnswers: (language: Language) => {
    switch (language) {
      case "en":
        return "No answers yet";
      case "th":
        return "ยังไม่มีคำตอบ";
      default:
        return "No answers yet";
    }
  },
  answeredBy: (language: Language) => {
    switch (language) {
      case "en":
        return "Answered by";
      case "th":
        return "ตอบโดย";
      default:
        return "Answered by";
    }
  },
} as const;
