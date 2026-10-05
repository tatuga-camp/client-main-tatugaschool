import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupClassroomsByGrade,
  mergeVisibleOrder,
  moveWithinGroup,
  NO_LEVEL_KEY,
  reorderVisible,
  filterClassrooms,
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

test("reorderVisible keeps other grades' order when the filter hides some", () => {
  // Stored order mixes grades (as the old ungrouped grid left it).
  const all = [
    { id: "B", level: "มัธยมศึกษาปีที่ 2/1", order: 0, userId: "X" },
    { id: "H", level: "มัธยมศึกษาปีที่ 2/2", order: 1, userId: "Y" },
    { id: "A", level: "มัธยมศึกษาปีที่ 1/1", order: 2, userId: "X" },
    { id: "C", level: "มัธยมศึกษาปีที่ 1/2", order: 3, userId: "X" },
  ];
  const visible = all.filter((c) => c.userId === "X");
  const ids = reorderVisible(all, visible, "C", "A");
  assert.ok(ids);
  const regrouped = groupClassroomsByGrade(
    ids.map((id, order) => ({ ...all.find((c) => c.id === id)!, order })),
  );
  assert.deepEqual(
    regrouped.map((g) => g.items.map((i) => i.id)),
    [["C", "A"], ["B", "H"]],
    "ม.1 changed as dragged, ม.2 kept B before hidden H",
  );
  assert.equal(reorderVisible(all, visible, "C", "B"), null, "cross-grade");
});

test("mergeVisibleOrder with nothing hidden is the new order", () => {
  assert.deepEqual(mergeVisibleOrder(["a", "b"], ["b", "a"]), ["b", "a"]);
});

test("filterClassrooms matches title, level, description and creator; trims", () => {
  const rooms = [
    { id: "1", title: "Room 1", level: "มัธยมศึกษาปีที่ 1/1", description: "Science track", creator: { firstName: "Kanya", lastName: "Srisuk" } },
    { id: "2", title: "Gifted", level: "ประถมศึกษาปีที่ 4/2", description: null, creator: null },
  ];
  assert.deepEqual(filterClassrooms(rooms, "  ").map((r) => r.id), ["1", "2"]);
  assert.deepEqual(filterClassrooms(rooms, "room").map((r) => r.id), ["1"]);
  assert.deepEqual(filterClassrooms(rooms, "ประถม").map((r) => r.id), ["2"]);
  assert.deepEqual(filterClassrooms(rooms, "science").map((r) => r.id), ["1"]);
  assert.deepEqual(filterClassrooms(rooms, "srisuk").map((r) => r.id), ["1"]);
  assert.deepEqual(filterClassrooms(rooms, "zzz"), []);
});
