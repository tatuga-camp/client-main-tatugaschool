import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isWithinBounds,
  presetRange,
  toDateBounds,
  toInputDate,
} from "./attendanceDateRange";

const today = new Date(2026, 2, 15, 14, 30); // 15 Mar 2026, local

test("presets resolve to local calendar days", () => {
  assert.deepEqual(presetRange("all", today), { from: "", to: "" });
  assert.deepEqual(presetRange("custom", today), { from: "", to: "" });
  assert.deepEqual(presetRange("today", today), {
    from: "2026-03-15",
    to: "2026-03-15",
  });
  assert.deepEqual(presetRange("yesterday", today), {
    from: "2026-03-14",
    to: "2026-03-14",
  });
  assert.deepEqual(presetRange("last30", today), {
    from: "2026-02-13",
    to: "2026-03-15",
  });
  assert.deepEqual(presetRange("thisMonth", today), {
    from: "2026-03-01",
    to: "2026-03-15",
  });
  assert.deepEqual(presetRange("lastMonth", today), {
    from: "2026-02-01",
    to: "2026-02-28",
  });
});

test("presets cross month and year edges", () => {
  const newYear = new Date(2026, 0, 1, 9);
  assert.deepEqual(presetRange("yesterday", newYear), {
    from: "2025-12-31",
    to: "2025-12-31",
  });
  assert.deepEqual(presetRange("lastMonth", newYear), {
    from: "2025-12-01",
    to: "2025-12-31",
  });
});

test("bounds cover the whole first and last day in local time", () => {
  const bounds = toDateBounds("2026-03-14", "2026-03-15");
  assert.equal(toInputDate(bounds.start!), "2026-03-14");
  assert.equal(bounds.start!.getHours(), 0);
  assert.equal(toInputDate(bounds.end!), "2026-03-15");
  assert.equal(bounds.end!.getHours(), 23);

  assert.equal(isWithinBounds(new Date(2026, 2, 14, 0, 0), bounds), true);
  assert.equal(isWithinBounds(new Date(2026, 2, 15, 23, 59), bounds), true);
  assert.equal(isWithinBounds(new Date(2026, 2, 13, 23, 59), bounds), false);
  assert.equal(isWithinBounds(new Date(2026, 2, 16, 0, 0), bounds), false);
  assert.equal(
    isWithinBounds(new Date(2026, 2, 14, 8).toISOString(), bounds),
    true,
  );
});

test("empty or malformed inputs leave that side open", () => {
  assert.deepEqual(toDateBounds("", ""), {});
  assert.deepEqual(toDateBounds("nope", ""), {});
  assert.equal(isWithinBounds(new Date(1990, 0, 1), {}), true);

  const fromOnly = toDateBounds("2026-03-14", "");
  assert.equal(fromOnly.end, undefined);
  assert.equal(isWithinBounds(new Date(2030, 0, 1), fromOnly), true);
  assert.equal(isWithinBounds(new Date(2026, 2, 13), fromOnly), false);
});
