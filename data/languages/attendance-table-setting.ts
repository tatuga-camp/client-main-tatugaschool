import { Language } from "../../interfaces";

export const attendanceTableSettingLanguage = {
  generalSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "General Settings";
      case "th":
        return "การตั้งค่าทั่วไป";
      default:
        return "General Settings";
    }
  },
  manageGeneralSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your general settings";
      case "th":
        return "จัดการการตั้งค่าทั่วไปของคุณ";
      default:
        return "Manage your general settings";
    }
  },
  subjectInformation: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Information";
      case "th":
        return "ข้อมูลรายวิชา";
      default:
        return "Subject Information";
    }
  },
  tableName: (language: Language) => {
    switch (language) {
      case "en":
        return "Table Name:";
      case "th":
        return "ชื่อตาราง:";
      default:
        return "Table Name:";
    }
  },
  tableNamePlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Table Name";
      case "th":
        return "ชื่อตาราง";
      default:
        return "Table Name";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Description:";
      case "th":
        return "คำอธิบาย:";
      default:
        return "Description:";
    }
  },
  descriptionPlaceholder: (language: Language) => {
    switch (language) {
      case "en":
        return "Description";
      case "th":
        return "คำอธิบาย";
      default:
        return "Description";
    }
  },
  saveChanges: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Changes";
      case "th":
        return "บันทึกการเปลี่ยนแปลง";
      default:
        return "Save Changes";
    }
  },
  attendanceStatus: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status";
      case "th":
        return "สถานะการเช็คชื่อ";
      default:
        return "Attendance Status";
    }
  },
  customizeStatus: (language: Language) => {
    switch (language) {
      case "en":
        return "Customize your attendance status here";
      case "th":
        return "ปรับแต่งสถานะการเช็คชื่อของคุณที่นี่";
      default:
        return "Customize your attendance status here";
    }
  },
  name: (language: Language) => {
    switch (language) {
      case "en":
        return "Name";
      case "th":
        return "ชื่อ";
      default:
        return "Name";
    }
  },
  color: (language: Language) => {
    switch (language) {
      case "en":
        return "Color";
      case "th":
        return "สี";
      default:
        return "Color";
    }
  },
  value: (language: Language) => {
    switch (language) {
      case "en":
        return "Value";
      case "th":
        return "ค่า";
      default:
        return "Value";
    }
  },
  status: (language: Language) => {
    switch (language) {
      case "en":
        return "Status";
      case "th":
        return "สถานะ";
      default:
        return "Status";
    }
  },
  dangerZone: (language: Language) => {
    switch (language) {
      case "en":
        return "Danger zone";
      case "th":
        return "พื้นที่อันตราย";
      default:
        return "Danger zone";
    }
  },
  irreversibleAction: (language: Language) => {
    switch (language) {
      case "en":
        return "Irreversible and destructive actions";
      case "th":
        return "การกระทำที่ไม่สามารถย้อนกลับได้และเป็นอันตราย";
      default:
        return "Irreversible and destructive actions";
    }
  },
  deleteTable: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Attendance Table";
      case "th":
        return "ลบตารางการเช็คชื่อนี้";
      default:
        return "Delete This Attendance Table";
    }
  },
  deleteTableWarning: (language: Language) => {
    switch (language) {
      case "en":
        return "This action is irreversible and will delete all attendance data associated with this table. Cannot be undone.";
      case "th":
        return "การดำเนินการนี้ไม่สามารถย้อนกลับได้และจะลบข้อมูลการเช็คชื่อทั้งหมดที่เกี่ยวข้องกับตารางนี้ ไม่สามารถกู้คืนได้";
      default:
        return "This action is irreversible and will delete all attendance data associated with this table. Cannot be undone.";
    }
  },
  deleteTableButton: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Table";
      case "th":
        return "ลบตารางนี้";
      default:
        return "Delete This Table";
    }
  },
  updated: (language: Language) => {
    switch (language) {
      case "en":
        return "Updated";
      case "th":
        return "อัปเดตแล้ว";
      default:
        return "Updated";
    }
  },
  attendanceTableUpdated: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Table Updated";
      case "th":
        return "อัปเดตตารางเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Table Updated";
    }
  },
  somethingWentWrong: (language: Language) => {
    switch (language) {
      case "en":
        return "Something Went Wrong";
      case "th":
        return "เกิดข้อผิดพลาด";
      default:
        return "Something Went Wrong";
    }
  },
  deleteConfirm: (language: Language) => {
    switch (language) {
      case "en":
        return "To confirm, type";
      case "th":
        return "เพื่อยืนยัน พิมพ์";
      default:
        return "To confirm, type";
    }
  },
  inTheBoxBelow: (language: Language) => {
    switch (language) {
      case "en":
        return "in the box below";
      case "th":
        return "ในช่องด้านล่าง";
      default:
        return "in the box below";
    }
  },
  areYouSure: (language: Language) => {
    switch (language) {
      case "en":
        return "Are you sure?";
      case "th":
        return "คุณแน่ใจหรือไม่?";
      default:
        return "Are you sure?";
    }
  },
  actionIrreversible: (language: Language) => {
    switch (language) {
      case "en":
        return "This action is irreversible and destructive. Please be careful.";
      case "th":
        return "การกระทำนี้ไม่สามารถย้อนกลับได้และเป็นอันตราย โปรดระมัดระวัง";
      default:
        return "This action is irreversible and destructive. Please be careful.";
    }
  },
  typeCorrectly: (language: Language) => {
    switch (language) {
      case "en":
        return "Please Type Correctly";
      case "th":
        return "กรุณาพิมพ์ให้ถูกต้อง";
      default:
        return "Please Type Correctly";
    }
  },
  deleting: (language: Language) => {
    switch (language) {
      case "en":
        return "Deleting...";
      case "th":
        return "กำลังลบ...";
      default:
        return "Deleting...";
    }
  },
  loading: (language: Language) => {
    switch (language) {
      case "en":
        return "Loading....";
      case "th":
        return "กำลังโหลด....";
      default:
        return "Loading....";
    }
  },
  deleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Deleted";
      case "th":
        return "ลบแล้ว";
      default:
        return "Deleted";
    }
  },
  attendanceTableDeleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Table Deleted";
      case "th":
        return "ลบตารางเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Table Deleted";
    }
  },
  attendanceStatusDeleted: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status Deleted";
      case "th":
        return "ลบสถานะการเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Status Deleted";
    }
  },
  delete: (language: Language) => {
    switch (language) {
      case "en":
        return "DELETE";
      case "th":
        return "ลบ";
      default:
        return "DELETE";
    }
  },
  requiredFields: (language: Language) => {
    switch (language) {
      case "en":
        return "Title, Color and Value is required";
      case "th":
        return "จำเป็นต้องระบุชื่อ สี และค่า";
      default:
        return "Title, Color and Value is required";
    }
  },
  created: (language: Language) => {
    switch (language) {
      case "en":
        return "Created";
      case "th":
        return "สร้างแล้ว";
      default:
        return "Created";
    }
  },
  attendanceStatusCreated: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance Status Created";
      case "th":
        return "สร้างสถานะการเช็คชื่อเรียบร้อย";
      default:
        return "Attendance Status Created";
    }
  },
  create: (language: Language) => {
    switch (language) {
      case "en":
        return "Create";
      case "th":
        return "สร้าง";
      default:
        return "Create";
    }
  },
} as const;
