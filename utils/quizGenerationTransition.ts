import type { QuizGenerationJob } from "../interfaces/Quiz";
import { isGenerationActive } from "./quizGeneration";

export type TransitionEvent =
  | { kind: "done"; createdCount: number }
  | { kind: "failed"; code: string | null }
  | null;

/** Detects the moment the same job leaves the active states, so side effects fire exactly once. */
export function generationTransition(
  prev: QuizGenerationJob | null | undefined,
  next: QuizGenerationJob | null | undefined,
): TransitionEvent {
  if (!prev || !next || prev.id !== next.id) return null;
  if (!isGenerationActive(prev)) return null;
  if (next.status === "DONE")
    return { kind: "done", createdCount: next.createdCount };
  if (next.status === "FAILED") return { kind: "failed", code: next.error };
  return null;
}
