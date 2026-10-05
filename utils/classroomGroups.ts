import { ClassLevelList } from "../data/classLevel";
import { splitLevel } from "./classLevel";

export const NO_LEVEL_KEY = "__no-level__";

export type ClassroomGroup<T> = { key: string; items: T[] };

type GroupableClassroom = {
  id: string;
  level: string | null | undefined;
  order?: number | null;
};

const PREDEFINED_GRADES: string[] = ClassLevelList.map((level) => level.title);

export function groupClassroomsByGrade<T extends GroupableClassroom>(
  classrooms: T[],
): ClassroomGroup<T>[] {
  const sorted = [...classrooms].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const byGrade = new Map<string, T[]>();
  for (const classroom of sorted) {
    const key = splitLevel(classroom.level).grade || NO_LEVEL_KEY;
    const list = byGrade.get(key) ?? [];
    list.push(classroom);
    byGrade.set(key, list);
  }
  const keys = [...byGrade.keys()];
  const predefined = keys
    .filter((key) => PREDEFINED_GRADES.includes(key))
    .sort((a, b) => PREDEFINED_GRADES.indexOf(a) - PREDEFINED_GRADES.indexOf(b));
  const custom = keys
    .filter((key) => key !== NO_LEVEL_KEY && !PREDEFINED_GRADES.includes(key))
    .sort((a, b) => a.localeCompare(b));
  const ordered = [
    ...predefined,
    ...custom,
    ...(byGrade.has(NO_LEVEL_KEY) ? [NO_LEVEL_KEY] : []),
  ];
  return ordered.map((key) => ({ key, items: byGrade.get(key) ?? [] }));
}

// Returns null when the drop should be ignored: unknown item, a drop onto
// another grade's classroom, or no movement.
export function moveWithinGroup<T extends { id: string }>(
  groups: ClassroomGroup<T>[],
  activeId: string,
  overId: string,
): ClassroomGroup<T>[] | null {
  const groupIndex = groups.findIndex((group) =>
    group.items.some((item) => item.id === activeId),
  );
  if (groupIndex === -1) return null;
  const items = groups[groupIndex].items;
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (to === -1 || from === to) return null;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return groups.map((group, index) =>
    index === groupIndex ? { ...group, items: next } : group,
  );
}

// The reorder API takes every classroom id. When the teacher filter hides
// some, put the visible ones back into the slots they already occupy so the
// hidden ones keep their positions.
export function mergeVisibleOrder(
  fullOrderIds: string[],
  visibleNewOrderIds: string[],
): string[] {
  const visible = new Set(visibleNewOrderIds);
  const queue = [...visibleNewOrderIds];
  return fullOrderIds.map((id) => (visible.has(id) ? (queue.shift() ?? id) : id));
}
