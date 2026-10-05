import { test } from "node:test";
import assert from "node:assert/strict";
import {
  barPercent,
  EXPECTED_MARKER_PERCENT,
  localizeSector,
  skillBand,
  summarizeSkills,
} from "./careerReport";

test("skillBand thresholds", () => {
  assert.equal(skillBand(1.2), "above");
  assert.equal(skillBand(1), "above");
  assert.equal(skillBand(0.99), "close");
  assert.equal(skillBand(0.8), "close");
  assert.equal(skillBand(0.79), "below");
  assert.equal(skillBand(0), "below");
  assert.equal(skillBand(Number.NaN), "below");
  assert.equal(skillBand(Number.POSITIVE_INFINITY), "below");
});

test("barPercent clamps to 0–100 and puts expectation at the marker", () => {
  assert.equal(barPercent(0), 0);
  assert.equal(barPercent(-1), 0);
  assert.equal(barPercent(Number.NaN), 0);
  assert.equal(barPercent(3), 100);
  assert.equal(barPercent(1.5), 100);
  assert.ok(Math.abs(barPercent(1) - EXPECTED_MARKER_PERCENT) < 1e-9);
});

const k = (id: string, avg: number) => ({ id, avg });

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
