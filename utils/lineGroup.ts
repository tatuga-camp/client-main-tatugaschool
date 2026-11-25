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

type DismissableLink = Pick<LineGroupOnSubject, "id" | "updateAt">;

// "Later" is remembered per link AND per time the group asked: the server
// touches a pending link's updateAt when the code is typed in the group again,
// which changes this key and so brings the confirm popup back.
export function lineGroupDismissalKey(link: DismissableLink): string {
  return `${link.id}:${link.updateAt}`;
}

// A stored entry in the "<link id>:<link updateAt>" format. Entries in the old
// bare-id format do not match and are ignored.
function isDismissalEntry(entry: unknown): entry is string {
  if (typeof entry !== "string") return false;
  const separator = entry.indexOf(":");
  return separator > 0 && separator < entry.length - 1;
}

// The dismissed list with this link added. An older entry of the same link
// (dismissed before the group asked again) is replaced. Returns the same list
// when the link is already dismissed.
export function dismissLineGroup(
  dismissed: string[],
  link: DismissableLink,
): string[] {
  const key = lineGroupDismissalKey(link);
  if (dismissed.includes(key)) return dismissed;
  return [
    ...dismissed.filter((entry) => !entry.startsWith(`${link.id}:`)),
    key,
  ];
}

export function nextPendingLineGroup(
  links: LineGroupOnSubject[] | undefined,
  dismissed: string[],
): LineGroupOnSubject | null {
  const pending = (links ?? [])
    .filter(
      (link) =>
        !link.isVerify &&
        !!link.verifyToken &&
        !dismissed.includes(lineGroupDismissalKey(link)),
    )
    .sort(
      (a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    );
  return pending[0] ?? null;
}

// "Later" on the confirm popup lasts for the browser session: the dismissals
// are kept in sessionStorage under this key, as a JSON array of
// "<link id>:<link updateAt>" strings.
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
    return parsed.filter(isDismissalEntry);
  } catch {
    return [];
  }
}

export function writeDismissedLineGroups(
  storage: DismissedStorage | null | undefined,
  dismissed: string[],
): void {
  try {
    storage?.setItem(
      LINE_GROUP_DISMISSED_KEY,
      JSON.stringify(Array.from(new Set(dismissed))),
    );
  } catch {
    // Storage unavailable or full: "Later" then lasts until the page reloads.
  }
}

// The connect (QR) popup has done its job once the code typed in LINE shows up
// as a pending link. Its open state must then be reset, not just hidden behind
// the confirm popup, or it would come back after Confirm / Deny / Later and
// keep the 15 s polling running. An archived subject is read-only for LINE
// links, so the popup is reset there as well.
export function shouldResetLineConnect(
  isOpen: boolean,
  pending: LineGroupOnSubject | null,
  archived = false,
): boolean {
  return isOpen && (archived || pending !== null);
}

// Which LINE popup the subject page renders. An archived subject renders none:
// nothing may be confirmed or connected there (the settings section still
// lists the links, so they can be disconnected or cancelled).
export function subjectLinePopup(state: {
  archived: boolean;
  isConnectOpen: boolean;
  pending: LineGroupOnSubject | null;
}): "confirm" | "connect" | null {
  if (state.archived) return null;
  if (state.pending) return "confirm";
  return state.isConnectOpen ? "connect" : null;
}

// The header LINE button toggles the connect popup; on an archived subject the
// popup cannot be opened.
export function toggleLineConnect(isOpen: boolean, archived: boolean): boolean {
  return archived ? false : !isOpen;
}
