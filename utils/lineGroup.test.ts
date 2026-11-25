import { test } from "node:test";
import assert from "node:assert/strict";
import { LineGroupOnSubject } from "../interfaces/LineGroupOnSubject";
import {
  lineGroupDisplayName,
  nextPendingLineGroup,
  verifiedLineGroups,
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
