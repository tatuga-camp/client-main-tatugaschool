import { Language } from "../../interfaces";

// Restart / give points / close / list strings are shared with the card and
// slider pickers; these are treasure-only.
export const TreasurePickerLanguage = {
  open_chest: (language: Language) =>
    language === "th" ? "เปิดหีบ" : "Open the chest",
  opening: (language: Language) =>
    language === "th" ? "กำลังเปิดหีบ…" : "Opening…",
  skip: (language: Language) =>
    language === "th" ? "ข้ามไปดูผล" : "Skip to result",
  pick_label: (language: Language) => (language === "th" ? "สุ่ม" : "Pick"),
  pick_unit: (language: Language, count: number) =>
    language === "th" ? "คน" : count === 1 ? "student" : "students",
  fewer: (language: Language) =>
    language === "th" ? "ลดจำนวนคน" : "Pick fewer",
  more: (language: Language) =>
    language === "th" ? "เพิ่มจำนวนคน" : "Pick more",
  count_label: (language: Language) =>
    language === "th" ? "จำนวนคนที่จะสุ่ม" : "How many students to pick",
  open_hint: (language: Language) =>
    language === "th" ? "กดเพื่อเปิดหีบ" : "Press to open the chest",
  picked_kicker: (language: Language, count: number) =>
    language === "th"
      ? `สุ่มได้ ${count} คน`
      : count === 1
        ? "Picked"
        : `${count} picked`,
  congrats: (language: Language, count: number) =>
    language === "th"
      ? count === 1
        ? "ยินดีด้วย!"
        : "ได้แก่…"
      : count === 1
        ? "Congratulations!"
        : "Here they are!",
  reveal_label: (language: Language) =>
    language === "th" ? "นักเรียนที่สุ่มได้" : "Picked students",
  put_back: (language: Language) =>
    language === "th" ? "ใส่คืนหีบ" : "Put back",
  back_to_chest: (language: Language) =>
    language === "th" ? "กลับไปที่หีบ" : "Back to the chest",
  empty_hint: (language: Language) =>
    language === "th"
      ? "สุ่มครบทุกคนแล้ว กดเริ่มใหม่เพื่อใส่ทุกคนกลับเข้าหีบ"
      : "Everyone has been picked. Restart to put them all back in the chest.",
  no_students_hint: (language: Language) =>
    language === "th"
      ? "เพิ่มนักเรียนในวิชานี้เพื่อใช้หีบสุ่มชื่อ"
      : "Add students to this subject to use the treasure chest.",
  vault_label: (language: Language, count: number) =>
    language === "th"
      ? `หีบสุ่มชื่อ มีนักเรียน ${count} คน`
      : `Treasure chest with ${count} student${count === 1 ? "" : "s"}`,
} as const;
