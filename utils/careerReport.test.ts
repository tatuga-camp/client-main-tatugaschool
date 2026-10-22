import { test } from "node:test";
import assert from "node:assert/strict";
import {
  keySkills,
  localizeSector,
  localizeSkillTitle,
  strengthIds,
  summarizeSkills,
} from "./careerReport";

const e = (id: string, emphasis: number) => ({ id, emphasis });

test("keySkills keeps the two skills that stand out most, highest first", () => {
  assert.deepEqual(
    keySkills([e("a", 0.5), e("b", 2.3), e("c", -1), e("d", 1.1)]),
    [e("b", 2.3), e("d", 1.1)],
  );
});

test("keySkills leaves out skills that don't stand out", () => {
  assert.deepEqual(keySkills([e("a", 1.4), e("b", 0), e("c", -0.2)]), [
    e("a", 1.4),
  ]);
  assert.deepEqual(keySkills([e("a", Number.NaN)]), []);
});

const k = (id: string, avg: number) => ({ id, avg });

test("strengthIds picks skills above the student's own average", () => {
  // Average of 90, 60, 60 is 70.
  assert.deepEqual(
    strengthIds([k("a", 90), k("b", 60), k("c", 60)]),
    new Set(["a"]),
  );
});

test("strengthIds ignores non-finite averages and flat profiles", () => {
  assert.deepEqual(
    strengthIds([k("a", 80), k("b", Number.NaN), k("c", 40)]),
    new Set(["a"]),
  );
  assert.deepEqual(strengthIds([k("a", 70), k("b", 70)]), new Set());
});

test("summarizeSkills splits without overlap", () => {
  assert.deepEqual(summarizeSkills([]), { strongest: [], toGrow: [] });
  assert.deepEqual(summarizeSkills([k("a", 3)]), {
    strongest: [k("a", 3)],
    toGrow: [],
  });
  assert.deepEqual(summarizeSkills([k("a", 3), k("b", 5)]), {
    strongest: [k("b", 5), k("a", 3)],
    toGrow: [],
  });
  assert.deepEqual(summarizeSkills([k("a", 3), k("b", 5), k("c", 1)]), {
    strongest: [k("b", 5), k("a", 3)],
    toGrow: [k("c", 1)],
  });
  assert.deepEqual(
    summarizeSkills([k("a", 3), k("b", 5), k("c", 1), k("d", 2), k("e", 4)]),
    { strongest: [k("b", 5), k("e", 4)], toGrow: [k("c", 1), k("d", 2)] },
  );
});

test("summarizeSkills ignores non-finite averages", () => {
  assert.deepEqual(summarizeSkills([k("a", Number.NaN), k("b", 2)]), {
    strongest: [k("b", 2)],
    toGrow: [],
  });
});

test("localizeSector falls back to English per field", () => {
  const sector = {
    title: "Education careers",
    titleTh: "อาชีพด้านการศึกษา",
    picture: "p.png",
    blurhash: "LOW",
    description: "Teach.",
    careers: [
      { title: "High school teacher", titleTh: "ครูมัธยมศึกษา", description: "Teaches." },
    ],
  };
  assert.deepEqual(localizeSector(sector, "th"), {
    title: "อาชีพด้านการศึกษา",
    description: "Teach.",
    picture: "p.png",
    blurHash: "LOW",
    careers: [{ title: "ครูมัธยมศึกษา", description: "Teaches." }],
  });
  assert.equal(localizeSector(sector, "en").title, "Education careers");
});

test("localizeSkillTitle gives the Thai name for each of the six skills", () => {
  assert.equal(localizeSkillTitle("Leadership", "th"), "ภาวะผู้นำ");
  assert.equal(localizeSkillTitle("Communication", "th"), "การสื่อสาร");
  assert.equal(localizeSkillTitle("Critical thinking", "th"), "การคิดเชิงวิพากษ์");
  assert.equal(localizeSkillTitle("Digital literacy", "th"), "ความรู้ด้านดิจิทัล");
  assert.equal(localizeSkillTitle("Creativity", "th"), "ความคิดสร้างสรรค์");
  assert.equal(localizeSkillTitle("Collaboration", "th"), "การทำงานร่วมกัน");
});

test("localizeSkillTitle ignores case and extra spaces like getSkillStyles", () => {
  assert.equal(localizeSkillTitle("Critical Thinking", "th"), "การคิดเชิงวิพากษ์");
  assert.equal(localizeSkillTitle("  digital literacy ", "th"), "ความรู้ด้านดิจิทัล");
});

test("localizeSkillTitle keeps English in English mode and for unknown skills", () => {
  assert.equal(localizeSkillTitle("Leadership", "en"), "Leadership");
  assert.equal(localizeSkillTitle("Financial literacy", "th"), "Financial literacy");
});
