import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addAcceptedAnswer,
  convertQuestionType,
  defaultQuestion,
  insertBlankToken,
  newQuizId,
  promptSegments,
  syncBlanksWithPrompt,
} from "./quizDraft";

test("newQuizId is 8 url-safe chars and varies", () => {
  const a = newQuizId();
  assert.match(a, /^[a-z0-9]{8}$/);
  assert.notEqual(a, newQuizId());
});

test("defaultQuestion builds a server-valid shape for each type", () => {
  const single = defaultQuestion("SINGLE");
  assert.equal(single.options.filter((o) => o.isCorrect).length, 1);
  assert.equal(single.options.length, 2);
  const fill = defaultQuestion("FILL_BLANK");
  assert.equal(fill.options.length, 0);
  assert.equal(fill.blanks.length, 1);
  assert.ok(fill.prompt.includes(`{{${fill.blanks[0].id}}}`));
  assert.deepEqual(fill.blanks[0].acceptedAnswers.length, 1);
});

test("convertQuestionType SINGLE→MULTIPLE keeps options; MULTIPLE→SINGLE keeps one correct", () => {
  const multi = convertQuestionType(defaultQuestion("SINGLE"), "MULTIPLE");
  assert.equal(multi.type, "MULTIPLE");
  const both = { ...multi, options: multi.options.map((o) => ({ ...o, isCorrect: true })) };
  const single = convertQuestionType(both, "SINGLE");
  assert.equal(single.options.filter((o) => o.isCorrect).length, 1);
});

test("convertQuestionType to FILL_BLANK appends a blank token; back to choice adds options", () => {
  const fill = convertQuestionType({ ...defaultQuestion("SINGLE"), prompt: "Capital of Thailand" }, "FILL_BLANK");
  assert.equal(fill.options.length, 0);
  assert.equal(fill.blanks.length, 1);
  assert.ok(fill.prompt.startsWith("Capital of Thailand "));
  const back = convertQuestionType(fill, "SINGLE");
  assert.equal(back.blanks.length, 0);
  assert.equal(back.options.length, 2);
  assert.ok(!back.prompt.includes("{{"));
});

test("insertBlankToken inserts at the caret, also inside Thai text", () => {
  assert.deepEqual(insertBlankToken("abc", 1, "x1"), { prompt: "a{{x1}}bc", cursor: 7 });
  const thai = "เมืองหลวงคือ";
  const out = insertBlankToken(thai, thai.length, "b");
  assert.equal(out.prompt, "เมืองหลวงคือ{{b}}");
});

test("promptSegments splits text and blanks", () => {
  assert.deepEqual(promptSegments("A {{x}} b{{y}}"), [
    { kind: "text", text: "A " },
    { kind: "blank", blankId: "x" },
    { kind: "text", text: " b" },
    { kind: "blank", blankId: "y" },
  ]);
});

test("syncBlanksWithPrompt keeps known blanks in prompt order, drops removed, adds new", () => {
  const blanks = [
    { id: "x", acceptedAnswers: ["1"] },
    { id: "gone", acceptedAnswers: ["2"] },
  ];
  assert.deepEqual(syncBlanksWithPrompt("{{new}} and {{x}}", blanks), [
    { id: "new", acceptedAnswers: [] },
    { id: "x", acceptedAnswers: ["1"] },
  ]);
});

test("addAcceptedAnswer trims, ignores empty and case-insensitive duplicates", () => {
  assert.deepEqual(addAcceptedAnswer(["Bangkok"], "  bangkok "), ["Bangkok"]);
  assert.deepEqual(addAcceptedAnswer(["Bangkok"], "   "), ["Bangkok"]);
  assert.deepEqual(addAcceptedAnswer(["Bangkok"], " กรุงเทพ "), ["Bangkok", "กรุงเทพ"]);
});
