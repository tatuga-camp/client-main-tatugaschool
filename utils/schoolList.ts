type ListSchool = {
  id: string;
  title: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  totalStorage?: number | null;
  limitTotalStorage?: number | null;
};

// Paid plans get a 10 TB cap from the server; treat anything this big as
// "unlimited" rather than drawing an always-empty meter.
export const UNLIMITED_STORAGE_BYTES = 1024 ** 4; // 1 TB

/** Default school first, then alphabetical (Thai-aware). Never mutates. */
export function sortSchools<T extends ListSchool>(
  schools: T[],
  defaultSchoolId: string | null | undefined,
): T[] {
  return [...schools].sort((a, b) => {
    if (a.id === defaultSchoolId) return -1;
    if (b.id === defaultSchoolId) return 1;
    return a.title.localeCompare(b.title, "th", { numeric: true });
  });
}

/** Case-insensitive match on name, city, country or description. */
export function filterSchools<T extends ListSchool>(
  schools: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return schools;
  return schools.filter((school) =>
    [school.title, school.city, school.country, school.description].some(
      (value) => (value ?? "").toLowerCase().includes(q),
    ),
  );
}

export type StorageUsage = {
  used: number;
  /** null when the plan is effectively unlimited or no limit is known. */
  limit: number | null;
  /** 0-100, only meaningful when `limit` is set. */
  percent: number;
};

export function storageUsage(school: ListSchool): StorageUsage {
  const used = Math.max(0, school.totalStorage ?? 0);
  const rawLimit = school.limitTotalStorage ?? 0;
  if (rawLimit <= 0 || rawLimit >= UNLIMITED_STORAGE_BYTES) {
    return { used, limit: null, percent: 0 };
  }
  const percent = Math.min(100, Math.round((used / rawLimit) * 100));
  return { used, limit: rawLimit, percent };
}

/** "Bangkok, Thailand", "Bangkok", or "" when neither is set. */
export function schoolLocation(school: ListSchool): string {
  return [school.city, school.country]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}
