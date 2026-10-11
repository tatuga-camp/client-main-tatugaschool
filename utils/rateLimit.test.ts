import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  dismissRateLimitNotice,
  generalWaitSeconds,
  getRateLimitNotice,
  installSwalRateLimitGuard,
  isRateLimitError,
  localRateLimitError,
  reportRateLimit,
  resetRateLimitForTests,
  subscribeRateLimit,
  waitForRateLimit,
} from "./rateLimit";

beforeEach(() => resetRateLimitForTests());

test("a general 429 opens the notice and pauses requests", () => {
  const now = 1_000_000;
  reportRateLimit({ retryAfter: 42, scope: "general" }, now);
  assert.deepEqual(getRateLimitNotice(), {
    scope: "general",
    until: now + 42_000,
    totalSeconds: 42,
  });
  assert.equal(generalWaitSeconds(now), 42);
  assert.equal(generalWaitSeconds(now + 41_500), 1);
  assert.equal(generalWaitSeconds(now + 42_000), 0);
});

test("an auth 429 shows the notice without pausing other requests", () => {
  reportRateLimit({ retryAfter: 900, scope: "auth" }, 0);
  assert.equal(getRateLimitNotice()?.scope, "auth");
  assert.equal(generalWaitSeconds(0), 0);
});

test("missing retryAfter falls back to 30 seconds", () => {
  reportRateLimit(undefined, 0);
  assert.equal(getRateLimitNotice()?.totalSeconds, 30);
  assert.equal(getRateLimitNotice()?.scope, "general");
});

test("many 429s at once keep the longest wait and notify once per change", () => {
  let calls = 0;
  subscribeRateLimit(() => calls++);
  reportRateLimit({ retryAfter: 60, scope: "general" }, 0);
  reportRateLimit({ retryAfter: 20, scope: "general" }, 0);
  reportRateLimit({ retryAfter: 60, scope: "general" }, 0);
  assert.equal(getRateLimitNotice()?.totalSeconds, 60);
  assert.equal(calls, 1);
});

test("dismissing hides the notice but keeps the pause", () => {
  reportRateLimit({ retryAfter: 10, scope: "general" }, 0);
  dismissRateLimitNotice();
  assert.equal(getRateLimitNotice(), null);
  assert.equal(generalWaitSeconds(0), 10);
});

test("isRateLimitError recognises axios errors and rethrown bodies", () => {
  assert.equal(isRateLimitError({ response: { status: 429 } }), true);
  assert.equal(isRateLimitError({ statusCode: 429 }), true);
  assert.equal(isRateLimitError({ statusCode: 401 }), false);
  assert.equal(isRateLimitError(undefined), false);
});

test("a locally held-back request fails like the server's 429", () => {
  const error = localRateLimitError(12) as any;
  assert.equal(isRateLimitError(error), true);
  assert.equal(error.response.data.retryAfter, 12);
  assert.equal(error.response.data.statusCode, 429);
});

test("the Swal guard skips error alerts only while the notice is open", async () => {
  const fired: any[][] = [];
  let closed = 0;
  const swal = {
    fire: async (...args: any[]) => fired.push(args),
    close: () => closed++,
  };
  installSwalRateLimitGuard(swal);

  await swal.fire({ icon: "error", title: "before" });
  reportRateLimit({ retryAfter: 5, scope: "general" }, Date.now());
  const skipped = await swal.fire({ icon: "error", title: "during" });
  await swal.fire("Error", "positional", "error");
  await swal.fire({ icon: "success", title: "still shown" });
  dismissRateLimitNotice();
  await swal.fire({ icon: "error", title: "after" });

  assert.deepEqual(skipped, { isConfirmed: false, isDenied: false, isDismissed: true });
  // Each skipped error alert closes the alert it would have replaced
  // (e.g. the "Loading…" spinner).
  assert.equal(closed, 2);
  assert.deepEqual(
    fired.map((args) => args[0]?.title ?? args[1]),
    ["before", "still shown", "after"],
  );
});

test("waitForRateLimit returns at once when nothing is paused", async () => {
  let slept = 0;
  await waitForRateLimit(async () => {
    slept++;
  });
  assert.equal(slept, 0);
});

test("waitForRateLimit holds until the wait ends, including an extension", async () => {
  reportRateLimit({ retryAfter: 2, scope: "general" });
  const naps: number[] = [];
  let extended = false;
  await waitForRateLimit(async (ms) => {
    naps.push(ms);
    if (!extended) {
      // Halfway through the first wait, another 429 extends the pause.
      extended = true;
      resetClock(1000);
      reportRateLimit({ retryAfter: 4, scope: "general" });
      return;
    }
    // Sleep through whatever is left.
    resetClock(generalWaitSeconds() * 1000 + 1);
  });
  assert.equal(naps.length, 2);
  assert.ok(naps[0] > 1000 && naps[0] <= 3000, `first nap ${naps[0]}`);
  assert.equal(generalWaitSeconds(), 0);
});

// Moves Date.now forward for the code under test.
const realNow = Date.now;
let offset = 0;
function resetClock(advanceMs: number) {
  offset += advanceMs;
  Date.now = () => realNow() + offset;
}
