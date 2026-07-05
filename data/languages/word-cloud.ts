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
  sessionTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Word Cloud Session";
      case "th":
        return "เซสชันเวิร์ดคลาวด์";
      default:
        return "Word Cloud Session";
    }
  },
  addQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Add question";
      case "th":
        return "เพิ่มคำถาม";
      default:
        return "Add question";
    }
  },
  removeQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove";
      case "th":
        return "ลบ";
      default:
        return "Remove";
    }
  },
  questionN: (language: Language, n: number) => {
    switch (language) {
      case "en":
        return `Question ${n}`;
      case "th":
        return `คำถามที่ ${n}`;
      default:
        return `Question ${n}`;
    }
  },
  questionXofY: (language: Language, x: number, y: number) => {
    switch (language) {
      case "en":
        return `Question ${x} of ${y}`;
      case "th":
        return `คำถาม ${x} จาก ${y}`;
      default:
        return `Question ${x} of ${y}`;
    }
  },
  nextQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Next";
      case "th":
        return "ถัดไป";
      default:
        return "Next";
    }
  },
  prevQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Back";
      case "th":
        return "ย้อนกลับ";
      default:
        return "Back";
    }
  },
  liveBadge: (language: Language) => {
    switch (language) {
      case "en":
        return "LIVE";
      case "th":
        return "สด";
      default:
        return "LIVE";
    }
  },
  startSession: (language: Language) => {
    switch (language) {
      case "en":
        return "Start session";
      case "th":
        return "เริ่มเซสชัน";
      default:
        return "Start session";
    }
  },
  emptySets: (language: Language) => {
    switch (language) {
      case "en":
        return "No sessions yet. Create one above.";
      case "th":
        return "ยังไม่มีเซสชัน สร้างอันใหม่ด้านบน";
      default:
        return "No sessions yet. Create one above.";
    }
  },
  settings: (language: Language) => {
    switch (language) {
      case "en":
        return "Settings";
      case "th":
        return "ตั้งค่า";
      default:
        return "Settings";
    }
  },
  titleLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "Session name";
      case "th":
        return "ชื่อเซสชัน";
      default:
        return "Session name";
    }
  },
  titlePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Name this session…";
      case "th":
        return "ตั้งชื่อเซสชันนี้…";
      default:
        return "Name this session…";
    }
  },
  shareResults: (language: Language) => {
    switch (language) {
      case "en":
        return "Share results";
      case "th":
        return "แชร์ผลลัพธ์";
      default:
        return "Share results";
    }
  },
  shareResultsAction: (language: Language) => {
    switch (language) {
      case "en":
        return "Share results to public";
      case "th":
        return "สร้างลิงก์สาธารณะ";
      default:
        return "Share results to public";
    }
  },
  shareHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Anyone with this link can view the answers without logging in.";
      case "th":
        return "ทุกคนที่มีลิงก์นี้สามารถดูคำตอบได้โดยไม่ต้องเข้าสู่ระบบ";
      default:
        return "Anyone with this link can view the answers without logging in.";
    }
  },
  copyLink: (language: Language) => {
    switch (language) {
      case "en":
        return "Copy link";
      case "th":
        return "คัดลอกลิงก์";
      default:
        return "Copy link";
    }
  },
  copied: (language: Language) => {
    switch (language) {
      case "en":
        return "Copied!";
      case "th":
        return "คัดลอกแล้ว!";
      default:
        return "Copied!";
    }
  },
  removePublicLink: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove public link";
      case "th":
        return "ลบลิงก์สาธารณะ";
      default:
        return "Remove public link";
    }
  },
} as const;
