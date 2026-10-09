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
