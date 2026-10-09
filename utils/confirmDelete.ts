import type { SweetAlertOptions } from "sweetalert2";
import { quizLanguage } from "../data/languages/quiz";
import type { Language } from "../interfaces";

// error-color from tailwind.config.ts
const ERROR_COLOR = "#F04438";

export function deleteConfirmOptions(
  kind: "quiz" | "assignment",
  lang: Language,
): SweetAlertOptions {
  return {
    icon: "warning",
    title:
      kind === "quiz"
        ? quizLanguage.deleteQuizTitle(lang)
        : quizLanguage.deleteAssignmentTitle(lang),
    text:
      kind === "quiz"
        ? quizLanguage.deleteQuizText(lang)
        : quizLanguage.deleteAssignmentText(lang),
    showCancelButton: true,
    focusCancel: true,
    confirmButtonText: quizLanguage.deleteButton(lang),
    cancelButtonText: quizLanguage.cancel(lang),
    confirmButtonColor: ERROR_COLOR,
  };
}

/** Runs `action` only when the teacher confirms; returns whether it ran. */
export async function runIfConfirmed(
  confirm: () => Promise<{ isConfirmed: boolean }>,
  action: () => Promise<void>,
): Promise<boolean> {
  const answer = await confirm();
  if (!answer.isConfirmed) return false;
  await action();
  return true;
}
