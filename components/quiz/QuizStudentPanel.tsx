import React, { useEffect, useRef, useState } from "react";
import { MdCheck, MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import { AssignmentOnQuiz, ErrorMessages, Language, StudentOnQuiz } from "../../interfaces";
import { useGetLanguage, useGetQuizReview, useOverrideQuizScore, useResetQuizAttempt } from "../../react-query";
import { promptSegments } from "../../utils/quizDraft";
import { formatDuration, scoreToSave } from "../../utils/quizMonitor";
import { showQuizError } from "./quizErrorAlert";
import { RiskBadge } from "./QuizMonitor";

function AnswerView({ question, answer, language }: { question: AssignmentOnQuiz; answer: StudentOnQuiz | null; language: Language }) {
  if (question.type === "FILL_BLANK") {
    const given = new Map((answer?.blankAnswers ?? []).map((b) => [b.blankId, b.value]));
    const accepted = new Map(question.blanks.map((b) => [b.id, b.acceptedAnswers]));
    return (
      <p className="text-sm leading-8 text-icon-color">
        {promptSegments(question.prompt).map((s, i) =>
          s.kind === "text" ? (
            <span key={i}>{s.text}</span>
          ) : (
            <span key={i} className="mx-1 inline-flex flex-col align-middle">
              <span className="rounded-md bg-primary-color/10 px-2 text-primary-color">
                {given.get(s.blankId) || quizLanguage.notAnswered(language)}
              </span>
              <span className="text-[11px] text-success-color">{(accepted.get(s.blankId) ?? []).join(" / ")}</span>
            </span>
          ),
        )}
      </p>
    );
  }
  const picked = new Set(answer?.selectedOptionIds ?? []);
  return (
    <>
      <p className="mb-2 text-sm text-icon-color">{question.prompt}</p>
      <ul className="flex flex-col gap-1">
        {question.options.map((o) => (
          <li
            key={o.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${
              picked.has(o.id) ? (o.isCorrect ? "bg-success-color/10" : "bg-error-color/10") : ""
            }`}
          >
            <span className="w-4">{o.isCorrect && <MdCheck className="text-success-color" />}</span>
            <span className={picked.has(o.id) ? "font-medium" : "text-icon-color/70"}>{o.text}</span>
            {picked.has(o.id) && <span className="ml-auto text-xs text-icon-color/50">{quizLanguage.studentAnswer(language)}</span>}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Rendered only for graded answers (score not null). Saves on blur only when the teacher actually edited the value. */
export function ScoreInput({ answer, max, assignmentId, language }: { answer: StudentOnQuiz; max: number; assignmentId: string; language: Language }) {
  const override = useOverrideQuizScore(assignmentId);
  const [value, setValue] = useState(String(answer.score ?? 0));
  const focused = useRef(false);
  const dirty = useRef(false);

  // The review polls; follow refreshed grades unless the teacher is mid-edit.
  useEffect(() => {
    if (!focused.current) setValue(String(answer.score ?? 0));
  }, [answer.score]);

  const save = async () => {
    focused.current = false;
    const edited = dirty.current;
    dirty.current = false;
    const score = edited ? scoreToSave(value, max, answer.score) : null;
    if (score === null) {
      setValue(String(answer.score ?? 0));
      return;
    }
    setValue(String(score));
    try {
      await override.mutateAsync({ studentOnQuizId: answer.id, score });
    } catch (error) {
      setValue(String(answer.score ?? 0));
      showQuizError(error, language);
    }
  };
  return (
    <span className="flex items-center gap-1 text-sm">
      <input
        type="number"
        min={0}
        max={max}
        step={0.5}
        value={value}
        disabled={override.isPending}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(e) => {
          dirty.current = true;
          setValue(e.target.value);
        }}
        onBlur={save}
        className="w-16 rounded-lg border border-gray-200 px-2 py-0.5 text-right disabled:opacity-60"
      />
      <span className="text-icon-color/60">{quizLanguage.scoreOf(language, max)}</span>
      {answer.teacherOverridden && <span className="text-xs text-warning-color">· {quizLanguage.overridden(language)}</span>}
    </span>
  );
}

export default function QuizStudentPanel({
  assignmentId,
  studentOnAssignmentId,
  onClose,
}: {
  assignmentId: string;
  studentOnAssignmentId: string;
  onClose: () => void;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const review = useGetQuizReview({ studentOnAssignmentId });
  const reset = useResetQuizAttempt(assignmentId);
  const data = review.data;
  const attempt = data?.studentOnAssignment.quizAttempt ?? null;
  const summary = attempt?.integritySummary;

  const confirmReset = async () => {
    const answer = await Swal.fire({
      title: quizLanguage.resetAttempt(lang),
      text: quizLanguage.resetConfirm(lang),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: quizLanguage.resetAttempt(lang),
    });
    if (!answer.isConfirmed) return;
    try {
      await reset.mutateAsync({ studentOnAssignmentId });
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({ title: result?.error ?? "Error", text: result?.message?.toString(), icon: "error" });
    }
  };

  const fact = (label: string, value: string) => (
    <div className="rounded-xl bg-background-color px-3 py-2">
      <div className="text-xs text-icon-color/60">{label}</div>
      <div className="font-semibold text-icon-color">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 md:items-stretch" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white font-Anuphan md:max-h-none md:w-[28rem] md:rounded-none md:rounded-l-3xl"
      >
        <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-icon-color">
              {data ? `${data.studentOnAssignment.firstName} ${data.studentOnAssignment.lastName}` : "…"}
            </div>
            {data && (
              <div className="text-sm text-icon-color/60">
                {quizLanguage.total(lang)}: {data.studentOnAssignment.score ?? 0}/{data.maxScore ?? 0}
              </div>
            )}
          </div>
          {data?.testMode && <RiskBadge score={attempt?.riskScore ?? null} language={lang} />}
          <button type="button" onClick={onClose} aria-label={quizLanguage.close(lang)} className="text-2xl text-icon-color/50 hover:text-icon-color">
            <MdClose />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          {data?.testMode && summary && (
            <section>
              <h4 className="mb-1 font-semibold text-icon-color">{quizLanguage.summary(lang)}</h4>
              <p className="mb-2 text-xs text-icon-color/60">
                {attempt?.riskSource === "JEV"
                  ? quizLanguage.jevPattern(lang, attempt.riskPattern, attempt.riskConfidence)
                  : quizLanguage.ruleBased(lang)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {fact(quizLanguage.exits(lang), String(summary.exitCount))}
                {fact(quizLanguage.timeAway(lang), formatDuration(summary.totalAwayMs))}
                {fact(quizLanguage.longestAway(lang), formatDuration(summary.longestAwayMs))}
                {fact(quizLanguage.translator(lang), summary.translateDetected ? "✓" : "–")}
                {fact(quizLanguage.pastes(lang), String(summary.pasteAttempts))}
                {fact(quizLanguage.screenshots(lang), String(summary.screenshotKeyCount))}
                {fact(quizLanguage.connectionGaps(lang), String(summary.heartbeatGapCount))}
              </div>
            </section>
          )}

          {data?.testMode && (
            <section>
              <h4 className="mb-2 font-semibold text-icon-color">{quizLanguage.timeline(lang)}</h4>
              {data.events.length === 0 ? (
                <p className="text-sm text-icon-color/50">{quizLanguage.noEvents(lang)}</p>
              ) : (
                <ol className="flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                  {data.events.map((e) => (
                    <li key={e.id} className="text-sm">
                      <span className="mr-2 tabular-nums text-icon-color/50">
                        {new Date(e.serverAt).toLocaleTimeString(lang === "th" ? "th-TH" : "en-GB")}
                      </span>
                      <span className="text-icon-color">{quizLanguage.event(lang, e.type)}</span>
                      {e.durationMs !== null && <span className="ml-1 text-icon-color/60">({formatDuration(e.durationMs)})</span>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h4 className="font-semibold text-icon-color">{quizLanguage.answers(lang)}</h4>
            {data?.items.map(({ question, answer }, i) => (
              <div key={question.id} className="rounded-2xl border border-gray-100 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-icon-color/60">{quizLanguage.questionLabel(lang, i + 1)}</span>
                  {answer && answer.score !== null ? (
                    <ScoreInput answer={answer} max={question.points} assignmentId={assignmentId} language={lang} />
                  ) : answer ? (
                    <span className="text-xs text-icon-color/50">{quizLanguage.notGradedYet(lang)}</span>
                  ) : (
                    <span className="text-xs text-icon-color/50">{quizLanguage.notAnswered(lang)}</span>
                  )}
                </div>
                <AnswerView question={question} answer={answer} language={lang} />
              </div>
            ))}
          </section>
        </div>

        {attempt && (
          <footer className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={confirmReset}
              disabled={reset.isPending}
              className="w-full rounded-2xl border border-error-color/30 py-2 text-sm font-medium text-error-color hover:bg-error-color/10"
            >
              {quizLanguage.resetAttempt(lang)}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
