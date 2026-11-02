import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classroomUiLanguage,
  subjectUiLanguage,
} from "../data/languages";

// Spec 2026-11-02-archived-subject-block: students can no longer open an
// archived subject, and teachers are told plainly what archiving does.

test("archiveSubjectEffects lists the four consequences in both languages", () => {
  for (const lang of ["en", "th"] as const) {
    const effects = subjectUiLanguage.archiveSubjectEffects(lang);
    assert.equal(effects.length, 4, lang);
    for (const line of effects) assert.ok(line.trim().length > 0, lang);
  }
});

test("archiveSubjectEffects says students can't open it, first", () => {
  assert.match(
    subjectUiLanguage.archiveSubjectEffects("en")[0],
    /Students can't open this subject/,
  );
});

test("no archive copy still tells teachers students can open it", () => {
  const texts = (["en", "th"] as const).flatMap((lang) => [
    subjectUiLanguage.archiveSubjectLead(lang),
    subjectUiLanguage.archivedBanner(lang),
    ...subjectUiLanguage.archiveSubjectEffects(lang),
  ]);
  for (const text of texts) {
    assert.doesNotMatch(text, /students can still/i);
    assert.doesNotMatch(text, /นักเรียนยังเปิดดูได้/);
  }
});

test("the archived banner says students can't open it", () => {
  assert.match(subjectUiLanguage.archivedBanner("en"), /students can't open/i);
});

test("the class archive hint says students lose all of the class's subjects", () => {
  assert.match(
    classroomUiLanguage.archiveHint("en"),
    /students can't open any of them/i,
  );
});
