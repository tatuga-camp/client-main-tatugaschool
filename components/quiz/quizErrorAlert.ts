import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import { ErrorMessages, Language } from "../../interfaces";
import { isQuizLockedError } from "../../utils/quizDraft";

/** Error alert for quiz editor actions. A 409 QUIZ_LOCKED gets the localized lock message instead of raw server text. */
export function showQuizError(error: unknown, lang: Language) {
  if (isQuizLockedError(error)) {
    Swal.fire({ title: quizLanguage.lockedBanner(lang), icon: "warning" });
    return;
  }
  const result = error as ErrorMessages;
  Swal.fire({ title: result?.error ?? "Error", text: result?.message?.toString(), icon: "error" });
}
