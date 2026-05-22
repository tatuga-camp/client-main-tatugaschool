import { Language } from "../../interfaces";

export const updatesLanguageData = {
  pageTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "What's New";
      case "th":
        return "อัปเดตล่าสุด";
      default:
        return "What's New";
    }
  },
  pageSubtitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Latest features, fixes, and news from Tatuga School";
      case "th":
        return "ฟีเจอร์ใหม่ การแก้ไข และข่าวสารจาก Tatuga School";
      default:
        return "Latest features, fixes, and news from Tatuga School";
    }
  },
  filterAll: (language: Language) => {
    switch (language) {
      case "en":
        return "All";
      case "th":
        return "ทั้งหมด";
      default:
        return "All";
    }
  },
  filterFeature: (language: Language) => {
    switch (language) {
      case "en":
        return "Feature";
      case "th":
        return "ฟีเจอร์";
      default:
        return "Feature";
    }
  },
  filterFix: (language: Language) => {
    switch (language) {
      case "en":
        return "Fix";
      case "th":
        return "การแก้ไข";
      default:
        return "Fix";
    }
  },
  filterNews: (language: Language) => {
    switch (language) {
      case "en":
        return "News";
      case "th":
        return "ข่าวสาร";
      default:
        return "News";
    }
  },
  filterAnnouncement: (language: Language) => {
    switch (language) {
      case "en":
        return "Announcement";
      case "th":
        return "ประกาศ";
      default:
        return "Announcement";
    }
  },
  empty: (language: Language) => {
    switch (language) {
      case "en":
        return "No updates yet. Check back soon!";
      case "th":
        return "ยังไม่มีอัปเดต กลับมาดูใหม่เร็ว ๆ นี้!";
      default:
        return "No updates yet. Check back soon!";
    }
  },
  emptyFiltered: (language: Language) => {
    switch (language) {
      case "en":
        return "No updates match this filter.";
      case "th":
        return "ไม่มีอัปเดตที่ตรงกับตัวกรองนี้";
      default:
        return "No updates match this filter.";
    }
  },
  error: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not load updates. Please try again later.";
      case "th":
        return "ไม่สามารถโหลดอัปเดตได้ โปรดลองอีกครั้งภายหลัง";
      default:
        return "Could not load updates. Please try again later.";
    }
  },
} as const;
