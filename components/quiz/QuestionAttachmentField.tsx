import React, { useEffect, useRef, useState } from "react";
import {
  MdAddPhotoAlternate,
  MdAttachFile,
  MdAudiotrack,
  MdClose,
  MdImage,
  MdMovie,
  MdPictureAsPdf,
} from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language, QuizAttachment, QuizAttachmentKind } from "../../interfaces";
import {
  getSignedURLTeacherService,
  UploadSignURLWithProgressService,
} from "../../services";
import {
  AttachmentPicker,
  checkAttachmentFile,
  formatBytes,
  QUIZ_FILE_ACCEPT,
} from "../../utils/quizAttachment";
import { UploadAbortedError } from "../../utils/uploadWithRetry";
import QuestionAttachment from "./QuestionAttachment";
import { showQuizError } from "./quizErrorAlert";

type Props = {
  attachment: QuizAttachment | null | undefined;
  schoolId: string;
  disabled: boolean;
  language: Language;
  onChange: (attachment: QuizAttachment | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

type Upload = {
  name: string;
  kind: QuizAttachmentKind;
  size: number;
  loaded: number;
};

const KIND_ICON: Record<QuizAttachmentKind, React.ReactNode> = {
  IMAGE: <MdImage />,
  PDF: <MdPictureAsPdf />,
  VIDEO: <MdMovie />,
  AUDIO: <MdAudiotrack />,
};

/** The question's one attachment: add image / attach file, upload with %, cancel, replace, remove. */
export default function QuestionAttachmentField({
  attachment,
  schoolId,
  disabled,
  language,
  onChange,
  onUploadingChange,
}: Props) {
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [upload, setUpload] = useState<Upload | null>(null);

  const reportUploading = useRef(onUploadingChange);
  reportUploading.current = onUploadingChange;
  useEffect(() => {
    reportUploading.current?.(upload !== null);
  }, [upload !== null]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      reportUploading.current?.(false);
    };
  }, []);

  const start = async (file: File, picker: AttachmentPicker) => {
    const check = checkAttachmentFile(file, picker);
    if (!check.ok) {
      const message =
        check.reason === "tooLarge"
          ? quizLanguage.fileTooLarge(
              language,
              quizLanguage.kindLabel(language, check.kind),
              formatBytes(check.maxBytes),
              formatBytes(file.size),
            )
          : check.reason === "empty"
            ? quizLanguage.fileEmpty(language)
            : picker === "image"
              ? quizLanguage.imageNotSupported(language)
              : quizLanguage.fileNotSupported(language);
      showQuizError({ error: message }, language);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({
      name: file.name,
      kind: check.kind,
      size: file.size,
      loaded: 0,
    });
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
        onChange({
          url: signURL.originalURL,
          name: file.name,
          kind: check.kind,
          mimeType: check.mimeType,
          size: file.size,
        });
      }
    } catch (error) {
      if (!(error instanceof UploadAbortedError) && mountedRef.current) {
        showQuizError(error, language);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (mountedRef.current) setUpload(null);
    }
  };

  const picker = (
    ref: React.RefObject<HTMLInputElement>,
    accept: string,
    kind: AttachmentPicker,
  ) => (
    <input
      ref={ref}
      type="file"
      accept={accept}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) void start(file, kind);
      }}
    />
  );

  const textButton =
    "flex w-max items-center gap-1 rounded-xl px-2 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40";

  if (upload) {
    const percent = upload.size
      ? Math.min(100, Math.round((upload.loaded / upload.size) * 100))
      : 0;
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 font-Anuphan"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
          {KIND_ICON[upload.kind]}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-medium text-icon-color">
            {upload.name}
          </span>
          <span className="text-xs text-icon-color/70">
            {quizLanguage.uploadingFile(
              language,
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
          aria-label={quizLanguage.cancelUpload(language)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-icon-color/70 hover:bg-error-color/10 hover:text-error-color"
        >
          <MdClose />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 font-Anuphan">
      {picker(imageInput, "image/*", "image")}
      {picker(fileInput, QUIZ_FILE_ACCEPT, "file")}
      {attachment ? (
        <>
          <QuestionAttachment key={attachment.url} attachment={attachment} language={language} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                (attachment.kind === "IMAGE"
                  ? imageInput
                  : fileInput
                ).current?.click()
              }
              className={`${textButton} text-primary-color hover:bg-primary-color/10`}
            >
              {attachment.kind === "IMAGE" ? (
                <MdAddPhotoAlternate className="text-lg" />
              ) : (
                <MdAttachFile className="text-lg" />
              )}
              {quizLanguage.replace(language)}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              className={`${textButton} text-error-color hover:bg-error-color/10`}
            >
              <MdClose className="text-lg" />
              {quizLanguage.remove(language)}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => imageInput.current?.click()}
            className={`${textButton} text-primary-color hover:bg-primary-color/10`}
          >
            <MdAddPhotoAlternate className="text-lg" />
            {quizLanguage.addImage(language)}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInput.current?.click()}
            className={`${textButton} text-primary-color hover:bg-primary-color/10`}
          >
            <MdAttachFile className="text-lg" />
            {quizLanguage.attachFile(language)}
          </button>
          <span className="text-xs text-icon-color/60">
            {quizLanguage.attachHint(language)}
          </span>
        </div>
      )}
    </div>
  );
}
