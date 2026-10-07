import { test } from "node:test";
import assert from "node:assert/strict";
import { seededRandom } from "./card-deck";
import {
  REEL_PAD,
  buildIdleReel,
  buildSpinReel,
  centerIndexAt,
  distanceFromCenter,
  fillReel,
} from "./slider-reel";

const noAdjacentRepeats = (ids: string[]) =>
  ids.every((id, i) => i === 0 || ids[i - 1] !== id);

test("fillReel: empty pool or length gives []", () => {
  assert.deepEqual(fillReel([], 5), []);
  assert.deepEqual(fillReel(["a"], 0), []);
});

test("fillReel: single student repeats", () => {
  assert.deepEqual(fillReel(["a"], 3), ["a", "a", "a"]);
});

test("fillReel: no adjacent repeats and respects `after`", () => {
  for (let seed = 1; seed < 50; seed++) {
    const ids = fillReel(["a", "b", "c"], 40, seededRandom(seed), "a");
    assert.notEqual(ids[0], "a");
    assert.ok(noAdjacentRepeats(ids));
  }
});

test("buildIdleReel: centered strip of 2*PAD+1", () => {
  const reel = buildIdleReel(["a", "b"], seededRandom(3));
  assert.equal(reel.length, REEL_PAD * 2 + 1);
  assert.ok(noAdjacentRepeats(reel));
});

test("buildSpinReel: keeps the idle prefix and lands the winner at target", () => {
  const pool = ["a", "b", "c", "d"];
  for (let seed = 1; seed < 50; seed++) {
    const random = seededRandom(seed);
    const idle = buildIdleReel(pool, random);
    const { reel, target } = buildSpinReel(idle, pool, "c", 26, random);
    assert.deepEqual(reel.slice(0, idle.length), idle);
    assert.equal(reel[target], "c");
    assert.ok(target === idle.length + 26 || target === idle.length + 25);
    assert.equal(reel.length, target + 1 + REEL_PAD);
    assert.ok(noAdjacentRepeats(reel), `seed ${seed}`);
  }
});

test("buildSpinReel: works with two students", () => {
  for (let seed = 1; seed < 30; seed++) {
    const random = seededRandom(seed);
    const idle = buildIdleReel(["a", "b"], random);
    const { reel, target } = buildSpinReel(idle, ["a", "b"], "a", 10, random);
    assert.equal(reel[target], "a");
    assert.ok(noAdjacentRepeats(reel));
  }
});

test("centerIndexAt and distanceFromCenter", () => {
  assert.equal(centerIndexAt(0, 180), 0);
  assert.equal(centerIndexAt(-180 * 8, 180), 8);
  assert.equal(centerIndexAt(-180 * 8 - 80, 180), 8);
  assert.equal(centerIndexAt(-180 * 8 - 100, 180), 9);
  assert.equal(distanceFromCenter(-180 * 8, 8, 180), 0);
  assert.equal(distanceFromCenter(-180 * 8, 10, 180), 2);
  assert.equal(distanceFromCenter(-180 * 8, 6, 180), 2);
});
