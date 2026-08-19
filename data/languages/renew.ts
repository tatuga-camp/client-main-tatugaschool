import { Language } from "../../interfaces";

export const RenewDataLanguage = {
  modalTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "ต่ออายุแผนของคุณ";
      default:
        return "Renew your plan";
    }
  },
  currentPlanLine: (language: Language) => {
    switch (language) {
      case "th":
        return "แผนปัจจุบัน";
      default:
        return "Current plan";
    }
  },
  fullPriceLine: (language: Language) => {
    switch (language) {
      case "th":
        return "ราคาเต็มของแผน";
      default:
        return "Full plan price";
    }
  },
  creditLine: (language: Language, days: number) => {
    switch (language) {
      case "th":
        return `เครดิตจากเวลาที่เหลือ ${days} วัน`;
      default:
        return `Credit for your remaining ${days} ${days === 1 ? "day" : "days"}`;
    }
  },
  dueToday: (language: Language) => {
    switch (language) {
      case "th":
        return "ยอดชำระวันนี้";
      default:
        return "Due today";
    }
  },
  calculating: (language: Language) => {
    switch (language) {
      case "th":
        return "กำลังคำนวณ...";
      default:
        return "Calculating...";
    }
  },
  cancelButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ยกเลิก";
      default:
        return "Cancel";
    }
  },
  confirmButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ต่ออายุตอนนี้";
      default:
        return "Renew now";
    }
  },
  renewEarlyButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ต่ออายุล่วงหน้า";
      default:
        return "Renew early";
    }
  },
  genericError: (language: Language) => {
    switch (language) {
      case "th":
        return "ไม่สามารถคำนวณราคาได้ กรุณาลองใหม่อีกครั้ง";
      default:
        return "Could not calculate the price. Please try again.";
    }
  },
  barMessage: (language: Language, plan: string, days: number) => {
    switch (language) {
      case "th":
        return `แผน ${plan} ของโรงเรียนจะหมดอายุในอีก ${days} วัน`;
      default:
        return `Your ${plan} subscription expires in ${days} ${days === 1 ? "day" : "days"}`;
    }
  },
  barContactManager: (language: Language) => {
    switch (language) {
      case "th":
        return "ติดต่อผู้จัดการการเรียกเก็บเงินของโรงเรียนเพื่อต่ออายุ";
      default:
        return "Contact your billing manager to renew";
    }
  },
};
