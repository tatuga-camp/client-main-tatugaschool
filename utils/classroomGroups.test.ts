import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupClassroomsByGrade,
  mergeVisibleOrder,
  moveWithinGroup,
  NO_LEVEL_KEY,
} from "./classroomGroups";

const c = (id: string, level: string, order: number) => ({ id, level, order });

test("groups by grade in predefined order, then custom A–Z, then no level", () => {
  const groups = groupClassroomsByGrade([
    c("a", "มัธยมศึกษาปีที่ 2/1", 0),
    c("b", "Zeta/1", 1),
    c("c", "", 2),
    c("d", "มัธยมศึกษาปีที่ 1/2", 3),
    c("e", "Alpha/1", 4),
    c("f", "มัธยมศึกษาปีที่ 1/1", 5),
    c("g", "อนุบาล/1", 6),
  ]);
  assert.deepEqual(
    groups.map((g) => g.key),
    ["อนุบาล", "มัธยมศึกษาปีที่ 1", "มัธยมศึกษาปีที่ 2", "Alpha", "Zeta", NO_LEVEL_KEY],
  );
  assert.deepEqual(
    groups[1].items.map((i) => i.id),
    ["d", "f"],
    "items keep stored order inside a group",
  );
});

test("missing order sorts as 0 and empty input gives no groups", () => {
  assert.deepEqual(groupClassroomsByGrade([]), []);
  const groups = groupClassroomsByGrade([
    { id: "x", level: "อนุบาล/1", order: 3 },
    { id: "y", level: "อนุบาล/2", order: undefined },
  ]);
  assert.deepEqual(groups[0].items.map((i) => i.id), ["y", "x"]);
});

test("moveWithinGroup reorders inside one group", () => {
  const groups = [
    { key: "g1", items: [{ id: "a" }, { id: "b" }, { id: "c" }] },
    { key: "g2", items: [{ id: "d" }] },
  ];
  const moved = moveWithinGroup(groups, "c", "a");
  assert.ok(moved);
  assert.deepEqual(moved[0].items.map((i) => i.id), ["c", "a", "b"]);
  assert.equal(moved[1], groups[1], "untouched groups are reused");
});

test("moveWithinGroup refuses cross-group and no-op moves", () => {
  const groups = [
    { key: "g1", items: [{ id: "a" }, { id: "b" }] },
    { key: "g2", items: [{ id: "d" }] },
  ];
  assert.equal(moveWithinGroup(groups, "a", "d"), null);
  assert.equal(moveWithinGroup(groups, "a", "a"), null);
  assert.equal(moveWithinGroup(groups, "zzz", "a"), null);
});

test("mergeVisibleOrder keeps hidden classrooms in place", () => {
  // Full stored order: a h1 b h2 c. Teacher filter hides h1, h2.
  // Visible classrooms re-ordered to c a b.
  assert.deepEqual(
    mergeVisibleOrder(["a", "h1", "b", "h2", "c"], ["c", "a", "b"]),
    ["c", "h1", "a", "h2", "b"],
  );
});

test("mergeVisibleOrder with nothing hidden is the new order", () => {
  assert.deepEqual(mergeVisibleOrder(["a", "b"], ["b", "a"]), ["b", "a"]);
});
