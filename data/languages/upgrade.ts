import { Language } from "../../interfaces";

export const UpgradeDataLanguage = {
  modalTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "อัปเกรดแผนของคุณ";
      default:
        return "Upgrade your plan";
    }
  },
  membersLabel: (language: Language) => {
    switch (language) {
      case "th":
        return "จำนวนสมาชิก";
      default:
        return "Members";
    }
  },
  newPlanLine: (language: Language) => {
    switch (language) {
      case "th":
        return "แผนใหม่";
      default:
        return "New plan";
    }
  },
  creditLine: (language: Language, currentPlan: string) => {
    switch (language) {
      case "th":
        return `เครดิตคงเหลือจาก ${currentPlan}`;
      default:
        return `Unused ${currentPlan} credit`;
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
        return "ยืนยันการอัปเกรด";
      default:
        return "Confirm upgrade";
    }
  },
  genericError: (language: Language) => {
    switch (language) {
      case "th":
        return "ไม่สามารถคำนวณการอัปเกรดได้ กรุณาลองใหม่อีกครั้ง";
      default:
        return "Could not calculate the upgrade. Please try again.";
    }
  },
} as const;
