import { Language } from "../../interfaces";

export const homepageDataLanguage = {
  welcome: (language: Language) => {
    switch (language) {
      case "en":
        return "Welcome Back";
      case "th":
        return "ยินดีต้อนรับกลับมา";
      default:
        return "Welcome Back";
    }
  },
  welcomeDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "This is your Homepage Schools Dashboard.";
      case "th":
        return "นี่คือหน้ารายชื่อของโรงเรียนทั้งหมดที่คุณเป็นสมาชิก";
      default:
        return "This is your Homepage Schools Dashboard.";
    }
  },
  selectSchool: (language: Language) => {
    switch (language) {
      case "en":
        return "Select Your School";
      case "th":
        return "เลือกโรงเรียนของคุณ";
      default:
        return "Select Your School";
    }
  },
  selectSchoolDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Lists of your school";
      case "th":
        return "รายชื่อโรงเรียนของคุณ";
      default:
        return "Lists of your school";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create School";
      case "th":
        return "สร้างโรงเรียน";
      default:
        return "Create School";
    }
  },
  join: (language: Language) => {
    switch (language) {
      case "en":
        return "Join School";
      case "th":
        return "เข้าร่วมโรงเรียน";
      default:
        return "Join School";
    }
  },
  openSchool: (language: Language) =>
    language === "th" ? "เข้าโรงเรียน" : "Open school",
  searchPlaceholder: (language: Language) =>
    language === "th" ? "ค้นหาโรงเรียน..." : "Search schools...",
  schoolCount: (language: Language, count: number) =>
    language === "th" ? `${count} โรงเรียน` : `${count} ${count === 1 ? "school" : "schools"}`,
  defaultBadge: (language: Language) =>
    language === "th" ? "โรงเรียนหลัก" : "Default",
  setDefault: (language: Language) =>
    language === "th" ? "ตั้งเป็นหลัก" : "Set as default",
  setDefaultAria: (language: Language, title: string) =>
    language === "th"
      ? `ตั้ง ${title} เป็นโรงเรียนหลัก`
      : `Make ${title} your default school`,
  defaultHintTitle: (language: Language, title: string) =>
    language === "th"
      ? `โรงเรียนหลักของคุณคือ ${title}`
      : `${title} is your default school`,
  noDefaultHintTitle: (language: Language) =>
    language === "th"
      ? "ยังไม่ได้เลือกโรงเรียนหลัก"
      : "You haven't picked a default school yet",
  defaultHintBody: (language: Language) =>
    language === "th"
      ? "โรงเรียนหลักจะเปิดให้อัตโนมัติหลังเข้าสู่ระบบ และเมื่อกดโลโก้ Tatuga ด้านบน หากต้องการเปลี่ยน ให้กดปุ่ม “ตั้งเป็นหลัก” ที่การ์ดโรงเรียนที่ต้องการ"
      : "Your default school opens right after you sign in and when you tap the Tatuga logo at the top. To change it, press “Set as default” on the school you want.",
  defaultSaveError: (language: Language) =>
    language === "th"
      ? "บันทึกโรงเรียนหลักไม่สำเร็จ กรุณาลองใหม่"
      : "Couldn't save your default school. Please try again.",
  noDescription: (language: Language) =>
    language === "th" ? "ยังไม่มีคำอธิบาย" : "No description yet",
  createdOn: (language: Language, date: string) =>
    language === "th" ? `สร้างเมื่อ ${date}` : `Created ${date}`,
  renewsOn: (language: Language, date: string) =>
    language === "th" ? `ต่ออายุ ${date}` : `Renews ${date}`,
  expiredOn: (language: Language, date: string) =>
    language === "th" ? `หมดอายุเมื่อ ${date}` : `Expired ${date}`,
  storage: (language: Language) =>
    language === "th" ? "พื้นที่จัดเก็บ" : "Storage",
  unlimited: (language: Language) =>
    language === "th" ? "ไม่จำกัด" : "Unlimited",
  createCardTitle: (language: Language) =>
    language === "th" ? "สร้างโรงเรียนใหม่" : "Create a new school",
  createCardBody: (language: Language) =>
    language === "th"
      ? "เริ่มต้นฟรี เพิ่มครูและห้องเรียนได้ภายหลัง"
      : "Start free. Add teachers and classes later.",
  emptyTitle: (language: Language) =>
    language === "th" ? "คุณยังไม่มีโรงเรียน" : "You're not in a school yet",
  emptyBody: (language: Language) =>
    language === "th"
      ? "สร้างโรงเรียนของคุณ หรือขอให้ผู้ดูแลโรงเรียนส่งคำเชิญมาที่อีเมลของคุณ"
      : "Create your own school, or ask a school admin to invite your email.",
  noMatchTitle: (language: Language) =>
    language === "th" ? "ไม่พบโรงเรียนที่ค้นหา" : "No schools match your search",
  noMatchBody: (language: Language) =>
    language === "th" ? "ลองค้นหาด้วยชื่ออื่น หรือจังหวัด" : "Try another name or city.",
  clearSearch: (language: Language) =>
    language === "th" ? "ล้างการค้นหา" : "Clear search",
  loadError: (language: Language) =>
    language === "th" ? "โหลดรายชื่อโรงเรียนไม่สำเร็จ" : "Couldn't load your schools",
  retry: (language: Language) => (language === "th" ? "ลองอีกครั้ง" : "Try again"),
} as const;
