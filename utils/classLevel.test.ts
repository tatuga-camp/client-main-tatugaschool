import { test } from "node:test";
import assert from "node:assert/strict";
import { fullGradeLabel, shortGradeLabel, splitLevel } from "./classLevel";

test("splitLevel separates grade and room", () => {
  assert.deepEqual(splitLevel("มัธยมศึกษาปีที่ 1/2"), {
    grade: "มัธยมศึกษาปีที่ 1",
    room: "2",
  });
});

test("splitLevel handles empty, whitespace, missing room and no slash", () => {
  assert.deepEqual(splitLevel(undefined), { grade: "", room: "" });
  assert.deepEqual(splitLevel("   "), { grade: "", room: "" });
  assert.deepEqual(splitLevel("ม.1/"), { grade: "ม.1", room: "" });
  assert.deepEqual(splitLevel("Grade A"), { grade: "Grade A", room: "" });
  assert.deepEqual(splitLevel(" อนุบาล / 3 "), { grade: "อนุบาล", room: "3" });
});

test("shortGradeLabel abbreviates predefined grades in Thai", () => {
  assert.equal(shortGradeLabel("อนุบาล", "th"), "อ.");
  assert.equal(shortGradeLabel("ประถมศึกษาปีที่ 4", "th"), "ป.4");
  assert.equal(shortGradeLabel("มัธยมศึกษาปีที่ 6", "th"), "ม.6");
  assert.equal(shortGradeLabel("ปวช. 2", "th"), "ปวช.2");
  assert.equal(shortGradeLabel("ปวส. 1", "th"), "ปวส.1");
  assert.equal(shortGradeLabel("อุดมศึกษา", "th"), "อุดม.");
});

test("shortGradeLabel abbreviates predefined grades in English", () => {
  assert.equal(shortGradeLabel("อนุบาล", "en"), "K");
  assert.equal(shortGradeLabel("ประถมศึกษาปีที่ 4", "en"), "P4");
  assert.equal(shortGradeLabel("มัธยมศึกษาปีที่ 6", "en"), "S6");
  assert.equal(shortGradeLabel("ปวช. 2", "en"), "VC2");
  assert.equal(shortGradeLabel("ปวส. 1", "en"), "HVC1");
  assert.equal(shortGradeLabel("อุดมศึกษา", "en"), "HE");
});

test("shortGradeLabel truncates custom grades by grapheme and handles empty", () => {
  assert.equal(shortGradeLabel("", "th"), "–");
  assert.equal(shortGradeLabel("Y7", "en"), "Y7");
  assert.equal(shortGradeLabel("ห้องเรียนพิเศษ", "th"), "ห้องเ…");
  assert.equal(shortGradeLabel("Grade Twelve", "en"), "Grad…");
});

test("fullGradeLabel uses English names in English only", () => {
  assert.equal(fullGradeLabel("มัธยมศึกษาปีที่ 1", "en"), "Secondary 1");
  assert.equal(fullGradeLabel("มัธยมศึกษาปีที่ 1", "th"), "มัธยมศึกษาปีที่ 1");
  assert.equal(fullGradeLabel("Custom", "en"), "Custom");
});
