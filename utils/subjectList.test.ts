import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canReorderSubjects,
  filterSubjects,
  sortSubjects,
  subjectEmoji,
  subjectTint,
} from "./subjectList";

const subject = (
  id: string,
  title: string,
  order: number,
  extra: Partial<{
    description: string;
    classId: string;
    teachers: { userId: string; firstName: string; lastName: string; email: string }[];
    createAt: string;
    classTitle: string;
  }> = {},
) => ({
  id,
  title,
  order,
  description: extra.description ?? "",
  educationYear: "1/2026",
  classId: extra.classId ?? "c1",
  createAt: extra.createAt ?? "2026-01-01",
  teachers: extra.teachers ?? [],
  class: { title: extra.classTitle ?? "Room 1", level: "มัธยมศึกษาปีที่ 1/1", description: "" },
});

const kanya = { userId: "u1", firstName: "Kanya", lastName: "Srisuk", email: "k@x.th" };
const pong = { userId: "u2", firstName: "Pong", lastName: "Thongdee", email: "p@x.th" };

const list = [
  subject("a", "Mathematics", 2, { teachers: [kanya], createAt: "2026-01-03" }),
  subject("b", "Science", 0, { teachers: [pong], classId: "c2", classTitle: "Room 2" }),
  subject("c", "English", 1, { teachers: [kanya, pong], description: "Reading", createAt: "2026-01-02" }),
];

test("filterSubjects combines teacher, classroom and search instead of replacing", () => {
  assert.deepEqual(filterSubjects(list, { teacherId: "u1" }).map((s) => s.id), ["a", "c"]);
  assert.deepEqual(
    filterSubjects(list, { teacherId: "u1", query: "read" }).map((s) => s.id),
    ["c"],
    "search keeps the teacher filter",
  );
  assert.deepEqual(filterSubjects(list, { classId: "c2" }).map((s) => s.id), ["b"]);
  assert.deepEqual(filterSubjects(list, { query: "  room 2 " }).map((s) => s.id), ["b"]);
  assert.deepEqual(filterSubjects(list, { query: "thongdee" }).map((s) => s.id), ["b", "c"]);
  assert.deepEqual(filterSubjects(list, {}).map((s) => s.id), ["a", "b", "c"]);
});

test("sortSubjects returns a new array in the chosen order", () => {
  const input = [...list];
  assert.deepEqual(sortSubjects(input, "Default").map((s) => s.id), ["b", "c", "a"]);
  assert.deepEqual(input.map((s) => s.id), ["a", "b", "c"], "input untouched");
  assert.deepEqual(sortSubjects(list, "AZ").map((s) => s.id), ["c", "a", "b"]);
  assert.deepEqual(sortSubjects(list, "ZA").map((s) => s.id), ["b", "a", "c"]);
  assert.deepEqual(sortSubjects(list, "Newest").map((s) => s.id), ["a", "c", "b"]);
  assert.deepEqual(sortSubjects(list, "Oldest").map((s) => s.id), ["b", "c", "a"]);
});

test("canReorderSubjects only while the list is in stored order", () => {
  assert.equal(canReorderSubjects("Default"), true);
  assert.equal(canReorderSubjects("AZ"), false);
  assert.equal(canReorderSubjects("Newest"), false);
});

test("subjectEmoji guesses from English and Thai titles, with a default", () => {
  assert.equal(subjectEmoji("Mathematics 1"), "📐");
  assert.equal(subjectEmoji("คณิตศาสตร์พื้นฐาน"), "📐");
  assert.equal(subjectEmoji("General Science"), "🔬");
  assert.equal(subjectEmoji("วิทยาศาสตร์"), "🔬");
  assert.equal(subjectEmoji("English for Communication"), "🔤");
  assert.equal(subjectEmoji("ภาษาไทย 1"), "📖");
  assert.equal(subjectEmoji("ภาษาจีน"), "🗣️");
  assert.equal(subjectEmoji("Visual Art"), "🎨");
  assert.equal(subjectEmoji("ดนตรี"), "🎵");
  assert.equal(subjectEmoji("สุขศึกษาและพลศึกษา"), "⚽");
  assert.equal(subjectEmoji("วิทยาการคำนวณ"), "💻");
  assert.equal(subjectEmoji("สังคมศึกษา"), "🌏");
  assert.equal(subjectEmoji("Homeroom"), "📚");
});

test("subjectTint is stable per id and stays in range", () => {
  assert.equal(subjectTint("abc"), subjectTint("abc"));
  const tints = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map(subjectTint));
  assert.ok(tints.size > 1, "different ids spread across colors");
  for (const t of tints) assert.match(t, /^bg-/);
});
