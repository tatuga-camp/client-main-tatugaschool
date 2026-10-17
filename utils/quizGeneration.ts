// Pure helpers for the "Generate questions with AI" dialog and the
// generating/failed card. No React, no network: everything here is unit-tested.
import type {
  QuizGenerationInput,
  QuizGenerationJob,
  QuizGenerationSource,
  QuizQuestionType,
} from "../interfaces/Quiz";
import { parseYouTubeId, youTubeWatchUrl } from "./youtube";

export const GENERATION_LIMITS = {
  minQuestions: 1,
  maxQuestions: 30,
  minChoices: 2,
  maxChoices: 6,
  maxInstructions: 1000,
} as const;

export type GenerationSourceDraft = {
  mode: "FILE" | "YOUTUBE" | "WEBSITE";
  /** The uploaded PDF/IMAGE (already on R2) when `mode === "FILE"`. */
  file: QuizGenerationSource | null;
  /** Pasted link for YOUTUBE / WEBSITE. */
  url: string;
};

export type GenerationForm = {
  source: GenerationSourceDraft;
  questionCount: number;
  allowedTypes: QuizQuestionType[];
  choicesPerQuestion: number;
  language: "th" | "en";
  instructions: string;
};

export function defaultGenerationForm(language: "th" | "en"): GenerationForm {
  return {
    source: { mode: "FILE", file: null, url: "" },
    questionCount: 10,
    allowedTypes: ["SINGLE"],
    choicesPerQuestion: 4,
    language,
    instructions: "",
  };
}

/** Pre-fills the dialog from a failed job for "Try again". */
export function formFromJob(
  job: QuizGenerationJob,
  language: "th" | "en",
): GenerationForm {
  const { source } = job;
  const draft: GenerationSourceDraft =
    source.kind === "PDF" || source.kind === "IMAGE"
      ? { mode: "FILE", file: source, url: "" }
      : { mode: source.kind, file: null, url: source.url };
  return {
    source: draft,
    questionCount: job.questionCount,
    allowedTypes: [...job.allowedTypes],
    choicesPerQuestion: job.choicesPerQuestion,
    language: job.language ?? language,
    instructions: job.instructions ?? "",
  };
}

export function isGenerationActive(
  job: QuizGenerationJob | null | undefined,
): boolean {
  return job?.status === "PENDING" || job?.status === "RUNNING";
}

/** The 11-character YouTube id from watch?v=, youtu.be/, /shorts/, /embed/ links; null otherwise. */
export function youtubeVideoId(url: string): string | null {
  return parseYouTubeId(url);
}

export function needsChoices(allowedTypes: QuizQuestionType[]): boolean {
  return allowedTypes.includes("SINGLE") || allowedTypes.includes("MULTIPLE");
}

export type FormIssue =
  | "noSource"
  | "badYoutube"
  | "badUrl"
  | "noTypes"
  | "badCount"
  | "badChoices"
  | "tooLongInstructions";

function isWebsiteUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname;
  } catch {
    return false;
  }
}

/** First problem with the form, or null when it can be submitted. */
export function validateGenerationForm(form: GenerationForm): FormIssue | null {
  const { source } = form;
  if (source.mode === "FILE" && !source.file) return "noSource";
  if (source.mode === "YOUTUBE" && !youtubeVideoId(source.url)) return "badYoutube";
  if (source.mode === "WEBSITE" && !isWebsiteUrl(source.url)) return "badUrl";

  if (form.allowedTypes.length === 0) return "noTypes";

  const { minQuestions, maxQuestions, minChoices, maxChoices, maxInstructions } =
    GENERATION_LIMITS;
  if (
    !Number.isInteger(form.questionCount) ||
    form.questionCount < minQuestions ||
    form.questionCount > maxQuestions
  )
    return "badCount";

  if (
    needsChoices(form.allowedTypes) &&
    (!Number.isInteger(form.choicesPerQuestion) ||
      form.choicesPerQuestion < minChoices ||
      form.choicesPerQuestion > maxChoices)
  )
    return "badChoices";

  if (form.instructions.length > maxInstructions) return "tooLongInstructions";
  return null;
}

/** Request body for POST /generation. Call `validateGenerationForm` first. */
export function toGenerationInput(form: GenerationForm): QuizGenerationInput {
  const { source } = form;
  let wire: QuizGenerationSource;
  if (source.mode === "FILE") {
    const file = source.file;
    if (!file) throw new Error("validateGenerationForm first: no file");
    wire = {
      kind: file.kind,
      url: file.url,
      name: file.name ?? undefined,
      mimeType: file.mimeType ?? undefined,
      size: file.size ?? undefined,
    };
  } else if (source.mode === "YOUTUBE") {
    const id = youtubeVideoId(source.url);
    if (!id) throw new Error("validateGenerationForm first: bad YouTube url");
    wire = { kind: "YOUTUBE", url: youTubeWatchUrl(id) };
  } else {
    wire = { kind: "WEBSITE", url: source.url.trim() };
  }

  const input: QuizGenerationInput = {
    source: wire,
    questionCount: form.questionCount,
    allowedTypes: [...form.allowedTypes],
    choicesPerQuestion: form.choicesPerQuestion,
    language: form.language,
  };
  const instructions = form.instructions.trim();
  if (instructions) input.instructions = instructions;
  return input;
}

/** Short label for the card's source chip: file name, "YouTube", or the site's hostname. */
export function sourceLabel(source: QuizGenerationSource): string {
  if (source.kind === "YOUTUBE") return "YouTube";
  if (source.kind === "WEBSITE") {
    try {
      return new URL(source.url).hostname || source.url;
    } catch {
      return source.url;
    }
  }
  if (source.name) return source.name;
  try {
    const last = decodeURIComponent(new URL(source.url).pathname.split("/").pop() ?? "");
    if (last) return last;
  } catch {
    // fall through to the raw url
  }
  return source.url;
}

type ServerError = { statusCode?: number; message?: unknown };

function asServerError(error: unknown): ServerError | null {
  return error && typeof error === "object" ? (error as ServerError) : null;
}

/** 409 QUIZ_GENERATING: a generation job is active on this quiz. */
export function isQuizGeneratingError(error: unknown): boolean {
  const e = asServerError(error);
  return !!e && e.statusCode === 409 && e.message === "QUIZ_GENERATING";
}

/** 409 QUIZ_NOT_DRAFT: the quiz must be moved to draft before generating. */
export function isQuizNotDraftError(error: unknown): boolean {
  const e = asServerError(error);
  return !!e && e.statusCode === 409 && e.message === "QUIZ_NOT_DRAFT";
}

/** 403 AI_QUOTA_EXCEEDED with the school's `used` and `limit` for this month. */
export function isQuotaError(
  error: unknown,
): error is { used: number; limit: number } {
  const e = asServerError(error) as (ServerError & { used?: unknown; limit?: unknown }) | null;
  return (
    !!e &&
    e.statusCode === 403 &&
    e.message === "AI_QUOTA_EXCEEDED" &&
    typeof e.used === "number" &&
    typeof e.limit === "number"
  );
}
