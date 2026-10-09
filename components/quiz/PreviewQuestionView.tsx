import React from "react";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
  MdCancel,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { promptSegments } from "../../utils/quizDraft";
import {
  normalizeBlankAnswer,
  PreviewAnswer,
  PreviewQuestion,
} from "../../utils/quizPreview";

type Props = {
  question: PreviewQuestion;
  answer: PreviewAnswer;
  onChange: (next: PreviewAnswer) => void;
  language: Language;
  /** After "Check answer": mark right and wrong choices and show the key. */
  reveal: boolean;
};

/**
 * What a student sees for one question (ported from the student app's
 * QuizQuestionView, sized for the phone frame), plus the answer reveal.
 */
export default function PreviewQuestionView({
  question,
  answer,
  onChange,
  language,
  reveal,
}: Props) {
  if (question.type === "FILL_BLANK") {
    const value = (blankId: string) =>
      answer.blankAnswers.find((b) => b.blankId === blankId)?.value ?? "";
    const setValue = (blankId: string, next: string) =>
      onChange({
        selectedOptionIds: [],
        blankAnswers: [
          ...answer.blankAnswers.filter((b) => b.blankId !== blankId),
          { blankId, value: next },
        ],
      });
    const isRight = (blankId: string) => {
      const blank = question.blanks.find((b) => b.id === blankId);
      const given = normalizeBlankAnswer(value(blankId));
      return (
        !!blank &&
        !!given &&
        blank.acceptedAnswers.some((a) => normalizeBlankAnswer(a) === given)
      );
    };
    return (
      <div className="flex flex-col gap-3">
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt=""
            className="max-h-48 rounded-2xl object-contain"
          />
        )}
        <p className="text-base leading-[2.6rem] text-icon-color">
          {promptSegments(question.prompt).map((segment, i) =>
            segment.kind === "text" ? (
              <span key={i}>{segment.text}</span>
            ) : (
              <input
                key={i}
                aria-label={`blank ${segment.blankId}`}
                value={value(segment.blankId)}
                onChange={(e) => setValue(segment.blankId, e.target.value)}
                size={Math.max(5, value(segment.blankId).length + 2)}
                autoComplete="off"
                spellCheck={false}
                className={`mx-1 inline-block max-w-full rounded-lg border-b-2 px-2 py-0.5 align-baseline text-base outline-none ${
                  reveal
                    ? isRight(segment.blankId)
                      ? "border-success-color bg-success-color/10"
                      : "border-error-color bg-error-color/10"
                    : "border-primary-color bg-primary-color/10 focus:bg-primary-color/15"
                }`}
              />
            ),
          )}
        </p>
        {reveal && (
          <div className="rounded-2xl bg-white p-3 text-sm ring-1 ring-gray-100">
            <p className="mb-1 font-semibold text-icon-color">
              {quizLanguage.previewAccepted(language)}
            </p>
            <ul className="flex flex-col gap-1">
              {question.blanks.map((blank, i) => (
                <li
                  key={blank.id}
                  className="flex flex-wrap items-center gap-1"
                >
                  <span className="text-icon-color/60">{i + 1}.</span>
                  {blank.acceptedAnswers.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-success-color/10 px-2 py-0.5 text-success-color"
                    >
                      {a}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const multiple = question.type === "MULTIPLE";
  const picked = new Set(answer.selectedOptionIds);
  const toggle = (id: string) => {
    if (!multiple)
      return onChange({ selectedOptionIds: [id], blankAnswers: [] });
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ selectedOptionIds: [...next], blankAnswers: [] });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="whitespace-pre-line text-base text-icon-color">
        {question.prompt}
      </p>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt=""
          className="max-h-48 rounded-2xl object-contain"
        />
      )}
      <ul
        className="flex flex-col gap-2"
        role={multiple ? "group" : "radiogroup"}
      >
        {question.options.map((option) => {
          const on = picked.has(option.id);
          const Icon = multiple
            ? on
              ? MdCheckBox
              : MdCheckBoxOutlineBlank
            : on
              ? MdRadioButtonChecked
              : MdRadioButtonUnchecked;
          const tone = reveal
            ? option.isCorrect
              ? "border-success-color bg-success-color/10"
              : on
                ? "border-error-color bg-error-color/10"
                : "border-gray-200 bg-white"
            : on
              ? "border-primary-color bg-primary-color/10"
              : "border-gray-200 bg-white hover:border-primary-color/40";
          return (
            <li key={option.id}>
              <button
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => toggle(option.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left text-sm text-icon-color transition ${tone}`}
              >
                <Icon
                  className={`shrink-0 text-xl ${on ? "text-primary-color" : "text-icon-color/30"}`}
                />
                <span className="flex flex-1 flex-col gap-2">
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt=""
                      className="max-h-32 rounded-xl object-contain"
                    />
                  )}
                  <span>{option.text}</span>
                </span>
                {reveal && option.isCorrect && (
                  <MdCheckCircle className="shrink-0 text-xl text-success-color" />
                )}
                {reveal && on && !option.isCorrect && (
                  <MdCancel className="shrink-0 text-xl text-error-color" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-icon-color/50">
        {multiple
          ? quizLanguage.previewChooseAll(language)
          : quizLanguage.previewChooseOne(language)}
      </p>
    </div>
  );
}
