import { test } from "node:test";
import assert from "node:assert/strict";
import { deleteConfirmOptions, runIfConfirmed } from "./confirmDelete";

test("quiz confirm is a cancellable warning with localized text", () => {
  const en = deleteConfirmOptions("quiz", "en");
  assert.equal(en.showCancelButton, true);
  assert.equal(en.icon, "warning");
  assert.equal(en.title, "Delete this quiz?");
  assert.equal(deleteConfirmOptions("quiz", "th").title, "ลบแบบทดสอบนี้?");
  assert.notEqual(deleteConfirmOptions("assignment", "en").title, en.title);
});

test("runIfConfirmed runs the action only after confirm", async () => {
  let calls = 0;
  const action = async () => { calls++; };
  assert.equal(await runIfConfirmed(async () => ({ isConfirmed: false }), action), false);
  assert.equal(calls, 0);
  assert.equal(await runIfConfirmed(async () => ({ isConfirmed: true }), action), true);
  assert.equal(calls, 1);
});
