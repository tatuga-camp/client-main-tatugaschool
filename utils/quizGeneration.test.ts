import { test } from "node:test";
import assert from "node:assert/strict";
import type { QuizGenerationJob } from "../interfaces/Quiz";
import {
  GENERATION_LIMITS,
  defaultGenerationForm,
  formFromJob,
  isGenerationActive,
  isQuizGeneratingError,
  isQuizNotDraftError,
  isQuotaError,
  needsChoices,
  sourceLabel,
  toGenerationInput,
  validateGenerationForm,
  youtubeVideoId,
  type GenerationForm,
} from "./quizGeneration";

const job = (over: Partial<QuizGenerationJob> = {}): QuizGenerationJob => ({
  id: "j1",
  createAt: "2026-10-17T00:00:00.000Z",
  updateAt: "2026-10-17T00:00:00.000Z",
  status: "PENDING",
  source: { kind: "YOUTUBE", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  questionCount: 10,
  allowedTypes: ["SINGLE"],
  choicesPerQuestion: 4,
  language: "en",
  instructions: null,
  createdCount: 0,
  error: null,
  attempts: 0,
  startedAt: null,
  finishedAt: null,
  assignmentId: "a1",
  subjectId: "s1",
  schoolId: "sc1",
  userId: "u1",
  ...over,
});

const form = (over: Partial<GenerationForm> = {}): GenerationForm => ({
  ...defaultGenerationForm("en"),
  source: {
    mode: "YOUTUBE",
    file: null,
    url: "https://youtu.be/dQw4w9WgXcQ",
  },
  ...over,
});

test("GENERATION_LIMITS match the spec", () => {
  assert.deepEqual(GENERATION_LIMITS, {
    minQuestions: 1,
    maxQuestions: 30,
    minChoices: 2,
    maxChoices: 6,
    maxInstructions: 1000,
  });
});

test("defaultGenerationForm: FILE mode, 10 questions, SINGLE, 4 choices, given language", () => {
  assert.deepEqual(defaultGenerationForm("th"), {
    source: { mode: "FILE", file: null, url: "" },
    questionCount: 10,
    allowedTypes: ["SINGLE"],
    choicesPerQuestion: 4,
    language: "th",
    instructions: "",
  });
});

test("isGenerationActive: PENDING and RUNNING only", () => {
  assert.equal(isGenerationActive(job({ status: "PENDING" })), true);
  assert.equal(isGenerationActive(job({ status: "RUNNING" })), true);
  assert.equal(isGenerationActive(job({ status: "DONE" })), false);
  assert.equal(isGenerationActive(job({ status: "FAILED" })), false);
  assert.equal(isGenerationActive(null), false);
  assert.equal(isGenerationActive(undefined), false);
});

test("youtubeVideoId: accepted link shapes", () => {
  assert.equal(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=1"), "dQw4w9WgXcQ");
  assert.equal(
    youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x"),
    "dQw4w9WgXcQ",
  );
  assert.equal(youtubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://m.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("  https://youtu.be/dQw4w9WgXcQ  "), "dQw4w9WgXcQ");
});

test("youtubeVideoId: rejects other sites, short ids and empty input", () => {
  assert.equal(youtubeVideoId("https://vimeo.com/x"), null);
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=short"), null);
  assert.equal(youtubeVideoId("https://www.youtube.com/"), null);
  assert.equal(youtubeVideoId(""), null);
  assert.equal(youtubeVideoId("not a url"), null);
});

test("needsChoices: true with SINGLE or MULTIPLE, false for FILL_BLANK only", () => {
  assert.equal(needsChoices(["SINGLE"]), true);
  assert.equal(needsChoices(["MULTIPLE"]), true);
  assert.equal(needsChoices(["FILL_BLANK", "MULTIPLE"]), true);
  assert.equal(needsChoices(["FILL_BLANK"]), false);
  assert.equal(needsChoices([]), false);
});

test("validateGenerationForm: valid form → null", () => {
  assert.equal(validateGenerationForm(form()), null);
  assert.equal(
    validateGenerationForm(
      form({
        source: {
          mode: "FILE",
          file: {
            kind: "PDF",
            url: "https://storage.example.com/x.pdf",
            name: "x.pdf",
            mimeType: "application/pdf",
            size: 1000,
          },
          url: "",
        },
      }),
    ),
    null,
  );
  assert.equal(
    validateGenerationForm(
      form({ source: { mode: "WEBSITE", file: null, url: "https://example.com/page" } }),
    ),
    null,
  );
});

test("validateGenerationForm: source issues", () => {
  assert.equal(
    validateGenerationForm(form({ source: { mode: "FILE", file: null, url: "" } })),
    "noSource",
  );
  assert.equal(
    validateGenerationForm(
      form({ source: { mode: "YOUTUBE", file: null, url: "https://vimeo.com/x" } }),
    ),
    "badYoutube",
  );
  assert.equal(
    validateGenerationForm(form({ source: { mode: "YOUTUBE", file: null, url: "" } })),
    "badYoutube",
  );
  assert.equal(
    validateGenerationForm(form({ source: { mode: "WEBSITE", file: null, url: "notaurl" } })),
    "badUrl",
  );
  assert.equal(
    validateGenerationForm(
      form({ source: { mode: "WEBSITE", file: null, url: "ftp://example.com/x" } }),
    ),
    "badUrl",
  );
});

test("validateGenerationForm: types, count, choices, instructions", () => {
  assert.equal(validateGenerationForm(form({ allowedTypes: [] })), "noTypes");
  assert.equal(validateGenerationForm(form({ questionCount: 31 })), "badCount");
  assert.equal(validateGenerationForm(form({ questionCount: 0 })), "badCount");
  assert.equal(validateGenerationForm(form({ questionCount: 2.5 })), "badCount");
  assert.equal(
    validateGenerationForm(form({ allowedTypes: ["SINGLE"], choicesPerQuestion: 7 })),
    "badChoices",
  );
  assert.equal(
    validateGenerationForm(form({ allowedTypes: ["MULTIPLE"], choicesPerQuestion: 1 })),
    "badChoices",
  );
  // choices are ignored when only FILL_BLANK is chosen
  assert.equal(
    validateGenerationForm(form({ allowedTypes: ["FILL_BLANK"], choicesPerQuestion: 1 })),
    null,
  );
  assert.equal(
    validateGenerationForm(form({ instructions: "x".repeat(1001) })),
    "tooLongInstructions",
  );
  assert.equal(validateGenerationForm(form({ instructions: "x".repeat(1000) })), null);
});

test("toGenerationInput: normalizes the YouTube URL and omits empty instructions", () => {
  const input = toGenerationInput(form({ instructions: "   " }));
  assert.deepEqual(input, {
    source: { kind: "YOUTUBE", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    questionCount: 10,
    allowedTypes: ["SINGLE"],
    choicesPerQuestion: 4,
    language: "en",
  });
  assert.equal("instructions" in input, false);
});

test("toGenerationInput: keeps trimmed instructions, trims WEBSITE url, maps file kind", () => {
  const web = toGenerationInput(
    form({
      source: { mode: "WEBSITE", file: null, url: "  https://example.com/page  " },
      instructions: "  focus on chapter 2  ",
    }),
  );
  assert.deepEqual(web.source, { kind: "WEBSITE", url: "https://example.com/page" });
  assert.equal(web.instructions, "focus on chapter 2");

  const file = toGenerationInput(
    form({
      source: {
        mode: "FILE",
        file: {
          kind: "IMAGE",
          url: "https://storage.example.com/a.png",
          name: "a.png",
          mimeType: "image/png",
          size: 123,
        },
        url: "ignored",
      },
    }),
  );
  assert.deepEqual(file.source, {
    kind: "IMAGE",
    url: "https://storage.example.com/a.png",
    name: "a.png",
    mimeType: "image/png",
    size: 123,
  });
});

test("toGenerationInput: FILL_BLANK-only forms send an in-range choicesPerQuestion", () => {
  const { minChoices, maxChoices } = GENERATION_LIMITS;
  const inRange = (n: number) => n >= minChoices && n <= maxChoices;

  // The choices input is hidden for FILL_BLANK-only, so a stale 1 (or 99) must
  // not reach the server's range validator.
  const low = toGenerationInput(form({ allowedTypes: ["FILL_BLANK"], choicesPerQuestion: 1 }));
  assert.ok(inRange(low.choicesPerQuestion), `got ${low.choicesPerQuestion}`);
  const high = toGenerationInput(form({ allowedTypes: ["FILL_BLANK"], choicesPerQuestion: 99 }));
  assert.ok(inRange(high.choicesPerQuestion), `got ${high.choicesPerQuestion}`);
  const bad = toGenerationInput(form({ allowedTypes: ["FILL_BLANK"], choicesPerQuestion: NaN }));
  assert.ok(inRange(bad.choicesPerQuestion), `got ${bad.choicesPerQuestion}`);
  // An already valid value is kept as-is.
  assert.equal(
    toGenerationInput(form({ allowedTypes: ["FILL_BLANK"], choicesPerQuestion: 3 }))
      .choicesPerQuestion,
    3,
  );
  // With choice types the value is sent untouched (validateGenerationForm guards it).
  assert.equal(
    toGenerationInput(form({ allowedTypes: ["SINGLE"], choicesPerQuestion: 5 }))
      .choicesPerQuestion,
    5,
  );
});

test("formFromJob round-trips a YOUTUBE job", () => {
  const j = job({
    questionCount: 7,
    allowedTypes: ["SINGLE", "FILL_BLANK"],
    choicesPerQuestion: 5,
    language: "th",
    instructions: "เน้นบทที่ 2",
  });
  const f = formFromJob(j, "en");
  assert.deepEqual(f, {
    source: { mode: "YOUTUBE", file: null, url: j.source.url },
    questionCount: 7,
    allowedTypes: ["SINGLE", "FILL_BLANK"],
    choicesPerQuestion: 5,
    language: "th",
    instructions: "เน้นบทที่ 2",
  });
  assert.deepEqual(toGenerationInput(f).source, j.source);
});

test("formFromJob: PDF job → FILE mode with the file kept; WEBSITE job → url", () => {
  const pdf = job({
    source: {
      kind: "PDF",
      url: "https://storage.example.com/x.pdf",
      name: "x.pdf",
      mimeType: "application/pdf",
      size: 10,
    },
    instructions: null,
  });
  const f = formFromJob(pdf, "th");
  assert.equal(f.source.mode, "FILE");
  assert.deepEqual(f.source.file, pdf.source);
  assert.equal(f.instructions, "");

  const web = job({ source: { kind: "WEBSITE", url: "https://example.com/p" } });
  assert.deepEqual(formFromJob(web, "en").source, {
    mode: "WEBSITE",
    file: null,
    url: "https://example.com/p",
  });
});

test("sourceLabel: file name, YouTube, hostname", () => {
  assert.equal(
    sourceLabel({ kind: "PDF", url: "https://storage.example.com/x.pdf", name: "notes.pdf" }),
    "notes.pdf",
  );
  assert.equal(
    sourceLabel({ kind: "IMAGE", url: "https://storage.example.com/dir/photo.png", name: null }),
    "photo.png",
  );
  assert.equal(sourceLabel({ kind: "YOUTUBE", url: "https://youtu.be/dQw4w9WgXcQ" }), "YouTube");
  assert.equal(
    sourceLabel({ kind: "WEBSITE", url: "https://www.example.com/path?x=1" }),
    "www.example.com",
  );
  assert.equal(sourceLabel({ kind: "WEBSITE", url: "garbage" }), "garbage");
});

test("error predicates match the server's 409/403 bodies", () => {
  assert.equal(isQuizGeneratingError({ statusCode: 409, message: "QUIZ_GENERATING" }), true);
  assert.equal(isQuizGeneratingError({ statusCode: 409, message: "QUIZ_LOCKED" }), false);
  assert.equal(isQuizGeneratingError(null), false);
  assert.equal(isQuizNotDraftError({ statusCode: 409, message: "QUIZ_NOT_DRAFT" }), true);
  assert.equal(isQuizNotDraftError({ statusCode: 400, message: "QUIZ_NOT_DRAFT" }), false);
  const quota: unknown = {
    statusCode: 403,
    message: "AI_QUOTA_EXCEEDED",
    used: 10,
    limit: 10,
  };
  assert.equal(isQuotaError(quota), true);
  if (isQuotaError(quota)) {
    assert.equal(quota.used, 10);
    assert.equal(quota.limit, 10);
  }
  assert.equal(isQuotaError({ statusCode: 403, message: "Forbidden" }), false);
  assert.equal(isQuotaError(undefined), false);
});
