import { Language } from "../../interfaces";

export const rubricLanguage = {
  // ---- Shared / common actions ----
  save: (language: Language) => {
    switch (language) {
      case "en":
        return "Save";
      case "th":
        return "บันทึก";
      default:
        return "Save";
    }
  },
  cancel: (language: Language) => {
    switch (language) {
      case "en":
        return "Cancel";
      case "th":
        return "ยกเลิก";
      default:
        return "Cancel";
    }
  },
  edit: (language: Language) => {
    switch (language) {
      case "en":
        return "Edit";
      case "th":
        return "แก้ไข";
      default:
        return "Edit";
    }
  },
  deleteAction: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบ";
      default:
        return "Delete";
    }
  },
  back: (language: Language) => {
    switch (language) {
      case "en":
        return "Back";
      case "th":
        return "ย้อนกลับ";
      default:
        return "Back";
    }
  },
  somethingWentWrong: (language: Language) => {
    switch (language) {
      case "en":
        return "Something Went Wrong";
      case "th":
        return "เกิดข้อผิดพลาดบางอย่าง";
      default:
        return "Something Went Wrong";
    }
  },
  success: (language: Language) => {
    switch (language) {
      case "en":
        return "Success";
      case "th":
        return "สำเร็จ";
      default:
        return "Success";
    }
  },

  // ---- RubricList ----
  rubricsTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubrics";
      case "th":
        return "เกณฑ์การให้คะแนน";
      default:
        return "Rubrics";
    }
  },
  rubricBadge: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric";
      case "th":
        return "เกณฑ์รูบิก";
      default:
        return "Rubric";
    }
  },
  createRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Create rubric";
      case "th":
        return "สร้างเกณฑ์การให้คะแนนแบบรูบิก";
      default:
        return "Create rubric";
    }
  },
  manageRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage Rubric";
      case "th":
        return "จัดการเกณฑ์รูบิก";
      default:
        return "Manage Rubric";
    }
  },
  rubricsDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Create and manage grading rubrics for this subject's assignments.";
      case "th":
        return "สร้างและจัดการเกณฑ์การให้คะแนนสำหรับงานของวิชานี้";
      default:
        return "Create and manage grading rubrics for this subject's assignments.";
    }
  },
  noRubricsYet: (language: Language) => {
    switch (language) {
      case "en":
        return "No rubrics yet";
      case "th":
        return "ยังไม่มีเกณฑ์การให้คะแนน";
      default:
        return "No rubrics yet";
    }
  },
  noRubricsHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Create a rubric to grade assignments by criteria.";
      case "th":
        return "สร้างเกณฑ์การให้คะแนนเพื่อให้คะแนนงานตามเกณฑ์ต่าง ๆ";
      default:
        return "Create a rubric to grade assignments by criteria.";
    }
  },
  editRubricTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Edit rubric";
      case "th":
        return "แก้ไขเกณฑ์การให้คะแนน";
      default:
        return "Edit rubric";
    }
  },
  deleteRubricTitle: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete rubric";
      case "th":
        return "ลบเกณฑ์การให้คะแนน";
      default:
        return "Delete rubric";
    }
  },
  rubricDeleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric has been deleted";
      case "th":
        return "ลบเกณฑ์การให้คะแนนแล้ว";
      default:
        return "Rubric has been deleted";
    }
  },
  couldNotDeleteRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not delete rubric";
      case "th":
        return "ไม่สามารถลบเกณฑ์การให้คะแนนได้";
      default:
        return "Could not delete rubric";
    }
  },

  // ---- RubricBuilder ----
  editRubricHeading: (language: Language) => {
    switch (language) {
      case "en":
        return "Edit Rubric";
      case "th":
        return "แก้ไขเกณฑ์การให้คะแนน";
      default:
        return "Edit Rubric";
    }
  },
  createRubricHeading: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Rubric";
      case "th":
        return "สร้างเกณฑ์การให้คะแนน";
      default:
        return "Create Rubric";
    }
  },
  draftWithAi: (language: Language) => {
    switch (language) {
      case "en":
        return "Draft with AI";
      case "th":
        return "ร่างด้วย AI";
      default:
        return "Draft with AI";
    }
  },
  rubricTitlePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric title";
      case "th":
        return "ชื่อเกณฑ์การให้คะแนน";
      default:
        return "Rubric title";
    }
  },
  descriptionOptionalPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Description (optional)";
      case "th":
        return "คำอธิบาย (ไม่บังคับ)";
      default:
        return "Description (optional)";
    }
  },
  addCriterion: (language: Language) => {
    switch (language) {
      case "en":
        return "Add criterion";
      case "th":
        return "เพิ่มเกณฑ์";
      default:
        return "Add criterion";
    }
  },
  maxRawPoints: (language: Language) => {
    switch (language) {
      case "en":
        return "Max raw points:";
      case "th":
        return "คะแนนดิบสูงสุด:";
      default:
        return "Max raw points:";
    }
  },
  criterionTitlePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Criterion title";
      case "th":
        return "ชื่อเกณฑ์";
      default:
        return "Criterion title";
    }
  },
  criterionDescriptionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Criterion description (optional)";
      case "th":
        return "คำอธิบายเกณฑ์ (ไม่บังคับ)";
      default:
        return "Criterion description (optional)";
    }
  },
  weight: (language: Language) => {
    switch (language) {
      case "en":
        return "Weight";
      case "th":
        return "น้ำหนัก";
      default:
        return "Weight";
    }
  },
  removeCriterion: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove criterion";
      case "th":
        return "ลบเกณฑ์";
      default:
        return "Remove criterion";
    }
  },
  level: (language: Language) => {
    switch (language) {
      case "en":
        return "Level";
      case "th":
        return "ระดับ";
      default:
        return "Level";
    }
  },
  removeLevel: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove level";
      case "th":
        return "ลบระดับ";
      default:
        return "Remove level";
    }
  },
  levelTitlePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Level title";
      case "th":
        return "ชื่อระดับ";
      default:
        return "Level title";
    }
  },
  points: (language: Language) => {
    switch (language) {
      case "en":
        return "Points";
      case "th":
        return "คะแนน";
      default:
        return "Points";
    }
  },
  levelDescriptionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Level description (optional)";
      case "th":
        return "คำอธิบายระดับ (ไม่บังคับ)";
      default:
        return "Level description (optional)";
    }
  },
  addLevel: (language: Language) => {
    switch (language) {
      case "en":
        return "Add level";
      case "th":
        return "เพิ่มระดับ";
      default:
        return "Add level";
    }
  },
  // Validation hints
  rubricTitleRequired: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric title is required";
      case "th":
        return "ต้องระบุชื่อเกณฑ์การให้คะแนน";
      default:
        return "Rubric title is required";
    }
  },
  atLeastOneCriterion: (language: Language) => {
    switch (language) {
      case "en":
        return "At least one criterion is required";
      case "th":
        return "ต้องมีเกณฑ์อย่างน้อยหนึ่งข้อ";
      default:
        return "At least one criterion is required";
    }
  },
  criterionRequiresTitle: (language: Language) => (index: number) => {
    switch (language) {
      case "en":
        return `Criterion ${index} requires a title`;
      case "th":
        return `เกณฑ์ข้อที่ ${index} ต้องมีชื่อ`;
      default:
        return `Criterion ${index} requires a title`;
    }
  },
  criterionRequiresLevels: (language: Language) => (index: number) => {
    switch (language) {
      case "en":
        return `Criterion ${index} requires at least 2 levels`;
      case "th":
        return `เกณฑ์ข้อที่ ${index} ต้องมีระดับอย่างน้อย 2 ระดับ`;
      default:
        return `Criterion ${index} requires at least 2 levels`;
    }
  },
  criterionLevelRequiresTitle:
    (language: Language) => (cIndex: number, lIndex: number) => {
      switch (language) {
        case "en":
          return `Criterion ${cIndex}, level ${lIndex} requires a title`;
        case "th":
          return `เกณฑ์ข้อที่ ${cIndex} ระดับที่ ${lIndex} ต้องมีชื่อ`;
        default:
          return `Criterion ${cIndex}, level ${lIndex} requires a title`;
      }
    },
  // Save toasts
  rubricUpdated: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric has been updated";
      case "th":
        return "อัปเดตเกณฑ์การให้คะแนนแล้ว";
      default:
        return "Rubric has been updated";
    }
  },
  rubricCreated: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric has been created";
      case "th":
        return "สร้างเกณฑ์การให้คะแนนแล้ว";
      default:
        return "Rubric has been created";
    }
  },
  couldNotSaveRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not save rubric";
      case "th":
        return "ไม่สามารถบันทึกเกณฑ์การให้คะแนนได้";
      default:
        return "Could not save rubric";
    }
  },

  // ---- RubricPicker ----
  rubricOptional: (language: Language) => {
    switch (language) {
      case "en":
        return "Rubric (optional)";
      case "th":
        return "เกณฑ์การให้คะแนน (ไม่บังคับ)";
      default:
        return "Rubric (optional)";
    }
  },
  noRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "No rubric";
      case "th":
        return "ไม่ใช้เกณฑ์การให้คะแนน";
      default:
        return "No rubric";
    }
  },
  selectARubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Select a rubric";
      case "th":
        return "เลือกเกณฑ์การให้คะแนน";
      default:
        return "Select a rubric";
    }
  },
  pickerNoRubricsHint: (language: Language) => {
    switch (language) {
      case "en":
        return "No rubrics yet. Create one in Settings to attach it here.";
      case "th":
        return "ยังไม่มีเกณฑ์การให้คะแนน สร้างในหน้าตั้งค่าเพื่อแนบไว้ที่นี่";
      default:
        return "No rubrics yet. Create one in Settings to attach it here.";
    }
  },

  // ---- RubricGradingPanel ----
  gradeWithRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade with rubric";
      case "th":
        return "ให้คะแนนด้วยเกณฑ์การให้คะแนน";
      default:
        return "Grade with rubric";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "Score:";
      case "th":
        return "คะแนน:";
      default:
        return "Score:";
    }
  },
  selectLevelHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Select a level for at least one criterion";
      case "th":
        return "เลือกระดับอย่างน้อยหนึ่งเกณฑ์";
      default:
        return "Select a level for at least one criterion";
    }
  },
  saveGrade: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Grade";
      case "th":
        return "บันทึกคะแนน";
      default:
        return "Save Grade";
    }
  },
  couldNotLoadRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not load the rubric. Please try again.";
      case "th":
        return "ไม่สามารถโหลดเกณฑ์การให้คะแนนได้ กรุณาลองใหม่อีกครั้ง";
      default:
        return "Could not load the rubric. Please try again.";
    }
  },
  weightLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "Weight";
      case "th":
        return "น้ำหนัก";
      default:
        return "Weight";
    }
  },
  pts: (language: Language) => {
    switch (language) {
      case "en":
        return "pts";
      case "th":
        return "คะแนน";
      default:
        return "pts";
    }
  },
  commentOptional: (language: Language) => {
    switch (language) {
      case "en":
        return "Comment (optional)";
      case "th":
        return "ความคิดเห็น (ไม่บังคับ)";
      default:
        return "Comment (optional)";
    }
  },
  criterionFeedbackPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Feedback for this criterion";
      case "th":
        return "ข้อเสนอแนะสำหรับเกณฑ์นี้";
      default:
        return "Feedback for this criterion";
    }
  },
  updateSuccess: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Success";
      case "th":
        return "อัปเดตสำเร็จ";
      default:
        return "Update Success";
    }
  },
  scoreUpdated: (language: Language) => {
    switch (language) {
      case "en":
        return "Score has been updated";
      case "th":
        return "อัปเดตคะแนนแล้ว";
      default:
        return "Score has been updated";
    }
  },
  couldNotGradeRubric: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not grade with the rubric";
      case "th":
        return "ไม่สามารถให้คะแนนด้วยเกณฑ์การให้คะแนนได้";
      default:
        return "Could not grade with the rubric";
    }
  },

  // ---- RubricAiAssistant ----
  draftRubricWithAi: (language: Language) => {
    switch (language) {
      case "en":
        return "Draft a rubric with AI";
      case "th":
        return "ร่างเกณฑ์การให้คะแนนด้วย AI";
      default:
        return "Draft a rubric with AI";
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
  draftReadyPrefix: (language: Language) => {
    switch (language) {
      case "en":
        return "A draft for";
      case "th":
        return "ร่างสำหรับ";
      default:
        return "A draft for";
    }
  },
  draftReadySuffix: (language: Language) => (count: number) => {
    switch (language) {
      case "en":
        return `is ready with ${count} criteria.`;
      case "th":
        return `พร้อมแล้ว มีทั้งหมด ${count} เกณฑ์`;
      default:
        return `is ready with ${count} criteria.`;
    }
  },
  curriculumSummary: (language: Language) => {
    switch (language) {
      case "en":
        return "Curriculum summary";
      case "th":
        return "สรุปหลักสูตร";
      default:
        return "Curriculum summary";
    }
  },
  applyDraft: (language: Language) => {
    switch (language) {
      case "en":
        return "Apply draft";
      case "th":
        return "ใช้ร่างนี้";
      default:
        return "Apply draft";
    }
  },
  topic: (language: Language) => {
    switch (language) {
      case "en":
        return "Topic";
      case "th":
        return "หัวข้อ";
      default:
        return "Topic";
    }
  },
  topicPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "e.g. Persuasive essay";
      case "th":
        return "เช่น เรียงความโน้มน้าวใจ";
      default:
        return "e.g. Persuasive essay";
    }
  },
  gradeLevel: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade level";
      case "th":
        return "ระดับชั้น";
      default:
        return "Grade level";
    }
  },
  gradeLevelPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "e.g. Grade 8";
      case "th":
        return "เช่น มัธยมศึกษาปีที่ 2";
      default:
        return "e.g. Grade 8";
    }
  },
  learningGoal: (language: Language) => {
    switch (language) {
      case "en":
        return "Learning goal";
      case "th":
        return "เป้าหมายการเรียนรู้";
      default:
        return "Learning goal";
    }
  },
  learningGoalPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "What should students demonstrate?";
      case "th":
        return "นักเรียนควรแสดงออกถึงสิ่งใด?";
      default:
        return "What should students demonstrate?";
    }
  },
  levelsPerCriterion: (language: Language) => {
    switch (language) {
      case "en":
        return "Levels per criterion";
      case "th":
        return "จำนวนระดับต่อเกณฑ์";
      default:
        return "Levels per criterion";
    }
  },
  numberOfCriteria: (language: Language) => {
    switch (language) {
      case "en":
        return "Number of criteria (optional)";
      case "th":
        return "จำนวนเกณฑ์ (ไม่บังคับ)";
      default:
        return "Number of criteria (optional)";
    }
  },
  auto: (language: Language) => {
    switch (language) {
      case "en":
        return "Auto";
      case "th":
        return "อัตโนมัติ";
      default:
        return "Auto";
    }
  },
  maxPointsPerLevel: (language: Language) => {
    switch (language) {
      case "en":
        return "Max points per level";
      case "th":
        return "คะแนนสูงสุดต่อระดับ";
      default:
        return "Max points per level";
    }
  },
  languageLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "Language";
      case "th":
        return "ภาษา";
      default:
        return "Language";
    }
  },
  curriculumFileOptional: (language: Language) => {
    switch (language) {
      case "en":
        return "Curriculum file (optional)";
      case "th":
        return "ไฟล์หลักสูตร (ไม่บังคับ)";
      default:
        return "Curriculum file (optional)";
    }
  },
  curriculumFileHint: (language: Language) => {
    switch (language) {
      case "en":
        return "PDF, text, or image (PNG/JPEG/WebP). The AI uses it as context.";
      case "th":
        return "PDF, ข้อความ หรือรูปภาพ (PNG/JPEG/WebP) AI จะใช้เป็นบริบท";
      default:
        return "PDF, text, or image (PNG/JPEG/WebP). The AI uses it as context.";
    }
  },
  removeFile: (language: Language) => {
    switch (language) {
      case "en":
        return "Remove file";
      case "th":
        return "ลบไฟล์";
      default:
        return "Remove file";
    }
  },
  chooseFile: (language: Language) => {
    switch (language) {
      case "en":
        return "Choose file";
      case "th":
        return "เลือกไฟล์";
      default:
        return "Choose file";
    }
  },
  uploadingCurriculum: (language: Language) => {
    switch (language) {
      case "en":
        return "Uploading curriculum…";
      case "th":
        return "กำลังอัปโหลดหลักสูตร…";
      default:
        return "Uploading curriculum…";
    }
  },
  generatingDraft: (language: Language) => {
    switch (language) {
      case "en":
        return "Generating draft… this can take a moment.";
      case "th":
        return "กำลังสร้างร่าง… อาจใช้เวลาสักครู่";
      default:
        return "Generating draft… this can take a moment.";
    }
  },
  working: (language: Language) => {
    switch (language) {
      case "en":
        return "Working…";
      case "th":
        return "กำลังดำเนินการ…";
      default:
        return "Working…";
    }
  },
  generate: (language: Language) => {
    switch (language) {
      case "en":
        return "Generate";
      case "th":
        return "สร้าง";
      default:
        return "Generate";
    }
  },
  topicRequired: (language: Language) => {
    switch (language) {
      case "en":
        return "Topic is required";
      case "th":
        return "ต้องระบุหัวข้อ";
      default:
        return "Topic is required";
    }
  },
  gradeLevelRequired: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade level is required";
      case "th":
        return "ต้องระบุระดับชั้น";
      default:
        return "Grade level is required";
    }
  },
  learningGoalRequired: (language: Language) => {
    switch (language) {
      case "en":
        return "Learning goal is required";
      case "th":
        return "ต้องระบุเป้าหมายการเรียนรู้";
      default:
        return "Learning goal is required";
    }
  },
  unsupportedFile: (language: Language) => {
    switch (language) {
      case "en":
        return "Unsupported file";
      case "th":
        return "ไฟล์ที่ไม่รองรับ";
      default:
        return "Unsupported file";
    }
  },
  unsupportedFileDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Please upload a PDF, text file, or PNG/JPEG/WebP image.";
      case "th":
        return "กรุณาอัปโหลดไฟล์ PDF, ไฟล์ข้อความ หรือรูปภาพ PNG/JPEG/WebP";
      default:
        return "Please upload a PDF, text file, or PNG/JPEG/WebP image.";
    }
  },
  couldNotGenerateDraft: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not generate a rubric draft. Please try again.";
      case "th":
        return "ไม่สามารถสร้างร่างเกณฑ์การให้คะแนนได้ กรุณาลองใหม่อีกครั้ง";
      default:
        return "Could not generate a rubric draft. Please try again.";
    }
  },
} as const;
