import Swal, { SweetAlertOptions } from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import { ErrorMessages, Language } from "../../interfaces";
import { isQuizLockedError } from "../../utils/quizDraft";

/** Alert options for a failed quiz request. A 409 QUIZ_LOCKED gets the localized lock message; anything else (e.g. a 400) shows the server's error and message. */
export function quizErrorAlertOptions(error: unknown, lang: Language): SweetAlertOptions {
  if (isQuizLockedError(error)) return { title: quizLanguage.lockedBanner(lang), icon: "warning" };
  const result = error as ErrorMessages | null | undefined;
  return { title: result?.error ?? "Error", text: result?.message?.toString(), icon: "error" };
}

/** Error alert for quiz editor and monitor actions. */
export function showQuizError(error: unknown, lang: Language) {
  Swal.fire(quizErrorAlertOptions(error, lang));
}
