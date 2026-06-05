import { test } from "node:test";
import assert from "node:assert/strict";
import { computeRubricScore } from "./rubricMath.ts";

test("normalizes full top grade to maxScore", () => {
  const score = computeRubricScore({
    criteria: [
      { weight: 1, maxPoints: 4 },
      { weight: 1, maxPoints: 4 },
    ],
    selections: [
      { points: 4, weight: 1 },
      { points: 4, weight: 1 },
    ],
    maxScore: 10,
  });
  assert.equal(score, 10);
});

test("counts ungraded criteria toward rawMax", () => {
  const score = computeRubricScore({
    criteria: [
      { weight: 1, maxPoints: 4 },
      { weight: 1, maxPoints: 4 },
    ],
    selections: [{ points: 4, weight: 1 }],
    maxScore: 10,
  });
  assert.equal(score, 5);
});

test("returns 0 when rawMax is 0", () => {
  const score = computeRubricScore({
    criteria: [{ weight: 0, maxPoints: 0 }],
    selections: [{ points: 0, weight: 0 }],
    maxScore: 10,
  });
  assert.equal(score, 0);
});
