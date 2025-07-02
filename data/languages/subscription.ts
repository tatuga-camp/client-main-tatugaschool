import { Language } from "../../interfaces";

export const subjectIsLockedDataLanguage = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "This subject is locked";
      case "th":
        return "รายวิชาถูกล็อค";
      default:
        return "This subject is locked";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "You can view data but cannot make any changes.";
      case "th":
        return "คุณสามารถดูข้อมูลได้ แต่ไม่สามารถแก้ไขหรือทำการเปลี่ยนแปลงใดๆได้";
      default:
        return "You can view data but cannot make any changes.";
    }
  },
  description2: (language: Language) => {
    switch (language) {
      case "en":
        return "Student are not affected by the locking subject ";
      case "th":
        return "การล็อครายวิชาไม่ส่งผลต่อนักเรียน นักเรียนยังคงใช้งานได้ปกติ";
      default:
        return "Student are not affected by the locking subject ";
    }
  },
  toUnlock: (language: Language) => {
    switch (language) {
      case "en":
        return "To unlock, please renew your subscription.";
      case "th":
        return "เพื่อที่จำทำการปลดล็อคกรุณาต่อระบบสมาชิก";
      default:
        return "To unlock, please renew your subscription.";
    }
  },
  renewButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Renew Subscription";
      case "th":
        return "สมัครสมาชิก";
      default:
        return "Renew Subscription";
    }
  },
  understandButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Click to confirm";
      case "th":
        return "ฉันเข้าใจ";
      default:
        return "Click to confirm";
    }
  },
} as const;

export const SubscriptionDataLanguage = {
  pricing: (language: Language) => {
    switch (language) {
      case "en":
        return "Pricing";
      case "th":
        return "ราคา";
      default:
        return "Pricing";
    }
  },
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Compare our plans and find yours";
      case "th":
        return "เปรียบเทียบระดับสมาชิกต่างๆ ";
      default:
        return "Compare our plans and find yours";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Select a plan that match to your needs!";
      case "th":
        return "เลือกแผนที่เหมาะกับความต้องการ";
      default:
        return "Select a plan that match to your needs!";
    }
  },
  monthly: (language: Language) => {
    switch (language) {
      case "en":
        return "Monthly billing";
      case "th":
        return "รายเดือน";
      default:
        return "Monthly billing";
    }
  },
  annual: (language: Language) => {
    switch (language) {
      case "en":
        return "Annual billing";
      case "th":
        return "รายปี";
      default:
        return "Annual billing";
    }
  },
  popular: (language: Language) => {
    switch (language) {
      case "en":
        return "Popular";
      case "th":
        return "ได้รับความนิยม";
      default:
        return "Popular";
    }
  },
  per_member_month: (language: Language) => {
    switch (language) {
      case "en":
        return "Per member/month";
      case "th":
        return "ราคาต่ออคนต่อเดือน";
      default:
        return "Per member/month";
    }
  },
  per_member_year: (language: Language) => {
    switch (language) {
      case "en":
        return "Per member/year";
      case "th":
        return "ราคาต่ออคนต่อปี";
      default:
        return "Per member/year";
    }
  },
} as const;
