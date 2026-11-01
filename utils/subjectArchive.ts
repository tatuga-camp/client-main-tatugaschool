import { MemberRole } from "../interfaces/MemberOnSchool";

export function isSubjectArchived(
  subject?: { isAchieved?: boolean } | null,
): boolean {
  return subject?.isAchieved === true;
}

export function archiveSwitchState(input: {
  subjectArchived: boolean;
  classArchived: boolean;
  roleSubject: MemberRole;
  roleSchool: MemberRole;
}): {
  visible: boolean;
  checked: boolean;
  disabled: boolean;
  hint: "classArchived" | null;
} {
  const visible = input.roleSubject === "ADMIN" || input.roleSchool === "ADMIN";
  const blockedByClass = input.subjectArchived && input.classArchived;
  return {
    visible,
    checked: input.subjectArchived,
    disabled: blockedByClass,
    hint: blockedByClass ? "classArchived" : null,
  };
}

export function writableSubjects<T extends { isAchieved?: boolean }>(
  subjects: T[],
): T[] {
  return subjects.filter((s) => !isSubjectArchived(s));
}
