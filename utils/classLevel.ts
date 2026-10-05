import type { Language } from "../interfaces";
import { ClassLevelList } from "../data/classLevel";

export type SplitLevel = { grade: string; room: string };

// Levels are stored as "<grade>/<room>", e.g. "มัธยมศึกษาปีที่ 1/2".
export function splitLevel(level: string | null | undefined): SplitLevel {
  const raw = (level ?? "").trim();
  if (!raw) return { grade: "", room: "" };
  const slash = raw.indexOf("/");
  if (slash === -1) return { grade: raw, room: "" };
  return {
    grade: raw.slice(0, slash).trim(),
    room: raw.slice(slash + 1).trim(),
  };
}

const NUMBERED_GRADES = [
  { prefix: "ประถมศึกษาปีที่", th: "ป.", en: "P" },
  { prefix: "มัธยมศึกษาปีที่", th: "ม.", en: "S" },
  { prefix: "ปวช.", th: "ปวช.", en: "VC" },
  { prefix: "ปวส.", th: "ปวส.", en: "HVC" },
];

// Intl.Segmenter keeps Thai vowel/tone marks with their consonant; older
// browsers without it (e.g. Firefox < 125) fall back to code points.
const graphemes = (text: string) =>
  typeof Intl.Segmenter === "function"
    ? Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
        (part) => part.segment,
      )
    : Array.from(text);

export function shortGradeLabel(grade: string, language: Language): string {
  const value = grade.trim();
  if (!value) return "–";
  if (value === "อนุบาล") return language === "th" ? "อ." : "K";
  if (value === "อุดมศึกษา") return language === "th" ? "อุดม." : "HE";
  for (const numbered of NUMBERED_GRADES) {
    if (value.startsWith(numbered.prefix)) {
      const number = value.slice(numbered.prefix.length).trim();
      if (/^\d+$/.test(number)) {
        return `${language === "th" ? numbered.th : numbered.en}${number}`;
      }
    }
  }
  const parts = graphemes(value);
  return parts.length > 4 ? `${parts.slice(0, 4).join("")}…` : value;
}

export function fullGradeLabel(grade: string, language: Language): string {
  if (language !== "en") return grade;
  return ClassLevelList.find((level) => level.title === grade)?.titleEn ?? grade;
}
