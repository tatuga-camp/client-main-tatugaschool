import { test } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension is required by Node's native TypeScript test runner.
import { anchoredZoom, wheelScaleFactor } from "./zoomMath.ts";

test("anchoredZoom keeps the anchor point visually fixed", () => {
  const next = anchoredZoom({ x: 0, y: 0, scale: 1 }, 2, 100, 50);
  assert.equal(next.scale, 2);
  assert.equal(next.x, -100);
  assert.equal(next.y, -50);
});

test("anchoredZoom respects a non-zero starting offset", () => {
  const next = anchoredZoom({ x: 30, y: 10, scale: 2 }, 1, 100, 50);
  assert.equal(next.x, 65);
  assert.equal(next.y, 30);
  assert.equal(next.scale, 1);
});

test("anchoredZoom anchored at origin only scales", () => {
  const next = anchoredZoom({ x: 0, y: 0, scale: 1 }, 3, 0, 0);
  assert.deepEqual(next, { x: 0, y: 0, scale: 3 });
});

test("anchoredZoom handles a fractional zoom-out ratio", () => {
  // ratio = 0.5/1 = 0.5; x' = 80 - (80 - 0)*0.5 = 40; y' = 40 - (40 - 0)*0.5 = 20
  const next = anchoredZoom({ x: 0, y: 0, scale: 1 }, 0.5, 80, 40);
  assert.equal(next.scale, 0.5);
  assert.equal(next.x, 40);
  assert.equal(next.y, 20);
});

test("wheelScaleFactor: scrolling up (negative deltaY) zooms in (>1)", () => {
  assert.ok(wheelScaleFactor(-100) > 1);
});

test("wheelScaleFactor: scrolling down (positive deltaY) zooms out (<1)", () => {
  assert.ok(wheelScaleFactor(100) < 1);
});

test("wheelScaleFactor: no movement is identity", () => {
  assert.equal(wheelScaleFactor(0), 1);
});
