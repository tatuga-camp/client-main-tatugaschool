import React, { useEffect, useRef, useState } from "react";
import { MdAddPhotoAlternate, MdDelete } from "react-icons/md";
import { quizLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { getSignedURLTeacherService, UploadSignURLWithProgressService } from "../../services";
import { validateQuestionImage } from "../../utils/quizDraft";
import { showQuizError } from "./quizErrorAlert";

type Props = {
  imageUrl: string | null | undefined;
  schoolId: string;
  disabled: boolean;
  language: Language;
  onChange: (imageUrl: string | null) => void;
};

/** The question's optional image: pick, upload through a signed URL, preview, remove. */
export default function QuestionImageField({ imageUrl, schoolId, disabled, language, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const upload = async (file: File) => {
    const check = validateQuestionImage(file);
    if (check !== "ok") {
      showQuizError(
        {
          error: check === "tooLarge" ? quizLanguage.imageTooLarge(language) : quizLanguage.imageNotSupported(language),
        },
        language,
      );
      return;
    }
    setProgress(0);
    try {
      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        schoolId,
      });
      await UploadSignURLWithProgressService({
        contentType: file.type,
        file,
        signURL: signURL.signURL,
        onProgress: (percent) => {
          if (mountedRef.current) setProgress(percent);
        },
      });
      if (mountedRef.current) onChange(signURL.originalURL);
    } catch (error) {
      showQuizError(error, language);
    } finally {
      if (mountedRef.current) setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />
      {imageUrl && !uploading && (
        <div className="relative w-max max-w-full">
          <img
            src={imageUrl}
            alt={quizLanguage.questionImageAlt(language)}
            className="max-h-48 max-w-full rounded-xl border border-gray-100 object-contain"
          />
        </div>
      )}
      {uploading ? (
        <div className="flex w-full max-w-xs flex-col gap-1" role="status" aria-live="polite">
          <span className="text-xs text-icon-color/70">
            {quizLanguage.uploadingImage(language)} {Math.round(progress ?? 0)}%
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-color/10">
            <div
              className="h-full rounded-full bg-primary-color transition-[width]"
              style={{ width: `${Math.max(5, Math.round(progress ?? 0))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex w-max items-center gap-1 rounded-xl px-2 py-1 text-sm font-medium text-primary-color hover:bg-primary-color/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MdAddPhotoAlternate className="text-lg" />
            {quizLanguage.addImage(language)}
          </button>
          {imageUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              className="flex w-max items-center gap-1 rounded-xl px-2 py-1 text-sm text-error-color hover:bg-error-color/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MdDelete className="text-lg" />
              {quizLanguage.removeImage(language)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
