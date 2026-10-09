import { test } from "node:test";
import assert from "node:assert/strict";
import { QuizMonitorRow } from "../interfaces";
import {
  editorLockState,
  formatDuration,
  monitorStats,
  quizEditorLoadState,
  riskBand,
  scoreToSave,
  sortMonitorRows,
} from "./quizMonitor";

const row = (id: string, o: Partial<QuizMonitorRow> = {}): QuizMonitorRow => ({
  studentOnAssignmentId: id,
  studentId: id,
  title: "",
  firstName: id,
  lastName: "",
  number: "1",
  photo: "",
  blurHash: null,
  status: "ANSWERING",
  answeredCount: 0,
  questionCount: 5,
  startedAt: null,
  submittedAt: null,
  lastSeenAt: null,
  score: null,
  integritySummary: null,
  riskScore: null,
  riskSource: null,
  riskPattern: null,
  riskConfidence: null,
  ...o,
});

test("riskBand thresholds", () => {
  assert.equal(riskBand(null), null);
  assert.equal(riskBand(0), "LOW");
  assert.equal(riskBand(29), "LOW");
  assert.equal(riskBand(30), "MEDIUM");
  assert.equal(riskBand(59), "MEDIUM");
  assert.equal(riskBand(60), "HIGH");
});

test("sortMonitorRows: risk desc, nulls last, then status, then number numerically", () => {
  const rows = [
    row("a", { riskScore: null, status: "NOT_STARTED", number: "2" }),
    row("b", { riskScore: 10 }),
    row("c", { riskScore: 80 }),
    row("d", { riskScore: null, status: "AWAY", number: "10" }),
    row("e", { riskScore: null, status: "AWAY", number: "9" }),
  ];
  assert.deepEqual(
    sortMonitorRows(rows).map((r) => r.studentOnAssignmentId),
    ["c", "b", "e", "d", "a"],
  );
});

test("monitorStats counts", () => {
  const stats = monitorStats([
    row("a", { status: "NOT_STARTED" }),
    row("b", { status: "ANSWERING", riskScore: 70 }),
    row("c", { status: "AWAY" }),
    row("d", { status: "SUBMITTED", riskScore: 10 }),
  ]);
  assert.deepEqual(stats, {
    total: 4,
    started: 3,
    answering: 1,
    away: 1,
    submitted: 1,
    highRisk: 1,
  });
});

test("formatDuration", () => {
  assert.equal(formatDuration(0), "0s");
  assert.equal(formatDuration(45_000), "45s");
  assert.equal(formatDuration(125_000), "2m 05s");
  assert.equal(formatDuration(3_720_000), "1h 02m");
});

test("editorLockState: server locked flag locks, loading is read-only without the banner", () => {
  assert.deepEqual(editorLockState(undefined, true), {
    locked: false,
    readOnly: true,
  });
  assert.deepEqual(editorLockState(undefined, false), {
    locked: false,
    readOnly: false,
  });
  assert.deepEqual(editorLockState(false, false), {
    locked: false,
    readOnly: false,
  });
  assert.deepEqual(editorLockState(true, false), {
    locked: true,
    readOnly: true,
  });
  assert.deepEqual(editorLockState(true, true), {
    locked: true,
    readOnly: true,
  });
});

test("scoreToSave clamps to the question's points and skips no-op saves", () => {
  assert.equal(scoreToSave("5", 2, 1), 2); // capped at max
  assert.equal(scoreToSave("-3", 2, 1), 0); // floored at 0
  assert.equal(scoreToSave("1.5", 2, 1), 1.5);
  assert.equal(scoreToSave("1", 2, 1), null); // unchanged
  assert.equal(scoreToSave("9", 2, 2), null); // clamps to the current value
  assert.equal(scoreToSave("", 2, 1), null); // blank never saves 0
  assert.equal(scoreToSave("abc", 2, 1), null);
});

test("scoreToSave never overrides an ungraded answer", () => {
  assert.equal(scoreToSave("0", 2, null), null);
  assert.equal(scoreToSave("2", 2, null), null);
});

test("quizEditorLoadState: loading, error, not a quiz, ready", () => {
  assert.equal(
    quizEditorLoadState({ data: undefined, isError: false }),
    "loading",
  );
  assert.equal(
    quizEditorLoadState({ data: undefined, isError: true }),
    "error",
  );
  assert.equal(
    quizEditorLoadState({ data: { type: "Assignment" }, isError: false }),
    "notQuiz",
  );
  assert.equal(
    quizEditorLoadState({ data: { type: "Quiz" }, isError: false }),
    "ready",
  );
  // A background refetch error keeps showing the loaded quiz.
  assert.equal(
    quizEditorLoadState({ data: { type: "Quiz" }, isError: true }),
    "ready",
  );
});
