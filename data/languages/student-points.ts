import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

// Copy for the subject "Students" tab: student grid, multi-select bar and the
// give-points panel (ScorePanel + its skill form).
export const studentPointsLanguage = {
  title: t("Students", "นักเรียน"),
  description: t(
    "Tap a student to give points. Drag cards to change the order.",
    "แตะที่นักเรียนเพื่อให้คะแนน ลากการ์ดเพื่อเปลี่ยนลำดับ",
  ),
  descriptionSorted: t(
    "Tap a student to give points. Clear the sort to drag cards again.",
    "แตะที่นักเรียนเพื่อให้คะแนน ล้างการเรียงลำดับเพื่อลากการ์ดได้อีกครั้ง",
  ),
  studentsView: t("Students", "นักเรียน"),
  groupsView: t("Groups", "กลุ่ม"),
  selectSeveral: t("Select several", "เลือกหลายคน"),
  selectSeveralHint: t("Give points to many at once", "ให้คะแนนหลายคนพร้อมกัน"),
  selecting: t("Tap students to select", "แตะเพื่อเลือกนักเรียน"),
  selected: (count: number) => (language: Language) =>
    language === "th" ? `เลือกแล้ว ${count} คน` : `${count} selected`,
  selectAll: t("Select all", "เลือกทั้งหมด"),
  unselectAll: t("Clear", "ล้าง"),
  cancel: t("Cancel", "ยกเลิก"),
  givePoints: t("Give points", "ให้คะแนน"),
  number: t("No.", "เลขที่"),
  points: t("points", "คะแนน"),
  dragToReorder: t("Drag to reorder", "ลากเพื่อเปลี่ยนลำดับ"),
  allDates: t("All dates", "ทุกวัน"),
  clearDates: t("Clear dates", "ล้างวันที่"),

  // Points date filter
  periodTitle: t("Count points from", "นับคะแนนจากช่วงเวลา"),
  periodHint: t(
    "Cards show only the points given in this period. Rank by points to see who is on top.",
    "การ์ดจะแสดงเฉพาะคะแนนที่ได้รับในช่วงนี้ เรียงตามคะแนนเพื่อดูว่าใครได้มากที่สุด",
  ),
  presetAll: t("All time", "ทั้งหมด"),
  presetToday: t("Today", "วันนี้"),
  presetYesterday: t("Yesterday", "เมื่อวาน"),
  presetThisWeek: t("This week", "สัปดาห์นี้"),
  presetLastWeek: t("Last week", "สัปดาห์ที่แล้ว"),
  presetThisMonth: t("This month", "เดือนนี้"),
  presetCustom: t("Custom range", "กำหนดเอง"),
  from: t("From", "ตั้งแต่"),
  to: t("To", "ถึง"),
  apply: t("Apply", "ใช้ช่วงนี้"),
  showingPeriod: (period: string, range: string) => (language: Language) =>
    language === "th"
      ? `แสดงคะแนนที่ได้รับ${period} (${range})`
      : `Showing points given ${period.toLowerCase()} (${range})`,
  showingCustom: (range: string) => (language: Language) =>
    language === "th"
      ? `แสดงคะแนนที่ได้รับช่วง ${range}`
      : `Showing points given ${range}`,
  topEarner: t("Top", "สูงสุด"),
  tiedWith: (count: number) => (language: Language) =>
    language === "th" ? `และอีก ${count} คน` : `+${count} tied`,
  noPointsInPeriod: t(
    "No points given in this period yet.",
    "ยังไม่มีการให้คะแนนในช่วงนี้",
  ),
  rankByPoints: t("Rank by points", "เรียงตามคะแนน"),
  showAllTime: t("Show all time", "ดูทั้งหมด"),
  sort: t("Sort", "เรียง"),
  sortByScore: t("Points", "คะแนน"),
  sortByName: t("Name", "ชื่อ"),
  sortByNumber: t("Number", "เลขที่"),
  defaultOrder: t("Custom order", "ลำดับที่จัดเอง"),
  noStudents: t("No students in this subject yet", "ยังไม่มีนักเรียนในวิชานี้"),
  noStudentsHint: t(
    "Add students to this subject's classroom. They show up here automatically.",
    "เพิ่มนักเรียนในห้องเรียนของวิชานี้ แล้วนักเรียนจะแสดงที่นี่โดยอัตโนมัติ",
  ),
  givenToast: (points: number, count: number) => (language: Language) => {
    const signed = points > 0 ? `+${points}` : `${points}`;
    return language === "th"
      ? `ให้ ${signed} คะแนนกับนักเรียน ${count} คน`
      : `Gave ${signed} to ${count} ${count === 1 ? "student" : "students"}`;
  },

  // ScorePanel
  panelTitle: t("Give points", "ให้คะแนน"),
  panelHint: t(
    "Pick a skill, adjust the points, then give.",
    "เลือกทักษะ ปรับคะแนน แล้วกดให้คะแนน",
  ),
  addSkill: t("Add skill", "เพิ่มทักษะ"),
  editSkill: t("Edit skill", "แก้ไขทักษะ"),
  pointsLabel: t("Points", "คะแนน"),
  pickSkillFirst: t("Pick a skill first", "เลือกทักษะก่อน"),
  giveAmount: (points: number) => (language: Language) => {
    const signed = points > 0 ? `+${points}` : `${points}`;
    return language === "th" ? `ให้ ${signed} คะแนน` : `Give ${signed}`;
  },
  noSkills: t(
    "No skills yet. Add one to start giving points.",
    "ยังไม่มีทักษะ เพิ่มทักษะเพื่อเริ่มให้คะแนน",
  ),

  // ScoreOnSubjectForm
  createSkillTitle: t("New skill", "สร้างทักษะใหม่"),
  updateSkillTitle: t("Edit skill", "แก้ไขทักษะ"),
  skillIcon: t("Icon", "ไอคอน"),
  skillName: t("Name", "ชื่อทักษะ"),
  skillNamePlaceholder: t("e.g. Helping others", "เช่น ช่วยเหลือเพื่อน"),
  defaultPoints: t("Default points", "คะแนนเริ่มต้น"),
  defaultPointsHint: t(
    "Use a negative number for things to work on.",
    "ใช้ค่าติดลบสำหรับพฤติกรรมที่ต้องปรับปรุง",
  ),
  back: t("Back", "กลับ"),
  save: t("Save", "บันทึก"),
  create: t("Create", "สร้าง"),
  delete: t("Delete", "ลบ"),
  skillCreated: t("Skill created", "สร้างทักษะแล้ว"),
  skillUpdated: t("Skill updated", "แก้ไขทักษะแล้ว"),
  skillDeleted: t("Skill deleted", "ลบทักษะแล้ว"),
};
