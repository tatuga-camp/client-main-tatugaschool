import { Language } from "../../interfaces";

export const announcementDataLanguage = {
  sectionTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Announcements";
      case "th":
        return "ประกาศ";
      default:
        return "Announcements";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "New announcement";
      case "th":
        return "ประกาศใหม่";
      default:
        return "New announcement";
    }
  },
  composerTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "New announcement";
      case "th":
        return "สร้างประกาศใหม่";
      default:
        return "New announcement";
    }
  },
  titlePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Title";
      case "th":
        return "หัวข้อ";
      default:
        return "Title";
    }
  },
  attachFiles: (language: Language) => {
    switch (language) {
      case "en":
        return "Attach files";
      case "th":
        return "แนบไฟล์";
      default:
        return "Attach files";
    }
  },
  post: (language: Language) => {
    switch (language) {
      case "en":
        return "Post announcement";
      case "th":
        return "โพสต์ประกาศ";
      default:
        return "Post announcement";
    }
  },
  posting: (language: Language) => {
    switch (language) {
      case "en":
        return "Posting...";
      case "th":
        return "กำลังโพสต์...";
      default:
        return "Posting...";
    }
  },
  posted: (language: Language) => {
    switch (language) {
      case "en":
        return "Announcement has been posted";
      case "th":
        return "ประกาศถูกโพสต์แล้ว";
      default:
        return "Announcement has been posted";
    }
  },
  deleteAnnouncementConfirm: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete this announcement and all its comments?";
      case "th":
        return "ลบประกาศนี้พร้อมความคิดเห็นทั้งหมดหรือไม่?";
      default:
        return "Delete this announcement and all its comments?";
    }
  },
  comments: (language: Language) => {
    switch (language) {
      case "en":
        return "Comments";
      case "th":
        return "ความคิดเห็น";
      default:
        return "Comments";
    }
  },
  replyAsTeacher: (language: Language) => {
    switch (language) {
      case "en":
        return "Reply as teacher...";
      case "th":
        return "ตอบกลับในฐานะครู...";
      default:
        return "Reply as teacher...";
    }
  },
  send: (language: Language) => {
    switch (language) {
      case "en":
        return "Send";
      case "th":
        return "ส่ง";
      default:
        return "Send";
    }
  },
  delete: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบ";
      default:
        return "Delete";
    }
  },
  attachments: (language: Language) => {
    switch (language) {
      case "en":
        return "Attachments";
      case "th":
        return "ไฟล์แนบ";
      default:
        return "Attachments";
    }
  },
} as const;
