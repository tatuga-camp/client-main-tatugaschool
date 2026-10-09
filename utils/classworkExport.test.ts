import { test } from "node:test";
import assert from "node:assert/strict";
import { countExportResults } from "./classworkExport";

const ok = { status: "fulfilled", value: undefined } as const;
const bad = { status: "rejected", reason: new Error("x") } as const;

test("countExportResults counts fulfilled and rejected copies", () => {
  assert.deepEqual(countExportResults([ok, bad, ok]), { succeeded: 2, failed: 1, total: 3 });
  assert.deepEqual(countExportResults([ok, ok]), { succeeded: 2, failed: 0, total: 2 });
  assert.deepEqual(countExportResults([bad]), { succeeded: 0, failed: 1, total: 1 });
  assert.deepEqual(countExportResults([]), { succeeded: 0, failed: 0, total: 0 });
});
