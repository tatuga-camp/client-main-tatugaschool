import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language, QuizSettings } from "../../interfaces";
import {
  EMPTY_PREVIEW_ANSWER,
  gradePreviewQuestion,
  PreviewAnswer,
  PreviewQuestion,
  sumPreviewScores,
} from "../../utils/quizPreview";
import PreviewQuestionView from "./PreviewQuestionView";

type Props = {
  title: string;
  questions: PreviewQuestion[];
  settings?: QuizSettings | null;
  language: Language;
};

/**
 * The quiz as a student sees it on a phone, built from the editor's live
 * drafts. The teacher can answer and check; nothing is sent to the server.
 */
export default function StudentPreview({
  title,
  questions,
  settings,
  language,
}: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PreviewAnswer>>({});
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [showSummary, setShowSummary] = useState(false);
  const mode = settings?.scoringMode ?? "ALL_OR_NOTHING";

  const count = questions.length;
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const question = questions[Math.min(index, Math.max(0, count - 1))];
  const answerOf = (id: string) => answers[id] ?? EMPTY_PREVIEW_ANSWER;
  const scoreOf = (q: PreviewQuestion) =>
    gradePreviewQuestion(q, answerOf(q.id), mode);
  const maxScore = sumPreviewScores(questions.map((q) => q.points));

  const check = (id: string) => setChecked((prev) => new Set(prev).add(id));
  const reset = () => {
    setAnswers({});
    setChecked(new Set());
    setShowSummary(false);
    setIndex(0);
  };
  const checkAll = () => {
    setChecked(new Set(questions.map((q) => q.id)));
    setShowSummary(true);
  };

  const verdict = (q: PreviewQuestion) => {
    const score = scoreOf(q);
    if (q.points > 0 && score >= q.points)
      return {
        text: quizLanguage.previewCorrect(language),
        tone: "bg-success-color/10 text-success-color",
        emoji: "🎉",
      };
    if (score > 0)
      return {
        text: quizLanguage.previewPartly(language),
        tone: "bg-warning-color/15 text-icon-color",
        emoji: "👍",
      };
    return {
      text: quizLanguage.previewIncorrect(language),
      tone: "bg-error-color/10 text-error-color",
      emoji: "🤔",
    };
  };

  return (
    <section
      aria-label={quizLanguage.studentPreview(language)}
      className="flex flex-col items-center gap-3 font-Anuphan"
    >
      <div className="w-[340px] max-w-full rounded-[2.4rem] border-[9px] border-icon-color bg-icon-color shadow-xl">
        <div className="relative flex h-[min(680px,calc(100dvh-10rem))] min-h-[480px] flex-col overflow-hidden rounded-[1.8rem] bg-background-color">
          <div className="absolute left-1/2 top-1.5 z-10 h-4 w-24 -translate-x-1/2 rounded-full bg-icon-color" />

          <header className="shrink-0 bg-white px-4 pb-3 pt-8 shadow-sm">
            <p className="truncate text-sm font-bold text-icon-color">
              {title || quizLanguage.untitled(language)}
            </p>
            {count > 0 && (
              <>
                <p className="text-xs text-icon-color/60">
                  {quizLanguage.previewQuestionOf(language, index + 1, count)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {questions.map((q, i) => {
                    const done = checked.has(q.id);
                    const full = done && q.points > 0 && scoreOf(q) >= q.points;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        aria-label={quizLanguage.previewQuestionOf(
                          language,
                          i + 1,
                          count,
                        )}
                        onClick={() => {
                          setShowSummary(false);
                          setIndex(i);
                        }}
                        className={`h-2.5 rounded-full transition-all ${i === index && !showSummary ? "w-6" : "w-2.5"} ${
                          done
                            ? full
                              ? "bg-success-color"
                              : "bg-error-color"
                            : i === index
                              ? "bg-primary-color"
                              : "bg-gray-200"
                        }`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {count === 0 ? (
              <p className="mt-16 text-center text-sm text-icon-color/50">
                {quizLanguage.previewEmpty(language)}
              </p>
            ) : showSummary ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-3xl bg-gradient-to-br from-primary-color to-secondary-color p-5 text-center text-white">
                  <p className="text-sm text-white/80">
                    {quizLanguage.previewScore(language)}
                  </p>
                  <p className="text-4xl font-extrabold">
                    {sumPreviewScores(questions.map(scoreOf))}
                    <span className="text-lg font-semibold text-white/80">
                      {" "}
                      / {maxScore}
                    </span>
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {questions.map((q, i) => {
                    const v = verdict(q);
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSummary(false);
                            setIndex(i);
                          }}
                          className="flex w-full items-center gap-2 rounded-2xl bg-white p-3 text-left text-sm ring-1 ring-gray-100"
                        >
                          <span>{v.emoji}</span>
                          <span className="flex-1 truncate text-icon-color">
                            {i + 1}. {q.prompt.replace(/\{\{[^}]+\}\}/g, "___")}
                          </span>
                          <span className="shrink-0 font-semibold text-icon-color/70">
                            {scoreOf(q)}/{q.points}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              question && (
                <div className="flex flex-col gap-3">
                  {question.unsaved && (
                    <span className="w-max rounded-full bg-warning-color/20 px-2 py-0.5 text-[11px] font-semibold text-icon-color">
                      {quizLanguage.previewUnsaved(language)}
                    </span>
                  )}
                  <PreviewQuestionView
                    question={question}
                    answer={answerOf(question.id)}
                    onChange={(next) => {
                      setAnswers((prev) => ({ ...prev, [question.id]: next }));
                      setChecked((prev) => {
                        if (!prev.has(question.id)) return prev;
                        const nextSet = new Set(prev);
                        nextSet.delete(question.id);
                        return nextSet;
                      });
                    }}
                    language={language}
                    reveal={checked.has(question.id)}
                  />
                  {checked.has(question.id) && (
                    <div
                      role="status"
                      className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold ${verdict(question).tone}`}
                    >
                      <span>
                        {verdict(question).emoji} {verdict(question).text}
                      </span>
                      <span>
                        {quizLanguage.previewPointsEarned(
                          language,
                          scoreOf(question),
                          question.points,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {count > 0 && (
            <footer className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white px-3 py-3">
              <button
                type="button"
                disabled={index === 0 && !showSummary}
                onClick={() => {
                  if (showSummary) setShowSummary(false);
                  else setIndex((i) => Math.max(0, i - 1));
                }}
                className="rounded-xl px-3 py-2 text-sm text-icon-color/70 hover:bg-background-color disabled:opacity-30"
              >
                {quizLanguage.previewPrev(language)}
              </button>
              {!showSummary && question && (
                <button
                  type="button"
                  onClick={() => check(question.id)}
                  className="flex-1 rounded-xl border border-primary-color/40 px-3 py-2 text-sm font-semibold text-primary-color hover:bg-primary-color/10"
                >
                  {quizLanguage.previewCheck(language)}
                </button>
              )}
              {!showSummary &&
                (index < count - 1 ? (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => Math.min(count - 1, i + 1))}
                    className="rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white hover:bg-primary-color-hover"
                  >
                    {quizLanguage.previewNext(language)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={checkAll}
                    className="rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white hover:bg-primary-color-hover"
                  >
                    {quizLanguage.previewCheckAll(language)}
                  </button>
                ))}
              {showSummary && <div className="flex-1" />}
            </footer>
          )}
        </div>
      </div>

      <div className="flex w-[340px] max-w-full flex-col gap-1 text-center text-xs text-icon-color/60">
        <button
          type="button"
          onClick={reset}
          className="mx-auto flex items-center gap-1 rounded-full px-3 py-1 font-medium text-primary-color hover:bg-primary-color/10"
        >
          <MdRefresh /> {quizLanguage.previewReset(language)}
        </button>
        <p>{quizLanguage.previewHint(language)}</p>
        {(settings?.shuffleQuestions || settings?.shuffleOptions) && (
          <p>🔀 {quizLanguage.previewShuffleNote(language)}</p>
        )}
        {settings?.timeLimitMinutes ? (
          <p>
            ⏱️{" "}
            {quizLanguage.previewTimerNote(language, settings.timeLimitMinutes)}
          </p>
        ) : null}
        {settings?.testMode && (
          <p>🛡️ {quizLanguage.previewTestModeNote(language)}</p>
        )}
      </div>
    </section>
  );
}
