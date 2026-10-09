import { test } from "node:test";
import assert from "node:assert/strict";
import { classworkHref, classworkShowsAttachments } from "./classworkLinks";

test("classworkHref: a quiz opens its editor, everything else the assignment page", () => {
  assert.equal(classworkHref("s1", { id: "q1", type: "Quiz" }), "/subject/s1/quiz/q1");
  assert.equal(classworkHref("s1", { id: "a1", type: "Assignment" }), "/subject/s1/assignment/a1");
  assert.equal(classworkHref("s1", { id: "m1", type: "Material" }), "/subject/s1/assignment/m1");
  assert.equal(classworkHref("s1", { id: "v1", type: "VideoQuiz" }), "/subject/s1/assignment/v1");
});

test("classworkShowsAttachments: hidden for quizzes and video quizzes", () => {
  assert.equal(classworkShowsAttachments("Assignment"), true);
  assert.equal(classworkShowsAttachments("Material"), true);
  assert.equal(classworkShowsAttachments("Quiz"), false);
  assert.equal(classworkShowsAttachments("VideoQuiz"), false);
});
