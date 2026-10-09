import { test } from "node:test";
import assert from "node:assert/strict";
import { quizErrorAlertOptions } from "./quizErrorAlert";

test("a 400 from the score override surfaces the server's error and message", () => {
  const opts = quizErrorAlertOptions(
    {
      statusCode: 400,
      error: "Bad Request",
      message: "Score must be between 0 and 2",
    },
    "en",
  );
  assert.equal(opts.title, "Bad Request");
  assert.equal(opts.text, "Score must be between 0 and 2");
  assert.equal(opts.icon, "error");
});

test("a 409 QUIZ_LOCKED gets the localized lock message", () => {
  const opts = quizErrorAlertOptions(
    { statusCode: 409, error: "Conflict", message: "QUIZ_LOCKED" },
    "en",
  );
  assert.equal(opts.icon, "warning");
  assert.notEqual(opts.title, "Conflict");
});

test("an unknown error still produces an alert", () => {
  assert.equal(quizErrorAlertOptions(undefined, "en").title, "Error");
});
