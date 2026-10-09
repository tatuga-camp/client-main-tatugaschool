import { AssignmentOnQuiz, QuizBlank, QuizQuestionInput, QuizQuestionType } from "../interfaces";

const TOKEN = /\{\{([A-Za-z0-9_-]{1,32})\}\}/g;

export function newQuizId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return id;
}

const twoOptions = () => [
  { id: newQuizId(), text: "Option 1", imageUrl: null, isCorrect: true },
  { id: newQuizId(), text: "Option 2", imageUrl: null, isCorrect: false },
];

export function defaultQuestion(type: QuizQuestionType): QuizQuestionInput {
  if (type === "FILL_BLANK") {
    const id = newQuizId();
    return {
      type,
      prompt: `Type your sentence here: {{${id}}}`,
      points: 1,
      options: [],
      blanks: [{ id, acceptedAnswers: ["answer"] }],
    };
  }
  return { type, prompt: "New question", points: 1, options: twoOptions(), blanks: [] };
}

export function convertQuestionType(q: QuizQuestionInput, to: QuizQuestionType): QuizQuestionInput {
  if (q.type === to) return q;
  if (to === "FILL_BLANK") {
    const id = newQuizId();
    const hasToken = /\{\{[A-Za-z0-9_-]{1,32}\}\}/.test(q.prompt);
    const prompt = hasToken ? q.prompt : `${q.prompt.trimEnd()} {{${id}}}`;
    return { ...q, type: to, prompt, options: [], blanks: syncBlanksWithPrompt(prompt, q.blanks) };
  }
  const prompt = q.prompt.replace(TOKEN, "____").trim() || "New question";
  const options = q.options.length >= 2 ? q.options : twoOptions();
  if (to === "SINGLE") {
    const firstCorrect = Math.max(0, options.findIndex((o) => o.isCorrect));
    return {
      ...q,
      type: to,
      prompt,
      blanks: [],
      options: options.map((o, i) => ({ ...o, isCorrect: i === firstCorrect })),
    };
  }
  return { ...q, type: to, prompt, blanks: [], options };
}

export function insertBlankToken(prompt: string, cursor: number, id: string): { prompt: string; cursor: number } {
  const at = Math.max(0, Math.min(cursor, prompt.length));
  const token = `{{${id}}}`;
  return { prompt: prompt.slice(0, at) + token + prompt.slice(at), cursor: at + token.length };
}

export type PromptSegment = { kind: "text"; text: string } | { kind: "blank"; blankId: string };

export function promptSegments(prompt: string): PromptSegment[] {
  const segments: PromptSegment[] = [];
  let last = 0;
  for (const match of prompt.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: "text", text: prompt.slice(last, index) });
    segments.push({ kind: "blank", blankId: match[1] });
    last = index + match[0].length;
  }
  if (last < prompt.length) segments.push({ kind: "text", text: prompt.slice(last) });
  return segments;
}

export function syncBlanksWithPrompt(prompt: string, blanks: QuizBlank[]): QuizBlank[] {
  const byId = new Map(blanks.map((b) => [b.id, b]));
  const seen = new Set<string>();
  const out: QuizBlank[] = [];
  for (const match of prompt.matchAll(TOKEN)) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(byId.get(id) ?? { id, acceptedAnswers: [] });
  }
  return out;
}

export function addAcceptedAnswer(list: string[], value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return list;
  if (list.some((a) => a.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) return list;
  return [...list, trimmed];
}

export function toQuestionInput(q: AssignmentOnQuiz): QuizQuestionInput {
  return {
    type: q.type,
    prompt: q.prompt,
    imageUrl: q.imageUrl,
    points: q.points,
    options: q.options.map((o) => ({ ...o })),
    blanks: q.blanks.map((b) => ({ ...b, acceptedAnswers: [...b.acceptedAnswers] })),
  };
}

/** A prompt edit in the blank editor: blanks follow the {{tokens}} left in the prompt. */
export function applyPromptEdit(value: QuizQuestionInput, prompt: string): QuizQuestionInput {
  return { ...value, prompt, blanks: syncBlanksWithPrompt(prompt, value.blanks) };
}

/** What the card sends on save. Fill-blank blanks are re-synced so a hand-deleted token never leaves an orphan. */
export function toQuestionPayload(draft: QuizQuestionInput): QuizQuestionInput {
  if (draft.type !== "FILL_BLANK") return draft;
  return { ...draft, blanks: syncBlanksWithPrompt(draft.prompt, draft.blanks) };
}

/**
 * When the server copy changes, take it only if the local draft has no unsaved edits
 * (it still equals the previous server copy). Otherwise keep the user's edits.
 */
export function rebaseDraft<T>(draft: T, prevBase: T, nextBase: T): T {
  return JSON.stringify(draft) === JSON.stringify(prevBase) ? nextBase : draft;
}

/** The server's 409 when a student has already started the quiz. */
export function isQuizLockedError(error: unknown): boolean {
  const e = error as { statusCode?: number; message?: unknown } | null | undefined;
  return !!e && e.statusCode === 409 && e.message === "QUIZ_LOCKED";
}

/** Reorder a question list to match `ids`; anything not in `ids` keeps its place at the end. */
export function reorderByIds<T extends { id: string }>(list: T[], ids: string[]): T[] {
  const byId = new Map(list.map((q) => [q.id, q]));
  const ordered = ids.map((id) => byId.get(id)).filter((q): q is T => !!q);
  const rest = list.filter((q) => !ids.includes(q.id));
  return [...ordered, ...rest];
}

/** Largest question image the editor uploads. */
export const QUESTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type QuestionImageCheck = "ok" | "notImage" | "tooLarge";

/** Checks a picked file before it is uploaded as a question image. */
export function validateQuestionImage(file: { type: string; size: number }): QuestionImageCheck {
  if (!file.type.startsWith("image/") || file.size <= 0) return "notImage";
  if (file.size > QUESTION_IMAGE_MAX_BYTES) return "tooLarge";
  return "ok";
}

/** Sets (or, with null, removes) the question's image in the draft. */
export function setQuestionImage(draft: QuizQuestionInput, imageUrl: string | null): QuizQuestionInput {
  return { ...draft, imageUrl };
}

/** Accepted-answer text typed per blank (keyed by blank id) but not yet added with Enter. */
export type PendingAnswers = Record<string, string>;

/** Adds each blank's pending text to its accepted answers. Returns `draft` itself when nothing changes. */
export function commitPendingAnswers(draft: QuizQuestionInput, pending: PendingAnswers): QuizQuestionInput {
  let changed = false;
  const blanks = draft.blanks.map((b) => {
    const next = addAcceptedAnswer(b.acceptedAnswers, pending[b.id] ?? "");
    if (next === b.acceptedAnswers) return b;
    changed = true;
    return { ...b, acceptedAnswers: next };
  });
  return changed ? { ...draft, blanks } : draft;
}

/** How many fill-in-the-blank blanks have no accepted answer (the server rejects those). */
export function blanksMissingAnswers(draft: QuizQuestionInput): number {
  if (draft.type !== "FILL_BLANK") return 0;
  return draft.blanks.filter((b) => b.acceptedAnswers.length === 0).length;
}

/** The set of question ids with unsaved edits, updated immutably (same set when nothing changes). */
export function withDirtyId(ids: ReadonlySet<string>, id: string, dirty: boolean): Set<string> {
  if (ids.has(id) === dirty) return ids as Set<string>;
  const next = new Set(ids);
  if (dirty) next.add(id);
  else next.delete(id);
  return next;
}
