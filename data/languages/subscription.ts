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
        return "Price for";
      case "th":
        return "ราคารายเดือนสำหรับจำนวนคุณครู";
      default:
        return "Price for";
    }
  },
  per_member_year: (language: Language) => {
    switch (language) {
      case "en":
        return "Price for";
      case "th":
        return "ราคารายปีสำหรับจำนวนคุณครู";
      default:
        return "Price for";
    }
  },
  only: (language: Language) => {
    switch (language) {
      case "en":
        return "Only";
      case "th":
        return "ตกเดือนละ";
      default:
        return "Only";
    }
  },
  month_unit: (language: Language) => {
    switch (language) {
      case "en":
        return "/mo";
      case "th":
        return "/เดือน";
      default:
        return "/mo";
    }
  },
  save_up_to: (language: Language, percent: number) => {
    switch (language) {
      case "th":
        return `ประหยัดสูงสุด ${percent}%`;
      default:
        return `Save up to ${percent}%`;
    }
  },
  available: (language: Language) => {
    switch (language) {
      case "th":
        return "มีให้บริการ";
      default:
        return "Available";
    }
  },
  not_available: (language: Language) => {
    switch (language) {
      case "th":
        return "ไม่มีให้บริการ";
      default:
        return "Not available";
    }
  },
  annual_only: (language: Language) => {
    switch (language) {
      case "th":
        return "สมัครได้เฉพาะรายปี";
      default:
        return "Annual billing only";
    }
  },
  get_started: (language: Language) => {
    switch (language) {
      case "th":
        return "เริ่มต้นใช้งาน";
      default:
        return "Get started";
    }
  },
  upgrade: (language: Language) => {
    switch (language) {
      case "th":
        return "อัปเกรด";
      default:
        return "Upgrade";
    }
  },
  current_plan: (language: Language) => {
    switch (language) {
      case "th":
        return "แผนปัจจุบันของคุณ";
      default:
        return "You are on this plan";
    }
  },
  update_members: (language: Language) => {
    switch (language) {
      case "th":
        return "อัปเดตจำนวนสมาชิก";
      default:
        return "Update members";
    }
  },
  members_label: (language: Language) => {
    switch (language) {
      case "th":
        return "จำนวนคุณครู (4 - 500)";
      default:
        return "Number of teachers (4 - 500)";
    }
  },
  ai_quiz_per_month: (language: Language, count: number) => {
    switch (language) {
      case "th":
        return `สร้างแบบทดสอบด้วย AI ${count.toLocaleString()} ครั้ง/เดือน`;
      default:
        return `${count.toLocaleString()} AI quiz generations / month`;
    }
  },
} as const;
