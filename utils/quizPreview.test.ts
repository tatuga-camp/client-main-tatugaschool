import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_PREVIEW_ANSWER,
  gradePreviewQuestion,
  isSavedAs,
  normalizeBlankAnswer,
  previewQuestions,
  saveBlocker,
  sumPreviewScores,
} from "./quizPreview";
import type { AssignmentOnQuiz, QuizQuestionInput } from "../interfaces";

// Grading cases are copied from the server's src/quiz/grading.spec.ts so the
// preview scores exactly like the real quiz.
const opt = (id: string, isCorrect: boolean) => ({
  id,
  text: id.toUpperCase(),
  imageUrl: null,
  isCorrect,
});
const single = {
  type: "SINGLE" as const,
  points: 2,
  options: [opt("a", false), opt("b", true)],
  blanks: [],
};
const multiple = {
  type: "MULTIPLE" as const,
  points: 4,
  options: [opt("a", true), opt("b", false), opt("c", true), opt("d", false)],
  blanks: [],
};
const fill = {
  type: "FILL_BLANK" as const,
  points: 2,
  options: [],
  blanks: [
    { id: "x", acceptedAnswers: ["Bangkok", "กรุงเทพ"] },
    { id: "y", acceptedAnswers: ["Thailand"] },
  ],
};
const pick = (...ids: string[]) => ({
  selectedOptionIds: ids,
  blankAnswers: [],
});
const blanks = (x?: string, y?: string) => ({
  selectedOptionIds: [],
  blankAnswers: [
    ...(x === undefined ? [] : [{ blankId: "x", value: x }]),
    ...(y === undefined ? [] : [{ blankId: "y", value: y }]),
  ],
});

test("normalizeBlankAnswer matches the server, including Thai mark order", () => {
  assert.equal(normalizeBlankAnswer("  Bangkok   City "), "bangkok city");
  assert.equal(normalizeBlankAnswer("ปู่"), normalizeBlankAnswer("ปู่"));
  assert.equal(normalizeBlankAnswer("ก่ิง"), normalizeBlankAnswer("กิ่ง"));
  assert.equal(normalizeBlankAnswer("นำ้"), normalizeBlankAnswer("น้ำ"));
});

test("SINGLE grading", () => {
  assert.equal(gradePreviewQuestion(single, pick("b"), "ALL_OR_NOTHING"), 2);
  assert.equal(gradePreviewQuestion(single, pick("a"), "PARTIAL"), 0);
  assert.equal(gradePreviewQuestion(single, pick("a", "b"), "PARTIAL"), 0);
  assert.equal(gradePreviewQuestion(single, pick(), "PARTIAL"), 0);
  assert.equal(gradePreviewQuestion(single, null, "PARTIAL"), 0);
});

test("MULTIPLE grading in both modes", () => {
  assert.equal(
    gradePreviewQuestion(multiple, pick("c", "a"), "ALL_OR_NOTHING"),
    4,
  );
  assert.equal(gradePreviewQuestion(multiple, pick("a"), "ALL_OR_NOTHING"), 0);
  assert.equal(gradePreviewQuestion(multiple, pick("a"), "PARTIAL"), 2);
  assert.equal(gradePreviewQuestion(multiple, pick("a", "b"), "PARTIAL"), 0);
  assert.equal(
    gradePreviewQuestion(multiple, pick("a", "b", "c"), "PARTIAL"),
    2,
  );
  assert.equal(
    gradePreviewQuestion(multiple, pick("a", "c", "zzz"), "ALL_OR_NOTHING"),
    4,
  );
});

test("FILL_BLANK grading", () => {
  assert.equal(
    gradePreviewQuestion(
      fill,
      blanks(" bangKOK ", "Thailand"),
      "ALL_OR_NOTHING",
    ),
    2,
  );
  assert.equal(
    gradePreviewQuestion(fill, blanks("กรุงเทพ", "thailand"), "ALL_OR_NOTHING"),
    2,
  );
  assert.equal(
    gradePreviewQuestion(fill, blanks("Bangkok", "Laos"), "ALL_OR_NOTHING"),
    0,
  );
  assert.equal(
    gradePreviewQuestion(fill, blanks("Bangkok", "Laos"), "PARTIAL"),
    1,
  );
  assert.equal(gradePreviewQuestion(fill, blanks("", ""), "PARTIAL"), 0);
  assert.equal(gradePreviewQuestion(fill, blanks(), "PARTIAL"), 0);
});

test("sumPreviewScores rounds to 2 decimals", () => {
  assert.equal(sumPreviewScores([1.25, 2.5, 0]), 3.75);
  assert.equal(sumPreviewScores([1 / 3, 1 / 3]), 0.67);
  assert.equal(sumPreviewScores([]), 0);
});

const saved = (over: Partial<AssignmentOnQuiz> = {}): AssignmentOnQuiz => ({
  id: "q1",
  createAt: "",
  updateAt: "",
  order: 0,
  type: "SINGLE",
  prompt: "Capital?",
  imageUrl: null,
  points: 1,
  options: [opt("a", true), opt("b", false)],
  blanks: [],
  assignmentId: "A1",
  subjectId: "S1",
  schoolId: "SC1",
  ...over,
});

test("previewQuestions prefers live drafts and flags them unsaved", () => {
  const draft: QuizQuestionInput = {
    ...saved(),
    prompt: "Capital of Thailand?",
  };
  const list = previewQuestions([saved(), saved({ id: "q2", prompt: "Two" })], {
    q1: draft,
  });
  assert.equal(list.length, 2);
  assert.equal(list[0].prompt, "Capital of Thailand?");
  assert.equal(list[0].unsaved, true);
  assert.equal(list[1].prompt, "Two");
  assert.equal(list[1].unsaved, false);
  assert.equal(list[0].id, "q1");
});

test("isSavedAs ignores the trimming the server applies", () => {
  const server = {
    ...saved(),
    options: [{ ...opt("a", true), text: "Bang" }, opt("b", false)],
  };
  const draft: QuizQuestionInput = {
    ...server,
    options: [{ ...opt("a", true), text: "Bang " }, opt("b", false)],
  };
  assert.equal(isSavedAs(draft, server), true);
  assert.equal(isSavedAs({ ...draft, prompt: "Other" }, server), false);
  const fillServer = {
    ...saved(),
    type: "FILL_BLANK" as const,
    prompt: "Hi {{x}}",
    options: [],
    blanks: [{ id: "x", acceptedAnswers: ["a"] }],
  };
  const fillDraft: QuizQuestionInput = {
    ...fillServer,
    blanks: [{ id: "x", acceptedAnswers: [" a ", ""] }],
  };
  assert.equal(isSavedAs(fillDraft, fillServer), true);
});

test("saveBlocker mirrors the server's question rules", () => {
  const ok: QuizQuestionInput = {
    type: "SINGLE",
    prompt: "Q",
    imageUrl: null,
    points: 1,
    options: [opt("a", true), opt("b", false)],
    blanks: [],
  };
  assert.equal(saveBlocker(ok), null);
  assert.equal(saveBlocker({ ...ok, prompt: "  " }), "prompt");
  assert.equal(
    saveBlocker({ ...ok, options: [opt("a", false), opt("b", false)] }),
    "pickOne",
  );
  assert.equal(
    saveBlocker({ ...ok, options: [opt("a", true), opt("b", true)] }),
    "pickOne",
  );
  assert.equal(
    saveBlocker({
      ...ok,
      type: "MULTIPLE",
      options: [opt("a", false), opt("b", false)],
    }),
    "pickAtLeastOne",
  );
  assert.equal(
    saveBlocker({
      ...ok,
      options: [{ ...opt("a", true), text: " " }, opt("b", false)],
    }),
    "optionText",
  );
  assert.equal(saveBlocker({ ...ok, options: [opt("a", true)] }), "twoOptions");
  const fillQ: QuizQuestionInput = {
    type: "FILL_BLANK",
    prompt: "A {{x}}",
    imageUrl: null,
    points: 1,
    options: [],
    blanks: [{ id: "x", acceptedAnswers: ["a"] }],
  };
  assert.equal(saveBlocker(fillQ), null);
  assert.equal(
    saveBlocker({ ...fillQ, prompt: "No blank", blanks: [] }),
    "needBlank",
  );
  assert.equal(
    saveBlocker({ ...fillQ, blanks: [{ id: "x", acceptedAnswers: [" "] }] }),
    "blankAnswer",
  );
});

test("EMPTY_PREVIEW_ANSWER is blank", () => {
  assert.deepEqual(EMPTY_PREVIEW_ANSWER, {
    selectedOptionIds: [],
    blankAnswers: [],
  });
});
