import { Language } from "../../interfaces";

export const gradeData = {
  title: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade Overview";
      case "th":
        return "คะแนนรวม";
      default:
        return "Grade Overview";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "You can view student grades here";
      case "th":
        return "คุณสามารถดูคะแนนรวมของงานที่มอบหมาย และคะแนนพิเศษได้ที่นี้";
      default:
        return "You can view student grades here";
    }
  },
  setting: (language: Language) => {
    switch (language) {
      case "en":
        return "Grade Setting";
      case "th":
        return "ตั้งค่าคำนวนเกรด";
      default:
        return "Grade Setting";
    }
  },
  no_work: (language: Language) => {
    switch (language) {
      case "en":
        return "NO WORK";
      case "th":
        return "ไม่ส่งงาน";
      default:
        return "NO WORK";
    }
  },
  wait_reviewed: (language: Language) => {
    switch (language) {
      case "en":
        return "NOT GRADED";
      case "th":
        return "ครูยังไม่ตรวจ";
      default:
        return "NOT GRADED";
    }
  },
  need_improvement: (language: Language) => {
    switch (language) {
      case "en":
        return "NEED IMPROVEMENT";
      case "th":
        return "ต้องปรับปรุง";
      default:
        return "NEED IMPROVEMENT";
    }
  },
  speical_score: (language: Language) => {
    switch (language) {
      case "en":
        return "special score";
      case "th":
        return "คะแนนพิเศษ";
      default:
        return "special score";
    }
  },
  assignment_score: (language: Language) => {
    switch (language) {
      case "en":
        return "assignment score";
      case "th":
        return "คะแนนชิ้นงาน";
      default:
        return "assignment score";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "points";
      case "th":
        return "คะแนนเต็ม";
      default:
        return "points";
    }
  },
  weight: (language: Language) => {
    switch (language) {
      case "en":
        return "weight";
      case "th":
        return "ค่าน้ำหนัก";
      default:
        return "weight";
    }
  },
  leaderboard: (language: Language) => {
    switch (language) {
      case "en":
        return "Leaderboard";
      case "th":
        return "อันดับคะแนน";
      default:
        return "Leaderboard";
    }
  },
  table: (language: Language) => {
    switch (language) {
      case "en":
        return "Table";
      case "th":
        return "ตาราง";
      default:
        return "Table";
    }
  },
  hide_scores: (language: Language) => {
    switch (language) {
      case "en":
        return "Hide Scores";
      case "th":
        return "ซ่อนคะแนน";
      default:
        return "Hide Scores";
    }
  },
  show_scores: (language: Language) => {
    switch (language) {
      case "en":
        return "Show Scores";
      case "th":
        return "แสดงคะแนน";
      default:
        return "Show Scores";
    }
  },
  fullscreen: (language: Language) => {
    switch (language) {
      case "en":
        return "Fullscreen";
      case "th":
        return "เต็มหน้าจอ";
      default:
        return "Fullscreen";
    }
  },
  exit_fullscreen: (language: Language) => {
    switch (language) {
      case "en":
        return "Exit Fullscreen";
      case "th":
        return "ออกจากเต็มหน้าจอ";
      default:
        return "Exit Fullscreen";
    }
  },
} as const;
