import { test } from "node:test";
import assert from "node:assert/strict";
import { highlightedMenu } from "./sidebarState";

test("highlightedMenu falls back to default for missing, empty or array query", () => {
  assert.equal(highlightedMenu("Grade", "Subject"), "Grade");
  assert.equal(highlightedMenu(undefined, "Subject"), "Subject");
  assert.equal(highlightedMenu("", "Subject"), "Subject");
  assert.equal(highlightedMenu(["Grade", "Classwork"], "Subject"), "Grade");
  assert.equal(highlightedMenu([], "Subject"), "Subject");
});
