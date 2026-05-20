import { Language } from "../../interfaces";

export const DiscountDataLanguage = {
  modalTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "ยืนยันการสมัครสมาชิก";
      default:
        return "Confirm your subscription";
    }
  },
  discountCodeLabel: (language: Language) => {
    switch (language) {
      case "th":
        return "รหัสส่วนลด";
      default:
        return "Discount code";
    }
  },
  placeholder: (language: Language) => {
    switch (language) {
      case "th":
        return "กรอกรหัสส่วนลด";
      default:
        return "Enter discount code";
    }
  },
  applyButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ใช้รหัส";
      default:
        return "Apply";
    }
  },
  totalToday: (language: Language) => {
    switch (language) {
      case "th":
        return "ยอดชำระวันนี้";
      default:
        return "Total today";
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
  confirmPayButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ยืนยันและชำระเงิน";
      default:
        return "Confirm & Pay";
    }
  },
  sectionTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "มีรหัสส่วนลดหรือไม่?";
      default:
        return "Have a discount code?";
    }
  },
  renewalHint: (language: Language) => {
    switch (language) {
      case "th":
        return "ใช้รหัสกับใบแจ้งหนี้การต่ออายุครั้งถัดไปของคุณ";
      default:
        return "Apply it to your next renewal invoice.";
    }
  },
  applyToPlanButton: (language: Language) => {
    switch (language) {
      case "th":
        return "ใช้กับแผนของฉัน";
      default:
        return "Apply to my plan";
    }
  },
  appliedTitle: (language: Language) => {
    switch (language) {
      case "th":
        return "ใช้รหัสส่วนลดแล้ว";
      default:
        return "Code applied";
    }
  },
  appliedText: (language: Language) => {
    switch (language) {
      case "th":
        return "ใบแจ้งหนี้การต่ออายุครั้งถัดไปของคุณจะได้รับส่วนลด";
      default:
        return "Your next renewal invoice will be discounted.";
    }
  },
  genericError: (language: Language) => {
    switch (language) {
      case "th":
        return "ไม่สามารถตรวจสอบรหัสนี้ได้ กรุณาลองใหม่อีกครั้ง";
      default:
        return "Could not validate this code. Please try again.";
    }
  },
  discountLabel: (
    language: Language,
    discount: { type: "percent" | "amount"; value: number },
    mode: "new" | "renewal",
  ) => {
    const amount =
      discount.type === "percent"
        ? `${discount.value}%`
        : `${(discount.value / 100).toLocaleString()}฿`;
    if (mode === "new") {
      switch (language) {
        case "th":
          return `ลด ${amount} สำหรับการชำระเงินครั้งแรก`;
        default:
          return `${amount} off your first payment`;
      }
    }
    switch (language) {
      case "th":
        return `ลด ${amount} สำหรับการต่ออายุครั้งถัดไป`;
      default:
        return `${amount} off your next renewal`;
    }
  },
} as const;
