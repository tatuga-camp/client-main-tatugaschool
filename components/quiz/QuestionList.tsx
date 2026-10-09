import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  MdClose,
  MdContentCopy,
  MdDragIndicator,
  MdLock,
  MdPhoneIphone,
  MdQuiz,
} from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import {
  AssignmentOnQuiz,
  QuizQuestionInput,
  QuizQuestionType,
} from "../../interfaces";
import {
  useCreateQuizQuestion,
  useGetAssignment,
  useDuplicateQuiz,
  useGetLanguage,
  useGetQuizQuestions,
  useReorderQuizQuestions,
} from "../../react-query";
import { defaultQuestion } from "../../utils/quizDraft";
import { previewQuestions } from "../../utils/quizPreview";
import QuestionCard from "./QuestionCard";
import { showQuizError } from "./quizErrorAlert";
import StudentPreview from "./StudentPreview";

type CardHooks = {
  onDirtyChange?: (questionId: string, dirty: boolean) => void;
  onDraftChange: (
    questionId: string,
    draft: QuizQuestionInput | undefined,
  ) => void;
  registerSave: (
    questionId: string,
    save: (() => Promise<boolean>) | null,
  ) => void;
};

function SortableQuestion({
  question,
  index,
  locked,
  hooks,
}: {
  question: AssignmentOnQuiz;
  index: number;
  locked: boolean;
  hooks: CardHooks;
}) {
  const language = useGetLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id, disabled: locked });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={
        isDragging
          ? "z-10 rounded-2xl shadow-lg ring-2 ring-primary-color/30"
          : ""
      }
    >
      <QuestionCard
        question={question}
        index={index}
        locked={locked}
        onDirtyChange={hooks.onDirtyChange}
        onDraftChange={hooks.onDraftChange}
        registerSave={hooks.registerSave}
        dragHandle={
          !locked && (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={quizLanguage.dragToReorder(language.data ?? "en")}
              className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg text-icon-color/40 hover:bg-background-color active:cursor-grabbing"
            >
              <MdDragIndicator className="text-xl" />
            </button>
          )
        }
      />
    </li>
  );
}

export default function QuestionList({
  assignmentId,
  subjectId,
  locked,
  readOnly = locked,
  onDirtyChange,
  saveAllRef,
}: {
  assignmentId: string;
  subjectId: string;
  /** A student has started: show the banner and Duplicate. */
  locked: boolean;
  /** Cards cannot be edited (locked, or the lock check is still loading). */
  readOnly?: boolean;
  /** Lifts each card's unsaved state so the page can warn before leaving the tab or publishing. */
  onDirtyChange?: (questionId: string, dirty: boolean) => void;
  /** Filled with "save every card now"; resolves with how many still are not saved. */
  saveAllRef?: React.MutableRefObject<(() => Promise<number>) | null>;
}) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const questions = useGetQuizQuestions({ assignmentId });
  const create = useCreateQuizQuestion();
  const reorder = useReorderQuizQuestions();
  const duplicate = useDuplicateQuiz();
  const [menuOpen, setMenuOpen] = useState(false);
  const assignment = useGetAssignment({ id: assignmentId });
  const [drafts, setDrafts] = useState<
    Record<string, QuizQuestionInput | undefined>
  >({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const saves = useRef(new Map<string, () => Promise<boolean>>());

  const onDraftChange = useCallback(
    (questionId: string, draft: QuizQuestionInput | undefined) =>
      setDrafts((prev) =>
        prev[questionId] === draft ? prev : { ...prev, [questionId]: draft },
      ),
    [],
  );
  const registerSave = useCallback(
    (questionId: string, save: (() => Promise<boolean>) | null) => {
      if (save) saves.current.set(questionId, save);
      else saves.current.delete(questionId);
    },
    [],
  );
  const hooks: CardHooks = useMemo(
    () => ({ onDirtyChange, onDraftChange, registerSave }),
    [onDirtyChange, onDraftChange, registerSave],
  );
  if (saveAllRef) {
    saveAllRef.current = async () => {
      const results = await Promise.all(
        [...saves.current.values()].map((save) => save().catch(() => false)),
      );
      return results.filter((ok) => !ok).length;
    };
  }
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const list = questions.data ?? [];
  const preview = useMemo(() => previewQuestions(list, drafts), [list, drafts]);
  const previewPanel = (
    <StudentPreview
      title={assignment.data?.title ?? ""}
      questions={preview}
      settings={assignment.data?.quizSettings}
      language={lang}
    />
  );

  const fail = (error: unknown) => showQuizError(error, lang);

  const add = async (type: QuizQuestionType) => {
    setMenuOpen(false);
    try {
      await create.mutateAsync({ assignmentId, ...defaultQuestion(type) });
    } catch (error) {
      fail(error);
    }
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (readOnly || !over || active.id === over.id) return;
    const from = list.findIndex((q) => q.id === active.id);
    const to = list.findIndex((q) => q.id === over.id);
    const ids = arrayMove(list, from, to).map((q) => q.id);
    try {
      // The hook moves the card in the cache right away and rolls back on error.
      await reorder.mutateAsync({ assignmentId, ids });
    } catch (error) {
      fail(error);
    }
  };

  const duplicateQuiz = async () => {
    try {
      const copy = await duplicate.mutateAsync({ assignmentId });
      router.push(`/subject/${subjectId}/quiz/${copy.id}`);
    } catch (error) {
      fail(error);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-8 p-4 md:p-6">
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4 xl:mx-0">
        {locked && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning-color/30 bg-warning-color/10 p-4 text-sm text-icon-color">
            <MdLock className="text-xl text-warning-color" />
            <span className="flex-1">{quizLanguage.lockedBanner(lang)}</span>
            <button
              type="button"
              onClick={duplicateQuiz}
              disabled={duplicate.isPending}
              className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-primary-color ring-1 ring-primary-color/30 hover:bg-primary-color/10"
            >
              <MdContentCopy /> {quizLanguage.duplicate(lang)}
            </button>
          </div>
        )}

        {list.length === 0 && !questions.isLoading && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <MdQuiz className="text-4xl text-primary-color/60" />
            <p className="font-semibold text-icon-color">
              {quizLanguage.emptyTitle(lang)}
            </p>
            <p className="text-sm text-icon-color/60">
              {quizLanguage.emptyHint(lang)}
            </p>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={list.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="flex flex-col gap-4">
              {list.map((question, index) => (
                <SortableQuestion
                  key={question.id}
                  question={question}
                  index={index}
                  locked={readOnly}
                  hooks={hooks}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>

        {!readOnly && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              disabled={create.isPending}
              className="w-full rounded-2xl border-2 border-dashed border-primary-color/30 py-4 font-medium text-primary-color transition hover:bg-primary-color/5"
            >
              + {quizLanguage.newQuestion(lang)}
            </button>
            {menuOpen && (
              <div className="absolute left-1/2 top-full z-20 mt-2 flex w-64 -translate-x-1/2 flex-col rounded-2xl border border-gray-100 bg-white p-1 shadow-lg">
                {(
                  ["SINGLE", "MULTIPLE", "FILL_BLANK"] as QuizQuestionType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => add(type)}
                    className="rounded-xl px-3 py-2 text-left text-sm text-icon-color hover:bg-primary-color/10"
                  >
                    {type === "SINGLE"
                      ? quizLanguage.typeSingle(lang)
                      : type === "MULTIPLE"
                        ? quizLanguage.typeMultiple(lang)
                        : quizLanguage.typeFillBlank(lang)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student preview: beside the cards on wide screens, a sheet on smaller ones. */}
      <aside className="sticky top-4 hidden shrink-0 xl:block">
        {previewPanel}
      </aside>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-primary-color px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-color-hover xl:hidden"
      >
        <MdPhoneIphone className="text-lg" />{" "}
        {quizLanguage.studentPreview(lang)}
      </button>
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={quizLanguage.studentPreview(lang)}
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-icon-color/50 p-4 backdrop-blur-sm xl:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label={quizLanguage.close(lang)}
            className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-white text-xl text-icon-color shadow"
          >
            <MdClose />
          </button>
          {previewPanel}
        </div>
      )}
    </div>
  );
}
