import { Language } from "../../interfaces";

// Spin/speed/list strings are shared with the slider picker (SliderPickerLanguage)
// and restart/give points/close with the card picker; these are wheel-only.
export const WheelPickerLanguage = {
  back_to_wheel: (language: Language) => {
    switch (language) {
      case "th":
        return "กลับไปที่วงล้อ";
      default:
        return "Back to wheel";
    }
  },
  no_students_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "เพิ่มนักเรียนในวิชานี้เพื่อใช้วงล้อสุ่มชื่อ";
      default:
        return "Add students to this subject to use the wheel.";
    }
  },
  wheel_label: (language: Language, count: number) => {
    switch (language) {
      case "th":
        return `วงล้อสุ่มชื่อ มีนักเรียน ${count} คน`;
      default:
        return `Name wheel with ${count} student${count === 1 ? "" : "s"}`;
    }
  },
} as const;
