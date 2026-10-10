import { test } from "node:test";
import assert from "node:assert/strict";
import {
  labelFontSize,
  landingRotation,
  pointerKick,
  segmentAt,
  segmentColors,
  slicePath,
  truncateLabel,
  wheelLabels,
} from "./wheel";

test("segmentAt: pointer at 12 o'clock reads the slice turned under it", () => {
  assert.equal(segmentAt(0, 4), 0);
  assert.equal(segmentAt(-1, 4), 0); // wheel nudged back: still slice 0
  assert.equal(segmentAt(1, 4), 3); // turned clockwise: the last slice arrives
  assert.equal(segmentAt(-91, 4), 1);
  assert.equal(segmentAt(720 + 10, 4), 3);
  assert.equal(segmentAt(123, 0), 0);
  assert.equal(segmentAt(-359.9999999999, 100), 99);
});

test("landingRotation: lands the chosen slice, always forward, enough turns", () => {
  for (const count of [1, 2, 3, 7, 50, 100]) {
    for (const index of [0, Math.floor(count / 2), count - 1]) {
      for (const random of [0, 0.25, 0.5, 0.999]) {
        for (const current of [0, 37.5, -12, 7200.3]) {
          const end = landingRotation(current, index, count, 5, random);
          assert.equal(segmentAt(end, count), index, `${count}/${index}`);
          assert.ok(end >= current + 5 * 360, "at least 5 turns");
          assert.ok(end < current + 6 * 360, "less than 6 turns");
        }
      }
    }
  }
});

test("landingRotation: never stops on a boundary", () => {
  const count = 10;
  const step = 36;
  for (const random of [0, 0.999]) {
    const end = landingRotation(0, 3, count, 5, random);
    const within = (((-end % step) + step) % step) / step;
    assert.ok(within > 0.1 && within < 0.9, `within=${within}`);
  }
});

test("pointerKick: kicks right after a peg passes, then settles", () => {
  // 4 slices of 90°. Turning clockwise past rotation 0 crosses a boundary.
  assert.ok(pointerKick(0.5, 4, 20) < -19, "just past a peg: full kick");
  assert.equal(pointerKick(45, 4, 20), 0, "mid-slice: rest");
  assert.ok(pointerKick(10, 4, 20) < 0 && pointerKick(10, 4, 20) > -20);
  assert.equal(pointerKick(10, 1, 20), 0, "one slice: no pegs");
});

test("slicePath: quarter slice and large-arc flag", () => {
  assert.equal(slicePath(100, 100, 100, 0, 90), "M 100 100 L 100 0 A 100 100 0 0 1 200 100 Z");
  assert.ok(slicePath(100, 100, 100, 0, 200).includes(" 0 1 1 "));
});

test("segmentColors: neighbours differ, including across the seam", () => {
  for (let count = 2; count <= 101; count++) {
    const colors = segmentColors(count);
    assert.equal(colors.length, count);
    for (let i = 0; i < count; i++) {
      const next = colors[(i + 1) % count];
      assert.notEqual(colors[i], next, `count=${count} i=${i}`);
    }
  }
});

test("labelFontSize: shrinks with crowding, stays readable and capped", () => {
  assert.equal(labelFontSize(4, 400), 22);
  assert.ok(labelFontSize(100, 250) >= 8);
  assert.ok(labelFontSize(100, 400) < labelFontSize(30, 400));
});

test("truncateLabel: keeps Thai marks with their consonant", () => {
  assert.equal(truncateLabel("Ann", 5), "Ann");
  assert.equal(truncateLabel("Christopher", 6), "Chris…");
  // "ปิ่น" + more: the first grapheme "ปิ่" must stay intact.
  const cut = truncateLabel("ปิ่นมณีรัตน์", 3);
  assert.ok(cut.startsWith("ปิ่น"), cut);
  assert.ok(cut.endsWith("…"));
});

test("wheelLabels: last-name initial only for shared first names", () => {
  assert.deepEqual(
    wheelLabels([
      { firstName: "Mali", lastName: "Suk" },
      { firstName: "Mali", lastName: "Dee" },
      { firstName: "Ton", lastName: "Kaew" },
      { firstName: "สมชาย", lastName: "ใจดี" },
      { firstName: "สมชาย", lastName: "รักไทย" },
    ]),
    ["Mali S.", "Mali D.", "Ton", "สมชาย จ.", "สมชาย ร."],
  );
});
