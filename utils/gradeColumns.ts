import type { ResponseGetOverviewAssignmentService } from "../services";

// Pure helpers only — no value imports, so `node --test` can load this file.

export type GradeViewMode = "assignment" | "tag";

type Overview = ResponseGetOverviewAssignmentService;
export type AssignmentEntry = Overview["assignments"][number];
export type SpecialEntry = Overview["scoreOnSubjects"][number];

export type GradeColumn =
  | {
      kind: "assignment";
      key: string;
      entry: AssignmentEntry;
      tag: string | null;
    }
  | { kind: "special"; key: string; entry: SpecialEntry }
  | { kind: "subtotal"; key: string; tag: string; maxTotal: number };

export type GradeGroupSegment = {
  kind: "group";
  tag: string;
  assignmentCount: number;
  maxTotal: number;
  collapsed: boolean;
  columns: GradeColumn[];
};

export type GradeSegment =
  | { kind: "single"; column: GradeColumn }
  | GradeGroupSegment;

export function firstTag(tags: string[] | null | undefined): string | null {
  const tag = tags?.[0]?.trim();
  return tag ? tag : null;
}

/** Same math as the Total column: weighted when a weight is set, else raw. */
export function assignmentContribution(
  score: number | null | undefined,
  maxScore: number | null | undefined,
  weight: number | null | undefined,
): number {
  const raw = score ?? 0;
  if (weight === null || weight === undefined) return raw;
  if (!maxScore) return 0;
  return (raw / maxScore) * weight;
}

export function specialContribution(
  sumRaw: number,
  maxScore: number | null | undefined,
  weight: number | null | undefined,
): number {
  if (weight === null || weight === undefined) return sumRaw;
  const max = maxScore ?? 100;
  if (!max) return 0;
  return (Math.min(sumRaw, max) / max) * weight;
}

export function assignmentMax(assignment: {
  maxScore: number | null;
  weight: number | null;
}): number {
  return assignment.weight ?? assignment.maxScore ?? 0;
}

export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Orders the Grade table columns. In "tag" mode every tags[0] group becomes
 * one contiguous block (at the position of its first assignment) followed by
 * a subtotal column; untagged assignments and special scores stay in place.
 */
export function buildGradeColumns(
  overview: Overview,
  mode: GradeViewMode,
  collapsedTags: string[] = [],
): { segments: GradeSegment[]; columns: GradeColumn[] } {
  const segments: GradeSegment[] = [];
  const groups = new Map<string, GradeGroupSegment>();
  const groupAssignments = new Map<string, GradeColumn[]>();

  for (const entry of overview.assignments) {
    const tag = firstTag(entry.assignment.tags);
    const column: GradeColumn = {
      kind: "assignment",
      key: entry.assignment.id,
      entry,
      tag,
    };
    if (mode === "assignment" || !tag) {
      segments.push({ kind: "single", column });
      continue;
    }
    let group = groups.get(tag);
    if (!group) {
      group = {
        kind: "group",
        tag,
        assignmentCount: 0,
        maxTotal: 0,
        collapsed: collapsedTags.includes(tag),
        columns: [],
      };
      groups.set(tag, group);
      groupAssignments.set(tag, []);
      segments.push(group);
    }
    group.assignmentCount += 1;
    group.maxTotal += assignmentMax(entry.assignment);
    groupAssignments.get(tag)!.push(column);
  }

  for (const group of groups.values()) {
    const subtotal: GradeColumn = {
      kind: "subtotal",
      key: `subtotal:${group.tag}`,
      tag: group.tag,
      maxTotal: group.maxTotal,
    };
    group.columns = group.collapsed
      ? [subtotal]
      : [...groupAssignments.get(group.tag)!, subtotal];
  }

  for (const entry of overview.scoreOnSubjects) {
    segments.push({
      kind: "single",
      column: { kind: "special", key: entry.scoreOnSubject.id, entry },
    });
  }

  const columns = segments.flatMap((segment) =>
    segment.kind === "single" ? [segment.column] : segment.columns,
  );
  return { segments, columns };
}

/** Per-tag subtotal for one student (teacher view: includes hidden scores). */
export function computeGroupTotals(
  assignments: AssignmentEntry[],
  studentOnSubjectId: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const entry of assignments) {
    const tag = firstTag(entry.assignment.tags);
    if (!tag) continue;
    const score = entry.students.find(
      (s) => s.studentOnSubjectId === studentOnSubjectId,
    )?.score;
    totals[tag] =
      (totals[tag] ?? 0) +
      assignmentContribution(
        score,
        entry.assignment.maxScore,
        entry.assignment.weight,
      );
  }
  return totals;
}
