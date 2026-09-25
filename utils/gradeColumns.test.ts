import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignmentContribution,
  buildGradeColumns,
  computeGroupTotals,
  firstTag,
  formatScore,
  specialContribution,
} from "./gradeColumns.ts";

type Work = { studentOnSubjectId: string; score: number; status: string };

function entry(
  id: string,
  tags: string[],
  maxScore: number,
  weight: number | null,
  students: Work[] = [],
) {
  return {
    assignment: { id, title: id, tags, maxScore, weight },
    students,
  };
}

function overview(assignments: ReturnType<typeof entry>[], specials: string[] = []) {
  return {
    grade: null,
    assignments,
    scoreOnSubjects: specials.map((id) => ({
      scoreOnSubject: { id, title: id, maxScore: 10, weight: null },
      students: [],
    })),
  } as any;
}

const keys = (columns: { key: string }[]) => columns.map((c) => c.key);

test("firstTag trims, uses only the first tag, blank is untagged", () => {
  assert.equal(firstTag([" Unit 1 ", "x"]), "Unit 1");
  assert.equal(firstTag(["  ", "x"]), null);
  assert.equal(firstTag([]), null);
  assert.equal(firstTag(undefined), null);
});

test("assignmentContribution matches the Total column math and never NaNs", () => {
  assert.equal(assignmentContribution(8, 10, null), 8);
  assert.equal(assignmentContribution(16, 20, 10), 8);
  assert.equal(assignmentContribution(undefined, 10, null), 0);
  assert.equal(assignmentContribution(5, 0, 10), 0);
});

test("specialContribution caps at maxScore when weighted", () => {
  assert.equal(specialContribution(7, 10, null), 7);
  assert.equal(specialContribution(15, 10, 20), 20);
  assert.equal(specialContribution(50, null, 10), 5);
});

test("formatScore keeps integers, 2 decimals otherwise", () => {
  assert.equal(formatScore(8), "8");
  assert.equal(formatScore(7.5), "7.50");
});

test("assignment mode: flat columns in order, specials last, no subtotals", () => {
  const { segments, columns } = buildGradeColumns(
    overview([entry("a1", ["Unit 1"], 10, null), entry("a2", [], 5, null)], ["s1"]),
    "assignment",
  );
  assert.deepEqual(keys(columns), ["a1", "a2", "s1"]);
  assert.ok(segments.every((s) => s.kind === "single"));
});

test("tag mode: contiguous group blocks at first position, untagged in place", () => {
  const { segments, columns } = buildGradeColumns(
    overview(
      [
        entry("a1", ["Unit 1"], 10, null),
        entry("a2", [], 5, null),
        entry("a3", ["Unit 1", "Extra"], 20, 10),
        entry("a4", ["Unit 2"], 10, null),
      ],
      ["s1"],
    ),
    "tag",
  );
  assert.deepEqual(keys(columns), [
    "a1",
    "a3",
    "subtotal:Unit 1",
    "a2",
    "a4",
    "subtotal:Unit 2",
    "s1",
  ]);
  const unit1 = segments[0];
  assert.equal(unit1.kind, "group");
  if (unit1.kind === "group") {
    assert.equal(unit1.tag, "Unit 1");
    assert.equal(unit1.assignmentCount, 2);
    assert.equal(unit1.maxTotal, 20); // 10 (maxScore) + 10 (weight)
  }
});

test("collapsed group keeps only its subtotal column", () => {
  const { columns, segments } = buildGradeColumns(
    overview([entry("a1", ["Unit 1"], 10, null), entry("a3", ["Unit 1"], 10, null)]),
    "tag",
    ["Unit 1"],
  );
  assert.deepEqual(keys(columns), ["subtotal:Unit 1"]);
  assert.equal(segments[0].kind === "group" && segments[0].collapsed, true);
});

// Parity fixture — keep identical to the "parity fixture" test in
// servers/server-main-tatugaschool/src/subject/public-progress/public-progress.util.spec.ts
test("parity fixture: Unit A subtotal is 12", () => {
  const data = overview([
    entry("p1", ["Unit A"], 10, null, [{ studentOnSubjectId: "ann", score: 7, status: "REVIEWD" }]),
    entry("p2", ["Unit A"], 20, 10, [{ studentOnSubjectId: "ann", score: 10, status: "REVIEWD" }]),
  ]);
  assert.deepEqual(computeGroupTotals(data.assignments, "ann"), { "Unit A": 12 });
});

test("computeGroupTotals gives 0 for groups the student has no work in", () => {
  const data = overview([entry("a1", ["Unit 1"], 10, null), entry("a2", [], 5, null)]);
  assert.deepEqual(computeGroupTotals(data.assignments, "ann"), { "Unit 1": 0 });
});
