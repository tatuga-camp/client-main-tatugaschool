import { Language } from "../../interfaces";

// Strings shared with the card picker (restart, give points, close, …) come
// from CardPickerLanguage; these are the reel-specific ones.
export const SliderPickerLanguage = {
  spin: (language: Language) => {
    switch (language) {
      case "th":
        return "หมุนสุ่ม";
      default:
        return "Spin";
    }
  },
  spinning: (language: Language) => {
    switch (language) {
      case "th":
        return "กำลังหมุน…";
      default:
        return "Spinning…";
    }
  },
  speed_quick: (language: Language) => {
    switch (language) {
      case "th":
        return "เร็ว";
      default:
        return "Quick";
    }
  },
  speed_dramatic: (language: Language) => {
    switch (language) {
      case "th":
        return "ลุ้นยาว";
      default:
        return "Dramatic";
    }
  },
  speed_label: (language: Language) => {
    switch (language) {
      case "th":
        return "ความเร็วในการหมุน";
      default:
        return "Spin speed";
    }
  },
  spin_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "กดปุ่มหมุนสุ่ม หรือกด";
      default:
        return "Press Spin, or press";
    }
  },
  waiting: (language: Language) => {
    switch (language) {
      case "th":
        return "รอสุ่ม";
      default:
        return "Waiting";
    }
  },
  put_back: (language: Language) => {
    switch (language) {
      case "th":
        return "ใส่คืน";
      default:
        return "Put back";
    }
  },
  back_to_reel: (language: Language) => {
    switch (language) {
      case "th":
        return "กลับไปหมุนต่อ";
      default:
        return "Back to spinner";
    }
  },
  open_list: (language: Language) => {
    switch (language) {
      case "th":
        return "ดูรายชื่อที่รอสุ่ม";
      default:
        return "Show name list";
    }
  },
  empty_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "กด เริ่มใหม่ เพื่อนำทุกคนกลับมารอสุ่ม";
      default:
        return "Press Restart to put everyone back in the draw.";
    }
  },
  no_students_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "เพิ่มนักเรียนในวิชานี้เพื่อใช้การหมุนสุ่ม";
      default:
        return "Add students to this subject to use the spinner.";
    }
  },
} as const;
