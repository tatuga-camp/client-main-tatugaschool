import { test } from "node:test";
import assert from "node:assert/strict";
import { FAN_MAX_SPREAD_DEG, FAN_SIDE_GUTTER, fanPoses } from "./card-fan";

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

test("fanPoses: empty and single card", () => {
  assert.deepEqual(fanPoses(0, 1280, 160, 224), []);
  assert.deepEqual(fanPoses(1, 1280, 160, 224), [{ x: 0, y: 0, rotate: 0 }]);
});

test("fanPoses: symmetric arc, left to right, edges lower than the middle", () => {
  const poses = fanPoses(5, 1280, 160, 224);
  assert.equal(poses.length, 5);
  for (let i = 0; i < 5; i++) {
    const mirror = poses[4 - i];
    assert.ok(near(poses[i].x, -mirror.x), "x mirrored");
    assert.ok(near(poses[i].y, mirror.y), "y mirrored");
    assert.ok(near(poses[i].rotate, -mirror.rotate), "rotate mirrored");
  }
  assert.ok(near(poses[2].x, 0) && near(poses[2].y, 0) && near(poses[2].rotate, 0));
  for (let i = 1; i < 5; i++) assert.ok(poses[i].x > poses[i - 1].x, "x increases");
  assert.ok(poses[0].y > poses[1].y && poses[1].y > poses[2].y, "edges sit lower");
  assert.ok(poses[0].rotate < 0 && poses[4].rotate > 0);
});

test("fanPoses: spread is capped for big classes", () => {
  const poses = fanPoses(45, 1280, 160, 224);
  const spread = poses[44].rotate - poses[0].rotate;
  assert.ok(spread <= FAN_MAX_SPREAD_DEG + 1e-6, `spread ${spread}`);
});

test("fanPoses: rotated cards always fit inside the viewport width", () => {
  for (const [count, vw, cw, ch] of [
    [5, 390, 128, 176],
    [40, 390, 128, 176],
    [40, 768, 160, 224],
    [12, 1280, 160, 224],
    [3, 360, 128, 176],
  ]) {
    for (const p of fanPoses(count, vw, cw, ch)) {
      // Horizontal half-extent of a w×h box rotated by θ.
      const rad = (Math.abs(p.rotate) * Math.PI) / 180;
      const halfExtent = (cw / 2) * Math.cos(rad) + (ch / 2) * Math.sin(rad);
      assert.ok(
        Math.abs(p.x) + halfExtent <= vw / 2 - FAN_SIDE_GUTTER + 1e-6,
        `count=${count} vw=${vw} x=${p.x} rot=${p.rotate}`,
      );
    }
  }
});

test("fanPoses: degenerate viewport narrower than a card collapses to a pile", () => {
  for (const p of fanPoses(10, 100, 128, 176)) {
    assert.equal(p.x, 0);
    assert.equal(p.y, 0);
  }
});
