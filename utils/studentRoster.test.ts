import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareStudentNumber,
  filterStudents,
  sortStudents,
  studentDisplayName,
} from "./studentRoster";

const s = (
  id: string,
  number: string,
  firstName = "A",
  createAt = "2026-01-01",
) => ({ id, number, firstName, lastName: "L", title: "ด.ช.", createAt });

test("default sort is natural by number, blanks last", () => {
  const ids = sortStudents(
    [s("a", "10"), s("b", "2"), s("c", ""), s("d", "12A"), s("e", "01")],
    "Default",
  ).map((x) => x.id);
  assert.deepEqual(ids, ["e", "b", "a", "d", "c"]);
});

test("sortStudents never mutates its input", () => {
  const input = [s("a", "2"), s("b", "1")];
  sortStudents(input, "Default");
  assert.deepEqual(input.map((x) => x.id), ["a", "b"]);
});

test("Newest / Oldest / AZ / ZA", () => {
  const list = [
    s("a", "1", "Malee", "2026-01-02"),
    s("b", "2", "Anan", "2026-01-03"),
    s("c", "3", "Somchai", "2026-01-01"),
  ];
  assert.deepEqual(sortStudents(list, "Newest").map((x) => x.id), ["b", "a", "c"]);
  assert.deepEqual(sortStudents(list, "Oldest").map((x) => x.id), ["c", "a", "b"]);
  assert.deepEqual(sortStudents(list, "AZ").map((x) => x.id), ["b", "a", "c"]);
  assert.deepEqual(sortStudents(list, "ZA").map((x) => x.id), ["c", "a", "b"]);
  assert.deepEqual(sortStudents(list, "Bogus").map((x) => x.id), ["a", "b", "c"]);
});

test("compareStudentNumber treats numbers naturally", () => {
  assert.ok(compareStudentNumber("2", "10") < 0);
  assert.ok(compareStudentNumber("", "1") > 0);
  assert.equal(compareStudentNumber("", ""), 0);
});

test("filterStudents matches name, title, number and full name; trims", () => {
  const list = [
    { ...s("a", "7", "Somchai"), lastName: "Jaidee" },
    { ...s("b", "17", "Malee"), lastName: null },
  ];
  assert.deepEqual(filterStudents(list, "  ").map((x) => x.id), ["a", "b"]);
  assert.deepEqual(filterStudents(list, "somchai jai").map((x) => x.id), ["a"]);
  assert.deepEqual(filterStudents(list, "7").map((x) => x.id), ["a", "b"]);
  assert.deepEqual(filterStudents(list, "MALEE").map((x) => x.id), ["b"]);
  assert.deepEqual(filterStudents(list, "zzz"), []);
});

test("studentDisplayName joins non-empty parts", () => {
  assert.equal(
    studentDisplayName({ title: "ด.ช.", firstName: "Somchai", lastName: "Jaidee" }),
    "ด.ช. Somchai Jaidee",
  );
  assert.equal(studentDisplayName({ firstName: "Malee", lastName: null }), "Malee");
});
