import { Language } from "../../interfaces";

export const subjectDataLanguage = {
  moreInfo: (language: Language) => {
    switch (language) {
      case "en":
        return "More Info & Edit";
      case "th":
        return "ข้อมูลเพิ่มเติม และแก้ไข";
      default:
        return "More Info & Edit";
    }
  },
  educationYear: (language: Language) => {
    switch (language) {
      case "en":
        return "Education Year";
      case "th":
        return "ปีการศึกษา";
      default:
        return "Education Year";
    }
  },
  code: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Code";
      case "th":
        return "รหัสเข้ารายวิชา";
      default:
        return "Subject Code";
    }
  },
  invite: (language: Language) => {
    switch (language) {
      case "en":
        return "Invite";
      case "th":
        return "เชิญ Co-teacher";
      default:
        return "Invite";
    }
  },
  qrCode: (language: Language) => {
    switch (language) {
      case "en":
        return "QR Code Subject";
      case "th":
        return "QR Code สำหรับเข้าวิชา";
      default:
        return "QR Code Subject";
    }
  },
};

export const settingOnSubjectDataLanguage = {
  general: (language: Language) => {
    switch (language) {
      case "en":
        return "General Settings";
      case "th":
        return "การตั้งค่าทั่วไป";
      default:
        return "General Settings";
    }
  },
  generalDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage your general settings";
      case "th":
        return "จัดการการตั้งค่าทั่วไปของคุณ";
      default:
        return "Manage your general settings";
    }
  },
  info: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Infomation";
      case "th":
        return "ข้อมูลวิชา";
      default:
        return "Subject Infomation";
    }
  },
  subjectId: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject ID";
      case "th":
        return "รหัสวิชา";
      default:
        return "Subject ID";
    }
  },
  connectClassId: (language: Language) => {
    switch (language) {
      case "en":
        return "The Subject Connect To Class ID";
      case "th":
        return "รหัสชั้นเรียนที่เชื่อมกับรายวิชานี้";
      default:
        return "The Subject Connect To Class ID";
    }
  },
  code: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Code";
      case "th":
        return "รหัสเข้สรายวิชา";
      default:
        return "Subject Code";
    }
  },
  name: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Name";
      case "th":
        return "ชื่อรายวิชา";
      default:
        return "Subject Name";
    }
  },
  description: (language: Language) => {
    switch (language) {
      case "en":
        return "Description";
      case "th":
        return "คำอธิบายรายวิชา";
      default:
        return "Description";
    }
  },
  educationYear: (language: Language) => {
    switch (language) {
      case "en":
        return "Education Year";
      case "th":
        return "ปีที่ศึกษา";
      default:
        return "Education Year";
    }
  },
  save: (language: Language) => {
    switch (language) {
      case "en":
        return "Save Changes";
      case "th":
        return "บันทึกการเปลี่ยนแปลง";
      default:
        return "Save Changes";
    }
  },
  subjectPermission: (language: Language) => {
    switch (language) {
      case "en":
        return "Subject Permission";
      case "th":
        return "การอนุญาตต่าง ๆ ";
      default:
        return "Subject Permission";
    }
  },
  allowDelete: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow Student To Delete Their Work";
      case "th":
        return "อนุญาตให้นักเรียนลบผลงานของตนเอง";
      default:
        return "Allow Student To Delete Their Work";
    }
  },
  allowViewScore: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow Student To View Overall Score";
      case "th":
        return "อนุญาตให้นักเรียนดูคะแนนรวมของตนเอง";
      default:
        return "Allow Student To View Overall Score";
    }
  },
  allowViewGrade: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow Student To View Grade";
      case "th":
        return "อนุญาตให้นักเรียนดูเกรดของตนเอง";
      default:
        return "Allow Student To View Grade";
    }
  },
  allowViewAttendance: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow Student To View Attendance Record";
      case "th":
        return "อนุญาตให้นักเรียนดูบันทึกการเข้าเรียนของตนเอง";
      default:
        return "Allow Student To View Attendance Record";
    }
  },
  coTeacher: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage Co-Teacher";
      case "th":
        return "จัดการครูผู้สอนร่วม";
      default:
        return "Manage Co-Teacher";
    }
  },
  studentSetting: (language: Language) => {
    switch (language) {
      case "en":
        return "Students Setting";
      case "th":
        return "การตั้งค่านักเรียน";
      default:
        return "Students Setting";
    }
  },
  studentSettingDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Manage Students / Import Student Here";
      case "th":
        return "จัดการนักเรียน ลบนักเรียนออกรายวิชา หรือเพิ่มเข้าจากที่นี้";
      default:
        return "Manage Students / Import Student Here";
    }
  },
  listOnStudent: (language: Language) => {
    switch (language) {
      case "en":
        return "Student Lists On The Subject";
      case "th":
        return "รายชื่อนักเรียนในวิชานี้";
      default:
        return "Student Lists On The Subject";
    }
  },
  listOnStudentDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "You cannot add student from another class to this subject. Once you create subject and add a class to this subject, the student will be automatically added to this subject. You can only disable a student from this subject not delete them.";
      case "th":
        return "คุณไม่สามารถเพิ่มนักเรียนจากห้องเรียนอื่นเข้ามาในวิชานี้ได้ เมื่อคุณสร้างวิชาและเพิ่มห้องเรียนให้กับวิชานี้แล้ว นักเรียนจะถูกเพิ่มเข้ามาในวิชานี้โดยอัตโนมัติ คุณสามารถปิดการใช้งานนักเรียนในวิชานี้ได้ แต่ไม่สามารถลบนักเรียนออกได้";
      default:
        return "You cannot add student from another class to this subject. Once you create subject and add a class to this subject, the student will be automatically added to this subject. You can only disable a student from this subject not delete them.";
    }
  },
  deleteSubject: (language: Language) => {
    switch (language) {
      case "en":
        return "Delete This Subject";
      case "th":
        return "ลบรายวิชา";
      default:
        return "Delete This Subject";
    }
  },
  deleteSubjectDescription: (language: Language) => {
    switch (language) {
      case "en":
        return "Once you delete this subject, all data will be lost and cannot be recovered. Please be careful.";
      case "th":
        return "เมื่อลบวิชานี้ ข้อมูลทั้งหมดจะสูญหายและไม่สามารถกู้คืนได้ โปรดดำเนินการด้วยความระมัดระวัง";
      default:
        return "Once you delete this subject, all data will be lost and cannot be recovered. Please be careful.";
    }
  },
};

export const footerOnSubjectDataLangugae = {
  StopWatch: (language: Language) => {
    switch (language) {
      case "en":
        return "Stop Watch";
      case "th":
        return "จัวเวลา";
      default:
        return "Stop Watch";
    }
  },
  Attendance: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance";
      case "th":
        return "เช็คชื่อ";
      default:
        return "Attendance";
    }
  },
  AttendanceQRCode: (language: Language) => {
    switch (language) {
      case "en":
        return "Attendance QRCode";
      case "th":
        return "เช็คชื่อด้วย QR Code";
      default:
        return "Attendance QRCode";
    }
  },
  WheelOfName: (language: Language) => {
    switch (language) {
      case "en":
        return "Wheel Of Name";
      case "th":
        return "วงเวียนสุ่มชื่อ";
      default:
        return "Wheel Of Name";
    }
  },
  SlidePicker: (language: Language) => {
    switch (language) {
      case "en":
        return "Slide Picker";
      case "th":
        return "ไลท์สุ่มชื่อ";
      default:
        return "Slide Picker";
    }
  },
};
