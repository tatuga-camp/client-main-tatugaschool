import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdCheckCircle, MdDelete, MdRadioButtonUnchecked } from "react-icons/md";
import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import { AssignmentOnQuiz, QuizQuestionInput, QuizQuestionType } from "../../interfaces";
import { useDeleteQuizQuestion, useGetLanguage, useUpdateQuizQuestion } from "../../react-query";
import {
  convertQuestionType,
  newQuizId,
  rebaseDraft,
  setQuestionImage,
  toQuestionInput,
  toQuestionPayload,
} from "../../utils/quizDraft";
import BlankEditor from "./BlankEditor";
import QuestionImageField from "./QuestionImageField";
import { showQuizError } from "./quizErrorAlert";

type Props = {
  question: AssignmentOnQuiz;
  index: number;
  locked: boolean;
  dragHandle?: React.ReactNode;
};

const TYPES: QuizQuestionType[] = ["SINGLE", "MULTIPLE", "FILL_BLANK"];

export default function QuestionCard({ question, index, locked, dragHandle }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const update = useUpdateQuizQuestion();
  const remove = useDeleteQuizQuestion();
  const [draft, setDraft] = useState<QuizQuestionInput>(() => toQuestionInput(question));
  const serverInput = useMemo(() => toQuestionInput(question), [question]);
  const serverKey = JSON.stringify(serverInput);
  const baseRef = useRef(serverInput);

  // Follow server changes to the question's own fields only (a reorder bumps updateAt
  // on every question), and never over unsaved edits.
  useEffect(() => {
    const prev = baseRef.current;
    baseRef.current = serverInput;
    setDraft((d) => rebaseDraft(d, prev, serverInput));
  }, [serverKey]);

  const dirty = JSON.stringify(draft) !== serverKey;

  const typeLabel = (type: QuizQuestionType) =>
    type === "SINGLE"
      ? quizLanguage.typeSingle(lang)
      : type === "MULTIPLE"
        ? quizLanguage.typeMultiple(lang)
        : quizLanguage.typeFillBlank(lang);

  const showError = (error: unknown) => showQuizError(error, lang);

  const save = async () => {
    try {
      const saved = await update.mutateAsync({ id: question.id, data: toQuestionPayload(draft) });
      setDraft(toQuestionInput(saved));
    } catch (error) {
      showError(error);
    }
  };

  const confirmDelete = async () => {
    const answer = await Swal.fire({
      title: quizLanguage.deleteConfirm(lang),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: quizLanguage.delete(lang),
    });
    if (!answer.isConfirmed) return;
    try {
      await remove.mutateAsync({ id: question.id });
    } catch (error) {
      showError(error);
    }
  };

  const setCorrect = (optionId: string) =>
    setDraft((d) => ({
      ...d,
      options: d.options.map((o) =>
        d.type === "SINGLE"
          ? { ...o, isCorrect: o.id === optionId }
          : o.id === optionId
            ? { ...o, isCorrect: !o.isCorrect }
            : o,
      ),
    }));

  const imageField = (
    <QuestionImageField
      imageUrl={draft.imageUrl}
      schoolId={question.schoolId}
      disabled={locked}
      language={lang}
      onChange={(imageUrl) => setDraft((d) => setQuestionImage(d, imageUrl))}
    />
  );

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 font-Anuphan">
      <header className="flex flex-wrap items-center gap-2">
        {dragHandle}
        <h3 className="font-semibold text-icon-color">{quizLanguage.questionLabel(lang, index + 1)}</h3>
        <select
          disabled={locked}
          value={draft.type}
          onChange={(e) => setDraft((d) => convertQuestionType(d, e.target.value as QuizQuestionType))}
          className="rounded-xl border border-gray-200 px-2 py-1 text-sm"
        >
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {typeLabel(type)}
            </option>
          ))}
        </select>
        <label className="ml-auto flex items-center gap-2 text-sm text-icon-color/70">
          {quizLanguage.points(lang)}
          <input
            type="number"
            min={0}
            step={0.5}
            disabled={locked}
            value={draft.points}
            onChange={(e) => setDraft((d) => ({ ...d, points: Math.max(0, Number(e.target.value) || 0) }))}
            className="w-20 rounded-xl border border-gray-200 px-2 py-1 text-right"
          />
        </label>
      </header>

      {draft.type === "FILL_BLANK" ? (
        <>
          <BlankEditor value={draft} onChange={setDraft} language={lang} disabled={locked} />
          {imageField}
        </>
      ) : (
        <>
          <textarea
            disabled={locked}
            value={draft.prompt}
            rows={2}
            placeholder={quizLanguage.promptPlaceholder(lang)}
            onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))}
            className="main-input w-full resize-y"
          />
          {imageField}
          <ul className="flex flex-col gap-2">
            {draft.options.map((option, i) => (
              <li key={option.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={locked}
                  aria-label={quizLanguage.markCorrect(lang)}
                  title={quizLanguage.markCorrect(lang)}
                  onClick={() => setCorrect(option.id)}
                  className={`text-2xl ${option.isCorrect ? "text-success-color" : "text-icon-color/30 hover:text-icon-color/60"}`}
                >
                  {option.isCorrect ? <MdCheckCircle /> : <MdRadioButtonUnchecked />}
                </button>
                <input
                  disabled={locked}
                  value={option.text}
                  placeholder={`${quizLanguage.option(lang)} ${i + 1}`}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      options: d.options.map((o) => (o.id === option.id ? { ...o, text: e.target.value } : o)),
                    }))
                  }
                  className={`main-input flex-1 ${option.isCorrect ? "border-success-color/50" : ""}`}
                />
                {!locked && draft.options.length > 2 && (
                  <button
                    type="button"
                    aria-label={quizLanguage.removeOption(lang)}
                    onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((o) => o.id !== option.id) }))}
                    className="text-xl text-icon-color/40 hover:text-error-color"
                  >
                    <MdDelete />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!locked && draft.options.length < 20 && (
            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  options: [...d.options, { id: newQuizId(), text: "", imageUrl: null, isCorrect: false }],
                }))
              }
              className="w-max text-sm font-medium text-primary-color hover:underline"
            >
              + {quizLanguage.addOption(lang)}
            </button>
          )}
        </>
      )}

      {!locked && (
        <footer className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <span className={`mr-auto text-xs ${dirty ? "text-warning-color" : "text-icon-color/50"}`}>
            {dirty ? quizLanguage.unsaved(lang) : quizLanguage.saved(lang)}
          </span>
          <button
            type="button"
            onClick={confirmDelete}
            className="rounded-xl px-3 py-1.5 text-sm text-error-color hover:bg-error-color/10"
          >
            {quizLanguage.delete(lang)}
          </button>
          <button
            type="button"
            disabled={!dirty || update.isPending || !draft.prompt.trim()}
            onClick={save}
            className="rounded-xl bg-primary-color px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-color-hover disabled:opacity-40"
          >
            {quizLanguage.save(lang)}
          </button>
        </footer>
      )}
    </article>
  );
}
