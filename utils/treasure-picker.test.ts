import assert from "node:assert/strict";
import { test } from "node:test";
import { clampKeep, planSingles, stepDelays } from "./treasure-picker";

const ids = Array.from({ length: 30 }, (_, i) => `s${i}`);
const seq = (seed = 1) => {
  let t = seed;
  return () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
};

test("clampKeep keeps the count inside the pool", () => {
  assert.equal(clampKeep(0, 10), 1);
  assert.equal(clampKeep(3.7, 10), 3);
  assert.equal(clampKeep(50, 10), 10);
  assert.equal(clampKeep(2, 0), 0);
  assert.equal(clampKeep(NaN, 5), 1);
});

test(`every student is either a winner or eliminated exactly once`, () => {
  for (const keep of [1, 3, 29, 30]) {
    const p = planSingles(ids, keep, "quick", seq(keep));
    const gone = p.steps.flatMap((s) => s.ids);
    assert.equal(p.winners.length, keep);
    assert.equal(gone.length + keep, ids.length);
    assert.deepEqual([...p.winners, ...gone].sort(), [...ids].sort());
    p.steps.forEach((s) => assert.ok(s.ids.length > 0 && s.delay > 0));
  }
});

test("singles: one per step, final steps slower than the first", () => {
  const p = planSingles(ids, 1, "dramatic", seq());
  assert.ok(p.steps.every((s) => s.ids.length === 1));
  assert.ok(p.steps.at(-1)!.delay > p.steps[0].delay * 5);
});

test("stepDelays respects roughly the speed budget", () => {
  const total = stepDelays(44, "quick").reduce((a, b) => a + b, 0);
  assert.ok(total < 5000, `total ${total}`);
  assert.deepEqual(stepDelays(0, "quick"), []);
});

test("winners are uniform-ish", () => {
  const counts = new Map<string, number>();
  const small = ["a", "b", "c", "d"];
  for (let i = 0; i < 4000; i++) {
    const w = planSingles(small, 1, "quick").winners[0];
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  for (const id of small) {
    const c = counts.get(id) ?? 0;
    assert.ok(c > 850 && c < 1150, `${id}: ${c}`);
  }
});
