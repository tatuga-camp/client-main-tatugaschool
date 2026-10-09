// Load auth before api-service: the two import each other, and under CommonJS (tsx --test)
// only this order resolves (webpack's ESM build hoists either way).
import "../../services/auth";
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AssignmentOnQuiz, QuizMonitorRow, QuizMonitorView, QuizReviewView, StudentOnQuiz } from "../../interfaces";
import { keyQuiz } from "../../react-query/quiz";
import QuizMonitor from "./QuizMonitor";
import QuizStudentPanel from "./QuizStudentPanel";

const row = (id: string, o: Partial<QuizMonitorRow> = {}): QuizMonitorRow => ({
  studentOnAssignmentId: id,
  studentId: id,
  title: "",
  firstName: `Student ${id}`,
  lastName: "",
  number: "1",
  photo: "/a.png",
  blurHash: null,
  status: "AWAY",
  answeredCount: 1,
  questionCount: 2,
  startedAt: "2026-10-09T00:00:00.000Z",
  submittedAt: null,
  lastSeenAt: "2026-10-09T00:00:00.000Z",
  score: null,
  integritySummary: null,
  riskScore: 72,
  riskSource: "RULE",
  riskPattern: null,
  riskConfidence: null,
  ...o,
});

function client() {
  const c = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  c.setQueryData(["language"], "en");
  return c;
}

const statLabel = (label: string) => `<div class="text-xs text-icon-color/60">${label}</div>`;

function renderMonitor(testMode: boolean) {
  const c = client();
  const view: QuizMonitorView = {
    assignmentId: "quiz1",
    testMode,
    questionCount: 2,
    locked: false,
    serverNow: "2026-10-09T00:00:30.000Z",
    rows: [row("a")],
  };
  c.setQueryData(keyQuiz.monitor("quiz1"), view);
  return renderToStaticMarkup(
    <QueryClientProvider client={c}>
      <QuizMonitor assignmentId="quiz1" />
    </QueryClientProvider>,
  );
}

test("Monitor with Test mode off: no risk column, no risk badge, no Away-now or High-risk stat", () => {
  const html = renderMonitor(false);
  assert.ok(html.includes("Student a"));
  assert.ok(!html.includes(">Risk<"));
  assert.ok(!html.includes(statLabel("Away now")));
  assert.ok(!html.includes(statLabel("High risk")));
  assert.ok(!html.includes("72%"));
});

test("Monitor with Test mode on: risk column, risk badge, Away-now and High-risk stats", () => {
  const html = renderMonitor(true);
  assert.ok(html.includes(">Risk<"));
  assert.ok(html.includes(statLabel("Away now")));
  assert.ok(html.includes(statLabel("High risk")));
  assert.ok(html.includes("72%"));
});

const question = (id: string, points: number): AssignmentOnQuiz => ({
  id,
  createAt: "2026-10-09T00:00:00.000Z",
  updateAt: "2026-10-09T00:00:00.000Z",
  order: 0,
  type: "SINGLE",
  prompt: `Prompt ${id}`,
  imageUrl: null,
  points,
  options: [
    { id: `${id}-a`, text: "A", imageUrl: null, isCorrect: true },
    { id: `${id}-b`, text: "B", imageUrl: null, isCorrect: false },
  ],
  blanks: [],
  assignmentId: "quiz1",
  subjectId: "s1",
  schoolId: "sc1",
});

const answer = (id: string, score: number | null): StudentOnQuiz => ({
  id,
  selectedOptionIds: [],
  blankAnswers: [],
  score,
  teacherOverridden: false,
  assignmentOnQuizId: id,
  studentOnAssignmentId: "a",
});

function renderPanel(score: number | null) {
  const c = client();
  const review: QuizReviewView = {
    studentOnAssignment: {
      id: "a",
      title: "",
      firstName: "Ann",
      lastName: "B",
      number: "1",
      photo: "",
      score: null,
      status: "PENDDING",
      quizAttempt: null,
    },
    maxScore: 2,
    scoringMode: "PARTIAL",
    testMode: false,
    items: [{ question: question("q1", 2), answer: answer("soq1", score) }],
    events: [],
  };
  c.setQueryData(keyQuiz.review("a"), review);
  return renderToStaticMarkup(
    <QueryClientProvider client={c}>
      <QuizStudentPanel assignmentId="quiz1" studentOnAssignmentId="a" onClose={() => {}} />
    </QueryClientProvider>,
  );
}

test("Student panel: an ungraded answer shows 'Not graded yet' and no score input", () => {
  const html = renderPanel(null);
  assert.ok(html.includes("Not graded yet"));
  assert.ok(!html.includes('type="number"'));
});

test("Student panel: a graded answer gets a score input capped at the question's points", () => {
  const html = renderPanel(1);
  assert.ok(!html.includes("Not graded yet"));
  assert.match(html, /<input[^>]*type="number"[^>]*max="2"[^>]*value="1"/);
});

test("Monitor: a failed fetch shows an error, not 'No students'", () => {
  const c = client();
  // Without this, mounting over an errored query with no data optimistically reports "pending" (a refetch).
  c.setDefaultOptions({ queries: { staleTime: Infinity, retry: false, retryOnMount: false } });
  c.getQueryCache()
    .build(c, { queryKey: keyQuiz.monitor("quiz1") })
    .setState({ status: "error", error: new Error("403"), data: undefined, fetchStatus: "idle" });
  const html = renderToStaticMarkup(
    <QueryClientProvider client={c}>
      <QuizMonitor assignmentId="quiz1" />
    </QueryClientProvider>,
  );
  assert.ok(html.includes("Could not load this quiz"));
  assert.ok(!html.includes("No students are assigned yet"));
});

test("Student panel: shows a spinner while the review loads", () => {
  const c = client();
  const html = renderToStaticMarkup(
    <QueryClientProvider client={c}>
      <QuizStudentPanel assignmentId="quiz1" studentOnAssignmentId="a" onClose={() => {}} />
    </QueryClientProvider>,
  );
  assert.ok(html.includes('aria-busy="true"'));
});
