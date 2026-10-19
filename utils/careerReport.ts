import type { Language } from "../interfaces";
import type { CareerSector } from "../data/career";

const MAX_KEY_SKILLS = 2;

// emphasis = how much a career's survey respondents rated this skill above
// other careers, relative to the career's own baseline
// (servers/server-main-tatugaschool/src/career/career-match.ts).
// Careers are ranked by these skills, so they explain the ranking.
export function keySkills<T extends { emphasis: number }>(skills: T[]): T[] {
  return skills
    .filter((skill) => Number.isFinite(skill.emphasis) && skill.emphasis > 0)
    .sort((a, b) => b.emphasis - a.emphasis)
    .slice(0, MAX_KEY_SKILLS);
}

// Skills scoring above the student's own average — the same "relative
// strength" the career ranking compares against.
export function strengthIds(skills: { id: string; avg: number }[]): Set<string> {
  const finite = skills.filter((skill) => Number.isFinite(skill.avg));
  if (finite.length === 0) return new Set();
  const average =
    finite.reduce((sum, skill) => sum + skill.avg, 0) / finite.length;
  return new Set(
    finite.filter((skill) => skill.avg > average).map((skill) => skill.id),
  );
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
