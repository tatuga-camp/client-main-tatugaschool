import { test } from "node:test";
import assert from "node:assert/strict";
import { toPixelBox, headRegion } from "./overlayMath.ts";

test("scales a normalized box to pixels (not mirrored)", () => {
  const px = toPixelBox(
    { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
    1000,
    500,
    false,
  );
  assert.deepEqual(px, { left: 100, top: 100, width: 300, height: 200 });
});

test("mirrors horizontally for selfie view", () => {
  const px = toPixelBox(
    { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
    1000,
    500,
    true,
  );
  assert.deepEqual(px, { left: 600, top: 100, width: 300, height: 200 });
});

test("a centered box is unchanged horizontally by mirroring", () => {
  const box = { x: 0.4, y: 0, width: 0.2, height: 1 };
  const plain = toPixelBox(box, 1000, 500, false);
  const mirrored = toPixelBox(box, 1000, 500, true);
  // Symmetric about the centre line; allow for floating-point drift.
  assert.ok(Math.abs(plain.left - mirrored.left) < 1e-9);
});

test("headRegion takes a top-centre slice of a person box", () => {
  const head = headRegion({ x: 0.2, y: 0.1, width: 0.4, height: 0.6 });
  // half width (0.2), centred: 0.2 + (0.4-0.2)/2 = 0.3; top of the box; 0.3*height
  assert.ok(Math.abs(head.x - 0.3) < 1e-9);
  assert.ok(Math.abs(head.y - 0.1) < 1e-9);
  assert.ok(Math.abs(head.width - 0.2) < 1e-9);
  assert.ok(Math.abs(head.height - 0.18) < 1e-9);
});

test("headRegion stays horizontally centred within its person box", () => {
  const box = { x: 0.2, y: 0.1, width: 0.4, height: 0.6 };
  const head = headRegion(box);
  const boxCentre = box.x + box.width / 2;
  const headCentre = head.x + head.width / 2;
  assert.ok(Math.abs(boxCentre - headCentre) < 1e-9);
});

test("headRegion clamps a box flush against the frame edge", () => {
  // A wide box hugging the right edge: the head slice must not exceed 1.
  const head = headRegion({ x: 0.7, y: 0.9, width: 0.4, height: 0.4 });
  assert.ok(head.x >= 0 && head.y >= 0);
  assert.ok(head.x + head.width <= 1 + 1e-9);
  assert.ok(head.y + head.height <= 1 + 1e-9);
});
