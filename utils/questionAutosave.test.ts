import { test } from "node:test";
import assert from "node:assert/strict";
import { AutosaveQueue, AutosaveStatus } from "./questionAutosave";

/** A fake clock: timers run only when the test advances time. */
function fakeClock() {
  let now = 0;
  let id = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  return {
    setTimer: (fn: () => void, ms: number) => {
      const t = ++id;
      timers.set(t, { at: now + ms, fn });
      return t;
    },
    clearTimer: (t: unknown) => void timers.delete(t as number),
    async advance(ms: number) {
      const end = now + ms;
      for (;;) {
        const due = [...timers.entries()]
          .filter(([, v]) => v.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]);
        now = due[1].at;
        due[1].fn();
        await new Promise((r) => setImmediate(r));
      }
      now = end;
      await new Promise((r) => setImmediate(r));
    },
  };
}

function setup(save: (p: string) => Promise<void>) {
  const clock = fakeClock();
  const statuses: AutosaveStatus[] = [];
  const queue = new AutosaveQueue<string>({
    save,
    delayMs: 2000,
    retryDelaysMs: [1000, 2000, 4000],
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    onStatus: (s) => statuses.push(s),
  });
  return { clock, queue, statuses };
}

test("saves once, 2 s after the last edit", async () => {
  const sent: string[] = [];
  const { clock, queue } = setup(async (p) => void sent.push(p));
  queue.edit("a");
  await clock.advance(1500);
  queue.edit("ab");
  await clock.advance(1500);
  assert.deepEqual(sent, []);
  await clock.advance(500);
  assert.deepEqual(sent, ["ab"]);
  assert.equal(queue.status, "saved");
  assert.equal(queue.isSettled(), true);
});

test("edits made while a save is in flight save once more afterwards, with the latest value", async () => {
  const sent: string[] = [];
  let release!: () => void;
  const { clock, queue } = setup(
    (p) =>
      new Promise<void>((resolve) => {
        sent.push(p);
        release = resolve;
      }),
  );
  queue.edit("v1");
  await clock.advance(2000);
  assert.equal(queue.status, "saving");
  queue.edit("v2");
  queue.edit("v3");
  release();
  await clock.advance(0);
  await clock.advance(2000);
  release();
  await clock.advance(0);
  assert.deepEqual(sent, ["v1", "v3"]);
  assert.equal(queue.status, "saved");
});

test("retries a failed save and gives up after the last retry", async () => {
  let calls = 0;
  const { clock, queue, statuses } = setup(async () => {
    calls++;
    throw new Error("offline");
  });
  queue.edit("x");
  await clock.advance(2000);
  assert.equal(queue.status, "retrying");
  await clock.advance(1000 + 2000 + 4000);
  assert.equal(calls, 4);
  assert.equal(queue.status, "error");
  assert.equal(queue.isSettled(), false);
  assert.ok(statuses.includes("retrying"));
});

test("a new edit after an error starts over", async () => {
  let fail = true;
  const sent: string[] = [];
  const { clock, queue } = setup(async (p) => {
    if (fail) throw new Error("x");
    sent.push(p);
  });
  queue.edit("a");
  await clock.advance(2000 + 7000);
  assert.equal(queue.status, "error");
  fail = false;
  queue.edit("b");
  await clock.advance(2000);
  assert.deepEqual(sent, ["b"]);
  assert.equal(queue.status, "saved");
});

test("flush saves a pending edit right away and reports success", async () => {
  const sent: string[] = [];
  const { queue } = setup(async (p) => void sent.push(p));
  queue.edit("now");
  assert.equal(await queue.flush(), true);
  assert.deepEqual(sent, ["now"]);
});

test("flush reports failure when the save fails", async () => {
  const { queue } = setup(async () => {
    throw new Error("x");
  });
  queue.edit("bad");
  assert.equal(await queue.flush(), false);
});

test("cancel with nothing pending keeps the saved status", async () => {
  const { clock, queue } = setup(async () => {});
  queue.edit("a");
  await clock.advance(2000);
  assert.equal(queue.status, "saved");
  queue.cancel();
  assert.equal(queue.status, "saved");
});

test("cancel drops a pending edit (e.g. the draft became invalid)", async () => {
  const sent: string[] = [];
  const { clock, queue } = setup(async (p) => void sent.push(p));
  queue.edit("a");
  queue.cancel();
  await clock.advance(5000);
  assert.deepEqual(sent, []);
  assert.equal(queue.status, "idle");
});
