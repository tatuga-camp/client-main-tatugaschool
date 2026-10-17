import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  MdClose,
  MdImage,
  MdLink,
  MdOutlineCloudUpload,
  MdPictureAsPdf,
} from "react-icons/md";
import { RiSparkling2Line, RiYoutubeLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { quizLanguage } from "../../data/languages";
import type {
  Language,
  QuizGenerationJob,
  QuizGenerationSource,
  QuizGenerationUsage,
  QuizQuestionType,
} from "../../interfaces";
import {
  keyQuiz,
  useCreateQuizGeneration,
  useGetLanguage,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLWithProgressService,
} from "../../services";
import {
  checkAttachmentFile,
  fileMimeType,
  formatBytes,
  kindForMime,
  MB,
} from "../../utils/quizAttachment";
import {
  defaultGenerationForm,
  GENERATION_LIMITS,
  GenerationForm,
  GenerationSourceDraft,
  isQuizGeneratingError,
  isQuizNotDraftError,
  isQuotaError,
  needsChoices,
  toGenerationInput,
  validateGenerationForm,
} from "../../utils/quizGeneration";
import { UploadAbortedError } from "../../utils/uploadWithRetry";
import InputNumber from "../common/InputNumber";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import { showQuizError } from "./quizErrorAlert";

type Props = {
  assignmentId: string;
  schoolId: string;
  usage: QuizGenerationUsage | undefined;
  /** Pre-filled form ("Try again" from a failed job). */
  initial?: GenerationForm;
  onClose: () => void;
  onSubmitted: (job: QuizGenerationJob) => void;
};

type Upload = {
  name: string;
  kind: "IMAGE" | "PDF";
  size: number;
  loaded: number;
};

/** Gemini's PDF ceiling for generation; stricter than the 200 MB attachment limit. */
export const GENERATION_PDF_MAX_BYTES = 50 * MB;

const SOURCE_MODES: GenerationSourceDraft["mode"][] = ["FILE", "YOUTUBE", "WEBSITE"];
const TYPE_ORDER: QuizQuestionType[] = ["SINGLE", "MULTIPLE", "FILL_BLANK"];
const LANGUAGES: ("th" | "en")[] = ["th", "en"];

function modeLabel(mode: GenerationSourceDraft["mode"], lang: Language): string {
  if (mode === "FILE") return quizLanguage.sourceFile(lang);
  if (mode === "YOUTUBE") return quizLanguage.sourceYoutube(lang);
  return quizLanguage.sourceWebsite(lang);
}

function typeLabel(type: QuizQuestionType, lang: Language): string {
  if (type === "SINGLE") return quizLanguage.typeSingle(lang);
  if (type === "MULTIPLE") return quizLanguage.typeMultiple(lang);
  return quizLanguage.typeFillBlank(lang);
}

function languageLabel(language: "th" | "en"): string {
  return language === "th" ? "ไทย" : "English";
}

const sectionLabel = "text-sm font-medium text-icon-color";
const chipBase =
  "rounded-full px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
const chipOn = "bg-primary-color text-white";
const chipOff = "bg-icon-color/5 text-icon-color hover:bg-primary-color/10";
const issueText = "text-xs text-error-color";

/**
 * "Generate questions with AI" form: pick a source (upload a PDF/image,
 * paste a YouTube or website link), how many questions, which types, choices
 * per question, output language and optional instructions. Submits the job
 * and hands it to the caller; the status card then takes over.
 */
export default function QuizGenerateDialog({
  assignmentId,
  schoolId,
  usage,
  initial,
  onClose,
  onSubmitted,
}: Props): JSX.Element {
  const language = useGetLanguage();
  const lang: Language = language.data ?? "en";
  const [form, setForm] = useState<GenerationForm>(
    () => initial ?? defaultGenerationForm(language.data ?? "en"),
  );
  const [upload, setUpload] = useState<Upload | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const queryClient = useQueryClient();
  const create = useCreateQuizGeneration();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const patch = (changes: Partial<GenerationForm>) =>
    setForm((f) => ({ ...f, ...changes }));
  const patchSource = (changes: Partial<GenerationSourceDraft>) =>
    setForm((f) => ({ ...f, source: { ...f.source, ...changes } }));

  const issue = validateGenerationForm(form);
  const uploading = upload !== null;
  const quotaReached = !!usage && usage.used >= usage.limit;
  const urlTouched = form.source.url.trim().length > 0;
  const canSubmit =
    !uploading && issue === null && !quotaReached && !create.isPending;

  const startUpload = async (file: File) => {
    const kind = kindForMime(fileMimeType(file));
    if (kind !== "IMAGE" && kind !== "PDF") {
      // Only PDF and images can be read by the generator; the drop hint
      // already states the accepted kinds and limits, so it doubles as the error.
      showQuizError({ error: quizLanguage.dropFileHint(lang) }, lang);
      return;
    }
    const check = checkAttachmentFile(file, kind === "IMAGE" ? "image" : "file");
    if (!check.ok) {
      const message =
        check.reason === "tooLarge"
          ? quizLanguage.fileTooLarge(
              lang,
              quizLanguage.kindLabel(lang, check.kind),
              formatBytes(check.maxBytes),
              formatBytes(file.size),
            )
          : check.reason === "empty"
            ? quizLanguage.fileEmpty(lang)
            : quizLanguage.dropFileHint(lang);
      showQuizError({ error: message }, lang);
      return;
    }
    if (kind === "PDF" && file.size > GENERATION_PDF_MAX_BYTES) {
      showQuizError(
        {
          error: quizLanguage.fileTooLarge(
            lang,
            quizLanguage.kindLabel(lang, "PDF"),
            formatBytes(GENERATION_PDF_MAX_BYTES),
            formatBytes(file.size),
          ),
        },
        lang,
      );
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({ name: file.name, kind, size: file.size, loaded: 0 });
    try {
      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: check.mimeType,
        fileSize: file.size,
        schoolId,
        purpose: "quiz-attachment",
      });
      if (controller.signal.aborted) throw new UploadAbortedError();
      await UploadSignURLWithProgressService({
        contentType: check.mimeType,
        file,
        signURL: signURL.signURL,
        signal: controller.signal,
        onProgress: (_percent, event) => {
          if (mountedRef.current) {
            setUpload((u) => (u ? { ...u, loaded: event.loaded } : u));
          }
        },
      });
      if (mountedRef.current) {
        const source: QuizGenerationSource = {
          kind,
          url: signURL.originalURL,
          name: file.name,
          mimeType: check.mimeType,
          size: file.size,
        };
        patchSource({ mode: "FILE", file: source });
      }
    } catch (error) {
      if (!(error instanceof UploadAbortedError) && mountedRef.current) {
        showQuizError(error, lang);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (mountedRef.current) setUpload(null);
    }
  };

  const toggleType = (type: QuizQuestionType) => {
    setForm((f) => {
      const on = f.allowedTypes.includes(type);
      const allowedTypes = on
        ? f.allowedTypes.filter((t) => t !== type)
        : TYPE_ORDER.filter((t) => t === type || f.allowedTypes.includes(t));
      return { ...f, allowedTypes };
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      const job = await create.mutateAsync({
        assignmentId,
        data: toGenerationInput(form),
      });
      if (mountedRef.current) onSubmitted(job);
    } catch (error) {
      if (!mountedRef.current) return;
      // The generation view (job + usage) is only polled while a job is active, so
      // a stale cache does not refresh itself; invalidate so the footer's usage
      // and the page's status card catch up to what the server just told us.
      const refreshGeneration = () =>
        queryClient.invalidateQueries({
          queryKey: keyQuiz.generation(assignmentId),
        });
      if (isQuotaError(error)) {
        void refreshGeneration();
        void Swal.fire({
          icon: "warning",
          title: quizLanguage.quotaReached(lang),
          text: quizLanguage.generationsLeft(lang, error.used, error.limit),
        });
      } else if (isQuizGeneratingError(error)) {
        // A job is already active (started elsewhere); refetch so the status
        // card appears on the page, then close.
        void refreshGeneration();
        onClose();
      } else if (isQuizNotDraftError(error)) {
        onClose();
        void Swal.fire({ icon: "warning", title: quizLanguage.generateNeedsDraft(lang) });
      } else {
        showQuizError(error, lang);
      }
    }
  };

  const renderDropZone = () => {
    if (upload) {
      const percent = upload.size
        ? Math.min(100, Math.round((upload.loaded / upload.size) * 100))
        : 0;
      return (
        <div
          role="status"
          aria-live="polite"
          className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            {upload.kind === "IMAGE" ? <MdImage /> : <MdPictureAsPdf />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-medium text-icon-color">
              {upload.name}
            </span>
            <span className="text-xs text-icon-color/70">
              {quizLanguage.uploadingFile(
                lang,
                percent,
                formatBytes(upload.loaded),
                formatBytes(upload.size),
              )}
            </span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-primary-color/10">
              <span
                className="block h-full rounded-full bg-primary-color transition-[width]"
                style={{ width: `${Math.max(3, percent)}%` }}
              />
            </span>
          </span>
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            aria-label={quizLanguage.cancelUpload(lang)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-icon-color/70 hover:bg-error-color/10 hover:text-error-color"
          >
            <MdClose />
          </button>
        </div>
      );
    }

    const file = form.source.file;
    if (file) {
      const fileKind: "IMAGE" | "PDF" = file.kind === "IMAGE" ? "IMAGE" : "PDF";
      return (
        <div className="flex w-full items-center gap-3 rounded-2xl border border-primary-color/20 bg-primary-color/5 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            {fileKind === "IMAGE" ? <MdImage /> : <MdPictureAsPdf />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-icon-color" title={file.url}>
              {file.name ?? file.url}
            </span>
            {typeof file.size === "number" && (
              <span className="text-xs text-icon-color/70">
                {quizLanguage.kindLabel(lang, fileKind)} · {formatBytes(file.size)}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => patchSource({ file: null })}
            aria-label={quizLanguage.remove(lang)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-icon-color/70 hover:bg-error-color/10 hover:text-error-color"
          >
            <MdClose />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) void startUpload(dropped);
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver
            ? "border-primary-color bg-primary-color/10"
            : "border-primary-color/30 bg-primary-color/5 hover:bg-primary-color/10"
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl text-primary-color">
          <MdOutlineCloudUpload aria-hidden="true" />
        </span>
        <span className="text-sm text-icon-color/80">
          {quizLanguage.dropFileHint(lang)}
        </span>
      </button>
    );
  };

  const renderUrlInput = (mode: "YOUTUBE" | "WEBSITE") => {
    const bad =
      urlTouched && (issue === "badYoutube" || issue === "badUrl");
    return (
      <div className="flex flex-col gap-1">
        <label className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-xl text-icon-color/60">
            {mode === "YOUTUBE" ? <RiYoutubeLine /> : <MdLink />}
          </span>
          <input
            type="url"
            inputMode="url"
            autoComplete="off"
            value={form.source.url}
            onChange={(e) => patchSource({ url: e.target.value })}
            placeholder={
              mode === "YOUTUBE"
                ? quizLanguage.youtubePlaceholder(lang)
                : quizLanguage.websitePlaceholder(lang)
            }
            aria-invalid={bad || undefined}
            aria-label={modeLabel(mode, lang)}
            className={`main-input w-full !pl-10 ${bad ? "!border-error-color" : ""}`}
          />
        </label>
        {bad && (
          <span className={issueText}>
            {mode === "YOUTUBE"
              ? quizLanguage.formIssue.badYoutube(lang)
              : quizLanguage.formIssue.badUrl(lang)}
          </span>
        )}
      </div>
    );
  };

  return (
    <PopupLayout onClose={onClose}>
      <form
        onSubmit={submit}
        aria-labelledby="quiz-generate-title"
        className="flex min-h-dvh w-full max-w-xl flex-col gap-5 bg-white p-5 font-Anuphan text-icon-color sm:min-h-0 sm:max-h-dvh sm:overflow-y-auto sm:rounded-2xl md:p-6"
      >
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void startUpload(file);
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
            <RiSparkling2Line aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id="quiz-generate-title" className="text-lg font-semibold leading-tight">
              {quizLanguage.generateTitle(lang)}
            </h2>
            <p className="text-sm text-icon-color/70">
              {quizLanguage.generateSubtitle(lang)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={quizLanguage.cancel(lang)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-icon-color/70 hover:bg-icon-color/5 hover:text-icon-color"
          >
            <MdClose />
          </button>
        </div>

        {/* Source */}
        <section className="flex flex-col gap-3">
          <div
            role="group"
            className="grid grid-cols-3 gap-1 rounded-xl bg-icon-color/5 p-1"
          >
            {SOURCE_MODES.map((mode) => {
              const on = form.source.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={on}
                  disabled={uploading}
                  onClick={() => patchSource({ mode })}
                  className={`truncate rounded-lg px-2 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    on
                      ? "bg-white text-primary-color shadow-sm"
                      : "text-icon-color/70 hover:text-icon-color"
                  }`}
                >
                  {modeLabel(mode, lang)}
                </button>
              );
            })}
          </div>
          {form.source.mode === "FILE"
            ? renderDropZone()
            : renderUrlInput(form.source.mode)}
        </section>

        {/* Questions + choices */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={sectionLabel}>{quizLanguage.numberOfQuestions(lang)}</span>
            <InputNumber
              value={form.questionCount}
              min={GENERATION_LIMITS.minQuestions}
              max={GENERATION_LIMITS.maxQuestions}
              useGrouping={false}
              onValueChange={(v) =>
                patch({ questionCount: typeof v === "number" ? v : 0 })
              }
            />
            {issue === "badCount" && (
              <span className={issueText}>{quizLanguage.formIssue.badCount(lang)}</span>
            )}
          </label>
          {needsChoices(form.allowedTypes) && (
            <label className="flex flex-col gap-1.5">
              <span className={sectionLabel}>{quizLanguage.choicesPerQuestion(lang)}</span>
              <InputNumber
                value={form.choicesPerQuestion}
                min={GENERATION_LIMITS.minChoices}
                max={GENERATION_LIMITS.maxChoices}
                useGrouping={false}
                onValueChange={(v) =>
                  patch({ choicesPerQuestion: typeof v === "number" ? v : 0 })
                }
              />
              {issue === "badChoices" && (
                <span className={issueText}>
                  {quizLanguage.formIssue.badChoices(lang)}
                </span>
              )}
            </label>
          )}
        </section>

        {/* Question types */}
        <section className="flex flex-col gap-1.5">
          <span className={sectionLabel}>{quizLanguage.questionTypes(lang)}</span>
          <div role="group" aria-label={quizLanguage.questionTypes(lang)} className="flex flex-wrap gap-2">
            {TYPE_ORDER.map((type) => {
              const on = form.allowedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleType(type)}
                  className={`${chipBase} ${on ? chipOn : chipOff}`}
                >
                  {typeLabel(type, lang)}
                </button>
              );
            })}
          </div>
          {issue === "noTypes" && (
            <span className={issueText}>{quizLanguage.formIssue.noTypes(lang)}</span>
          )}
        </section>

        {/* Output language */}
        <section className="flex flex-col gap-1.5">
          <span className={sectionLabel}>{quizLanguage.outputLanguage(lang)}</span>
          <div role="group" aria-label={quizLanguage.outputLanguage(lang)} className="flex flex-wrap gap-2">
            {LANGUAGES.map((value) => {
              const on = form.language === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => patch({ language: value })}
                  className={`${chipBase} ${on ? chipOn : chipOff}`}
                >
                  {languageLabel(value)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Extra instructions */}
        <label className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className={sectionLabel}>{quizLanguage.extraInstructions(lang)}</span>
            <span
              className={`text-xs ${
                form.instructions.length > GENERATION_LIMITS.maxInstructions
                  ? "text-error-color"
                  : "text-icon-color/50"
              }`}
            >
              {form.instructions.length}/{GENERATION_LIMITS.maxInstructions}
            </span>
          </span>
          <textarea
            value={form.instructions}
            maxLength={GENERATION_LIMITS.maxInstructions}
            rows={3}
            onChange={(e) => patch({ instructions: e.target.value })}
            placeholder={quizLanguage.extraInstructionsPlaceholder(lang)}
            className="main-input w-full resize-y"
          />
          {issue === "tooLongInstructions" && (
            <span className={issueText}>
              {quizLanguage.formIssue.tooLongInstructions(lang)}
            </span>
          )}
        </label>

        {/* Footer */}
        <footer className="mt-auto flex flex-col gap-3 border-t border-icon-color/10 pt-4 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`text-xs ${quotaReached ? "font-medium text-error-color" : "text-icon-color/60"}`}
          >
            {usage ? quizLanguage.generationsLeft(lang, usage.used, usage.limit) : " "}
          </span>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl px-4 py-2 text-sm font-medium text-icon-color/70 transition hover:bg-icon-color/5 hover:text-icon-color sm:w-auto"
            >
              {quizLanguage.cancel(lang)}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              title={quotaReached ? quizLanguage.quotaReached(lang) : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-color px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-color-hover focus:bg-primary-color-focus disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {create.isPending ? (
                <LoadingSpinner />
              ) : (
                <RiSparkling2Line aria-hidden="true" className="text-lg" />
              )}
              {quizLanguage.generate(lang)}
            </button>
          </div>
        </footer>
      </form>
    </PopupLayout>
  );
}
