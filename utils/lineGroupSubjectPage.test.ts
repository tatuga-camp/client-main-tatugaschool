// Edge cases for the second spec amendments on the subject page:
//   B1 — an archived subject shows no LINE popup and has a disabled header button
//   B3 — "Later" is stored as "<link id>:<link updateAt>" and is forgotten when
//        the group asks again (the server touches the link's updateAt)
// The page itself (pages/subject/[subjectId]/index.tsx) cannot be rendered
// here, so its LINE state is followed by a small model built from the same
// helpers, called the way the page calls them; the last tests read the page's
// source to pin that it is wired the way the model assumes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LineGroupOnSubject } from "../interfaces/LineGroupOnSubject";
import {
  dismissLineGroup,
  lineGroupDismissalKey,
  nextPendingLineGroup,
  readDismissedLineGroups,
  shouldResetLineConnect,
  subjectLinePopup,
  toggleLineConnect,
  verifiedLineGroups,
  writeDismissedLineGroups,
} from "./lineGroup";

const KEY = "line-group-dismissed";
const AT = "2026-11-25T08:00:00.000Z";
const LATER_1 = "2026-11-25T08:30:00.000Z";
const LATER_2 = "2026-11-25T09:15:00.000Z";

function link(overrides: Partial<LineGroupOnSubject>): LineGroupOnSubject {
  return {
    id: "link-1",
    createAt: AT,
    updateAt: AT,
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

const pending = (id: string, overrides: Partial<LineGroupOnSubject> = {}) =>
  link({
    id,
    createAt: `2026-11-25T0${id.slice(-1)}:00:00.000Z`,
    ...overrides,
  });
const verified = (id: string, overrides: Partial<LineGroupOnSubject> = {}) =>
  link({ id, isVerify: true, verifyToken: null, verifiedAt: AT, ...overrides });
const asksAgain = (item: LineGroupOnSubject, updateAt: string) => ({
  ...item,
  updateAt,
});

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  const writes: string[] = [];
  return {
    items,
    writes,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes.push(value);
      items.set(key, value);
    },
  };
}

// The LINE part of the subject page: the connect popup's open state, the
// dismissals kept in state and written to sessionStorage, the reset effect and
// the popup that ends up on screen.
function subjectPage(storage: StorageLike | null) {
  let open = false;
  let dismissed = readDismissedLineGroups(storage);
  let links: LineGroupOnSubject[] | undefined;
  let archived = false;
  let popup: "confirm" | "connect" | null = null;
  let offered: LineGroupOnSubject | null = null;

  const render = () => {
    for (let pass = 0; pass < 5; pass++) {
      offered = nextPendingLineGroup(links, dismissed);
      popup = subjectLinePopup({
        archived,
        isConnectOpen: open,
        pending: offered,
      });
      // useEffect(() => { if (resetLineConnect) setTriggerLineConnect(false) })
      if (!shouldResetLineConnect(open, offered, archived)) return;
      open = false;
    }
    assert.fail("the page never settled");
  };

  const page = {
    show(next: LineGroupOnSubject[] | undefined, isArchived = archived) {
      links = next;
      archived = isArchived;
      render();
      return page;
    },
    clickHeaderButton() {
      // The button is disabled on an archived subject; a script can still
      // call its handler, which is what this does.
      open = toggleLineConnect(open, archived);
      render();
      return page;
    },
    later() {
      assert.equal(popup, "confirm", "Later is only on the confirm popup");
      const next = dismissLineGroup(dismissed, offered!);
      if (next !== dismissed) {
        dismissed = next;
        writeDismissedLineGroups(storage, next);
      }
      render();
      return page;
    },
    get popup() {
      return popup;
    },
    get offeredId() {
      return popup === "confirm" ? (offered?.id ?? null) : null;
    },
    get connectOpen() {
      return open;
    },
    get polling() {
      return open ? 15_000 : false;
    },
    get dismissed() {
      return dismissed;
    },
    get headerButton() {
      return {
        disabled: archived,
        connected: verifiedLineGroups(links).length > 0,
      };
    },
  };
  return page;
}

// ---- B3: "Later" and the group asking again ----

test('B3: every time the group asks again the confirm popup returns, and only the newest "Later" of a link is kept', () => {
  const storage = memoryStorage();
  const page = subjectPage(storage);
  let p1 = pending("p1");
  for (const updateAt of [LATER_1, LATER_2, "2026-11-25T10:00:00.000Z"]) {
    page.show([p1]);
    assert.equal(page.offeredId, "p1");
    page.later();
    assert.equal(page.popup, null);
    p1 = asksAgain(p1, updateAt);
  }
  assert.equal(storage.items.get(KEY), JSON.stringify([`p1:${LATER_2}`]));
  page.show([p1]);
  assert.equal(page.offeredId, "p1");
});

test("B3: the server's touch failed (updateAt unchanged) — the link simply stays dismissed, nothing breaks", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1")]);
  page.later();
  // The group typed the code again but the touch was rejected: same row back.
  page.show([pending("p1")]);
  assert.equal(page.popup, null);
  assert.equal(subjectPage(storage).show([pending("p1")]).popup, null);
});

test("B3: an updateAt that goes back to an already dismissed value is still dismissed only if that entry is the stored one", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  page.later(); // p1:AT
  page.show([pending("p1", { updateAt: LATER_1 })]);
  page.later(); // replaces p1:AT with p1:LATER_1
  page.show([pending("p1")]); // a stale response with the old updateAt
  assert.equal(page.offeredId, "p1");
  assert.deepEqual(page.dismissed, [`p1:${LATER_1}`]);
});

test("B3: the group asks again while a co-teacher confirms — a verified link is never offered, whatever its updateAt", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  page.later();
  page.show([verified("p1", { updateAt: LATER_1 })]);
  assert.equal(page.popup, null);
  assert.equal(page.headerButton.connected, true);
  // A verified link that still carries a token (written between the two
  // server steps) is not offered either.
  page.show([verified("p1", { updateAt: LATER_2, verifyToken: "token" })]);
  assert.equal(page.popup, null);
});

test("B3: a confirm that the server reverted (cap reached) leaves a pending link with a new updateAt — it is offered again", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  page.later();
  page.show([verified("p1", { updateAt: LATER_1 })]);
  assert.equal(page.popup, null);
  page.show([pending("p1", { updateAt: LATER_2 })]);
  assert.equal(page.offeredId, "p1");
});

test("B3: the group asks again while a co-teacher denies — the link is gone, its stale entry hides nothing else", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1"), pending("p2")]);
  page.later();
  assert.equal(page.offeredId, "p2");
  // p1 denied; the same group then asks again and gets a new link.
  page.show([pending("p2"), pending("p3", { lineGroupId: "C123a91f" })]);
  assert.equal(page.offeredId, "p2");
  page.later();
  assert.equal(page.offeredId, "p3");
  assert.deepEqual(readDismissedLineGroups(storage), [`p1:${AT}`, `p2:${AT}`]);
});

test("B3: the link was denied and nothing is pending — no popup, and the stored entry does not throw on the next load", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1")]);
  page.later();
  for (const links of [[], undefined, [verified("v1")]]) {
    assert.equal(page.show(links).popup, null);
    assert.equal(subjectPage(storage).show(links).popup, null);
  }
});

test('B3: "Later" on one link does not dismiss another link with the same updateAt, or one whose id starts the same', () => {
  const page = subjectPage(memoryStorage()).show([
    pending("p1"),
    pending("p12", { createAt: "2026-11-25T02:00:00.000Z" }),
  ]);
  assert.equal(page.offeredId, "p1");
  page.later();
  assert.equal(page.offeredId, "p12");
  page.later();
  assert.equal(page.popup, null);
  // p1 asks again: only p1 comes back, and its new entry leaves p12's alone.
  page.show([asksAgain(pending("p1"), LATER_1), pending("p12")]);
  assert.equal(page.offeredId, "p1");
  page.later();
  assert.equal(page.popup, null);
  assert.deepEqual(page.dismissed, [`p12:${AT}`, `p1:${LATER_1}`]);
});

test("B3: a session that holds old bare ids ignores them, and the first Later writes the new format without them", () => {
  const storage = memoryStorage({ [KEY]: '["p1","p2"]' });
  const page = subjectPage(storage).show([pending("p1"), pending("p2")]);
  assert.equal(page.offeredId, "p1");
  page.later();
  assert.equal(storage.items.get(KEY), JSON.stringify([`p1:${AT}`]));
  assert.equal(page.offeredId, "p2");
  // Reload: p1 stays dismissed in the new format, p2 (old bare id) is offered.
  assert.equal(
    subjectPage(storage).show([pending("p1"), pending("p2")]).offeredId,
    "p2",
  );
});

test("B3: old bare ids mixed with new entries — only the new entries count", () => {
  const storage = memoryStorage({
    [KEY]: JSON.stringify(["p1", `p2:${AT}`, "p3"]),
  });
  const page = subjectPage(storage).show([
    pending("p1"),
    pending("p2"),
    pending("p3"),
  ]);
  assert.equal(page.offeredId, "p1");
  page.later();
  assert.equal(page.offeredId, "p3");
  assert.equal(
    storage.items.get(KEY),
    JSON.stringify([`p2:${AT}`, `p1:${AT}`]),
  );
});

test("B3: a bare id that equals a link's whole id:updateAt key is not possible to confuse — matching is on the full string", () => {
  // An entry is only ever compared with "<id>:<updateAt>" of a current link.
  const p1 = pending("p1");
  for (const entry of [
    "p1",
    "p1:",
    `p1:${AT} `,
    ` p1:${AT}`,
    `P1:${AT}`,
    `p1:${AT.slice(0, -1)}`,
  ]) {
    assert.equal(nextPendingLineGroup([p1], [entry])?.id, "p1", entry);
  }
  assert.equal(nextPendingLineGroup([p1], [lineGroupDismissalKey(p1)]), null);
});

test("B3: stored values that are not a list of id:updateAt strings read as nothing dismissed, entry by entry", () => {
  const good = `p1:${AT}`;
  const cases: [string, string[]][] = [
    ["", []],
    ["null", []],
    ["true", []],
    ["42", []],
    ['"p1:x"', []],
    ["{}", []],
    [`{"0":"${good}","length":1}`, []],
    ["[", []],
    [`["${good}"`, []],
    ["[]", []],
    ['["p1"]', []],
    ['[":"]', []],
    ['[":x"]', []],
    ['["p1:"]', []],
    ['[""]', []],
    [`[null,1,true,{},["${good}"],"${good}"]`, [good]],
    [`["${good}","${good}"]`, [good, good]],
    ['["a:b:c:d"]', ["a:b:c:d"]],
  ];
  for (const [raw, expected] of cases) {
    const storage = memoryStorage(raw === "" ? {} : { [KEY]: raw });
    assert.deepEqual(readDismissedLineGroups(storage), expected, raw);
    // Whatever was stored, the page loads and offers what is not dismissed.
    const page = subjectPage(storage).show([pending("p1"), pending("p2")]);
    assert.equal(page.offeredId, expected.includes(good) ? "p2" : "p1", raw);
  }
});

test("B3: a duplicated entry in storage is written back once on the next Later", () => {
  const good = `p1:${AT}`;
  const storage = memoryStorage({ [KEY]: JSON.stringify([good, good]) });
  const page = subjectPage(storage).show([pending("p1"), pending("p2")]);
  assert.equal(page.offeredId, "p2");
  page.later();
  assert.equal(storage.items.get(KEY), JSON.stringify([good, `p2:${AT}`]));
});

test("B3: storage that throws on read, on write, or on both — Later still works until the page reloads", () => {
  const stored = JSON.stringify([`p1:${AT}`]);
  const readThrows: StorageLike = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {},
  };
  const kept = memoryStorage({ [KEY]: stored });
  const writeThrows: StorageLike = {
    getItem: kept.getItem,
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const bothThrow: StorageLike = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("SecurityError");
    },
  };
  const links = [pending("p1"), pending("p2")];

  for (const storage of [readThrows, bothThrow, null]) {
    const page = subjectPage(storage).show(links);
    assert.equal(page.offeredId, "p1");
    page.later();
    assert.equal(page.offeredId, "p2");
    page.later();
    assert.equal(page.popup, null);
    // The group asks again: the popup still returns.
    page.show([asksAgain(links[0], LATER_1), links[1]]);
    assert.equal(page.offeredId, "p1");
  }

  // Reads work, writes fail: what was stored before still counts, the new
  // dismissal lasts until the reload.
  const page = subjectPage(writeThrows).show(links);
  assert.equal(page.offeredId, "p2");
  page.later();
  assert.equal(page.popup, null);
  assert.equal(kept.items.get(KEY), stored);
  assert.equal(subjectPage(writeThrows).show(links).offeredId, "p2");
});

test("B3: a storage whose getItem returns a non-string does not break the page", () => {
  for (const value of [undefined, 0, {}, []]) {
    const storage = {
      getItem: () => value as unknown as string,
      setItem() {},
    };
    assert.doesNotThrow(() => readDismissedLineGroups(storage));
    assert.equal(subjectPage(storage).show([pending("p1")]).offeredId, "p1");
  }
});

test("B3: nothing is written to storage when nothing new is dismissed", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1")]);
  assert.equal(storage.writes.length, 0);
  page.later();
  assert.equal(storage.writes.length, 1);
  // Refetches, the group asking again, a confirm elsewhere: no writes.
  page.show([pending("p1")]);
  page.show([asksAgain(pending("p1"), LATER_1)]);
  page.show([verified("p1")]);
  page.show([]);
  assert.equal(storage.writes.length, 1);
});

test("B3: dismissLineGroup never changes the list it is given and keeps other links' entries in order", () => {
  const before = Object.freeze([`a:${AT}`, `p1:${AT}`, `b:${AT}`]) as string[];
  const after = dismissLineGroup(before, { id: "p1", updateAt: LATER_1 });
  assert.deepEqual(after, [`a:${AT}`, `b:${AT}`, `p1:${LATER_1}`]);
  assert.deepEqual(before, [`a:${AT}`, `p1:${AT}`, `b:${AT}`]);
  // Old bare ids of other links that slipped into state are left as they are;
  // they never match anything.
  assert.deepEqual(dismissLineGroup(["p1", "p2"], { id: "p1", updateAt: AT }), [
    "p1",
    "p2",
    `p1:${AT}`,
  ]);
});

// ---- B3 with the connect popup (A7) ----

test("B3 + A7: everything dismissed, connect popup open, the group asks again — the confirm popup returns and the connect popup is reset", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  page.later();
  page.clickHeaderButton();
  assert.equal(page.popup, "connect");
  assert.equal(page.polling, 15_000);
  page.show([asksAgain(pending("p1"), LATER_1)]);
  assert.equal(page.offeredId, "p1");
  assert.equal(page.connectOpen, false);
  assert.equal(page.polling, false);
  page.later();
  assert.equal(page.popup, null);
});

test("A7/B4 on the page: a pending link replaced by another in one refetch — the confirm popup moves to the new link", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  assert.equal(page.offeredId, "p1");
  page.show([pending("p2")]);
  assert.equal(page.offeredId, "p2");
  // Later on p2 must not be recorded against p1, and the other way round.
  page.later();
  assert.deepEqual(page.dismissed, [`p2:${AT}`]);
  assert.equal(page.show([pending("p1")]).offeredId, "p1");
});

test("A7/B4 on the page: a dismissed link replaced by another while the connect popup is open — confirm for the new one, connect reset", () => {
  const page = subjectPage(memoryStorage()).show([pending("p1")]);
  page.later();
  page.clickHeaderButton();
  assert.equal(page.popup, "connect");
  page.show([pending("p2")]);
  assert.equal(page.offeredId, "p2");
  assert.equal(page.connectOpen, false);
});

// ---- B1: archived subject ----

test("B1: the subject is archived while the confirm popup is open — the popup goes, nothing is dismissed or stored", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1")]);
  assert.equal(page.popup, "confirm");
  page.show([pending("p1")], true);
  assert.equal(page.popup, null);
  assert.deepEqual(page.dismissed, []);
  assert.equal(storage.writes.length, 0);
  // Restored: the link is still waiting, so the teacher is asked again.
  page.show([pending("p1")], false);
  assert.equal(page.offeredId, "p1");
});

test("B1: the subject is archived while the connect popup is open — its state is reset and polling stops; restoring does not bring it back", () => {
  const page = subjectPage(memoryStorage()).show([verified("v1")]);
  page.clickHeaderButton();
  assert.equal(page.popup, "connect");
  page.show([verified("v1")], true);
  assert.equal(page.popup, null);
  assert.equal(page.connectOpen, false);
  assert.equal(page.polling, false);
  page.show([verified("v1")], false);
  assert.equal(page.popup, null);
  assert.equal(page.connectOpen, false);
});

test("B1: archived with the connect popup open and a pending link arriving in the same refresh — no popup; restored, only the confirm popup shows", () => {
  const page = subjectPage(memoryStorage()).show([]);
  page.clickHeaderButton();
  page.show([pending("p1")], true);
  assert.equal(page.popup, null);
  assert.equal(page.connectOpen, false);
  page.show([pending("p1")], false);
  assert.equal(page.offeredId, "p1");
  page.later();
  // The connect popup was reset, so it is not waiting behind the confirm one.
  assert.equal(page.popup, null);
});

test("B1: on an archived subject the header button is disabled and its handler opens nothing, however often it is called", () => {
  const page = subjectPage(memoryStorage()).show([verified("v1")], true);
  assert.equal(page.headerButton.disabled, true);
  // It still reads CONNECTED when a verified group exists.
  assert.equal(page.headerButton.connected, true);
  for (let i = 0; i < 3; i++) {
    page.clickHeaderButton();
    assert.equal(page.connectOpen, false);
    assert.equal(page.popup, null);
    assert.equal(page.polling, false);
  }
  // Restored: one click opens it, as before.
  page.show([verified("v1")], false);
  assert.equal(page.headerButton.disabled, false);
  page.clickHeaderButton();
  assert.equal(page.popup, "connect");
});

test("B1: an archived subject with no verified group has a disabled button that does not read CONNECTED", () => {
  for (const links of [undefined, [], [pending("p1")]]) {
    const page = subjectPage(memoryStorage()).show(links, true);
    assert.deepEqual(page.headerButton, { disabled: true, connected: false });
    assert.equal(page.popup, null);
  }
});

test("B1: archive toggled repeatedly with links changing in between — never a popup while archived, never a stale connect popup after", () => {
  const page = subjectPage(memoryStorage()).show([]);
  page.clickHeaderButton();
  const steps: [LineGroupOnSubject[], boolean, string | null][] = [
    [[], true, null],
    [[pending("p1")], true, null],
    [[pending("p1")], false, "confirm"],
    [[pending("p1")], true, null],
    [[pending("p2")], true, null],
    [[], false, null],
    [[verified("p2")], true, null],
    [[verified("p2")], false, null],
  ];
  for (const [links, archived, expected] of steps) {
    page.show(links, archived);
    assert.equal(
      page.popup,
      expected,
      JSON.stringify([links.length, archived]),
    );
    assert.equal(page.connectOpen, false);
  }
});

test("B1: dismissals made before the subject was archived are still there after it is restored", () => {
  const storage = memoryStorage();
  const page = subjectPage(storage).show([pending("p1"), pending("p2")]);
  page.later();
  page.show([pending("p1"), pending("p2")], true);
  assert.equal(page.popup, null);
  page.show([pending("p1"), pending("p2")], false);
  assert.equal(page.offeredId, "p2");
  assert.equal(subjectPage(storage).show([pending("p1")]).popup, null);
});

test("B1: subjectLinePopup and shouldResetLineConnect agree — a reset never leaves the connect popup on screen", () => {
  for (const archived of [true, false]) {
    for (const isConnectOpen of [true, false]) {
      for (const item of [null, pending("p1")]) {
        const popup = subjectLinePopup({
          archived,
          isConnectOpen,
          pending: item,
        });
        const reset = shouldResetLineConnect(isConnectOpen, item, archived);
        if (reset) assert.notEqual(popup, "connect");
        if (popup === "connect") assert.equal(reset, false);
        if (archived) assert.equal(popup, null);
        // The connect popup shows exactly when it is open and stays open.
        assert.equal(popup === "connect", isConnectOpen && !reset);
      }
    }
  }
});

// ---- the page is wired the way the model above assumes ----

const squash = (source: string) => source.replace(/\s+/g, " ");
const pageSource = squash(
  readFileSync(
    join(__dirname, "..", "pages", "subject", "[subjectId]", "index.tsx"),
    "utf8",
  ),
);
const settingSource = squash(
  readFileSync(
    join(__dirname, "..", "components", "subject", "Setting.tsx"),
    "utf8",
  ),
);
const occurrences = (source: string, needle: string) =>
  source.split(needle).length - 1;

test("page wiring (B1): each LINE popup is rendered once, and only through subjectLinePopup", () => {
  assert.equal(occurrences(pageSource, "<VerifyConnectLine"), 1);
  assert.equal(occurrences(pageSource, "<QrCodeLineConnect"), 1);
  assert.match(
    pageSource,
    /\{subject\.data && linePopup === "connect" && \( <PopupLayout onClose=\{\(\) => setTriggerLineConnect\(false\)\}> <QrCodeLineConnect/,
  );
  assert.match(
    pageSource,
    /\{subject\.data && linePopup === "confirm" && pendingLineGroup && \( <PopupLayout onClose=\{\(\) => dismissPendingLineGroup\(pendingLineGroup\)\} > <VerifyConnectLine/,
  );
  assert.match(
    pageSource,
    /const linePopup = subjectLinePopup\(\{ archived, isConnectOpen: triggerLineConnect, pending: pendingLineGroup, \}\);/,
  );
  // No render condition left that looks at the open state directly.
  assert.ok(!/\{[^{}]*triggerLineConnect &&/.test(pageSource));
});

test("page wiring (B1): the open state is reset through shouldResetLineConnect with the archived flag of the subject", () => {
  assert.match(
    pageSource,
    /const archived = isSubjectArchived\(subject\.data\);/,
  );
  assert.match(
    pageSource,
    /const resetLineConnect = shouldResetLineConnect\( triggerLineConnect, pendingLineGroup, archived, \);/,
  );
  assert.match(
    pageSource,
    /useEffect\(\(\) => \{ if \(resetLineConnect\) setTriggerLineConnect\(false\); \}, \[resetLineConnect\]\);/,
  );
  assert.match(
    pageSource,
    /refetchInterval: triggerLineConnect \? 15_000 : false/,
  );
});

test("page wiring (B1): the header LINE button is disabled when archived, cannot open the popup, and still shows CONNECTED", () => {
  const button = pageSource.match(
    /<button onClick=\{\(\) => \{ setTriggerLineConnect\(\(prev\) => toggleLineConnect\(prev, archived\), \); \}\} disabled=\{archived\} aria-label="QR Code Subject"[^>]*> (.*?)<\/button>/,
  );
  assert.ok(button, "the header LINE button");
  assert.match(
    button[1],
    /\{verifiedLineGroups\(lineGroups\.data\)\.length > 0 \? \( <> CONNECTED <FaCheck \/> <\/> \) : \(/,
  );
  // setTriggerLineConnect is only ever given false, or the guarded toggle.
  const setters = pageSource.match(/setTriggerLineConnect\([^)]*\)?/g) ?? [];
  assert.ok(setters.length >= 3);
  for (const call of setters) {
    assert.ok(
      call === "setTriggerLineConnect(false)" ||
        call.startsWith("setTriggerLineConnect((prev)"),
      call,
    );
  }
});

test('page wiring (B3): "Later" and closing the confirm popup dismiss the offered link by id and updateAt, through dismissLineGroup', () => {
  assert.equal(
    occurrences(pageSource, "dismissPendingLineGroup(pendingLineGroup)"),
    2,
  );
  assert.ok(
    !pageSource.includes("dismissPendingLineGroup(pendingLineGroup.id)"),
  );
  assert.match(
    pageSource,
    /onLater=\{\(\) => dismissPendingLineGroup\(pendingLineGroup\)\}/,
  );
  assert.match(
    pageSource,
    /const next = dismissLineGroup\(dismissedLineGroups, link\); if \(next === dismissedLineGroups\) return; setDismissedLineGroups\(next\); writeDismissedLineGroups\(browserSessionStorage\(\), next\);/,
  );
  assert.match(
    pageSource,
    /\(\(\) => readDismissedLineGroups\(browserSessionStorage\(\)\)\);/,
  );
  assert.match(
    pageSource,
    /const pendingLineGroup = nextPendingLineGroup\( lineGroups\.data, dismissedLineGroups, \);/,
  );
  // The storage is only reached through the helpers.
  assert.ok(!pageSource.includes("sessionStorage."));
  assert.ok(!pageSource.includes("line-group-dismissed"));
});

test("settings wiring (A1/B4): the section is disabled by the subject's archived flag", () => {
  assert.match(
    settingSource,
    /<LineGroupSettings subjectId=\{subjectId\} disabled=\{subjectArchived\} \/>/,
  );
  assert.match(settingSource, /const subjectArchived = isSubjectArchived\(/);
});
