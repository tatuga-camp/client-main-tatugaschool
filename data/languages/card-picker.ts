import { Language } from "../../interfaces";

export const CardPickerLanguage = {
  restart: (language: Language) => {
    switch (language) {
      case "en":
        return "Restart";
      case "th":
        return "เริ่มใหม่";
      default:
        return "Restart";
    }
  },
  shuffle: (language: Language) => {
    switch (language) {
      case "en":
        return "Shuffle";
      case "th":
        return "สับการ์ด";
      default:
        return "Shuffle";
    }
  },
  delete_name: (language: Language) => {
    switch (language) {
      case "en":
        return "delete";
      case "th":
        return "ลบชื่อ";
      default:
        return "delete";
    }
  },
  give_score: (language: Language) => {
    switch (language) {
      case "en":
        return "give score";
      case "th":
        return "ให้คะแนน";
      default:
        return "give score";
    }
  },
  cancel: (language: Language) => {
    switch (language) {
      case "en":
        return "cancel";
      case "th":
        return "ออก";
      default:
        return "cancel";
    }
  },
  draw_card: (language: Language) => {
    switch (language) {
      case "th":
        return "จั่วการ์ด";
      default:
        return "Draw a card";
    }
  },
  draw_next: (language: Language) => {
    switch (language) {
      case "th":
        return "จั่วใบต่อไป";
      default:
        return "Draw next";
    }
  },
  finish: (language: Language) => {
    switch (language) {
      case "th":
        return "เสร็จสิ้น";
      default:
        return "Finish";
    }
  },
  put_back: (language: Language) => {
    switch (language) {
      case "th":
        return "ใส่คืนสำรับ";
      default:
        return "Put back";
    }
  },
  give_points: (language: Language) => {
    switch (language) {
      case "th":
        return "ให้คะแนน";
      default:
        return "Give points";
    }
  },
  picked_label: (language: Language) => {
    switch (language) {
      case "th":
        return "ถูกเลือกแล้ว!";
      default:
        return "PICKED!";
    }
  },
  in_deck: (language: Language) => {
    switch (language) {
      case "th":
        return "ในสำรับ";
      default:
        return "In deck";
    }
  },
  picked: (language: Language) => {
    switch (language) {
      case "th":
        return "เลือกแล้ว";
      default:
        return "Picked";
    }
  },
  drag_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "ลากการ์ดใบบนสุดออก หรือกด";
      default:
        return "Drag the top card out, or press";
    }
  },
  empty_deck_title: (language: Language) => {
    switch (language) {
      case "th":
        return "เลือกครบทุกคนแล้ว";
      default:
        return "Everyone's been picked";
    }
  },
  empty_deck_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "กด เริ่มใหม่ เพื่อนำทุกคนกลับเข้าสำรับ";
      default:
        return "Press Restart to put everyone back in the deck.";
    }
  },
  no_students_title: (language: Language) => {
    switch (language) {
      case "th":
        return "ยังไม่มีนักเรียน";
      default:
        return "No students yet";
    }
  },
  no_students_hint: (language: Language) => {
    switch (language) {
      case "th":
        return "เพิ่มนักเรียนในวิชานี้เพื่อใช้การสุ่มการ์ด";
      default:
        return "Add students to this subject to use the card picker.";
    }
  },
  sound_on: (language: Language) => {
    switch (language) {
      case "th":
        return "เปิดเสียง";
      default:
        return "Sound on";
    }
  },
  sound_off: (language: Language) => {
    switch (language) {
      case "th":
        return "ปิดเสียง";
      default:
        return "Sound off";
    }
  },
  move_to_picked: (language: Language) => {
    switch (language) {
      case "th":
        return "ย้ายไปเลือกแล้ว";
      default:
        return "Move to Picked";
    }
  },
  move_to_deck: (language: Language) => {
    switch (language) {
      case "th":
        return "ใส่คืนสำรับ";
      default:
        return "Put back in deck";
    }
  },
  now_label: (language: Language) => {
    switch (language) {
      case "th":
        return "ตอนนี้";
      default:
        return "Now";
    }
  },
  points_short: (language: Language) => {
    switch (language) {
      case "th":
        return "คะแนน";
      default:
        return "pts";
    }
  },
  open_list: (language: Language) => {
    switch (language) {
      case "th":
        return "ดูรายชื่อในสำรับ";
      default:
        return "Show deck list";
    }
  },
  close: (language: Language) => {
    switch (language) {
      case "th":
        return "ปิด";
      default:
        return "Close";
    }
  },
  empty_list: (language: Language) => {
    switch (language) {
      case "th":
        return "ไม่มีรายชื่อ";
      default:
        return "No one here";
    }
  },
  number_label: (language: Language, number: string) => {
    switch (language) {
      case "th":
        return `เลขที่ ${number}`;
      default:
        return `No. ${number}`;
    }
  },
} as const;
