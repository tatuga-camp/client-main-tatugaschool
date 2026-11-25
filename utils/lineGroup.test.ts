import { test } from "node:test";
import assert from "node:assert/strict";
import { LineGroupOnSubject } from "../interfaces/LineGroupOnSubject";
import {
  LINE_GROUP_DISMISSED_KEY,
  browserSessionStorage,
  lineGroupDisplayName,
  nextPendingLineGroup,
  readDismissedLineGroups,
  shouldResetLineConnect,
  verifiedLineGroups,
  writeDismissedLineGroups,
} from "./lineGroup";

function link(overrides: Partial<LineGroupOnSubject>): LineGroupOnSubject {
  return {
    id: "link-1",
    createAt: "2026-11-25T08:00:00.000Z",
    updateAt: "2026-11-25T08:00:00.000Z",
    lineGroupId: "C123a91f",
    groupName: null,
    isVerify: false,
    verifyToken: "token",
    verifyExpireAt: "2026-11-26T08:00:00.000Z",
    verifiedAt: null,
    allowAssignment: true,
    allowMorningSummary: true,
    allowAnnouncement: true,
    allowAi: true,
    subjectId: "subject-1",
    schoolId: "school-1",
    ...overrides,
  };
}

test("lineGroupDisplayName: uses the group name when there is one", () => {
  assert.equal(
    lineGroupDisplayName(
      { groupName: "ม.2/1 ผู้ปกครอง", lineGroupId: "C123a91f" },
      "th",
    ),
    "ม.2/1 ผู้ปกครอง",
  );
});

test("lineGroupDisplayName: falls back to the last 4 chars of the id", () => {
  const unnamed = { groupName: null, lineGroupId: "C123a91f" };
  assert.equal(lineGroupDisplayName(unnamed, "th"), "กลุ่ม LINE …a91f");
  assert.equal(lineGroupDisplayName(unnamed, "en"), "LINE group …a91f");
});

test("lineGroupDisplayName: a blank name is treated as missing", () => {
  const blank = { groupName: "   ", lineGroupId: "C123a91f" };
  assert.equal(lineGroupDisplayName(blank, "th"), "กลุ่ม LINE …a91f");
  assert.equal(lineGroupDisplayName(blank, "en"), "LINE group …a91f");
});

test("verifiedLineGroups: only verified links", () => {
  const out = verifiedLineGroups([
    link({ id: "a", isVerify: true, verifyToken: null }),
    link({ id: "b" }),
    link({ id: "c", isVerify: true, verifyToken: null }),
  ]);
  assert.deepEqual(
    out.map((l) => l.id),
    ["a", "c"],
  );
});

test("verifiedLineGroups: undefined gives an empty list", () => {
  assert.deepEqual(verifiedLineGroups(undefined), []);
});

test("nextPendingLineGroup: oldest pending link that is not dismissed", () => {
  const links = [
    link({ id: "verified", isVerify: true, verifyToken: null }),
    link({ id: "newer", createAt: "2026-11-25T10:00:00.000Z" }),
    link({ id: "older", createAt: "2026-11-25T09:00:00.000Z" }),
  ];
  assert.equal(nextPendingLineGroup(links, [])?.id, "older");
  assert.equal(nextPendingLineGroup(links, ["older"])?.id, "newer");
});

test("nextPendingLineGroup: null when all dismissed or none pending", () => {
  const links = [
    link({ id: "verified", isVerify: true, verifyToken: null }),
    link({ id: "pending" }),
  ];
  assert.equal(nextPendingLineGroup(links, ["pending"]), null);
  assert.equal(nextPendingLineGroup([links[0]], []), null);
  assert.equal(nextPendingLineGroup([], []), null);
  assert.equal(nextPendingLineGroup(undefined, []), null);
});

test("nextPendingLineGroup: a pending link without a token is ignored", () => {
  const links = [
    link({ id: "no-token", verifyToken: null }),
    link({ id: "ok", createAt: "2026-11-25T12:00:00.000Z" }),
  ];
  assert.equal(nextPendingLineGroup(links, [])?.id, "ok");
  assert.equal(nextPendingLineGroup([links[0]], []), null);
});

// ---- edge cases beyond the plan's list ----

test("lineGroupDisplayName: an empty name is treated as missing", () => {
  const empty = { groupName: "", lineGroupId: "C123a91f" };
  assert.equal(lineGroupDisplayName(empty, "en"), "LINE group …a91f");
});

test("lineGroupDisplayName: tabs and newlines only count as blank", () => {
  const blank = { groupName: "\n\t  ", lineGroupId: "C123a91f" };
  assert.equal(lineGroupDisplayName(blank, "th"), "กลุ่ม LINE …a91f");
});

test("lineGroupDisplayName: surrounding whitespace is trimmed off a real name", () => {
  assert.equal(
    lineGroupDisplayName(
      { groupName: "  ม.2/1 นักเรียน \n", lineGroupId: "C123a91f" },
      "en",
    ),
    "ม.2/1 นักเรียน",
  );
});

test("lineGroupDisplayName: an emoji-only name is a name, not the fallback", () => {
  assert.equal(
    lineGroupDisplayName({ groupName: "🎉🎉", lineGroupId: "C123a91f" }, "en"),
    "🎉🎉",
  );
});

test("lineGroupDisplayName: a 100-character name comes back whole (the card truncates, not the helper)", () => {
  const long = "ก".repeat(100);
  assert.equal(
    lineGroupDisplayName({ groupName: long, lineGroupId: "C123a91f" }, "th"),
    long,
  );
});

test("lineGroupDisplayName: an id shorter than 4 chars, or empty, does not throw", () => {
  assert.equal(
    lineGroupDisplayName({ groupName: null, lineGroupId: "C1" }, "en"),
    "LINE group …C1",
  );
  assert.equal(
    lineGroupDisplayName({ groupName: null, lineGroupId: "" }, "th"),
    "กลุ่ม LINE …",
  );
});

test("lineGroupDisplayName: two unnamed groups with different ids get different labels", () => {
  assert.notEqual(
    lineGroupDisplayName({ groupName: null, lineGroupId: "Caaaa1111" }, "en"),
    lineGroupDisplayName({ groupName: null, lineGroupId: "Caaaa2222" }, "en"),
  );
});

test("verifiedLineGroups: empty list, and a list with no verified link, give []", () => {
  assert.deepEqual(verifiedLineGroups([]), []);
  assert.deepEqual(
    verifiedLineGroups([link({ id: "p1" }), link({ id: "p2" })]),
    [],
  );
});

test("verifiedLineGroups: keeps order and does not mutate the input", () => {
  const input = [
    link({ id: "z", isVerify: true, verifyToken: null }),
    link({ id: "p" }),
    link({ id: "a", isVerify: true, verifyToken: null }),
  ];
  const snapshot = JSON.stringify(input);
  const out = verifiedLineGroups(input);
  assert.deepEqual(
    out.map((l) => l.id),
    ["z", "a"],
  );
  assert.equal(JSON.stringify(input), snapshot);
  assert.equal(out[0], input[0]);
});

test("verifiedLineGroups: a verified link that still carries a token counts as verified", () => {
  const out = verifiedLineGroups([link({ id: "a", isVerify: true })]);
  assert.equal(out.length, 1);
});

test("nextPendingLineGroup: a verified link is never offered, even with a leftover token", () => {
  assert.equal(
    nextPendingLineGroup([link({ id: "v", isVerify: true })], []),
    null,
  );
});

test("nextPendingLineGroup: an empty-string token is ignored like a null one", () => {
  assert.equal(
    nextPendingLineGroup([link({ id: "e", verifyToken: "" })], []),
    null,
  );
});

test("nextPendingLineGroup: does not reorder the caller's list", () => {
  const links = [
    link({ id: "newer", createAt: "2026-11-25T10:00:00.000Z" }),
    link({ id: "older", createAt: "2026-11-25T09:00:00.000Z" }),
  ];
  nextPendingLineGroup(links, []);
  assert.deepEqual(
    links.map((l) => l.id),
    ["newer", "older"],
  );
});

test("nextPendingLineGroup: three pending links (the cap) are offered one at a time, oldest first", () => {
  const links = [
    link({ id: "p3", createAt: "2026-11-25T12:00:00.000Z" }),
    link({ id: "p1", createAt: "2026-11-25T10:00:00.000Z" }),
    link({ id: "p2", createAt: "2026-11-25T11:00:00.000Z" }),
  ];
  const seen: string[] = [];
  for (let i = 0; i < 4; i++) {
    const next = nextPendingLineGroup(links, seen);
    if (!next) break;
    seen.push(next.id);
  }
  assert.deepEqual(seen, ["p1", "p2", "p3"]);
  assert.equal(nextPendingLineGroup(links, seen), null);
});

test("nextPendingLineGroup: duplicate and unknown dismissed ids are harmless", () => {
  const links = [
    link({ id: "a" }),
    link({ id: "b", createAt: "2026-11-25T09:00:00.000Z" }),
  ];
  assert.equal(nextPendingLineGroup(links, ["a", "a", "gone", ""])?.id, "b");
});

test("nextPendingLineGroup: same createAt keeps the server's order (stable)", () => {
  const links = [link({ id: "first" }), link({ id: "second" })];
  assert.equal(nextPendingLineGroup(links, [])?.id, "first");
});

test("nextPendingLineGroup: a dismissed link that the server later replaced (new id) is offered again", () => {
  // The 4th pending request replaces the oldest: same group, new link id.
  const replaced = [link({ id: "link-new", lineGroupId: "C123a91f" })];
  assert.equal(nextPendingLineGroup(replaced, ["link-old"])?.id, "link-new");
});

// ---- "Later" lasts for the browser session (sessionStorage) ----

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}

const brokenStorage = {
  getItem(): string | null {
    throw new Error("SecurityError: storage is not available");
  },
  setItem(): void {
    throw new Error("QuotaExceededError");
  },
};

test("dismissed ids: the storage key is line-group-dismissed", () => {
  assert.equal(LINE_GROUP_DISMISSED_KEY, "line-group-dismissed");
});

test("dismissed ids: written as a JSON array of ids and read back", () => {
  const storage = memoryStorage();
  writeDismissedLineGroups(storage, ["a", "b"]);
  assert.equal(storage.items.get("line-group-dismissed"), '["a","b"]');
  assert.deepEqual(readDismissedLineGroups(storage), ["a", "b"]);
});

test("dismissed ids: nothing stored reads as an empty list", () => {
  assert.deepEqual(readDismissedLineGroups(memoryStorage()), []);
});

test("dismissed ids: a dismissed link stays dismissed after a reload (new state, same storage)", () => {
  const storage = memoryStorage();
  const links = [
    link({ id: "p1", createAt: "2026-11-25T09:00:00.000Z" }),
    link({ id: "p2", createAt: "2026-11-25T10:00:00.000Z" }),
  ];
  writeDismissedLineGroups(storage, ["p1"]);
  // After a reload the page starts from what the session stored.
  const afterReload = readDismissedLineGroups(storage);
  assert.equal(nextPendingLineGroup(links, afterReload)?.id, "p2");
});

test("dismissed ids: no storage at all (server render, blocked storage) reads empty and writes nothing", () => {
  for (const storage of [null, undefined]) {
    assert.deepEqual(readDismissedLineGroups(storage), []);
    assert.doesNotThrow(() => writeDismissedLineGroups(storage, ["a"]));
  }
});

test("dismissed ids: a storage that throws is treated as empty and never breaks the page", () => {
  assert.deepEqual(readDismissedLineGroups(brokenStorage), []);
  assert.doesNotThrow(() => writeDismissedLineGroups(brokenStorage, ["a"]));
});

test("dismissed ids: a corrupt or foreign value reads as empty", () => {
  for (const value of ["", "not json", "{", '{"a":1}', '"a"', "null", "42"]) {
    const storage = memoryStorage({ "line-group-dismissed": value });
    assert.deepEqual(readDismissedLineGroups(storage), [], value);
  }
});

test("dismissed ids: non-string entries are dropped, strings are kept", () => {
  const storage = memoryStorage({
    "line-group-dismissed": '["a", 1, null, {"id":"x"}, "b", ""]',
  });
  assert.deepEqual(readDismissedLineGroups(storage), ["a", "b"]);
});

test("dismissed ids: writing removes duplicates and keeps the order", () => {
  const storage = memoryStorage();
  writeDismissedLineGroups(storage, ["a", "b", "a"]);
  assert.equal(storage.items.get("line-group-dismissed"), '["a","b"]');
});

test("dismissed ids: other keys in the same storage are left alone", () => {
  const storage = memoryStorage({ other: "keep" });
  writeDismissedLineGroups(storage, ["a"]);
  assert.equal(storage.items.get("other"), "keep");
});

// ---- the connect (QR) popup closes itself once a pending link shows up ----

test("connect popup: an open popup is reset as soon as there is a pending link to confirm", () => {
  assert.equal(shouldResetLineConnect(true, link({ id: "p1" })), true);
});

test("connect popup: it stays open while nothing is waiting for confirmation", () => {
  assert.equal(shouldResetLineConnect(true, null), false);
});

test("connect popup: a closed popup needs no reset, with or without a pending link", () => {
  assert.equal(shouldResetLineConnect(false, null), false);
  assert.equal(shouldResetLineConnect(false, link({ id: "p1" })), false);
});

test("connect popup: once reset it does not come back after Confirm, Deny or Later", () => {
  const pending = link({ id: "p1" });
  // The teacher opens the QR popup, then the code typed in LINE arrives.
  let open = true;
  if (shouldResetLineConnect(open, nextPendingLineGroup([pending], []))) {
    open = false;
  }
  assert.equal(open, false);
  // Later: the link is dismissed. Confirm / Deny: the link leaves the pending list.
  for (const next of [
    nextPendingLineGroup([pending], ["p1"]),
    nextPendingLineGroup([link({ id: "p1", isVerify: true })], []),
    nextPendingLineGroup([], []),
  ]) {
    assert.equal(next, null);
    assert.equal(open, false);
    assert.equal(shouldResetLineConnect(open, next), false);
  }
});

// ---- more on "Later" for the browser session ----

test("browserSessionStorage: null where there is no window (server render)", () => {
  assert.equal(typeof (globalThis as any).window, "undefined");
  assert.equal(browserSessionStorage(), null);
});

test("browserSessionStorage: the tab's sessionStorage in a browser, and null when the browser refuses access to it", () => {
  const holder = globalThis as any;
  const storage = memoryStorage();
  try {
    holder.window = { sessionStorage: storage };
    assert.equal(browserSessionStorage(), storage);
    // Safari private mode / blocked site data: reading the property throws.
    holder.window = Object.defineProperty({}, "sessionStorage", {
      get() {
        throw new Error("SecurityError: The operation is insecure.");
      },
    });
    assert.equal(browserSessionStorage(), null);
    assert.deepEqual(readDismissedLineGroups(browserSessionStorage()), []);
    assert.doesNotThrow(() =>
      writeDismissedLineGroups(browserSessionStorage(), ["a"]),
    );
  } finally {
    delete holder.window;
  }
});

test("dismissed ids: a full storage (write throws, read works) keeps what was stored before", () => {
  const storage = {
    ...memoryStorage({ "line-group-dismissed": '["a"]' }),
    setItem(): void {
      throw new Error("QuotaExceededError");
    },
  };
  assert.doesNotThrow(() => writeDismissedLineGroups(storage, ["a", "b"]));
  assert.deepEqual(readDismissedLineGroups(storage), ["a"]);
});

test("dismissed ids: array-like objects and nested arrays are not taken for a list of ids", () => {
  for (const value of ['{"length":1,"0":"a"}', '[["a"]]', "[[]]", "[{}]"]) {
    const storage = memoryStorage({ "line-group-dismissed": value });
    assert.deepEqual(readDismissedLineGroups(storage), [], value);
  }
});

test("dismissed ids: an empty list is written as [] and read back as empty", () => {
  const storage = memoryStorage({ "line-group-dismissed": '["a"]' });
  writeDismissedLineGroups(storage, []);
  assert.equal(storage.items.get("line-group-dismissed"), "[]");
  assert.deepEqual(readDismissedLineGroups(storage), []);
});

test("dismissed ids: the caller's list is not changed by writing it", () => {
  const ids = ["a", "b", "a"];
  writeDismissedLineGroups(memoryStorage(), ids);
  assert.deepEqual(ids, ["a", "b", "a"]);
});

// The subject page keeps the dismissed ids in state, starting from the session
// storage, and writes every change back. This follows that sequence.
function pageSession(storage: Parameters<typeof readDismissedLineGroups>[0]) {
  let dismissed = readDismissedLineGroups(storage);
  return {
    next: (links: LineGroupOnSubject[]) =>
      nextPendingLineGroup(links, dismissed),
    later(id: string) {
      if (dismissed.includes(id)) return;
      dismissed = [...dismissed, id];
      writeDismissedLineGroups(storage, dismissed);
    },
  };
}

const threePending = [
  link({ id: "p1", createAt: "2026-11-25T09:00:00.000Z" }),
  link({ id: "p2", createAt: "2026-11-25T10:00:00.000Z" }),
  link({ id: "p3", createAt: "2026-11-25T11:00:00.000Z" }),
];

test('"Later" on all three pending links survives a reload of the same tab, and a new tab starts fresh', () => {
  const storage = memoryStorage();
  const page = pageSession(storage);
  for (const expected of ["p1", "p2", "p3"]) {
    const offered = page.next(threePending);
    assert.equal(offered?.id, expected);
    page.later(expected);
  }
  assert.equal(page.next(threePending), null);
  assert.equal(storage.items.get("line-group-dismissed"), '["p1","p2","p3"]');
  // Reload: new state, same storage.
  assert.equal(pageSession(storage).next(threePending), null);
  // Another tab has its own sessionStorage.
  assert.equal(pageSession(memoryStorage()).next(threePending)?.id, "p1");
});

test('"Later" after a reload adds to the ids already stored instead of replacing them', () => {
  const storage = memoryStorage({ "line-group-dismissed": '["p1"]' });
  const page = pageSession(storage);
  assert.equal(page.next(threePending)?.id, "p2");
  page.later("p2");
  assert.equal(storage.items.get("line-group-dismissed"), '["p1","p2"]');
});

test('"Later" with storage that throws, or none: the popups still step through until the page reloads', () => {
  for (const storage of [brokenStorage, null]) {
    const page = pageSession(storage);
    page.later("p1");
    assert.equal(page.next(threePending)?.id, "p2");
    page.later("p2");
    page.later("p3");
    assert.equal(page.next(threePending), null);
    // Nothing was stored, so a reload offers them again.
    assert.equal(pageSession(storage).next(threePending)?.id, "p1");
  }
});

test('"Later" with malformed stored JSON: the page starts with nothing dismissed and repairs the value on the next "Later"', () => {
  const storage = memoryStorage({ "line-group-dismissed": '{"p1":true' });
  const page = pageSession(storage);
  assert.equal(page.next(threePending)?.id, "p1");
  page.later("p1");
  assert.equal(storage.items.get("line-group-dismissed"), '["p1"]');
  assert.equal(pageSession(storage).next(threePending)?.id, "p2");
});

// ---- connect popup: more sequences ----

test("connect popup: opened while the only pending link is dismissed it stays open; a code typed in another group then resets it", () => {
  const dismissed = ["p1"];
  const first = link({ id: "p1", createAt: "2026-11-25T09:00:00.000Z" });
  let open = true;
  assert.equal(
    shouldResetLineConnect(open, nextPendingLineGroup([first], dismissed)),
    false,
  );
  const second = link({
    id: "p2",
    lineGroupId: "Cother",
    createAt: "2026-11-25T10:00:00.000Z",
  });
  const pending = nextPendingLineGroup([first, second], dismissed);
  assert.equal(pending?.id, "p2");
  if (shouldResetLineConnect(open, pending)) open = false;
  assert.equal(open, false);
});

test("connect popup: verified groups alone never reset it", () => {
  const verified = [
    link({ id: "v1", isVerify: true, verifyToken: null }),
    link({ id: "v2", isVerify: true, verifyToken: null }),
  ];
  assert.equal(
    shouldResetLineConnect(true, nextPendingLineGroup(verified, [])),
    false,
  );
});

// ---- the link type carries verifiedAt (string | null) ----

type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

test("LineGroupOnSubject.verifiedAt is a required string | null", () => {
  // Compile-time only: a type checker that reads this file (an editor, or tsc
  // with test files included) rejects these two lines if the field is missing,
  // optional or of another type. `bun run typecheck` skips test files.
  const exact: Same<LineGroupOnSubject["verifiedAt"], string | null> = true;
  const required: Same<
    Pick<LineGroupOnSubject, "verifiedAt">,
    { verifiedAt: string | null }
  > = true;
  assert.ok(exact && required);
  assert.equal(link({}).verifiedAt, null);
  assert.equal(
    link({ isVerify: true, verifiedAt: "2026-11-25T08:05:00.000Z" }).verifiedAt,
    "2026-11-25T08:05:00.000Z",
  );
});

test("links with a null verifiedAt (verified before the field existed) are still verified, in server order", () => {
  const links = [
    link({ id: "old-1", isVerify: true, verifiedAt: null }),
    link({ id: "new", isVerify: true, verifiedAt: "2026-11-25T08:05:00.000Z" }),
    link({ id: "old-2", isVerify: true, verifiedAt: null }),
  ];
  assert.deepEqual(
    verifiedLineGroups(links).map((item) => item.id),
    ["old-1", "new", "old-2"],
  );
  assert.equal(nextPendingLineGroup(links, []), null);
});
