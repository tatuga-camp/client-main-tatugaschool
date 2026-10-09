// Load auth before api-service: the two import each other, and under CommonJS (tsx --test)
// only this order resolves (webpack's ESM build hoists either way).
import "../../services/auth";
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import type { NextRouter } from "next/router";
import { AssignmentOnQuiz } from "../../interfaces";
import { keyQuiz } from "../../react-query/quiz";
import QuestionList from "./QuestionList";

const question = (id: string, order: number): AssignmentOnQuiz => ({
  id,
  createAt: "2026-10-09T00:00:00.000Z",
  updateAt: "2026-10-09T00:00:00.000Z",
  order,
  type: "SINGLE",
  prompt: `Question ${id}`,
  imageUrl: null,
  points: 1,
  options: [
    { id: `${id}-a`, text: "A", imageUrl: null, isCorrect: true },
    { id: `${id}-b`, text: "B", imageUrl: null, isCorrect: false },
  ],
  blanks: [],
  assignmentId: "quiz1",
  subjectId: "s1",
  schoolId: "sc1",
});

function render(props: { locked: boolean; readOnly?: boolean }) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(["language"], "en");
  client.setQueryData(keyQuiz.questions("quiz1"), [question("q1", 0), question("q2", 1)]);
  const router = { query: {}, push: async () => true } as unknown as NextRouter;
  return renderToStaticMarkup(
    <RouterContext.Provider value={router}>
      <QueryClientProvider client={client}>
        <QuestionList assignmentId="quiz1" subjectId="s1" {...props} />
      </QueryClientProvider>
    </RouterContext.Provider>,
  );
}

const count = (html: string, needle: string) => html.split(needle).length - 1;

test("QuestionList unlocked: editable cards, drag handles, save/delete and add question", () => {
  const html = render({ locked: false });
  assert.equal(count(html, 'aria-label="Drag to reorder"'), 2);
  assert.ok(!html.includes("questions are locked"));
  assert.ok(!html.includes("Duplicate quiz"));
  assert.ok(html.includes("New question"));
  assert.equal(count(html, ">Delete<"), 2);
  assert.ok(!/<textarea[^>]*disabled/.test(html));
});

test("QuestionList locked: banner and Duplicate show, cards read-only, no drag handles", () => {
  const html = render({ locked: true });
  assert.ok(html.includes("questions are locked"));
  assert.ok(html.includes("Duplicate quiz"));
  assert.equal(count(html, 'aria-label="Drag to reorder"'), 0);
  assert.ok(!html.includes("New question"));
  assert.equal(count(html, ">Delete<"), 0);
  assert.equal(count(html, ">Save<"), 0);
  assert.equal((html.match(/<textarea[^>]*disabled/g) ?? []).length, 2);
  assert.equal((html.match(/<select[^>]*disabled/g) ?? []).length, 2);
});

test("QuestionList while the lock check loads: read-only without the banner", () => {
  const html = render({ locked: false, readOnly: true });
  assert.ok(!html.includes("questions are locked"));
  assert.equal(count(html, 'aria-label="Drag to reorder"'), 0);
  assert.ok(!html.includes("New question"));
  assert.equal((html.match(/<textarea[^>]*disabled/g) ?? []).length, 2);
});
