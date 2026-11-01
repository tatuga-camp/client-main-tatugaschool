import { test } from "node:test";
import assert from "node:assert/strict";
import {
  archiveSwitchState,
  isSubjectArchived,
  writableSubjects,
} from "./subjectArchive";

test("isSubjectArchived: only true when isAchieved is true", () => {
  assert.equal(isSubjectArchived({ isAchieved: true }), true);
  assert.equal(isSubjectArchived({ isAchieved: false }), false);
  assert.equal(isSubjectArchived({}), false);
  assert.equal(isSubjectArchived(null), false);
  assert.equal(isSubjectArchived(undefined), false);
});

const base = {
  subjectArchived: false,
  classArchived: false,
  roleSubject: "ADMIN" as const,
  roleSchool: "TEACHER" as const,
};

test("archiveSwitchState: hidden while roles are TEACHER/TEACHER", () => {
  const s = archiveSwitchState({
    ...base,
    roleSubject: "TEACHER",
    roleSchool: "TEACHER",
  });
  assert.equal(s.visible, false);
});

test("archiveSwitchState: visible for subject admin or school admin", () => {
  assert.equal(archiveSwitchState(base).visible, true);
  assert.equal(
    archiveSwitchState({ ...base, roleSubject: "TEACHER", roleSchool: "ADMIN" })
      .visible,
    true,
  );
});

test("archiveSwitchState: active subject", () => {
  const s = archiveSwitchState(base);
  assert.equal(s.checked, false);
  assert.equal(s.disabled, false);
  assert.equal(s.hint, null);
});

test("archiveSwitchState: archived subject can be un-archived", () => {
  const s = archiveSwitchState({ ...base, subjectArchived: true });
  assert.equal(s.checked, true);
  assert.equal(s.disabled, false);
});

test("archiveSwitchState: archived by class is checked and disabled", () => {
  const s = archiveSwitchState({
    ...base,
    subjectArchived: true,
    classArchived: true,
  });
  assert.equal(s.checked, true);
  assert.equal(s.disabled, true);
  assert.equal(s.hint, "classArchived");
});

test("writableSubjects drops archived subjects", () => {
  const out = writableSubjects([
    { id: "a" },
    { id: "b", isAchieved: true },
    { id: "c", isAchieved: false },
  ]);
  assert.deepEqual(
    out.map((s) => s.id),
    ["a", "c"],
  );
});
