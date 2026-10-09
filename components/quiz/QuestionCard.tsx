import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MdCheckCircle,
  MdDelete,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import {
  AssignmentOnQuiz,
  QuizQuestionInput,
  QuizQuestionType,
} from "../../interfaces";
import {
  useDeleteQuizQuestion,
  useGetLanguage,
  useUpdateQuizQuestion,
} from "../../react-query";
import {
  AutosaveQueue,
  AutosaveStatus,
  QUESTION_AUTOSAVE_DELAY_MS,
  QUESTION_AUTOSAVE_RETRY_MS,
} from "../../utils/questionAutosave";
import { isSavedAs, saveBlocker, SaveBlocker } from "../../utils/quizPreview";
import {
  commitPendingAnswers,
  convertQuestionType,
  newQuizId,
  PendingAnswers,
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
  /** Reports whether this card has unsaved edits (false again when it unmounts). */
  onDirtyChange?: (questionId: string, dirty: boolean) => void;
  /** Reports the live draft for the student preview (undefined when it matches the server). */
  onDraftChange?: (
    questionId: string,
    draft: QuizQuestionInput | undefined,
  ) => void;
  /** Registers "save this card now"; resolves true when it is on the server. */
  registerSave?: (
    questionId: string,
    save: (() => Promise<boolean>) | null,
  ) => void;
};

const BUSY: AutosaveStatus[] = ["waiting", "saving", "retrying"];

const TYPES: QuizQuestionType[] = ["SINGLE", "MULTIPLE", "FILL_BLANK"];

export default function QuestionCard({
  question,
  index,
  locked,
  dragHandle,
  onDirtyChange,
  onDraftChange,
  registerSave,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const update = useUpdateQuizQuestion();
  const remove = useDeleteQuizQuestion();
  const [draft, setDraft] = useState<QuizQuestionInput>(() =>
    toQuestionInput(question),
  );
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

  const [pending, setPending] = useState<PendingAnswers>({});
  // Typed-but-not-added answers count as edits and are included in what Save sends.
  const committed = useMemo(
    () => commitPendingAnswers(draft, pending),
    [draft, pending],
  );
  const payload = useMemo(() => toQuestionPayload(committed), [committed]);

  // Autosave: 2 s after the last valid edit. Typed-but-not-added blank answers
  // are left out until the teacher adds them (Enter / blur) or presses Save.
  const saveRef = useRef(update.mutateAsync);
  saveRef.current = update.mutateAsync;
  const [autoStatus, setAutoStatus] = useState<AutosaveStatus>("idle");
  const queueRef = useRef<AutosaveQueue<QuizQuestionInput> | null>(null);
  if (!queueRef.current) {
    queueRef.current = new AutosaveQueue<QuizQuestionInput>({
      save: async (data) => {
        await saveRef.current({ id: question.id, data });
      },
      delayMs: QUESTION_AUTOSAVE_DELAY_MS,
      retryDelaysMs: QUESTION_AUTOSAVE_RETRY_MS,
      setTimer: (fn, ms) => window.setTimeout(fn, ms),
      clearTimer: (timer) => window.clearTimeout(timer as number),
      onStatus: setAutoStatus,
    });
  }
  const queue = queueRef.current;
  useEffect(() => () => queue.dispose(), [queue]);

  const draftKey = JSON.stringify(draft);
  const draftSaved = isSavedAs(draft, question);
  const blocker: SaveBlocker | null = saveBlocker(committed);
  useEffect(() => {
    if (locked || draftSaved || saveBlocker(draft)) {
      queue.cancel();
      return;
    }
    queue.edit(toQuestionPayload(draft));
  }, [draftKey, draftSaved, locked]);

  const unsaved = !isSavedAs(committed, question);
  const dirty = unsaved || BUSY.includes(autoStatus) || autoStatus === "error";

  /** Save now, including typed-but-not-added answers. True when on the server. */
  const saveNow = async (): Promise<boolean> => {
    if (locked) return !unsaved;
    if (!unsaved) return queue.flush();
    if (saveBlocker(committed)) return false;
    queue.edit(payload);
    const ok = await queue.flush();
    if (ok) setPending({});
    return ok;
  };
  const saveNowRef = useRef(saveNow);
  saveNowRef.current = saveNow;
  useEffect(() => {
    registerSave?.(question.id, () => saveNowRef.current());
    return () => registerSave?.(question.id, null);
  }, [question.id]);

  const reportDraft = useRef(onDraftChange);
  reportDraft.current = onDraftChange;
  useEffect(() => {
    reportDraft.current?.(question.id, draftSaved ? undefined : draft);
  }, [draftKey, draftSaved, question.id]);
  useEffect(
    () => () => reportDraft.current?.(question.id, undefined),
    [question.id],
  );

  const reportDirty = useRef(onDirtyChange);
  reportDirty.current = onDirtyChange;
  useEffect(() => {
    reportDirty.current?.(question.id, dirty);
  }, [dirty, question.id]);
  useEffect(
    () => () => reportDirty.current?.(question.id, false),
    [question.id],
  );

  const typeLabel = (type: QuizQuestionType) =>
    type === "SINGLE"
      ? quizLanguage.typeSingle(lang)
      : type === "MULTIPLE"
        ? quizLanguage.typeMultiple(lang)
        : quizLanguage.typeFillBlank(lang);

  const showError = (error: unknown) => showQuizError(error, lang);

  const save = async () => {
    const ok = await saveNow();
    if (!ok && update.error) showError(update.error);
  };

  const blockerText = (b: SaveBlocker) =>
    ({
      prompt: quizLanguage.blockPrompt(lang),
      twoOptions: quizLanguage.blockTwoOptions(lang),
      optionText: quizLanguage.blockOptionText(lang),
      pickOne: quizLanguage.blockPickOne(lang),
      pickAtLeastOne: quizLanguage.blockPickAtLeastOne(lang),
      needBlank: quizLanguage.blockNeedBlank(lang),
      blankAnswer: quizLanguage.blockBlankAnswer(lang),
    })[b];

  const status: { text: string; tone: string } = blocker
    ? {
        text: unsaved
          ? quizLanguage.notSavedBecause(lang, blockerText(blocker))
          : quizLanguage.needsAttention(lang, blockerText(blocker)),
        tone: "text-error-color",
      }
    : autoStatus === "saving"
      ? {
          text: quizLanguage.autosaveSaving(lang),
          tone: "text-icon-color/60",
        }
      : autoStatus === "retrying"
        ? {
            text: quizLanguage.autosaveRetrying(lang),
            tone: "text-warning-color",
          }
        : autoStatus === "error"
          ? {
              text: quizLanguage.autosaveError(lang),
              tone: "text-error-color",
            }
          : unsaved
            ? {
                text: quizLanguage.autosaveWaiting(lang),
                tone: "text-warning-color",
              }
            : {
                text: `✓ ${quizLanguage.autosaveSaved(lang)}`,
                tone: "text-success-color",
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
    <article
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 font-Anuphan ${
        !locked && (blocker || autoStatus === "error")
          ? "border-error-color/40"
          : "border-gray-100"
      }`}
    >
      <header className="flex flex-wrap items-center gap-2">
        {dragHandle}
        <h3 className="font-semibold text-icon-color">
          {quizLanguage.questionLabel(lang, index + 1)}
        </h3>
        <select
          disabled={locked}
          value={draft.type}
          onChange={(e) =>
            setDraft((d) =>
              convertQuestionType(d, e.target.value as QuizQuestionType),
            )
          }
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
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                points: Math.max(0, Number(e.target.value) || 0),
              }))
            }
            className="w-20 rounded-xl border border-gray-200 px-2 py-1 text-right"
          />
        </label>
      </header>

      {draft.type === "FILL_BLANK" ? (
        <>
          <BlankEditor
            value={draft}
            onChange={setDraft}
            language={lang}
            disabled={locked}
            pending={pending}
            onPendingChange={setPending}
          />
          {imageField}
        </>
      ) : (
        <>
          <textarea
            disabled={locked}
            value={draft.prompt}
            rows={2}
            placeholder={quizLanguage.promptPlaceholder(lang)}
            onChange={(e) =>
              setDraft((d) => ({ ...d, prompt: e.target.value }))
            }
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
                  {option.isCorrect ? (
                    <MdCheckCircle />
                  ) : (
                    <MdRadioButtonUnchecked />
                  )}
                </button>
                <input
                  disabled={locked}
                  value={option.text}
                  placeholder={`${quizLanguage.option(lang)} ${i + 1}`}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      options: d.options.map((o) =>
                        o.id === option.id ? { ...o, text: e.target.value } : o,
                      ),
                    }))
                  }
                  className={`main-input flex-1 ${option.isCorrect ? "border-success-color/50" : ""}`}
                />
                {!locked && draft.options.length > 2 && (
                  <button
                    type="button"
                    aria-label={quizLanguage.removeOption(lang)}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        options: d.options.filter((o) => o.id !== option.id),
                      }))
                    }
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
                  options: [
                    ...d.options,
                    {
                      id: newQuizId(),
                      text: "",
                      imageUrl: null,
                      isCorrect: false,
                    },
                  ],
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
          <span
            role="status"
            aria-live="polite"
            className={`mr-auto text-xs ${status.tone}`}
          >
            {status.text}
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
            disabled={!dirty || update.isPending || !!blocker}
            onClick={save}
            className={`rounded-xl bg-primary-color px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-color-hover disabled:opacity-40 ${
              autoStatus === "error" ? "ring-2 ring-error-color/50" : ""
            }`}
          >
            {quizLanguage.save(lang)}
          </button>
        </footer>
      )}
    </article>
  );
}
