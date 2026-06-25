import { Language } from "../../interfaces";

export const groupOnSubjectLanguage = {
  autoRefreshGroup: (language: Language) => {
    switch (language) {
      case "en":
        return "Auto Refresh Group";
      case "th":
        return "จัดกลุ่มอัตโนมัติ";
      default:
        return "Auto Refresh Group";
    }
  },
  groupSetting: (language: Language) => {
    switch (language) {
      case "en":
        return "Group Setting";
      case "th":
        return "ตั้งค่ากลุ่ม";
      default:
        return "Group Setting";
    }
  },
  groupDelete: (language: Language) => {
    switch (language) {
      case "en":
        return "Group Delete";
      case "th":
        return "ลบกลุ่ม";
      default:
        return "Group Delete";
    }
  },
  createNewColumn: (language: Language) => {
    switch (language) {
      case "en":
        return "Create New Column";
      case "th":
        return "สร้างกลุ่มใหม่";
      default:
        return "Create New Column";
    }
  },
  confirmAutoRefresh: (language: Language) => {
    switch (language) {
      case "en":
        return "Are you sure?";
      case "th":
        return "คุณแน่ใจหรือไม่?";
      default:
        return "Are you sure?";
    }
  },
  deleteToastSummary: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete";
      case "th":
        return "ลบแล้ว";
      default:
        return "Delete";
    }
  },
  deleteToastDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Group has been deleted";
      case "th":
        return "ลบกลุ่มเรียบร้อยแล้ว";
      default:
        return "Group has been deleted";
    }
  },
  ungroupStudents: (language: Language) => {
    switch (language) {
      case "en":
        return "Ungroup Students";
      case "th":
        return "นักเรียนที่ยังไม่จัดกลุ่ม";
      default:
        return "Ungroup Students";
    }
  },
  noStudents: (language: Language) => {
    switch (language) {
      case "en":
        return "No Students";
      case "th":
        return "ไม่มีนักเรียน";
      default:
        return "No Students";
    }
  },
  score: (language: Language) => {
    switch (language) {
      case "en":
        return "score";
      case "th":
        return "คะแนน";
      default:
        return "score";
    }
  },
  addScore: (language: Language) => {
    switch (language) {
      case "en":
        return "Add Score";
      case "th":
        return "ให้คะแนน";
      default:
        return "Add Score";
    }
  },
  addScoreTooltip: (language: Language) => {
    switch (language) {
      case "en":
        return "Give this group a score";
      case "th":
        return "ให้คะแนนกลุ่มนี้";
      default:
        return "Give this group a score";
    }
  },
  updatedToastSummary: (language: Language) => {
    switch (language) {
      case "en":
        return "Updated";
      case "th":
        return "อัปเดตแล้ว";
      default:
        return "Updated";
    }
  },
  updatedToastDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Group has been updated";
      case "th":
        return "อัปเดตกลุ่มเรียบร้อยแล้ว";
      default:
        return "Group has been updated";
    }
  },
  number: (language: Language) => {
    switch (language) {
      case "en":
        return "Number";
      case "th":
        return "เลขที่";
      default:
        return "Number";
    }
  },
  createGroup: (language: Language) => {
    switch (language) {
      case "en":
        return "Create Group";
      case "th":
        return "สร้างกลุ่ม";
      default:
        return "Create Group";
    }
  },
  updateGroup: (language: Language) => {
    switch (language) {
      case "en":
        return "Update Group";
      case "th":
        return "แก้ไขกลุ่ม";
      default:
        return "Update Group";
    }
  },
  titleLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "title";
      case "th":
        return "ชื่อกลุ่ม";
      default:
        return "title";
    }
  },
  descriptionLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "description";
      case "th":
        return "คำอธิบาย";
      default:
        return "description";
    }
  },
  numberOfGroupsLabel: (language: Language) => {
    switch (language) {
      case "en":
        return "numbers of groups";
      case "th":
        return "จำนวนกลุ่ม";
      default:
        return "numbers of groups";
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
  fillOutAllData: (language: Language) => {
    switch (language) {
      case "en":
        return "Fill out all data";
      case "th":
        return "กรุณากรอกข้อมูลให้ครบถ้วน";
      default:
        return "Fill out all data";
    }
  },
  createdToastSummary: (language: Language) => {
    switch (language) {
      case "en":
        return "Created";
      case "th":
        return "สร้างแล้ว";
      default:
        return "Created";
    }
  },
  createdToastDetail: (language: Language) => {
    switch (language) {
      case "en":
        return "Group has been created";
      case "th":
        return "สร้างกลุ่มเรียบร้อยแล้ว";
      default:
        return "Group has been created";
    }
  },
};
