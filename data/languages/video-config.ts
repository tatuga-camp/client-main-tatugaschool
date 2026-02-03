import { Language } from "../../interfaces";

export const videoConfigLanguage = {
  videoPreview: (language: Language) => {
    switch (language) {
      case "en":
        return "Video Preview";
      case "th":
        return "ตัวอย่างวิดีโอ";
      default:
        return "Video Preview";
    }
  },
  addQuestionAtCurrentTime: (language: Language) => {
    switch (language) {
      case "en":
        return "Add Question at Current Time";
      case "th":
        return "เพิ่มคำถามที่เวลานี้";
      default:
        return "Add Question at Current Time";
    }
  },
  pauseVideoTip: (language: Language) => {
    switch (language) {
      case "en":
        return "Pause video to add question at specific time";
      case "th":
        return "หยุดวิดีโอเพื่อเพิ่มคำถามในเวลาที่ต้องการ";
      default:
        return "Pause video to add question at specific time";
    }
  },
  configuration: (language: Language) => {
    switch (language) {
      case "en":
        return "Configuration";
      case "th":
        return "การตั้งค่า";
      default:
        return "Configuration";
    }
  },
  playbackSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Playback Settings";
      case "th":
        return "ตั้งค่าการเล่น";
      default:
        return "Playback Settings";
    }
  },
  preventFastForward: (language: Language) => {
    switch (language) {
      case "en":
        return "Prevent Fast Forward";
      case "th":
        return "ห้ามกรอวิดีโอ";
      default:
        return "Prevent Fast Forward";
    }
  },
  popupQuestions: (language: Language) => {
    switch (language) {
      case "en":
        return "Popup Questions (comming soon)";
      case "th":
        return "คำถามป๊อปอัพ (เร็วๆ นี้)";
      default:
        return "Popup Questions (comming soon)";
    }
  },
  newQuestionAt: (language: Language) => {
    switch (language) {
      case "en":
        return "New Question at";
      case "th":
        return "คำถามใหม่ที่เวลา";
      default:
        return "New Question at";
    }
  },
  questionTextPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Question text";
      case "th":
        return "คำถาม";
      default:
        return "Question text";
    }
  },
  options: (language: Language) => {
    switch (language) {
      case "en":
        return "Options";
      case "th":
        return "ตัวเลือก";
      default:
        return "Options";
    }
  },
  optionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Option";
      case "th":
        return "ตัวเลือก";
      default:
        return "Option";
    }
  },
  addOption: (language: Language) => {
    switch (language) {
      case "en":
        return "+ Add Option";
      case "th":
        return "+ เพิ่มตัวเลือก";
      default:
        return "+ Add Option";
    }
  },
  saveQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Question";
      case "th":
        return "บันทึกคำถาม";
      default:
        return "Save Question";
    }
  },
  noQuestions: (language: Language) => {
    switch (language) {
      case "en":
        return "No questions added yet.";
      case "th":
        return "ยังไม่มีคำถาม";
      default:
        return "No questions added yet.";
    }
  },
  saveConfiguration: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Configuration";
      case "th":
        return "บันทึกการตั้งค่า";
      default:
        return "Save Configuration";
    }
  },
} as const;
