import { Language } from "../../interfaces";

export const FacePickerLanguage = {
  pick: (language: Language) => {
    switch (language) {
      case "en":
        return "Pick";
      case "th":
        return "สุ่มเลือก";
      default:
        return "Pick";
    }
  },
  pickAgain: (language: Language) => {
    switch (language) {
      case "en":
        return "Pick again";
      case "th":
        return "สุ่มอีกครั้ง";
      default:
        return "Pick again";
    }
  },
  noFaces: (language: Language) => {
    switch (language) {
      case "en":
        return "No students detected — make sure they're in the camera's view";
      case "th":
        return "ไม่พบนักเรียน — โปรดให้นักเรียนอยู่ในมุมมองของกล้อง";
      default:
        return "No students detected — make sure they're in the camera's view";
    }
  },
  privacy: (language: Language) => {
    switch (language) {
      case "en":
        return "Runs entirely on this device. No video is recorded or uploaded.";
      case "th":
        return "ประมวลผลบนเครื่องนี้ทั้งหมด ไม่มีการบันทึกหรืออัปโหลดวิดีโอ";
      default:
        return "Runs entirely on this device. No video is recorded or uploaded.";
    }
  },
  permissionDenied: (language: Language) => {
    switch (language) {
      case "en":
        return "Camera access was blocked";
      case "th":
        return "การเข้าถึงกล้องถูกปฏิเสธ";
      default:
        return "Camera access was blocked";
    }
  },
  noCamera: (language: Language) => {
    switch (language) {
      case "en":
        return "No camera was found on this device";
      case "th":
        return "ไม่พบกล้องบนอุปกรณ์นี้";
      default:
        return "No camera was found on this device";
    }
  },
  loadError: (language: Language) => {
    switch (language) {
      case "en":
        return "Could not start the detector";
      case "th":
        return "ไม่สามารถเริ่มตัวตรวจจับได้";
      default:
        return "Could not start the detector";
    }
  },
  retry: (language: Language) => {
    switch (language) {
      case "en":
        return "Try again";
      case "th":
        return "ลองอีกครั้ง";
      default:
        return "Try again";
    }
  },
  enableCameraHint: (language: Language) => {
    switch (language) {
      case "en":
        return "Allow camera access in your browser, then try again.";
      case "th":
        return "อนุญาตการเข้าถึงกล้องในเบราว์เซอร์ แล้วลองอีกครั้ง";
      default:
        return "Allow camera access in your browser, then try again.";
    }
  },
  switchCamera: (language: Language) => {
    switch (language) {
      case "en":
        return "Switch camera";
      case "th":
        return "สลับกล้อง";
      default:
        return "Switch camera";
    }
  },
  cameraSettings: (language: Language) => {
    switch (language) {
      case "en":
        return "Camera settings";
      case "th":
        return "ตั้งค่ากล้อง";
      default:
        return "Camera settings";
    }
  },
  chooseCamera: (language: Language) => {
    switch (language) {
      case "en":
        return "Choose camera";
      case "th":
        return "เลือกกล้อง";
      default:
        return "Choose camera";
    }
  },
  winner: (language: Language) => {
    switch (language) {
      case "en":
        return "It's you!";
      case "th":
        return "คุณคือผู้ถูกเลือก!";
      default:
        return "It's you!";
    }
  },
} as const;
