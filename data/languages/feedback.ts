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
  rewardHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Get 20% off any plan. Your personal code appears after you submit.";
      case "th":
        return "รับส่วนลด 20% สำหรับทุกแพ็กเกจ โค้ดส่วนตัวของคุณจะแสดงหลังจากส่งความคิดเห็น";
      default:
        return "Get 20% off any plan. Your personal code appears after you submit.";
    }
  },
  rewardCounterRemaining: (language: Language, n: number) => {
    switch (language) {
      case "en":
        return `${n} more characters to earn your 20% code`;
      case "th":
        return `อีก ${n} ตัวอักษรเพื่อรับโค้ดส่วนลด 20%`;
      default:
        return `${n} more characters to earn your 20% code`;
    }
  },
  rewardCounterReady: (language: Language) => {
    switch (language) {
      case "en":
        return "✓ Your feedback qualifies for the 20% code";
      case "th":
        return "✓ ความคิดเห็นของคุณมีสิทธิ์รับโค้ดส่วนลด 20%";
      default:
        return "✓ Your feedback qualifies for the 20% code";
    }
  },
  anonymousNoReward: (language: Language) => {
    switch (language) {
      case "en":
        return "Anonymous feedback doesn't earn the 20% code. Untick this box to get your personal discount code.";
      case "th":
        return "ความคิดเห็นแบบไม่ระบุตัวตนไม่ได้รับโค้ดส่วนลด 20% ยกเลิกการเลือกช่องนี้เพื่อรับโค้ดส่วนลดส่วนตัวของคุณ";
      default:
        return "Anonymous feedback doesn't earn the 20% code. Untick this box to get your personal discount code.";
    }
  },
  campaignNote: (language: Language) => {
    switch (language) {
      case "en":
        return "One code per teacher. Anonymous feedback isn't eligible.";
      case "th":
        return "หนึ่งโค้ดต่อครู ความคิดเห็นแบบไม่ระบุตัวตนไม่มีสิทธิ์รับโค้ด";
      default:
        return "One code per teacher. Anonymous feedback isn't eligible.";
    }
  },
  rewardThanksTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Thank you for your feedback!";
      case "th":
        return "ขอบคุณสำหรับความคิดเห็นของคุณ!";
      default:
        return "Thank you for your feedback!";
    }
  },
  rewardIssuedLead: (language: Language) => {
    switch (language) {
      case "en":
        return "Here's your personal 20% off code as a thank-you.";
      case "th":
        return "นี่คือโค้ดส่วนลด 20% ส่วนตัวของคุณเพื่อขอบคุณ";
      default:
        return "Here's your personal 20% off code as a thank-you.";
    }
  },
  copyCode: (language: Language) => {
    switch (language) {
      case "en":
        return "Copy code";
      case "th":
        return "คัดลอกโค้ด";
      default:
        return "Copy code";
    }
  },
  codeCopied: (language: Language) => {
    switch (language) {
      case "en":
        return "Code copied";
      case "th":
        return "คัดลอกโค้ดแล้ว";
      default:
        return "Code copied";
    }
  },
  rewardDetailPlan: (language: Language) => {
    switch (language) {
      case "en":
        return "20% off any Tatuga School plan";
      case "th":
        return "ส่วนลด 20% สำหรับทุกแพ็กเกจของ Tatuga School";
      default:
        return "20% off any Tatuga School plan";
    }
  },
  rewardDetailExpiry: (language: Language, date: string) => {
    switch (language) {
      case "en":
        return `Can be used once, and expires on ${date}`;
      case "th":
        return `ใช้ได้ 1 ครั้ง และหมดอายุวันที่ ${date}`;
      default:
        return `Can be used once, and expires on ${date}`;
    }
  },
  rewardDetailEmail: (language: Language, email: string) => {
    switch (language) {
      case "en":
        return `We also sent it to ${email}`;
      case "th":
        return `เราได้ส่งโค้ดไปที่ ${email} ด้วยเช่นกัน`;
      default:
        return `We also sent it to ${email}`;
    }
  },
  rewardWhereToUse: (language: Language) => {
    switch (language) {
      case "en":
        return "Enter it at checkout or renewal in School → Billing & Plan. If you're not your school's billing manager, share the code with them.";
      case "th":
        return "กรอกโค้ดตอนชำระเงินหรือต่ออายุที่ โรงเรียน → ระบบสมาชิก หากคุณไม่ใช่บัญชีจัดการระบบสมาชิกของโรงเรียน โปรดแชร์โค้ดนี้ให้เจ้าของบัญชีดังกล่าว";
      default:
        return "Enter it at checkout or renewal in School → Billing & Plan. If you're not your school's billing manager, share the code with them.";
    }
  },
  alreadyReceivedLead: (language: Language) => {
    switch (language) {
      case "en":
        return "We've received it. Thanks for helping us make Tatuga School better.";
      case "th":
        return "เราได้รับแล้ว ขอบคุณที่ช่วยให้ Tatuga School ดียิ่งขึ้น";
      default:
        return "We've received it. Thanks for helping us make Tatuga School better.";
    }
  },
  alreadyReceivedWithCode: (language: Language, code: string, date: string) => {
    switch (language) {
      case "en":
        return `You've already received your one-time 20% code: ${code}, valid until ${date}. Each teacher gets one code.`;
      case "th":
        return `คุณได้รับโค้ดส่วนลด 20% แบบใช้ครั้งเดียวไปแล้ว: ${code} ใช้ได้ถึงวันที่ ${date} ครูแต่ละคนได้รับโค้ดเพียงหนึ่งโค้ด`;
      default:
        return `You've already received your one-time 20% code: ${code}, valid until ${date}. Each teacher gets one code.`;
    }
  },
  alreadyReceivedNoCode: (language: Language) => {
    switch (language) {
      case "en":
        return "You've already received your one-time 20% code. Each teacher gets one code.";
      case "th":
        return "คุณได้รับโค้ดส่วนลด 20% แบบใช้ครั้งเดียวไปแล้ว ครูแต่ละคนได้รับโค้ดเพียงหนึ่งโค้ด";
      default:
        return "You've already received your one-time 20% code. Each teacher gets one code.";
    }
  },
  campaignPageTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Give feedback, get 20% off";
      case "th":
        return "ให้ความคิดเห็น รับส่วนลด 20%";
      default:
        return "Give feedback, get 20% off";
    }
  },
  campaignEyebrow: (language: Language) => {
    switch (language) {
      case "en":
        return "Thank-you gift";
      case "th":
        return "ของขวัญขอบคุณ";
      default:
        return "Thank-you gift";
    }
  },
  campaignHeadline: (language: Language) => {
    switch (language) {
      case "en":
        return "Tell us what you think. Get 20% off any plan.";
      case "th":
        return "บอกเราว่าคุณคิดอย่างไร รับส่วนลด 20% สำหรับทุกแพ็กเกจ";
      default:
        return "Tell us what you think. Get 20% off any plan.";
    }
  },
  campaignStep1: (language: Language) => {
    switch (language) {
      case "en":
        return "1. Share feedback";
      case "th":
        return "1. แชร์ความคิดเห็น";
      default:
        return "1. Share feedback";
    }
  },
  campaignStep2: (language: Language) => {
    switch (language) {
      case "en":
        return "2. Get your code + email";
      case "th":
        return "2. รับโค้ดและอีเมล";
      default:
        return "2. Get your code + email";
    }
  },
  campaignStep3: (language: Language) => {
    switch (language) {
      case "en":
        return "3. Use within 30 days";
      case "th":
        return "3. ใช้ภายใน 30 วัน";
      default:
        return "3. Use within 30 days";
    }
  },
};
