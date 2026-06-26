import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRouletteSequence } from "./roulette.ts";

test("count of 0 yields an empty sequence", () => {
  assert.deepEqual(buildRouletteSequence(0), []);
});

test("count of 1 yields a single immediate winner at index 0", () => {
  assert.deepEqual(buildRouletteSequence(1), [{ index: 0, delayMs: 0 }]);
});

test("with constant random=0 the hops round-robin and never repeat", () => {
  const seq = buildRouletteSequence(
    4,
    { minHops: 15, extraHopsRange: 10, startDelayMs: 60, endDelayMs: 400 },
    () => 0,
  );
  assert.equal(seq.length, 15);
  assert.equal(seq[0].index, 1);
  assert.equal(seq[1].index, 2);
  assert.equal(seq[2].index, 3);
  assert.equal(seq[3].index, 0);
  for (let i = 1; i < seq.length; i++) {
    assert.notEqual(seq[i].index, seq[i - 1].index);
  }
});

test("delays decelerate from start to end", () => {
  const seq = buildRouletteSequence(
    4,
    { minHops: 15, extraHopsRange: 10, startDelayMs: 60, endDelayMs: 400 },
    () => 0,
  );
  assert.equal(seq[0].delayMs, 60);
  assert.equal(seq[seq.length - 1].delayMs, 400);
  for (let i = 1; i < seq.length; i++) {
    assert.ok(seq[i].delayMs >= seq[i - 1].delayMs);
  }
});

test("winner index is always within range", () => {
  for (const r of [() => 0, () => 0.5, () => 0.999]) {
    const seq = buildRouletteSequence(5, undefined, r);
    const winner = seq[seq.length - 1].index;
    assert.ok(winner >= 0 && winner < 5);
  }
});
