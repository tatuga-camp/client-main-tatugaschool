import { AssignmentType } from "../interfaces";

/** Where a classwork card opens: a quiz goes straight to its editor. */
export function classworkHref(subjectId: string, classwork: { id: string; type: AssignmentType }): string {
  return classwork.type === "Quiz"
    ? `/subject/${subjectId}/quiz/${classwork.id}`
    : `/subject/${subjectId}/assignment/${classwork.id}`;
}

/** Quizzes and video quizzes have no file attachments, so their expanded card hides that section. */
export function classworkShowsAttachments(type: AssignmentType): boolean {
  return type !== "Quiz" && type !== "VideoQuiz";
}
