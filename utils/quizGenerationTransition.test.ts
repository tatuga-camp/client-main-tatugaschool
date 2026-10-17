import { test } from "node:test";
import assert from "node:assert/strict";
import type { QuizGenerationJob } from "../interfaces/Quiz";
import { generationTransition } from "./quizGenerationTransition";

const job = (over: Partial<QuizGenerationJob> = {}): QuizGenerationJob => ({
  id: "j1",
  createAt: "2026-10-17T00:00:00.000Z",
  updateAt: "2026-10-17T00:00:00.000Z",
  status: "RUNNING",
  source: { kind: "YOUTUBE", url: "https://youtu.be/abcdefghijk" },
  questionCount: 10,
  allowedTypes: ["SINGLE"],
  choicesPerQuestion: 4,
  language: "en",
  instructions: null,
  createdCount: 0,
  error: null,
  attempts: 1,
  startedAt: null,
  finishedAt: null,
  assignmentId: "a1",
  subjectId: "s1",
  schoolId: "sc1",
  userId: "u1",
  ...over,
});

test("active -> DONE reports done with count", () => {
  assert.deepEqual(
    generationTransition(job(), job({ status: "DONE", createdCount: 8 })),
    { kind: "done", createdCount: 8 },
  );
  assert.deepEqual(
    generationTransition(job({ status: "PENDING" }), job({ status: "DONE", createdCount: 3 })),
    { kind: "done", createdCount: 3 },
  );
});

test("active -> FAILED reports failed with code", () => {
  assert.deepEqual(
    generationTransition(job(), job({ status: "FAILED", error: "TIMEOUT" })),
    { kind: "failed", code: "TIMEOUT" },
  );
  assert.deepEqual(
    generationTransition(job(), job({ status: "FAILED", error: null })),
    { kind: "failed", code: null },
  );
});

test("DONE -> DONE is null", () => {
  assert.equal(
    generationTransition(job({ status: "DONE" }), job({ status: "DONE" })),
    null,
  );
});

test("different ids are null", () => {
  assert.equal(
    generationTransition(job(), job({ id: "j2", status: "DONE" })),
    null,
  );
});

test("undefined -> RUNNING is null, and missing next is null", () => {
  assert.equal(generationTransition(undefined, job()), null);
  assert.equal(generationTransition(job(), null), null);
});
