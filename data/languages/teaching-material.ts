import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

export const teachingMaterialDataLanguage = {
  title: t("Teaching Materials", "สื่อการสอน"),
  description: t(
    "Search worksheets, templates and other materials to use in your classroom",
    "ค้นหาใบงาน เทมเพลต และสื่อการสอนอื่น ๆ เพื่อนำไปใช้ในห้องเรียนของคุณ",
  ),
  available: (count: number) => (language: Language) =>
    language === "th"
      ? `มีสื่อการสอนทั้งหมด ${count.toLocaleString("th-TH")} รายการ`
      : `${count.toLocaleString("en-US")} materials available`,
  search: t("Search", "ค้นหาสื่อการสอน"),
  searchPlaceholder: t(
    "Describe what you need, e.g. math games for grade 5",
    "พิมพ์สิ่งที่ต้องการ เช่น เกมคณิตศาสตร์สำหรับ ป.5",
  ),
  searchButton: t("Search", "ค้นหา"),
  quickSearch: t("Try:", "ลองค้นหา:"),
  create: t("Add material", "เพิ่มสื่อการสอน"),
  results: t("Results", "ผลการค้นหา"),
  found: (count: number) => (language: Language) =>
    language === "th"
      ? `${count.toLocaleString("th-TH")} รายการ`
      : `${count.toLocaleString("en-US")} ${count === 1 ? "item" : "items"}`,
  sortBy: t("Sort by", "เรียงตาม"),
  sortRelevant: t("Most relevant", "ตรงกับคำค้นหา"),
  sortRecent: t("Recently added", "เพิ่มล่าสุด"),
  match: t("Match", "ความตรง"),
  createdAt: t("Added", "เพิ่มเมื่อ"),
  noThumbnail: t("No preview", "ไม่มีตัวอย่าง"),
  emptyTitle: t("No materials found", "ไม่พบสื่อการสอน"),
  emptyHint: t(
    "Try different keywords or one of the suggestions above",
    "ลองใช้คำค้นหาอื่น หรือเลือกจากคำแนะนำด้านบน",
  ),
  errorTitle: t("Could not load materials", "ไม่สามารถโหลดสื่อการสอนได้"),
  // Detail panel (TeachingMaterialShow)
  detailLabel: t("Teaching material", "สื่อการสอน"),
  edit: t("Edit", "แก้ไข"),
  close: t("Close", "ปิด"),
  openInCanva: t("Open in Canva", "เปิดใน Canva"),
  creator: t("Source", "ที่มา"),
  files: t("Files", "ไฟล์"),
  noFiles: t("No files attached yet", "ยังไม่มีไฟล์แนบ"),
  view: t("Open", "เปิดดู"),
  download: t("Download", "ดาวน์โหลด"),
  cannotPreview: t(
    "This file type cannot be previewed here. Download it to open.",
    "ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้ กรุณาดาวน์โหลดเพื่อเปิด",
  ),
  detailError: t(
    "Could not load this material",
    "ไม่สามารถโหลดสื่อการสอนนี้ได้",
  ),
  // Create / edit form
  formCreateTitle: t("Add material", "เพิ่มสื่อการสอน"),
  formEditTitle: t("Edit material", "แก้ไขสื่อการสอน"),
  formSubtitle: t(
    "Upload files and fill in the details teachers will search by",
    "อัปโหลดไฟล์และกรอกรายละเอียดที่คุณครูจะใช้ค้นหา",
  ),
  dropTitle: t(
    "Drop files here or choose from your device",
    "ลากไฟล์มาวางที่นี่ หรือเลือกจากอุปกรณ์",
  ),
  dropHint: t(
    "PDF, Word, PowerPoint, Excel, images or video, up to 100 MB each",
    "PDF, Word, PowerPoint, Excel, รูปภาพ หรือวิดีโอ ไม่เกิน 100 MB ต่อไฟล์",
  ),
  chooseFiles: t("Choose files", "เลือกไฟล์"),
  selectedFiles: t("Attached files", "ไฟล์ที่แนบ"),
  remove: t("Remove", "ลบ"),
  uploaded: t("Uploaded", "อัปโหลดแล้ว"),
  suggestFromFiles: t("Fill in details from files", "กรอกรายละเอียดจากไฟล์"),
  suggestHint: t(
    "Uploads the files and suggests titles, tags and a description",
    "อัปโหลดไฟล์แล้วช่วยแนะนำชื่อ แท็ก และคำอธิบาย",
  ),
  accessLevel: t("Access level", "ระดับการเข้าถึง"),
  titleEn: t("Title (English)", "ชื่อ (ภาษาอังกฤษ)"),
  titleTh: t("Title (Thai)", "ชื่อ (ภาษาไทย)"),
  titleEnPlaceholder: t(
    "e.g. English worksheet for grade 2",
    "เช่น English worksheet for grade 2",
  ),
  titleThPlaceholder: t("e.g. ใบงานภาษาอังกฤษ ป.2", "เช่น ใบงานภาษาอังกฤษ ป.2"),
  creatorUrl: t("Source link", "ลิงก์ที่มา"),
  canvaUrl: t("Canva link (optional)", "ลิงก์ Canva (ไม่บังคับ)"),
  urlPlaceholder: t("https://", "https://"),
  tags: t("Tags", "แท็ก"),
  tagPlaceholder: t("Add a tag", "เพิ่มแท็ก"),
  addTag: t("Add", "เพิ่ม"),
  noTags: t("No tags yet", "ยังไม่มีแท็ก"),
  suggestedTags: t("Suggestions:", "แท็กแนะนำ:"),
  descriptionLabel: t("Description", "คำอธิบาย"),
  descriptionPlaceholder: t(
    "What is in this material and how can teachers use it?",
    "สื่อนี้มีอะไรบ้าง และคุณครูนำไปใช้อย่างไร",
  ),
  cancel: t("Cancel", "ยกเลิก"),
  saveCreate: t("Add material", "เพิ่มสื่อการสอน"),
  saveUpdate: t("Save changes", "บันทึกการแก้ไข"),
} as const;
