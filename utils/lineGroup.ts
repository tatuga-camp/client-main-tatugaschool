import { LineGroupOnSubject } from "../interfaces/LineGroupOnSubject";

export function lineGroupDisplayName(
  link: Pick<LineGroupOnSubject, "groupName" | "lineGroupId">,
  language: "th" | "en",
): string {
  const name = link.groupName?.trim();
  if (name) return name;
  const tail = link.lineGroupId.slice(-4);
  return language === "th" ? `กลุ่ม LINE …${tail}` : `LINE group …${tail}`;
}

export function verifiedLineGroups(
  links: LineGroupOnSubject[] | undefined,
): LineGroupOnSubject[] {
  return (links ?? []).filter((link) => link.isVerify);
}

export function nextPendingLineGroup(
  links: LineGroupOnSubject[] | undefined,
  dismissedIds: string[],
): LineGroupOnSubject | null {
  const pending = (links ?? [])
    .filter(
      (link) =>
        !link.isVerify && !!link.verifyToken && !dismissedIds.includes(link.id),
    )
    .sort(
      (a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    );
  return pending[0] ?? null;
}

// "Later" on the confirm popup lasts for the browser session: the dismissed
// link ids are kept in sessionStorage under this key, as a JSON array of ids.
export const LINE_GROUP_DISMISSED_KEY = "line-group-dismissed";

type DismissedStorage = Pick<Storage, "getItem" | "setItem">;

// The tab's sessionStorage, or null where there is none (server render) or the
// browser refuses access to it (reading the property itself can throw).
export function browserSessionStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readDismissedLineGroups(
  storage: DismissedStorage | null | undefined,
): string[] {
  try {
    const raw = storage?.getItem(LINE_GROUP_DISMISSED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
  } catch {
    return [];
  }
}

export function writeDismissedLineGroups(
  storage: DismissedStorage | null | undefined,
  ids: string[],
): void {
  try {
    storage?.setItem(
      LINE_GROUP_DISMISSED_KEY,
      JSON.stringify(Array.from(new Set(ids))),
    );
  } catch {
    // Storage unavailable or full: "Later" then lasts until the page reloads.
  }
}
