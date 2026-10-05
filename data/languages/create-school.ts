import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const createSchoolDataLanguage = {
  title: (language: Language) =>
    pick(language, "Set up your school", "ตั้งค่าโรงเรียนของคุณ"),
  subtitle: (language: Language) =>
    pick(
      language,
      "Teachers and students will see these details. You can change them later in school settings.",
      "ครูและนักเรียนจะเห็นข้อมูลนี้ คุณแก้ไขได้ภายหลังในหน้าตั้งค่าโรงเรียน",
    ),
  profile: (language: Language) =>
    pick(language, "School profile", "ข้อมูลโรงเรียน"),
  address: (language: Language) =>
    pick(language, "Address & contact", "ที่อยู่และการติดต่อ"),
  invite: (language: Language) =>
    pick(language, "Invite teachers", "เชิญครู"),
  stepOf: (language: Language, step: number, total: number) =>
    pick(
      language,
      `Step ${step} of ${total}`,
      `ขั้นตอนที่ ${step} จาก ${total}`,
    ),
  logo: (language: Language) => pick(language, "School logo", "โลโก้โรงเรียน"),
  uploadTitle: (language: Language) =>
    pick(language, "Upload logo", "อัปโหลดโลโก้"),
  replaceLogo: (language: Language) =>
    pick(language, "Replace logo", "เปลี่ยนโลโก้"),
  uploadingLogo: (language: Language) =>
    pick(language, "Uploading…", "กำลังอัปโหลด…"),
  logoHint: (language: Language) =>
    pick(
      language,
      "A square PNG or JPG looks best.",
      "ใช้ไฟล์ PNG หรือ JPG ทรงสี่เหลี่ยมจัตุรัสจะสวยที่สุด",
    ),
  logoRequired: (language: Language) =>
    pick(
      language,
      "Upload your school's logo",
      "กรุณาอัปโหลดโลโก้โรงเรียน",
    ),
  school: (language: Language) =>
    pick(language, "School name", "ชื่อโรงเรียน"),
  schoolPlaceholder: (language: Language) =>
    pick(language, "e.g. Bangkok Wittaya School", "เช่น โรงเรียนกรุงเทพวิทยา"),
  description: (language: Language) =>
    pick(language, "Short description", "คำอธิบายสั้น ๆ"),
  descriptionPlaceholder: (language: Language) =>
    pick(
      language,
      "e.g. Secondary school, grades 7–12",
      "เช่น โรงเรียนมัธยม ชั้น ม.1–ม.6",
    ),
  country: (language: Language) => pick(language, "Country", "ประเทศ"),
  countryPlaceholder: (language: Language) =>
    pick(language, "Select a country", "เลือกประเทศ"),
  streetAddress: (language: Language) =>
    pick(language, "Address", "ที่อยู่"),
  streetAddressPlaceholder: (language: Language) =>
    pick(
      language,
      "House number, road, sub-district",
      "เลขที่ ถนน ตำบล/แขวง",
    ),
  city: (language: Language) =>
    pick(language, "City or province", "จังหวัด"),
  zipCode: (language: Language) => pick(language, "Postal code", "รหัสไปรษณีย์"),
  phone: (language: Language) =>
    pick(language, "School phone number", "เบอร์โทรศัพท์โรงเรียน"),
  required: (language: Language) =>
    pick(language, "Fill in this field", "กรุณากรอกช่องนี้"),
  invalidPhone: (language: Language) =>
    pick(language, "Enter the school's phone number", "กรอกเบอร์โทรศัพท์โรงเรียน"),
  button: (language: Language) => pick(language, "Continue", "ถัดไป"),
  back: (language: Language) => pick(language, "Back", "ย้อนกลับ"),
  create: (language: Language) =>
    pick(language, "Create school", "สร้างโรงเรียน"),
  creating: (language: Language) =>
    pick(language, "Creating school…", "กำลังสร้างโรงเรียน…"),
  created: (language: Language) =>
    pick(language, "School created", "สร้างโรงเรียนแล้ว"),
  createdDetail: (language: Language) =>
    pick(
      language,
      "Invite the teachers you work with now, or skip and do it later from the Members tab.",
      "เชิญครูที่ทำงานร่วมกันได้เลย หรือข้ามไปก่อนแล้วเชิญภายหลังที่แท็บสมาชิก",
    ),
  preview: (language: Language) =>
    pick(language, "Preview", "ตัวอย่าง"),
  previewName: (language: Language) =>
    pick(language, "Your school's name", "ชื่อโรงเรียนของคุณ"),
  previewDescription: (language: Language) =>
    pick(
      language,
      "Your description appears here",
      "คำอธิบายจะแสดงตรงนี้",
    ),
  inviteTitle: (language: Language) =>
    pick(
      language,
      "Search for teachers by email",
      "ค้นหาครูด้วยอีเมล",
    ),
  inviteDone: (language: Language) =>
    pick(language, "Go to my school", "ไปที่โรงเรียนของฉัน"),
};
