import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REWARD_MIN_CHARS,
  formatRewardDate,
  rewardCharCount,
  rewardFormState,
} from "./feedbackReward";

test("rewardCharCount counts trimmed Unicode code points like the server", () => {
  assert.equal(REWARD_MIN_CHARS, 30);
  assert.equal(rewardCharCount("กี".repeat(15)), 30);
  assert.equal(rewardCharCount("ก".repeat(29)), 29);
  assert.equal(rewardCharCount(" " + "a".repeat(29) + " "), 29);
  assert.equal(rewardCharCount("a".repeat(30)), 30);
  assert.equal(rewardCharCount("😀".repeat(3)), 3);
});

test("rewardFormState hides everything once a reward exists or is loading", () => {
  const hidden = { hint: "hidden", counter: null, showAnonymousWarning: false };
  assert.deepEqual(
    rewardFormState({ hasReward: true, isAnonymous: false, body: "abc" }),
    hidden,
  );
  assert.deepEqual(
    rewardFormState({ hasReward: undefined, isAnonymous: true, body: "abc" }),
    hidden,
  );
});

test("rewardFormState warns when anonymous", () => {
  assert.deepEqual(
    rewardFormState({ hasReward: false, isAnonymous: true, body: "abc" }),
    { hint: "muted", counter: null, showAnonymousWarning: true },
  );
});

test("rewardFormState shows the counter", () => {
  assert.deepEqual(
    rewardFormState({
      hasReward: false,
      isAnonymous: false,
      body: "a".repeat(12),
    }),
    { hint: "show", counter: { remaining: 18 }, showAnonymousWarning: false },
  );
  assert.equal(
    rewardFormState({
      hasReward: false,
      isAnonymous: false,
      body: "a".repeat(30),
    }).counter,
    "ready",
  );
});

test("formatRewardDate formats in Bangkok time", () => {
  assert.equal(formatRewardDate("2026-11-29T05:00:00.000Z", "en"), "29 November 2026");
});
