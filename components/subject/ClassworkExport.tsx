import React, { useState } from "react";
import { FiShare, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import {
  classworkTransferLanguage as t,
  quizLanguage,
} from "../../data/languages";
import {
  Assignment,
  ErrorMessages,
  FileOnAssignment,
} from "../../interfaces";
import {
  useCreateAssignment,
  useCreateFileOnAssignment,
  useCreateQuestionOnVideo,
  useDuplicateQuiz,
  useGetLanguage,
  useGetQuestionOnVideoByAssignmentId,
  useUpdateSkillToAssignment,
} from "../../react-query";
import { countExportResults } from "../../utils/classworkExport";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  PickerSubject,
  SubjectPickerEmpty,
  SubjectPickerFilters,
  SubjectPickRow,
  SubjectRowsSkeleton,
  useSubjectPicker,
} from "./SubjectPicker";

type Props = {
  assignment: Assignment;
  files: FileOnAssignment[];
  schoolId: string;
  currentSubjectId: string;
  /** Popup usage: shows a close button in the header. */
  onClose?: () => void;
};

function ClassworkExport({
  assignment,
  files,
  schoolId,
  currentSubjectId,
  onClose,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const isQuiz = assignment.type === "Quiz";
  const picker = useSubjectPicker({
    schoolId,
    excludeSubjectId: currentSubjectId,
  });
  // Selections survive filter changes, so a teacher can pick across years.
  const [selected, setSelected] = useState<PickerSubject[]>([]);
  const selectedIds = new Set(selected.map((s) => s.id));

  const questions = useGetQuestionOnVideoByAssignmentId({
    assignmentId: assignment.id,
  });
  const create = useCreateAssignment();
  const createFiles = useCreateFileOnAssignment();
  const createQuestions = useCreateQuestionOnVideo();
  const duplicateQuiz = useDuplicateQuiz();
  const updateSkill = useUpdateSkillToAssignment();
  const [loading, setLoading] = useState(false);

  const toggle = (subject: PickerSubject) =>
    setSelected((prev) =>
      prev.some((s) => s.id === subject.id)
        ? prev.filter((s) => s.id !== subject.id)
        : [...prev, subject],
    );

  const allShownSelected =
    picker.visible.length > 0 &&
    picker.visible.every((s) => selectedIds.has(s.id));
  const toggleAllShown = () =>
    setSelected((prev) =>
      allShownSelected
        ? prev.filter((s) => !picker.visible.some((v) => v.id === s.id))
        : [
            ...prev,
            ...picker.visible.filter((v) => !prev.some((s) => s.id === v.id)),
          ],
    );

  const handleExport = async () => {
    if (selected.length === 0) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selected.map(async (targetSubject) => {
          if (isQuiz) {
            await duplicateQuiz.mutateAsync({
              assignmentId: assignment.id,
              targetSubjectId: targetSubject.id,
            });
            return;
          }
          const classwork = await create.mutateAsync({
            subjectId: targetSubject.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            type: assignment.type,
            status: assignment.status,
            maxScore: assignment.maxScore,
            beginDate: assignment.beginDate,
            videoURL: assignment.videoURL,
            preventFastForward: assignment.preventFastForward,
            assignAll: true,
            tags: assignment.tags,
          });

          if (files && files.length > 0) {
            await Promise.allSettled(
              files.map((f) =>
                createFiles.mutateAsync({
                  assignmentId: classwork.id,
                  type: f.type,
                  url: f.url,
                  size: f.size,
                  ...(f.blurHash && { blurHash: f.blurHash }),
                }),
              ),
            );
          }

          if (questions.data && questions.data.length > 0) {
            await Promise.allSettled(
              questions.data.map((f) =>
                createQuestions.mutateAsync({
                  assignmentId: classwork.id,
                  question: f.question,
                  correctOptions: f.correctOptions,
                  timestamp: f.timestamp,
                  options: f.options,
                }),
              ),
            );
          }
          updateSkill.mutate({
            assignmentId: classwork.id,
          });
        }),
      );

      setLoading(false);
      setSelected([]);
      const { succeeded, total } = countExportResults(results);
      Swal.fire({
        title:
          succeeded === 0
            ? quizLanguage.exportFailedTitle(lang)
            : quizLanguage.exportDone(lang),
        text: quizLanguage.exportResult(lang, succeeded, total),
        footer:
          isQuiz && succeeded > 0
            ? quizLanguage.exportQuizDraftNote(lang)
            : undefined,
        icon:
          succeeded === total
            ? "success"
            : succeeded === 0
              ? "error"
              : "warning",
      });
    } catch (error) {
      setLoading(false);
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString() || (error as Error).message,
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex min-h-full flex-col font-Anuphan">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 md:p-6">
        <section className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            <FiShare aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-icon-color">
              {t.exportHeading(lang)}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-icon-color/60">
              {isQuiz ? t.exportBodyQuiz(lang) : t.exportBody(lang)}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close(lang)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-icon-color/60 transition hover:bg-background-color hover:text-icon-color focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-color"
            >
              <FiX aria-hidden />
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <SubjectPickerFilters picker={picker} lang={lang} />

          <div className="mb-3 mt-5 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-icon-color">
              {t.subjects(lang)}
              {!picker.isLoading && (
                <span className="ml-2 rounded-full bg-background-color px-2 py-0.5 text-xs font-medium text-icon-color/60">
                  {picker.visible.length}
                </span>
              )}
            </h3>
            {picker.visible.length > 1 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-icon-color/70">
                <input
                  type="checkbox"
                  checked={allShownSelected}
                  onChange={toggleAllShown}
                  className="h-4 w-4 accent-primary-color"
                />
                {t.selectAllShown(lang)}
              </label>
            )}
          </div>

          {picker.isLoading ? (
            <SubjectRowsSkeleton />
          ) : picker.visible.length === 0 ? (
            <SubjectPickerEmpty picker={picker} lang={lang} />
          ) : (
            <ul className="flex flex-col gap-2">
              {picker.visible.map((subject) => (
                <SubjectPickRow
                  key={subject.id}
                  subject={subject}
                  lang={lang}
                  mode="check"
                  selected={selectedIds.has(subject.id)}
                  onClick={() => toggle(subject)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Sticky action bar: always shows what will happen before it happens. */}
      <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            {selected.length > 0 ? (
              <>
                <span className="truncate font-semibold text-icon-color">
                  {t.selected(lang, selected.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  disabled={loading}
                  className="shrink-0 rounded-full px-2.5 py-1 font-medium text-primary-color hover:bg-primary-color/10 disabled:opacity-50"
                >
                  {t.clearSelection(lang)}
                </button>
              </>
            ) : (
              <span className="truncate text-icon-color/60">
                {t.selectHint(lang)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading || selected.length === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : <FiShare aria-hidden />}
            {loading ? t.copying(lang) : t.copyTo(lang, selected.length)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassworkExport;
