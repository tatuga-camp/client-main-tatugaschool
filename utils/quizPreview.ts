import type {
  AssignmentOnQuiz,
  QuizQuestionInput,
  QuizScoringMode,
} from "../interfaces";
import { promptSegments, toQuestionPayload } from "./quizDraft";

/**
 * Client copy of the server's grading (src/quiz/grading.ts) for the teacher's
 * student preview. Keep the two in step: quizPreview.test.ts repeats the
 * server's grading.spec cases.
 */

export type PreviewAnswer = {
  selectedOptionIds: string[];
  blankAnswers: { blankId: string; value: string }[];
};

export const EMPTY_PREVIEW_ANSWER: PreviewAnswer = {
  selectedOptionIds: [],
  blankAnswers: [],
};

type GradableQuestion = Pick<
  QuizQuestionInput,
  "type" | "points" | "options" | "blanks"
>;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** NFC does not fix above vowels or SARA AM; move tone marks after them until stable. */
function reorderThaiMarks(value: string): string {
  let previous: string;
  let current = value;
  do {
    previous = current;
    current = current
      .replace(/([่-๋])([ัิ-ฺ็])/g, "$2$1")
      .replace(/(ำ)([่-๋])/g, "$2$1");
  } while (current !== previous);
  return current;
}

export function normalizeBlankAnswer(value: string): string {
  return reorderThaiMarks(value.normalize("NFC"))
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

export function gradePreviewQuestion(
  question: GradableQuestion,
  answer: PreviewAnswer | null,
  mode: QuizScoringMode,
): number {
  if (!answer) return 0;
  const points = question.points;

  if (question.type === "SINGLE") {
    const correct = question.options.find((o) => o.isCorrect);
    if (!correct) return 0;
    return answer.selectedOptionIds.length === 1 &&
      answer.selectedOptionIds[0] === correct.id
      ? points
      : 0;
  }

  if (question.type === "MULTIPLE") {
    const correctIds = new Set(
      question.options.filter((o) => o.isCorrect).map((o) => o.id),
    );
    if (correctIds.size === 0) return 0;
    const validIds = new Set(question.options.map((o) => o.id));
    const picked = new Set(
      answer.selectedOptionIds.filter((id) => validIds.has(id)),
    );
    const correctPicked = [...picked].filter((id) => correctIds.has(id)).length;
    const wrongPicked = picked.size - correctPicked;
    if (mode === "ALL_OR_NOTHING") {
      return correctPicked === correctIds.size && wrongPicked === 0
        ? points
        : 0;
    }
    return round2(
      (points * Math.max(0, correctPicked - wrongPicked)) / correctIds.size,
    );
  }

  if (question.blanks.length === 0) return 0;
  const given = new Map(
    answer.blankAnswers.map((b) => [b.blankId, normalizeBlankAnswer(b.value)]),
  );
  const matched = question.blanks.filter((blank) => {
    const value = given.get(blank.id);
    if (!value) return false;
    return blank.acceptedAnswers.some((a) => normalizeBlankAnswer(a) === value);
  }).length;
  if (mode === "ALL_OR_NOTHING") {
    return matched === question.blanks.length ? points : 0;
  }
  return round2((points * matched) / question.blanks.length);
}

export function sumPreviewScores(scores: number[]): number {
  return round2(scores.reduce((total, s) => total + s, 0));
}

export type PreviewQuestion = QuizQuestionInput & {
  id: string;
  /** The card has edits that are not on the server yet. */
  unsaved: boolean;
};

/** What the student preview shows: each card's live draft, or the saved question. */
export function previewQuestions(
  saved: AssignmentOnQuiz[],
  drafts: Record<string, QuizQuestionInput | undefined>,
): PreviewQuestion[] {
  return saved.map((q) => {
    const draft = drafts[q.id];
    if (!draft) {
      return {
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        imageUrl: q.imageUrl,
        points: q.points,
        options: q.options,
        blanks: q.blanks,
        unsaved: false,
      };
    }
    return {
      ...toQuestionPayload(draft),
      id: q.id,
      unsaved: !isSavedAs(draft, q),
    };
  });
}

/** The shape the server stores: it trims option text and accepted answers and drops empty ones. */
function asStored(q: QuizQuestionInput) {
  const p = toQuestionPayload(q);
  return {
    type: p.type,
    prompt: p.prompt,
    imageUrl: p.imageUrl ?? null,
    points: p.points,
    options: p.options.map((o) => ({
      id: o.id,
      text: o.text.trim(),
      imageUrl: o.imageUrl ?? null,
      isCorrect: o.isCorrect,
    })),
    blanks: p.blanks.map((b) => ({
      id: b.id,
      acceptedAnswers: b.acceptedAnswers.map((a) => a.trim()).filter(Boolean),
    })),
  };
}

/** True when saving `draft` would leave the server copy unchanged. */
export function isSavedAs(
  draft: QuizQuestionInput,
  server: QuizQuestionInput | AssignmentOnQuiz,
): boolean {
  return (
    JSON.stringify(asStored(draft)) ===
    JSON.stringify(asStored(server as QuizQuestionInput))
  );
}

export type SaveBlocker =
  | "prompt"
  | "twoOptions"
  | "optionText"
  | "pickOne"
  | "pickAtLeastOne"
  | "needBlank"
  | "blankAnswer";

/** Why the server would reject this draft (src/quiz/question-shape.ts), or null when it can be saved. */
export function saveBlocker(draft: QuizQuestionInput): SaveBlocker | null {
  const p = toQuestionPayload(draft);
  if (!p.prompt.trim()) return "prompt";
  if (p.type === "FILL_BLANK") {
    const tokens = promptSegments(p.prompt).filter((s) => s.kind === "blank");
    if (p.blanks.length === 0 || tokens.length === 0) return "needBlank";
    if (p.blanks.some((b) => !b.acceptedAnswers.some((a) => a.trim())))
      return "blankAnswer";
    return null;
  }
  if (p.options.length < 2) return "twoOptions";
  if (p.options.some((o) => !o.text.trim() && !o.imageUrl)) return "optionText";
  const correct = p.options.filter((o) => o.isCorrect).length;
  if (p.type === "SINGLE" && correct !== 1) return "pickOne";
  if (p.type === "MULTIPLE" && correct < 1) return "pickAtLeastOne";
  return null;
}
