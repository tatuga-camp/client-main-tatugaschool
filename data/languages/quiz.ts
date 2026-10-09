// data/languages/quiz.ts
import {
  Language,
  QuizIntegrityEventType,
  QuizMonitorStatus,
  QuizRiskPattern,
} from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

export const quizLanguage = {
  untitled: t("Untitled quiz", "แบบทดสอบไม่มีชื่อ"),
  tabQuestions: t("Questions", "คำถาม"),
  tabSettings: t("Settings", "ตั้งค่า"),
  tabMonitor: t("Monitor", "ติดตามการสอบ"),
  assignStudents: t("Assign students", "มอบหมายนักเรียน"),
  tabQuestionsDescription: t("Write and arrange the quiz questions", "เขียนและจัดลำดับคำถามในแบบทดสอบ"),
  tabSettingsDescription: t("Schedule, time limit, scoring and test mode", "กำหนดเวลา เวลาทำ การให้คะแนน และโหมดสอบ"),
  tabMonitorDescription: t("Follow students while they take the quiz", "ติดตามนักเรียนระหว่างทำแบบทดสอบ"),
  deleteQuiz: t("Delete", "ลบ"),
  deleteQuizTitle: t("Delete this quiz?", "ลบแบบทดสอบนี้?"),
  deleteQuizText: t(
    "Questions, students' answers and scores will be removed. This can't be undone.",
    "คำถาม คำตอบ และคะแนนของนักเรียนจะถูกลบ และไม่สามารถกู้คืนได้",
  ),
  deleteAssignmentTitle: t("Delete this assignment?", "ลบงานนี้?"),
  deleteAssignmentText: t(
    "Files, students' work and scores will be removed. This can't be undone.",
    "ไฟล์ งานของนักเรียน และคะแนนจะถูกลบ และไม่สามารถกู้คืนได้",
  ),
  deleteButton: t("Delete", "ลบ"),
  cancel: t("Cancel", "ยกเลิก"),
  deleted: t("Deleted", "ลบแล้ว"),
  publish: t("Publish", "เผยแพร่"),
  unpublish: t("Move to draft", "ย้ายไปแบบร่าง"),
  published: t("Published", "เผยแพร่แล้ว"),
  draft: t("Draft", "แบบร่าง"),
  needQuestionsToPublish: t(
    "Add at least one question before publishing",
    "เพิ่มคำถามอย่างน้อย 1 ข้อก่อนเผยแพร่",
  ),
  totalPoints: (l: Language, n: number) =>
    l === "th" ? `คะแนนเต็ม ${n}` : `${n} points total`,

  // Questions tab
  newQuestion: t("New question", "เพิ่มคำถาม"),
  typeSingle: t("Single answer", "ตอบได้ข้อเดียว"),
  typeMultiple: t("Multiple answers", "ตอบได้หลายข้อ"),
  typeFillBlank: t("Fill in the blank", "เติมคำในช่องว่าง"),
  questionLabel: (l: Language, n: number) =>
    l === "th" ? `ข้อ ${n}` : `Question ${n}`,
  promptPlaceholder: t("Type the question", "พิมพ์คำถาม"),
  points: t("Points", "คะแนน"),
  option: t("Option", "ตัวเลือก"),
  addOption: t("Add option", "เพิ่มตัวเลือก"),
  markCorrect: t("Mark as correct", "ตั้งเป็นคำตอบที่ถูก"),
  correct: t("Correct", "ถูก"),
  removeOption: t("Remove option", "ลบตัวเลือก"),
  addBlank: t("Add blank at cursor", "เพิ่มช่องว่างที่ตำแหน่งเคอร์เซอร์"),
  blankLabel: (l: Language, n: number) =>
    l === "th" ? `ช่องว่าง ${n}` : `Blank ${n}`,
  acceptedAnswers: t("Accepted answers", "คำตอบที่ยอมรับ"),
  acceptedHint: t(
    "Press Enter to add. Case and extra spaces are ignored.",
    "กด Enter เพื่อเพิ่ม ไม่สนตัวพิมพ์เล็ก-ใหญ่และช่องว่างเกิน",
  ),
  addAnswerPlaceholder: t("Add an accepted answer", "เพิ่มคำตอบที่ยอมรับ"),
  addImage: t("Add image", "เพิ่มรูปภาพ"),
  removeImage: t("Remove image", "ลบรูปภาพ"),
  imageTooLarge: t(
    "The image must be 5 MB or smaller",
    "รูปภาพต้องมีขนาดไม่เกิน 5 MB",
  ),
  imageNotSupported: t("Please choose an image file", "กรุณาเลือกไฟล์รูปภาพ"),
  uploadingImage: t("Uploading image…", "กำลังอัปโหลดรูปภาพ…"),
  questionImageAlt: t("Question image", "รูปภาพประกอบคำถาม"),
  preview: t("Preview", "ตัวอย่าง"),
  save: t("Save", "บันทึก"),
  saved: t("Saved", "บันทึกแล้ว"),
  unsaved: t("Unsaved changes", "ยังไม่ได้บันทึก"),
  delete: t("Delete", "ลบ"),
  deleteConfirm: t("Delete this question?", "ลบคำถามนี้หรือไม่?"),
  dragToReorder: t("Drag to reorder", "ลากเพื่อเรียงลำดับ"),
  emptyTitle: t("No questions yet", "ยังไม่มีคำถาม"),
  emptyHint: t(
    "Add your first question to build the quiz.",
    "เพิ่มคำถามข้อแรกเพื่อเริ่มสร้างแบบทดสอบ",
  ),
  lockedBanner: t(
    "Students have started this quiz, so questions are locked. Duplicate it to make changes.",
    "มีนักเรียนเริ่มทำแบบทดสอบแล้ว จึงแก้ไขคำถามไม่ได้ ให้ทำสำเนาเพื่อแก้ไข",
  ),
  duplicate: t("Duplicate quiz", "ทำสำเนาแบบทดสอบ"),
  blankNeedsAnswer: t(
    "Every blank needs at least one accepted answer before you can save.",
    "ทุกช่องว่างต้องมีคำตอบที่ยอมรับอย่างน้อย 1 คำตอบก่อนบันทึก",
  ),
  unsavedTitle: t("You have unsaved questions", "มีคำถามที่ยังไม่ได้บันทึก"),
  unsavedText: t(
    "Changes you have not saved will be lost.",
    "การแก้ไขที่ยังไม่ได้บันทึกจะหายไป",
  ),
  unsavedPublishText: t(
    "Students will get the last saved version. Changes you have not saved are not included.",
    "นักเรียนจะได้รับฉบับที่บันทึกล่าสุด การแก้ไขที่ยังไม่ได้บันทึกจะไม่ถูกรวมไปด้วย",
  ),
  leaveAnyway: t("Leave without saving", "ออกโดยไม่บันทึก"),
  publishAnyway: t("Publish anyway", "เผยแพร่ต่อ"),
  keepEditing: t("Keep editing", "แก้ไขต่อ"),

  // Page load
  loadQuizFailed: t("Could not load this quiz.", "โหลดแบบทดสอบไม่สำเร็จ"),
  notAQuiz: t("This classwork is not a quiz.", "งานนี้ไม่ใช่แบบทดสอบ"),
  backToClasswork: t("Back to classwork", "กลับไปที่หน้างาน"),

  // Export to other subjects
  exportDone: t("Export finished", "ส่งออกเสร็จแล้ว"),
  exportFailedTitle: t("Export failed", "ส่งออกไม่สำเร็จ"),
  exportResult: (l: Language, succeeded: number, total: number) =>
    l === "th"
      ? `ส่งออกไปยัง ${succeeded} จาก ${total} วิชา`
      : `Exported to ${succeeded} of ${total} subject${total === 1 ? "" : "s"}`,
  exportQuizDraftNote: t(
    "Quiz copies are created as Draft. Publish them in each subject when ready.",
    "สำเนาแบบทดสอบถูกสร้างเป็นแบบร่าง ให้เผยแพร่ในแต่ละวิชาเมื่อพร้อม",
  ),

  // Settings tab
  description: t("Instructions", "คำชี้แจง"),
  beginDate: t("Opens at", "เปิดให้ทำเมื่อ"),
  dueDate: t("Due at", "กำหนดส่ง"),
  noDueDate: t("No due date", "ไม่มีกำหนดส่ง"),
  beginDateRequired: t(
    "Choose when the quiz opens",
    "กรุณาเลือกวันเวลาที่เปิดให้ทำ",
  ),
  scoring: t("Scoring", "การให้คะแนน"),
  allOrNothing: t("All or nothing", "ถูกทั้งหมดจึงได้คะแนน"),
  allOrNothingHint: t(
    "Full points only when the answer is exactly right.",
    "ได้คะแนนเต็มเมื่อตอบถูกทั้งหมดเท่านั้น",
  ),
  partial: t("Partial credit", "ให้คะแนนบางส่วน"),
  partialHint: t(
    "Points for each right choice or blank; wrong choices take points away.",
    "ได้คะแนนตามตัวเลือกหรือช่องว่างที่ถูก ตัวเลือกที่ผิดจะถูกหักคะแนน",
  ),
  timeLimit: t("Time limit (minutes)", "จำกัดเวลา (นาที)"),
  timeLimitHint: t("Leave empty for no limit.", "เว้นว่างหากไม่จำกัดเวลา"),
  shuffleQuestions: t("Shuffle question order", "สลับลำดับคำถาม"),
  shuffleOptions: t("Shuffle answer options", "สลับลำดับตัวเลือก"),
  testMode: t("Test mode", "โหมดสอบ"),
  testModeHint: t(
    "Records when students leave the screen, switch apps, use a translator, paste or press screenshot keys, and shows a cheating-risk score on the monitor. Nothing is blocked; you decide.",
    "บันทึกเมื่อนักเรียนออกจากหน้าจอ สลับแอป ใช้ตัวแปลภาษา วางข้อความ หรือกดปุ่มจับภาพหน้าจอ และแสดงคะแนนความเสี่ยงการทุจริตในหน้าติดตาม ระบบไม่บล็อก ครูเป็นผู้ตัดสิน",
  ),
  showAnswers: t(
    "Show correct answers after submitting",
    "แสดงเฉลยหลังส่งคำตอบ",
  ),
  allowViewScore: t(
    "Students can see their score",
    "นักเรียนดูคะแนนของตนเองได้",
  ),
  saveSettings: t("Save settings", "บันทึกการตั้งค่า"),

  // Monitor tab
  refreshing: t("Updates every 10 seconds", "อัปเดตทุก 10 วินาที"),
  statStarted: t("Started", "เริ่มแล้ว"),
  statAnswering: t("Answering", "กำลังทำ"),
  statAway: t("Away now", "ออกจากหน้าจอ"),
  statSubmitted: t("Submitted", "ส่งแล้ว"),
  statHighRisk: t("High risk", "ความเสี่ยงสูง"),
  colStudent: t("Student", "นักเรียน"),
  colStatus: t("Status", "สถานะ"),
  colProgress: t("Progress", "ความคืบหน้า"),
  colRisk: t("Risk", "ความเสี่ยง"),
  colLastSeen: t("Last seen", "เห็นล่าสุด"),
  noStudents: t(
    "No students are assigned yet",
    "ยังไม่มีนักเรียนที่ได้รับมอบหมาย",
  ),
  loadFailed: t(
    "Could not load this quiz. It will retry automatically.",
    "โหลดข้อมูลแบบทดสอบไม่สำเร็จ ระบบจะลองใหม่อัตโนมัติ",
  ),
  status: (l: Language, s: QuizMonitorStatus) =>
    ({
      NOT_STARTED: t("Not started", "ยังไม่เริ่ม"),
      ANSWERING: t("Answering", "กำลังทำ"),
      AWAY: t("Away now", "ออกจากหน้าจอ"),
      SUBMITTED: t("Submitted", "ส่งแล้ว"),
    })[s](l),
  riskLow: t("Low", "ต่ำ"),
  riskMedium: t("Medium", "ปานกลาง"),
  riskHigh: t("High", "สูง"),
  ruleBased: t("Rule-based estimate", "ประเมินจากกฎ"),
  jevPattern: (
    l: Language,
    p: QuizRiskPattern | null,
    confidence: number | null,
  ) => {
    const label = p
      ? {
          NORMAL: t("Normal test-taking", "ทำข้อสอบตามปกติ"),
          CONNECTIVITY: t(
            "Mostly connection gaps",
            "ส่วนใหญ่เป็นปัญหาการเชื่อมต่อ",
          ),
          DISTRACTED: t(
            "Distracted, no sign of lookup",
            "เสียสมาธิ ไม่พบการค้นหาคำตอบ",
          ),
          OUTSIDE_HELP: t(
            "Likely outside help",
            "น่าจะมีความช่วยเหลือจากภายนอก",
          ),
        }[p](l)
      : t("AI estimate", "ประเมินโดย AI")(l);
    const pct =
      confidence === null ? "" : ` · ${Math.round(confidence * 100)}%`;
    return `${label}${pct}`;
  },

  // Student panel
  summary: t("Summary", "สรุป"),
  exits: t("Left the screen", "ออกจากหน้าจอ"),
  timeAway: t("Time away", "เวลาที่ออกไป"),
  longestAway: t("Longest away", "ออกนานที่สุด"),
  translator: t("Translator detected", "ตรวจพบตัวแปลภาษา"),
  pastes: t("Paste attempts", "พยายามวางข้อความ"),
  screenshots: t("Screenshot keys", "กดปุ่มจับภาพหน้าจอ"),
  connectionGaps: t("Connection gaps", "การเชื่อมต่อขาดหาย"),
  timeline: t("Timeline", "ลำดับเหตุการณ์"),
  noEvents: t("No events recorded", "ไม่มีเหตุการณ์ที่บันทึกไว้"),
  event: (l: Language, type: QuizIntegrityEventType) =>
    ({
      HIDDEN: t("Left the quiz screen", "ออกจากหน้าแบบทดสอบ"),
      VISIBLE: t("Came back", "กลับมาที่หน้าแบบทดสอบ"),
      BLUR: t("Window lost focus", "หน้าต่างไม่ได้โฟกัส"),
      FOCUS: t("Window focused again", "กลับมาโฟกัสหน้าต่าง"),
      TRANSLATE_DETECTED: t("Translator detected", "ตรวจพบตัวแปลภาษา"),
      COPY_ATTEMPT: t("Tried to copy", "พยายามคัดลอก"),
      PASTE_ATTEMPT: t("Tried to paste", "พยายามวาง"),
      FULLSCREEN_EXIT: t("Left full screen", "ออกจากโหมดเต็มจอ"),
      SCREENSHOT_KEY: t("Pressed a screenshot key", "กดปุ่มจับภาพหน้าจอ"),
      HEARTBEAT_GAP: t("Connection gap", "การเชื่อมต่อขาดหาย"),
      PAGE_HIDE: t("Page hidden", "หน้าถูกซ่อน"),
      PAGE_SHOW: t("Page shown", "หน้าแสดงอีกครั้ง"),
    })[type](l),
  answers: t("Answers", "คำตอบ"),
  notAnswered: t("Not answered", "ไม่ได้ตอบ"),
  notGradedYet: t("Not graded yet", "ยังไม่ได้ตรวจ"),
  studentAnswer: t("Student", "นักเรียน"),
  key: t("Key", "เฉลย"),
  scoreOf: (l: Language, max: number) =>
    l === "th" ? `จาก ${max}` : `of ${max}`,
  overridden: t("Edited by teacher", "ครูแก้คะแนน"),
  total: t("Total", "รวม"),
  resetAttempt: t("Reset attempt", "รีเซ็ตการทำแบบทดสอบ"),
  resetConfirm: t(
    "This deletes the student's answers and records so they can start again.",
    "การรีเซ็ตจะลบคำตอบและบันทึกของนักเรียน เพื่อให้เริ่มทำใหม่ได้",
  ),
  close: t("Close", "ปิด"),

  // Autosave
  autosaveWaiting: t("Unsaved changes", "ยังไม่ได้บันทึก"),
  autosaveSaving: t("Saving…", "กำลังบันทึก…"),
  autosaveSaved: t("Saved", "บันทึกแล้ว"),
  autosaveRetrying: t(
    "Couldn't save, retrying…",
    "บันทึกไม่สำเร็จ กำลังลองใหม่…",
  ),
  autosaveError: t(
    "Couldn't save. Check your connection and press Save.",
    "บันทึกไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วกดบันทึก",
  ),
  notSavedBecause: (l: Language, reason: string) =>
    l === "th" ? `ยังไม่บันทึก: ${reason}` : `Not saved: ${reason}`,
  needsAttention: (l: Language, reason: string) =>
    l === "th" ? `ต้องแก้ไข: ${reason}` : `Needs attention: ${reason}`,
  blockPrompt: t("write the question", "พิมพ์คำถาม"),
  blockTwoOptions: t("add at least 2 options", "เพิ่มตัวเลือกอย่างน้อย 2 ข้อ"),
  blockOptionText: t("fill in every option", "กรอกตัวเลือกให้ครบ"),
  blockPickOne: t(
    "mark exactly one correct answer",
    "เลือกคำตอบที่ถูกต้อง 1 ข้อ",
  ),
  blockPickAtLeastOne: t(
    "mark at least one correct answer",
    "เลือกคำตอบที่ถูกต้องอย่างน้อย 1 ข้อ",
  ),
  blockNeedBlank: t("add a blank to the sentence", "เพิ่มช่องว่างในประโยค"),
  blockBlankAnswer: t(
    "give every blank an accepted answer",
    "ใส่คำตอบที่ยอมรับให้ทุกช่องว่าง",
  ),
  unsavedCount: (l: Language, n: number) =>
    l === "th"
      ? `มีคำถาม ${n} ข้อที่ยังบันทึกไม่ได้`
      : `${n} ${n === 1 ? "question isn't" : "questions aren't"} saved`,
  unsavedFixText: t(
    "Fix the highlighted questions or leave without those changes.",
    "แก้ไขคำถามที่ไฮไลต์ไว้ หรือออกโดยไม่บันทึกการแก้ไขเหล่านั้น",
  ),

  // Student preview
  studentPreview: t("Student preview", "มุมมองนักเรียน"),
  previewHint: t(
    "Try the quiz like a student. Nothing here is sent or graded for real.",
    "ลองทำแบบทดสอบแบบนักเรียน ไม่มีการส่งหรือบันทึกคะแนนจริง",
  ),
  previewUnsaved: t("Unsaved", "ยังไม่บันทึก"),
  previewEmpty: t(
    "Add a question to see the preview.",
    "เพิ่มคำถามเพื่อดูตัวอย่าง",
  ),
  previewQuestionOf: (l: Language, i: number, n: number) =>
    l === "th" ? `ข้อ ${i} จาก ${n}` : `Question ${i} of ${n}`,
  previewPrev: t("Previous", "ก่อนหน้า"),
  previewNext: t("Next", "ถัดไป"),
  previewCheck: t("Check answer", "ตรวจคำตอบ"),
  previewCheckAll: t("Check all", "ตรวจทั้งหมด"),
  previewReset: t("Reset", "เริ่มใหม่"),
  previewCorrect: t("Correct", "ถูกต้อง"),
  previewIncorrect: t("Not quite", "ยังไม่ถูก"),
  previewPartly: t("Partly right", "ถูกบางส่วน"),
  previewPointsEarned: (l: Language, got: number, max: number) =>
    l === "th" ? `ได้ ${got} จาก ${max} คะแนน` : `${got} / ${max} points`,
  previewAnswerKey: t("Answer", "เฉลย"),
  previewAccepted: t("Accepted answers", "คำตอบที่ยอมรับ"),
  previewScore: t("Preview score", "คะแนนจากการลองทำ"),
  previewShuffleNote: t(
    "Students see the questions or options in a shuffled order.",
    "นักเรียนจะเห็นคำถามหรือตัวเลือกแบบสลับลำดับ",
  ),
  previewTimerNote: (l: Language, minutes: number) =>
    l === "th"
      ? `นักเรียนมีเวลา ${minutes} นาที (ไม่จับเวลาในตัวอย่าง)`
      : `Students get ${minutes} minutes (no timer in the preview).`,
  previewTestModeNote: t(
    "Test mode is on for students.",
    "นักเรียนจะทำในโหมดสอบ",
  ),
  previewChooseOne: t("Choose one answer", "เลือกคำตอบเดียว"),
  previewChooseAll: t("Choose all that apply", "เลือกได้หลายคำตอบ"),
};
