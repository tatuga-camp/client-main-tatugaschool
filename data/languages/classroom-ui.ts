import { Language } from "../../interfaces";

const pick = (language: Language, en: string, th: string) =>
  language === "th" ? th : en;

export const classroomUiLanguage = {
  // Classes tab
  classroomsTitle: (l: Language) => pick(l, "Classrooms", "ห้องเรียน"),
  subjectsHint: (l: Language) =>
    pick(l, "Looking for subjects?", "กำลังหาวิชาเรียนอยู่ใช่ไหม?"),
  openSubjects: (l: Language) =>
    pick(l, "Open the Subjects tab", "ไปที่แท็บวิชาเรียน"),
  createClassroom: (l: Language) =>
    pick(l, "Create classroom", "สร้างห้องเรียน"),
  active: (l: Language) => pick(l, "Active", "ใช้งานอยู่"),
  archived: (l: Language) => pick(l, "Archived", "เก็บถาวร"),
  classroomStatus: (l: Language) =>
    pick(l, "Classroom status", "สถานะห้องเรียน"),
  teacherFilter: (l: Language) => pick(l, "Teacher", "ครูผู้สร้าง"),
  allTeachers: (l: Language) => pick(l, "All teachers", "ครูทุกคน"),
  classroomCount: (l: Language, n: number) =>
    pick(l, `${n} ${n === 1 ? "classroom" : "classrooms"}`, `${n} ห้อง`),
  noLevel: (l: Language) => pick(l, "No level", "ไม่ระบุระดับชั้น"),
  studentCount: (l: Language, n: number) =>
    pick(l, `${n} ${n === 1 ? "student" : "students"}`, `${n} คน`),
  createdBy: (l: Language, name: string) =>
    pick(l, `Created by ${name}`, `สร้างโดย ${name}`),
  dragToReorder: (l: Language) => pick(l, "Drag to reorder", "ลากเพื่อจัดลำดับ"),
  emptyActiveTitle: (l: Language) =>
    pick(l, "No classrooms yet", "ยังไม่มีห้องเรียน"),
  emptyActiveBody: (l: Language) =>
    pick(
      l,
      "Create a classroom to add students and follow their grades.",
      "สร้างห้องเรียนเพื่อเพิ่มนักเรียนและติดตามผลการเรียน",
    ),
  emptyArchived: (l: Language) =>
    pick(l, "No archived classrooms", "ไม่มีห้องเรียนที่เก็บถาวร"),
  emptyTeacher: (l: Language) =>
    pick(l, "No classrooms for this teacher", "ครูท่านนี้ยังไม่มีห้องเรียน"),
  showAllTeachers: (l: Language) => pick(l, "Show all teachers", "แสดงครูทุกคน"),
  reorderFailed: (l: Language) =>
    pick(
      l,
      "Couldn't save the new order. The list was restored.",
      "บันทึกลำดับใหม่ไม่สำเร็จ ระบบคืนค่าลำดับเดิมแล้ว",
    ),

  // Create classroom
  fieldLevel: (l: Language) => pick(l, "Level", "ระดับชั้น"),
  fieldTitle: (l: Language) => pick(l, "Classroom name", "ชื่อห้องเรียน"),
  titlePlaceholder: (l: Language) =>
    pick(l, "e.g. Room 1, 2026", "เช่น ห้อง 1 ปี 2569"),
  fieldDescription: (l: Language) => pick(l, "Description", "คำอธิบาย"),
  descriptionPlaceholder: (l: Language) =>
    pick(l, "e.g. Science–Math program", "เช่น แผนการเรียนวิทย์–คณิต"),
  creating: (l: Language) => pick(l, "Creating…", "กำลังสร้าง…"),
  created: (l: Language) => pick(l, "Classroom created", "สร้างห้องเรียนแล้ว"),
  close: (l: Language) => pick(l, "Close", "ปิด"),
  cancel: (l: Language) => pick(l, "Cancel", "ยกเลิก"),

  // Classroom page
  tabStudents: (l: Language) => pick(l, "Students", "นักเรียน"),
  tabGrades: (l: Language) => pick(l, "Grade summary", "สรุปผลการเรียน"),
  tabSettings: (l: Language) => pick(l, "Settings", "ตั้งค่า"),
  classroomSections: (l: Language) =>
    pick(l, "Classroom sections", "ส่วนของห้องเรียน"),
  createdOn: (l: Language, date: string) =>
    pick(l, `Created ${date}`, `สร้างเมื่อ ${date}`),
  updatedOn: (l: Language, date: string) =>
    pick(l, `Updated ${date}`, `อัปเดตเมื่อ ${date}`),
  classroomNotFound: (l: Language) =>
    pick(l, "Classroom not found", "ไม่พบห้องเรียน"),
  classroomNotFoundBody: (l: Language) =>
    pick(
      l,
      "It may have been deleted, or you may not have access to it.",
      "ห้องเรียนนี้อาจถูกลบไปแล้ว หรือคุณอาจไม่มีสิทธิ์เข้าถึง",
    ),
  backHome: (l: Language) => pick(l, "Back to home", "กลับหน้าแรก"),
  loadError: (l: Language) =>
    pick(l, "Couldn't load this classroom.", "โหลดห้องเรียนไม่สำเร็จ"),
  tryAgain: (l: Language) => pick(l, "Try again", "ลองอีกครั้ง"),

  // Students tab
  studentsHeading: (l: Language, n: number) =>
    pick(l, `Students (${n})`, `นักเรียน (${n})`),
  searchPlaceholder: (l: Language) =>
    pick(l, "Search name or number", "ค้นหาชื่อหรือเลขที่"),
  sortLabel: (l: Language) => pick(l, "Sort", "เรียงตาม"),
  importExcel: (l: Language) => pick(l, "Import Excel", "นำเข้า Excel"),
  addStudent: (l: Language) => pick(l, "Add student", "เพิ่มนักเรียน"),
  moreActions: (l: Language, name: string) =>
    pick(l, `More actions for ${name}`, `ตัวเลือกเพิ่มเติมของ ${name}`),
  resetPassword: (l: Language) => pick(l, "Reset password", "รีเซ็ตรหัสผ่าน"),
  careerSuggestion: (l: Language) => pick(l, "Career suggestion", "แนะนำอาชีพ"),
  editDetails: (l: Language) => pick(l, "Edit details", "แก้ไขข้อมูล"),
  deleteStudent: (l: Language) => pick(l, "Delete student", "ลบนักเรียน"),
  emptyRosterTitle: (l: Language) =>
    pick(l, "No students yet", "ยังไม่มีนักเรียนในห้องนี้"),
  emptyRosterBody: (l: Language) =>
    pick(
      l,
      "Add students one at a time, or import a class list from Excel.",
      "เพิ่มนักเรียนทีละคน หรือนำเข้ารายชื่อทั้งห้องจากไฟล์ Excel",
    ),
  noSearchResults: (l: Language, query: string) =>
    pick(l, `No students match “${query}”`, `ไม่พบนักเรียนที่ตรงกับ “${query}”`),
  resetConfirmTitle: (l: Language, name: string) =>
    pick(l, `Reset ${name}'s password?`, `รีเซ็ตรหัสผ่านของ ${name}?`),
  // Server sets password = null; the student app lets them sign in without
  // one and set a new password from their profile page (verified 2026-10-05).
  resetConfirmBody: (l: Language, name: string) =>
    pick(
      l,
      `${name} will be able to sign in without a password, then set a new one from their profile page.`,
      `${name} จะเข้าสู่ระบบได้โดยไม่ต้องใช้รหัสผ่าน และตั้งรหัสผ่านใหม่ได้จากหน้าโปรไฟล์`,
    ),
  resetDone: (l: Language, name: string) =>
    pick(l, `${name}'s password was reset`, `รีเซ็ตรหัสผ่านของ ${name} แล้ว`),
  passwordHint: (l: Language) =>
    pick(
      l,
      "Teachers can't see student passwords, only reset them.",
      "คุณครูไม่สามารถดูรหัสผ่านของนักเรียนได้ ทำได้เพียงรีเซ็ตเท่านั้น",
    ),
  sectionDetails: (l: Language) => pick(l, "Details", "ข้อมูลนักเรียน"),
  sectionAccount: (l: Language) => pick(l, "Account", "บัญชี"),
  sectionCareer: (l: Language) => pick(l, "Career suggestion", "แนะนำอาชีพ"),
  careerSectionBody: (l: Language, name: string) =>
    pick(
      l,
      `See which careers fit ${name}'s skills from graded classwork.`,
      `ดูอาชีพที่เหมาะกับทักษะของ ${name} จากงานที่ได้รับการตรวจแล้ว`,
    ),
  openCareer: (l: Language) =>
    pick(l, "View career suggestions", "ดูอาชีพที่แนะนำ"),
  saveChanges: (l: Language) => pick(l, "Save changes", "บันทึกการเปลี่ยนแปลง"),
  saving: (l: Language) => pick(l, "Saving…", "กำลังบันทึก…"),
  saved: (l: Language) => pick(l, "Changes saved", "บันทึกแล้ว"),
  studentNumber: (l: Language, n: string) =>
    pick(l, `No. ${n}`, `เลขที่ ${n}`),
  studentDeleted: (l: Language) => pick(l, "Student deleted", "ลบนักเรียนแล้ว"),
  uploadPhoto: (l: Language) => pick(l, "Upload photo", "อัปโหลดรูป"),
  changePhoto: (l: Language) => pick(l, "Change photo", "เปลี่ยนรูป"),
  photoHint: (l: Language) =>
    pick(
      l,
      "Optional. A square photo works best.",
      "ไม่บังคับ ใช้รูปทรงสี่เหลี่ยมจัตุรัสจะดีที่สุด",
    ),
  tabOneStudent: (l: Language) => pick(l, "One student", "ทีละคน"),
  tabImportExcel: (l: Language) =>
    pick(l, "Import from Excel", "นำเข้าจาก Excel"),

  // Career suggestion
  backTo: (l: Language, name: string) =>
    pick(l, `Back to ${name}`, `กลับไปที่ ${name}`),
  careerHeading: (l: Language, name: string) =>
    pick(l, `Careers that fit ${name}'s skills`, `อาชีพที่เหมาะกับทักษะของ ${name}`),
  careerSource: (l: Language) =>
    pick(
      l,
      "Based on skill scores from graded classwork.",
      "คำนวณจากคะแนนทักษะในงานที่ได้รับการตรวจแล้ว",
    ),
  strongestSkills: (l: Language) => pick(l, "Strongest skills", "ทักษะที่โดดเด่น"),
  skillsToGrow: (l: Language) => pick(l, "Skills to grow", "ทักษะที่ควรพัฒนา"),
  topMatch: (l: Language) =>
    pick(l, "Best-fit career area", "กลุ่มอาชีพที่เหมาะที่สุด"),
  exampleJobs: (l: Language) => pick(l, "Example jobs", "ตัวอย่างอาชีพ"),
  rankedCareers: (l: Language) =>
    pick(l, "All matching career areas", "กลุ่มอาชีพทั้งหมดที่เข้ากัน"),
  bandAbove: (l: Language) =>
    pick(l, "Above what this career needs", "สูงกว่าที่อาชีพนี้ต้องการ"),
  bandClose: (l: Language) => pick(l, "Close", "ใกล้เคียง"),
  bandBelow: (l: Language) => pick(l, "Below", "ต่ำกว่า"),
  expectedLevel: (l: Language) =>
    pick(l, "Line = level this career expects", "เส้น = ระดับที่อาชีพนี้ต้องการ"),
  showMore: (l: Language, n: number) =>
    pick(l, `Show ${n} more`, `แสดงอีก ${n} รายการ`),
  showLess: (l: Language) => pick(l, "Show less", "แสดงน้อยลง"),
  notEnoughData: (l: Language, name: string) =>
    pick(l, `Not enough skill data for ${name} yet.`, `ยังมีข้อมูลทักษะของ ${name} ไม่พอ`),
  notEnoughDataBody: (l: Language) =>
    pick(
      l,
      "Career suggestions appear once more of their graded classwork includes skills.",
      "ระบบจะแนะนำอาชีพได้เมื่อมีงานที่ได้รับการตรวจและผูกกับทักษะมากขึ้น",
    ),
  careerLoadError: (l: Language) =>
    pick(l, "Couldn't load career suggestions.", "โหลดคำแนะนำอาชีพไม่สำเร็จ"),
  noCareers: (l: Language, name: string) =>
    pick(l, `No career suggestions for ${name} yet.`, `ยังไม่มีอาชีพที่แนะนำสำหรับ ${name}`),

  // Grade summary
  studentColumn: (l: Language) => pick(l, "Student", "นักเรียน"),
  noGrades: (l: Language) =>
    pick(
      l,
      "No subjects with grades for this education year.",
      "ยังไม่มีวิชาที่มีคะแนนในปีการศึกษานี้",
    ),

  // Settings
  archiveHint: (l: Language) =>
    pick(
      l,
      "Archived classrooms move to the Archived list. Students and grades are kept.",
      "ห้องเรียนที่เก็บถาวรจะย้ายไปอยู่ในรายการเก็บถาวร ข้อมูลนักเรียนและคะแนนยังอยู่ครบ",
    ),
  deleteOnlyOwner: (l: Language) =>
    pick(
      l,
      "Only the school admin and the teacher who created this classroom can delete it.",
      "เฉพาะผู้ดูแลโรงเรียนและครูผู้สร้างห้องเรียนนี้เท่านั้นที่ลบได้",
    ),
  classroomUpdated: (l: Language) =>
    pick(l, "Classroom updated", "บันทึกห้องเรียนแล้ว"),
};
