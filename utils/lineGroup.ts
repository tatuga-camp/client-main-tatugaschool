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
