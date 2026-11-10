import { Language } from "../../interfaces";
import type { PickerSound } from "../../components/subject/picker-sound/usePickerSound";

export const PickerSoundLanguage = {
  menu_label: (language: Language) => {
    switch (language) {
      case "th":
        return "เสียงประกอบ";
      default:
        return "Sound effects";
    }
  },
  name: (language: Language, sound: PickerSound) => {
    const th: Record<PickerSound, string> = {
      off: "ปิดเสียง",
      chime: "กระดิ่ง",
      arcade: "เกมตู้",
      drumroll: "กลองรัว",
    };
    const en: Record<PickerSound, string> = {
      off: "Off",
      chime: "Chime",
      arcade: "Arcade",
      drumroll: "Drumroll",
    };
    return language === "th" ? th[sound] : en[sound];
  },
  hint: (language: Language, sound: PickerSound) => {
    const th: Record<PickerSound, string> = {
      off: "ไม่มีเสียงประกอบ",
      chime: "เสียงใสนุ่มนวล ไล่โน้ตสูงขึ้นเรื่อย ๆ",
      arcade: "เสียงบี๊บแบบเกม 8 บิต พร้อมเพลงฉลองชัย",
      drumroll: "กลองรัวเร้าใจ ปิดท้ายด้วยเสียงฉาบ",
    };
    const en: Record<PickerSound, string> = {
      off: "No sound effects",
      chime: "Soft notes that climb toward the pick",
      arcade: "8-bit blips and a victory jingle",
      drumroll: "Snare taps building to a cymbal crash",
    };
    return language === "th" ? th[sound] : en[sound];
  },
} as const;
