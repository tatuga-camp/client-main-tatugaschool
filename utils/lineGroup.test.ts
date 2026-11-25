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
