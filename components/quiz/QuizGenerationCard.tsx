import { ProgressBar } from "primereact/progressbar";
import React from "react";
import { MdCheck, MdErrorOutline } from "react-icons/md";
import { RiSparkling2Line } from "react-icons/ri";
import { quizLanguage } from "../../data/languages";
import type { Language, QuizGenerationJob, QuizQuestionType } from "../../interfaces";
import { isGenerationActive, sourceLabel } from "../../utils/quizGeneration";

type Props = {
  job: QuizGenerationJob;
  language: Language;
  /** "Try again" on a failed job: the caller reopens the dialog pre-filled from `job`. */
  onRetry: (job: QuizGenerationJob) => void;
  /** "Dismiss" on a failed job: the caller hides the card for this job id. */
  onDismiss: (jobId: string) => void;
};

const TYPE_ORDER: QuizQuestionType[] = ["SINGLE", "MULTIPLE", "FILL_BLANK"];

function typeName(type: QuizQuestionType, lang: Language): string {
  if (type === "SINGLE") return quizLanguage.typeSingle(lang);
  if (type === "MULTIPLE") return quizLanguage.typeMultiple(lang);
  return quizLanguage.typeFillBlank(lang);
}

/** "10 questions · Single answer, Multiple answers" in the UI language. */
function metaText(job: QuizGenerationJob, lang: Language): string {
  const types = TYPE_ORDER.filter((t) => job.allowedTypes.includes(t))
    .map((t) => typeName(t, lang))
    .join(", ");
  const count = quizLanguage.questionCountLabel(lang, job.questionCount);
  return types ? `${count} · ${types}` : count;
}

function MetaRow({ job, lang }: { job: QuizGenerationJob; lang: Language }) {
  return (
    <div className="flex flex-col gap-1.5 text-xs text-icon-color/70 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
      <span
        className="inline-flex max-w-full items-center rounded-full bg-white px-2.5 py-1 font-medium text-icon-color ring-1 ring-icon-color/10"
        title={job.source.url}
      >
        <span className="truncate">{sourceLabel(job.source)}</span>
      </span>
      <span>{metaText(job, lang)}</span>
    </div>
  );
}

/**
 * Status card for the newest QuizGenerationJob, rendered above the question
 * cards. PENDING/RUNNING → "we're generating" card; FAILED → reason + Try
 * again / Dismiss; DONE → nothing (the questions themselves are the result).
 */
export default function QuizGenerationCard({
  job,
  language: lang,
  onRetry,
  onDismiss,
}: Props): JSX.Element | null {
  if (isGenerationActive(job)) {
    // Cosmetic progress: PENDING = reading, RUNNING = writing; "checking" is
    // only ever shown as upcoming because the card disappears on DONE.
    const current = job.status === "PENDING" ? 0 : 1;
    const steps = [
      quizLanguage.generatingStepRead(lang),
      quizLanguage.generatingStepWrite(lang),
      quizLanguage.generatingStepCheck(lang),
    ];

    return (
      <section
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex flex-col gap-4 rounded-2xl border border-primary-color/20 bg-primary-color/5 p-4 font-Anuphan text-icon-color md:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
            <RiSparkling2Line aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-base font-semibold leading-tight">
              {job.status === "PENDING"
                ? quizLanguage.queuedTitle(lang)
                : quizLanguage.generatingTitle(lang)}
            </h3>
            <p className="text-sm text-icon-color/70">
              {quizLanguage.generatingBody(lang)}
            </p>
          </div>
        </div>

        <ProgressBar mode="indeterminate" style={{ height: 6 }} />

        <MetaRow job={job} lang={lang} />

        <ol className="flex flex-col gap-1.5 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5">
          {steps.map((label, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <li
                key={label}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-2 ${
                  active
                    ? "font-medium text-primary-color"
                    : done
                      ? "text-icon-color/70"
                      : "text-icon-color/40"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-primary-color text-[10px] text-white"
                      : active
                        ? "animate-pulse bg-primary-color"
                        : "ring-1 ring-icon-color/20"
                  }`}
                >
                  {done && <MdCheck />}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  if (job.status === "FAILED") {
    return (
      <section
        role="alert"
        className="flex flex-col gap-4 rounded-2xl border border-error-color/30 bg-error-color/5 p-4 font-Anuphan text-icon-color md:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-color/10 text-xl text-error-color">
            <MdErrorOutline aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-base font-semibold leading-tight">
              {quizLanguage.generationFailed(lang)}
            </h3>
            <p className="text-sm text-icon-color/70">
              {quizLanguage.generationErrorText(lang, job.error)}
            </p>
          </div>
        </div>

        <MetaRow job={job} lang={lang} />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onDismiss(job.id)}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-icon-color/70 transition hover:bg-icon-color/5 hover:text-icon-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40 sm:w-auto"
          >
            {quizLanguage.dismiss(lang)}
          </button>
          <button
            type="button"
            onClick={() => onRetry(job)}
            className="w-full rounded-xl bg-primary-color px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-color-hover focus:bg-primary-color-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40 sm:w-auto"
          >
            {quizLanguage.tryAgain(lang)}
          </button>
        </div>
      </section>
    );
  }

  return null;
}
