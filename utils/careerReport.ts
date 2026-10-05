import type { Language } from "../interfaces";
import type { CareerSector } from "../data/career";

export type SkillBand = "above" | "close" | "below";

// matchPoint = student average ÷ the career's expected level for that skill
// (servers/server-main-tatugaschool/src/career/career.service.ts).
export const BAR_MAX_RATIO = 1.5;
export const EXPECTED_MARKER_PERCENT = (1 / BAR_MAX_RATIO) * 100;

export function skillBand(matchPoint: number): SkillBand {
  if (!Number.isFinite(matchPoint)) return "below";
  if (matchPoint >= 1) return "above";
  if (matchPoint >= 0.8) return "close";
  return "below";
}

export function barPercent(matchPoint: number): number {
  if (!Number.isFinite(matchPoint) || matchPoint <= 0) return 0;
  return (Math.min(matchPoint, BAR_MAX_RATIO) / BAR_MAX_RATIO) * 100;
}

// Top two averages are "strongest"; up to two of the remaining lowest are
// "to grow", lowest first. A skill never appears in both lists.
export function summarizeSkills<T extends { id: string; avg: number }>(
  skills: T[],
): { strongest: T[]; toGrow: T[] } {
  const sorted = skills
    .filter((skill) => Number.isFinite(skill.avg))
    .sort((a, b) => b.avg - a.avg);
  const strongest = sorted.slice(0, 2);
  const toGrow = sorted.slice(strongest.length).slice(-2).reverse();
  return { strongest, toGrow };
}

export type LocalizedSector = {
  title: string;
  description: string;
  picture: string;
  blurHash?: string;
  careers: { title: string; description: string }[];
};

export function localizeSector(
  sector: CareerSector,
  language: Language,
): LocalizedSector {
  const th = language === "th";
  return {
    title: (th && sector.titleTh) || sector.title,
    description: (th && sector.descriptionTh) || sector.description,
    picture: sector.picture,
    blurHash: sector.blurHash ?? sector.blurhash,
    careers: sector.careers.map((career) => ({
      title: (th && career.titleTh) || career.title,
      description: (th && career.descriptionTh) || career.description,
    })),
  };
}
