import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addAcceptedAnswer,
  applyPromptEdit,
  isQuizLockedError,
  rebaseDraft,
  reorderByIds,
  toQuestionPayload,
  convertQuestionType,
  defaultQuestion,
  insertBlankToken,
  newQuizId,
  promptSegments,
  syncBlanksWithPrompt,
  QUESTION_IMAGE_MAX_BYTES,
  setQuestionImage,
  validateQuestionImage,
  blanksMissingAnswers,
  commitPendingAnswers,
  withDirtyId,
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
  const both = {
    ...multi,
    options: multi.options.map((o) => ({ ...o, isCorrect: true })),
  };
  const single = convertQuestionType(both, "SINGLE");
  assert.equal(single.options.filter((o) => o.isCorrect).length, 1);
});

test("convertQuestionType to FILL_BLANK appends a blank token; back to choice adds options", () => {
  const fill = convertQuestionType(
    { ...defaultQuestion("SINGLE"), prompt: "Capital of Thailand" },
    "FILL_BLANK",
  );
  assert.equal(fill.options.length, 0);
  assert.equal(fill.blanks.length, 1);
  assert.ok(fill.prompt.startsWith("Capital of Thailand "));
  const back = convertQuestionType(fill, "SINGLE");
  assert.equal(back.blanks.length, 0);
  assert.equal(back.options.length, 2);
  assert.ok(!back.prompt.includes("{{"));
});

test("insertBlankToken inserts at the caret, also inside Thai text", () => {
  assert.deepEqual(insertBlankToken("abc", 1, "x1"), {
    prompt: "a{{x1}}bc",
    cursor: 7,
  });
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
  assert.deepEqual(addAcceptedAnswer(["Bangkok"], " กรุงเทพ "), [
    "Bangkok",
    "กรุงเทพ",
  ]);
});

test("applyPromptEdit: hand-deleting a {{token}} drops its blank from the edit", () => {
  const value = {
    type: "FILL_BLANK" as const,
    prompt: "A {{a1}} and {{b2}}",
    points: 1,
    options: [],
    blanks: [
      { id: "a1", acceptedAnswers: ["x"] },
      { id: "b2", acceptedAnswers: ["y"] },
    ],
  };
  const next = applyPromptEdit(value, "A {{a1}} and ");
  assert.equal(next.prompt, "A {{a1}} and ");
  assert.deepEqual(next.blanks, [{ id: "a1", acceptedAnswers: ["x"] }]);
  assert.equal(next.points, 1);
});

test("toQuestionPayload: save path sends blanks synced with the prompt", () => {
  const draft = {
    type: "FILL_BLANK" as const,
    prompt: "Only {{b2}} left",
    points: 2,
    options: [],
    blanks: [
      { id: "a1", acceptedAnswers: ["x"] },
      { id: "b2", acceptedAnswers: ["y"] },
    ],
  };
  assert.deepEqual(toQuestionPayload(draft).blanks, [
    { id: "b2", acceptedAnswers: ["y"] },
  ]);
  const single = defaultQuestion("SINGLE");
  assert.equal(toQuestionPayload(single), single);
});

test("rebaseDraft: clean drafts follow the server, dirty drafts are kept", () => {
  const prev = { prompt: "a", points: 1 };
  const next = { prompt: "a", points: 1 };
  assert.equal(rebaseDraft({ prompt: "a", points: 1 }, prev, next), next);
  const dirty = { prompt: "edited", points: 1 };
  assert.equal(
    rebaseDraft(dirty, prev, { prompt: "server", points: 1 }),
    dirty,
  );
});

test("isQuizLockedError matches only the 409 QUIZ_LOCKED shape", () => {
  assert.equal(
    isQuizLockedError({
      statusCode: 409,
      message: "QUIZ_LOCKED",
      error: "Conflict",
    }),
    true,
  );
  assert.equal(
    isQuizLockedError({ statusCode: 409, message: "Other", error: "Conflict" }),
    false,
  );
  assert.equal(
    isQuizLockedError({ statusCode: 400, message: "QUIZ_LOCKED" }),
    false,
  );
  assert.equal(isQuizLockedError(undefined), false);
  assert.equal(isQuizLockedError(new Error("x")), false);
});

test("reorderByIds follows ids and keeps unknown items at the end", () => {
  const list = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(
    reorderByIds(list, ["c", "a", "b"]).map((q) => q.id),
    ["c", "a", "b"],
  );
  assert.deepEqual(
    reorderByIds(list, ["b", "a"]).map((q) => q.id),
    ["b", "a", "c"],
  );
});

test("validateQuestionImage accepts images up to 5 MB", () => {
  assert.equal(QUESTION_IMAGE_MAX_BYTES, 5 * 1024 * 1024);
  assert.equal(validateQuestionImage({ type: "image/png", size: 1024 }), "ok");
  assert.equal(
    validateQuestionImage({
      type: "image/jpeg",
      size: QUESTION_IMAGE_MAX_BYTES,
    }),
    "ok",
  );
});

test("validateQuestionImage rejects files over 5 MB", () => {
  assert.equal(
    validateQuestionImage({
      type: "image/png",
      size: QUESTION_IMAGE_MAX_BYTES + 1,
    }),
    "tooLarge",
  );
});

test("validateQuestionImage rejects non-image and empty files", () => {
  assert.equal(
    validateQuestionImage({ type: "application/pdf", size: 1024 }),
    "notImage",
  );
  assert.equal(validateQuestionImage({ type: "", size: 1024 }), "notImage");
  assert.equal(
    validateQuestionImage({ type: "image/png", size: 0 }),
    "notImage",
  );
});

test("an image change makes the draft differ from the server copy; removing it restores equality", () => {
  const base = defaultQuestion("SINGLE");
  const withImage = setQuestionImage(
    { ...base, imageUrl: null },
    "https://storage.example.com/a.png",
  );
  assert.equal(withImage.imageUrl, "https://storage.example.com/a.png");
  assert.notEqual(
    JSON.stringify(withImage),
    JSON.stringify({ ...base, imageUrl: null }),
  );
  const removed = setQuestionImage(withImage, null);
  assert.equal(removed.imageUrl, null);
  assert.deepEqual(removed, { ...base, imageUrl: null });
});

test("commitPendingAnswers adds typed-but-not-entered answers to their blanks", () => {
  const draft = {
    type: "FILL_BLANK" as const,
    prompt: "A {{b1}} and {{b2}}",
    points: 1,
    options: [],
    blanks: [
      { id: "b1", acceptedAnswers: ["cat"] },
      { id: "b2", acceptedAnswers: [] },
    ],
  };
  const next = commitPendingAnswers(draft, {
    b1: " Dog ",
    b2: "แมว",
    gone: "x",
  });
  assert.deepEqual(next.blanks, [
    { id: "b1", acceptedAnswers: ["cat", "Dog"] },
    { id: "b2", acceptedAnswers: ["แมว"] },
  ]);
  // Nothing pending (or only blanks/duplicates): the same object comes back.
  assert.equal(commitPendingAnswers(draft, {}), draft);
  assert.equal(commitPendingAnswers(draft, { b1: "  ", b2: "" }), draft);
  assert.equal(commitPendingAnswers(draft, { b1: "CAT" }), draft);
});

test("blanksMissingAnswers counts fill-blank blanks with no accepted answer", () => {
  const base = { prompt: "x {{b1}} {{b2}}", points: 1, options: [] };
  assert.equal(
    blanksMissingAnswers({
      ...base,
      type: "FILL_BLANK",
      blanks: [
        { id: "b1", acceptedAnswers: [] },
        { id: "b2", acceptedAnswers: ["a"] },
      ],
    }),
    1,
  );
  assert.equal(
    blanksMissingAnswers({
      ...base,
      type: "FILL_BLANK",
      blanks: [{ id: "b1", acceptedAnswers: ["a"] }],
    }),
    0,
  );
  assert.equal(
    blanksMissingAnswers({
      ...base,
      type: "SINGLE",
      blanks: [{ id: "b1", acceptedAnswers: [] }],
    }),
    0,
  );
});

test("withDirtyId adds and removes ids, returning the same set when nothing changes", () => {
  const empty = new Set<string>();
  const one = withDirtyId(empty, "q1", true);
  assert.deepEqual([...one], ["q1"]);
  assert.notEqual(one, empty);
  assert.equal(withDirtyId(one, "q1", true), one);
  assert.equal(withDirtyId(one, "q2", false), one);
  const none = withDirtyId(one, "q1", false);
  assert.deepEqual([...none], []);
  assert.deepEqual([...one], ["q1"]); // not mutated
});
