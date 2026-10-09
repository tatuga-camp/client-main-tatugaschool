import React, { useRef, useState } from "react";
import { MdClose, MdShortText } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language, QuizQuestionInput } from "../../interfaces";
import {
  addAcceptedAnswer,
  insertBlankToken,
  newQuizId,
  promptSegments,
  syncBlanksWithPrompt,
} from "../../utils/quizDraft";

type Props = {
  value: QuizQuestionInput;
  onChange: (next: QuizQuestionInput) => void;
  language: Language;
  disabled: boolean;
};

export default function BlankEditor({ value, onChange, language, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const setPrompt = (prompt: string) =>
    onChange({ ...value, prompt, blanks: syncBlanksWithPrompt(prompt, value.blanks) });

  const addBlank = () => {
    const el = textareaRef.current;
    const cursor = el ? el.selectionStart : value.prompt.length;
    const next = insertBlankToken(value.prompt, cursor, newQuizId());
    setPrompt(next.prompt);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(next.cursor, next.cursor);
    });
  };

  const setAnswers = (blankId: string, answers: string[]) =>
    onChange({
      ...value,
      blanks: value.blanks.map((b) => (b.id === blankId ? { ...b, acceptedAnswers: answers } : b)),
    });

  const blankNumber = new Map(value.blanks.map((b, i) => [b.id, i + 1]));

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        disabled={disabled}
        value={value.prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder={quizLanguage.promptPlaceholder(language)}
        className="main-input w-full resize-y"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={addBlank}
        className="flex w-max items-center gap-1 rounded-xl border border-primary-color/30 px-3 py-1.5 text-sm font-medium text-primary-color transition hover:bg-primary-color/10 disabled:opacity-50"
      >
        <MdShortText /> {quizLanguage.addBlank(language)}
      </button>

      <div className="rounded-xl bg-background-color p-3 text-sm leading-8 text-icon-color">
        <span className="mr-2 text-xs font-medium uppercase text-icon-color/60">
          {quizLanguage.preview(language)}
        </span>
        {promptSegments(value.prompt).map((segment, i) =>
          segment.kind === "text" ? (
            <span key={i}>{segment.text}</span>
          ) : (
            <span
              key={i}
              className="mx-1 inline-block min-w-14 rounded-md bg-primary-color/15 px-2 text-center text-xs font-semibold text-primary-color"
            >
              {blankNumber.get(segment.blankId) ?? "?"}
            </span>
          ),
        )}
      </div>

      {value.blanks.map((blank, index) => (
        <div key={blank.id} className="rounded-xl border border-gray-100 p-3">
          <div className="mb-2 text-sm font-semibold text-icon-color">
            {quizLanguage.blankLabel(language, index + 1)} · {quizLanguage.acceptedAnswers(language)}
          </div>
          <div className="flex flex-wrap gap-2">
            {blank.acceptedAnswers.map((answer) => (
              <span
                key={answer}
                className="flex items-center gap-1 rounded-full bg-success-color/10 px-3 py-1 text-sm text-success-color"
              >
                {answer}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={quizLanguage.delete(language)}
                    onClick={() => setAnswers(blank.id, blank.acceptedAnswers.filter((a) => a !== answer))}
                  >
                    <MdClose />
                  </button>
                )}
              </span>
            ))}
            <input
              disabled={disabled}
              value={drafts[blank.id] ?? ""}
              placeholder={quizLanguage.addAnswerPlaceholder(language)}
              onChange={(e) => setDrafts((d) => ({ ...d, [blank.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
                e.preventDefault();
                setAnswers(blank.id, addAcceptedAnswer(blank.acceptedAnswers, drafts[blank.id] ?? ""));
                setDrafts((d) => ({ ...d, [blank.id]: "" }));
              }}
              className="min-w-40 flex-1 rounded-full border border-gray-200 px-3 py-1 text-sm outline-none focus:border-primary-color"
            />
          </div>
          <p className="mt-1 text-xs text-icon-color/60">{quizLanguage.acceptedHint(language)}</p>
        </div>
      ))}
    </div>
  );
}
