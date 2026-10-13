import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React, { useMemo, useState } from "react";
import { FiCalendar, FiCheck, FiSearch, FiX } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { MdImportContacts } from "react-icons/md";
import Swal from "sweetalert2";
import {
  classworkTransferLanguage as t,
  quizLanguage,
} from "../../data/languages";
import { ErrorMessages, Language } from "../../interfaces";
import { MenuAssignmentQuery } from "../../pages/subject/[subjectId]/assignment/[assignmentId]";
import {
  useCreateAssignment,
  useCreateFileOnAssignment,
  useCreateQuestionOnVideo,
  useDuplicateQuiz,
  useGetAssignments,
  useGetLanguage,
  useUpdateSkillToAssignment,
} from "../../react-query";
import { ResponseGetAssignmentsService } from "../../services";
import { fieldInputClass } from "../common/FormField";
import LoadingSpinner from "../common/LoadingSpinner";
import { TYPE_TILE, TypeIcon, typeLabel } from "./ClassworkCard";
import {
  PickerSubject,
  SubjectPickerEmpty,
  SubjectPickerFilters,
  SubjectPickRow,
  SubjectRowsSkeleton,
  useSubjectPicker,
} from "./SubjectPicker";

type SourceClasswork = ResponseGetAssignmentsService[number];

type Props = {
  schoolId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
  targetSubjectId: string;
};
function ImportAssignment({
  schoolId,
  onClose,
  toast,
  targetSubjectId,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const picker = useSubjectPicker({ schoolId });
  const [source, setSource] = useState<PickerSubject | null>(null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-classwork-title"
      className="flex h-[min(46rem,calc(100dvh-2rem))] w-[min(56rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white font-Anuphan shadow-xl"
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
        {source ? (
          <button
            type="button"
            onClick={() => setSource(null)}
            aria-label={t.back(lang)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 hover:text-icon-color"
          >
            <IoArrowBack />
          </button>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            <MdImportContacts aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-icon-color/50">
            {t.importStep(lang, source ? 2 : 1)}
          </p>
          <h2
            id="import-classwork-title"
            className="truncate text-lg font-semibold text-icon-color"
          >
            {source ? source.title : t.importTitle(lang)}
          </h2>
          <p className="text-sm text-icon-color/60">
            {source ? t.importPickClasswork(lang) : t.importPickSubject(lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close(lang)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 hover:text-icon-color"
        >
          <FiX />
        </button>
      </header>

      {source ? (
        <ClassworkStep
          key={source.id}
          lang={lang}
          subjectId={source.id}
          targetSubjectId={targetSubjectId}
          toast={toast}
          onBack={() => setSource(null)}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-4 pt-4 sm:px-6">
            <SubjectPickerFilters picker={picker} lang={lang} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
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
                    mode="open"
                    onClick={() => setSource(subject)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportAssignment;

function formatDate(value: string, lang: Language) {
  return new Date(value).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ClassworkStepProps = {
  lang: Language;
  subjectId: string;
  targetSubjectId: string;
  toast: React.RefObject<Toast>;
  onBack: () => void;
};
function ClassworkStep({
  lang,
  subjectId,
  targetSubjectId,
  toast,
  onBack,
}: ClassworkStepProps) {
  const router = useRouter();
  const classworks = useGetAssignments({ subjectId });
  const create = useCreateAssignment();
  const createFiles = useCreateFileOnAssignment();
  const createQuestions = useCreateQuestionOnVideo();
  const duplicateQuiz = useDuplicateQuiz();
  const updateSkill = useUpdateSkillToAssignment();
  const [selected, setSelected] = useState<SourceClasswork | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...(classworks.data ?? [])]
      .sort((a, b) => a.order - b.order)
      .filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
  }, [classworks.data, search]);

  const handleImport = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      if (selected.type === "Quiz") {
        const copy = await duplicateQuiz.mutateAsync({
          assignmentId: selected.id,
          targetSubjectId,
        });
        router.push(`/subject/${targetSubjectId}/quiz/${copy.id}`);
        return;
      }
      const classwork = await create.mutateAsync({
        subjectId: targetSubjectId,
        title: selected.title,
        description: selected.description,
        dueDate: selected.dueDate,
        type: selected.type,
        status: selected.status,
        maxScore: selected.maxScore,
        beginDate: selected.beginDate,
        videoURL: selected.videoURL,
        preventFastForward: selected.preventFastForward,
        tags: selected.tags,
      });

      if (selected.files && selected.files.length > 0) {
        await Promise.allSettled(
          selected.files.map((f) =>
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
      if (selected.questions && selected.questions.length > 0) {
        await Promise.allSettled(
          selected.questions.map((f) =>
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

      toast.current?.show({
        severity: "success",
        summary: t.imported(lang),
        detail: classwork.title,
      });
      router.push({
        pathname: `/subject/${targetSubjectId}/assignment/${classwork.id}`,
        query: { menu: "manageassigning" as MenuAssignmentQuery },
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

  const query = search.trim();

  return (
    <>
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <label className="relative block">
          <span className="sr-only">{t.searchClasswork(lang)}</span>
          <FiSearch
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-color/40"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchClasswork(lang)}
            className={`${fieldInputClass()} pl-11`}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {classworks.isLoading ? (
          <SubjectRowsSkeleton />
        ) : classworks.error ? (
          <p
            role="alert"
            className="rounded-2xl border border-error-color/20 bg-error-color/5 px-4 py-6 text-center text-sm text-error-color"
          >
            {t.loadFailed(lang)}: {classworks.error.message}
          </p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-icon-color/15 px-6 py-10 text-center">
            <span aria-hidden className="text-3xl">
              🗂️
            </span>
            <p className="font-semibold text-icon-color">
              {query ? t.noClassworkMatch(lang, query) : t.noClasswork(lang)}
            </p>
            {!query && (
              <button
                type="button"
                onClick={onBack}
                className="mt-1 rounded-full px-3 py-1.5 text-sm font-medium text-primary-color hover:bg-primary-color/10"
              >
                {t.back(lang)}
              </button>
            )}
          </div>
        ) : (
          <ul role="radiogroup" className="flex flex-col gap-2">
            {visible.map((classwork) => (
              <ClassworkPickRow
                key={classwork.id}
                classwork={classwork}
                lang={lang}
                selected={selected?.id === classwork.id}
                onSelect={() => setSelected(classwork)}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <p className="min-w-0 flex-1 text-sm text-icon-color/60">
          {selected
            ? selected.type === "Quiz"
              ? t.quizDraftHint(lang)
              : t.classworkHint(lang)
            : t.importPickClasswork(lang)}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-icon-color transition hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
          >
            {t.back(lang)}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !selected}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {loading ? <LoadingSpinner /> : <MdImportContacts aria-hidden />}
            {t.importButton(lang)}
          </button>
        </div>
      </footer>
    </>
  );
}

function ClassworkPickRow({
  classwork,
  lang,
  selected,
  onSelect,
}: {
  classwork: SourceClasswork;
  lang: Language;
  selected: boolean;
  onSelect: () => void;
}) {
  const isPublished = classwork.status === "Published";
  const fileCount = classwork.files?.length ?? 0;
  const questionCount = classwork.questions?.length ?? 0;
  return (
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition sm:gap-4 ${
          selected
            ? "border-primary-color bg-primary-color/5 ring-2 ring-primary-color/15"
            : "border-gray-100 bg-white hover:border-primary-color/30 hover:bg-background-color"
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${TYPE_TILE[classwork.type]}`}
        >
          <TypeIcon type={classwork.type} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-semibold text-icon-color group-hover:text-primary-color">
            {classwork.title}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-icon-color/60">
            <span className="font-medium">{typeLabel(classwork.type, lang)}</span>
            {classwork.dueDate && (
              <span className="flex items-center gap-1">
                <FiCalendar aria-hidden />
                {t.due(lang, formatDate(classwork.dueDate, lang))}
              </span>
            )}
            {fileCount > 0 && <span>{t.files(lang, fileCount)}</span>}
            {questionCount > 0 && (
              <span>{t.questions(lang, questionCount)}</span>
            )}
          </span>
        </span>
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline ${
            isPublished
              ? "bg-success-color/10 text-success-color"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isPublished ? quizLanguage.published(lang) : quizLanguage.draft(lang)}
        </span>
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
            selected
              ? "border-primary-color bg-primary-color text-white"
              : "border-icon-color/20 bg-white text-transparent group-hover:border-primary-color/50"
          }`}
        >
          <FiCheck />
        </span>
      </button>
    </li>
  );
}
