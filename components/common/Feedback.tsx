import React, { useState } from "react";
import {
  BsCloudUpload,
  BsFillImageFill,
  BsFileEarmarkTextFill,
} from "react-icons/bs";
import { useCreateFeedback } from "../../react-query/feedback";
import { useGetLanguage } from "../../react-query/language";
import { feedbackLanguageData } from "../../data/languages";
import { FeedbackTag } from "../../interfaces";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services/google-storage";
import { IoCloseCircle } from "react-icons/io5";

type FileWithPreview = {
  file: File;
  previewUrl: string;
};

function Feedback() {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const { mutate: createFeedback } = useCreateFeedback();
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<FeedbackTag | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(
        (file) => file.size <= 5 * 1024 * 1024,
      );

      const newFiles = validFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    if (!body.trim()) {
      setError(feedbackLanguageData.errorRequiredBody(lang));
      return;
    }
    if (!tag) {
      setError(feedbackLanguageData.errorRequiredTag(lang));
      return;
    }

    try {
      const uploadedFiles: { url: string; type: string; size: number }[] = [];

      for (const fileObj of files) {
        const signUrlResponse = await getSignedURLTeacherService({
          fileName: fileObj.file.name,
          fileType: fileObj.file.type,
          fileSize: fileObj.file.size,
        });

        await UploadSignURLService({
          contentType: fileObj.file.type,
          file: fileObj.file,
          signURL: signUrlResponse.signURL,
        });

        uploadedFiles.push({
          url: signUrlResponse.originalURL,
          type: fileObj.file.type,
          size: fileObj.file.size,
        });
      }

      createFeedback(
        {
          body,
          tag,
          private: isIncognito,
          files: uploadedFiles,
        },
        {
          onSuccess: () => {
            setIsSuccess(true);
            setBody("");
            setTag(null);
            setIsIncognito(false);
            setFiles([]);
          },
          onError: (err) => {
            setError(err.message || "An error occurred");
          },
        },
      );
    } catch (err: any) {
      setError(err.message || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl text-green-500">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {feedbackLanguageData.successTitle(lang)}
        </h2>
        <p className="text-gray-600">
          {feedbackLanguageData.successMessage(lang)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 rounded-3xl bg-white p-6 shadow-xl md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {feedbackLanguageData.title(lang)}
        </h2>
        <p className="text-sm text-gray-500">
          {feedbackLanguageData.subtitle(lang)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">
            {feedbackLanguageData.tagLabel(lang)}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["COMPLIMENT", "BUG", "REQUEST_FEATURE"] as FeedbackTag[]).map(
              (t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTag(t)}
                  className={`rounded-xl border-2 p-2 text-sm font-semibold transition-all duration-200 ${
                    tag === t
                      ? "border-primary-color bg-primary-color text-white shadow-md"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-primary-color hover:text-primary-color"
                  }`}
                >
                  {feedbackLanguageData.tags[t](lang)}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={feedbackLanguageData.bodyPlaceholder(lang)}
            className="h-32 w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 outline-none transition duration-200 focus:border-primary-color focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex w-max cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-primary-color hover:text-primary-color">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="1.2em"
              width="1.2em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"></path>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"></path>
            </svg>
            {feedbackLanguageData.attachFiles(lang)}
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {files.map((fileObj, index) => (
                <div
                  key={index}
                  className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                >
                  {fileObj.file.type.startsWith("image/") ? (
                    <img
                      src={fileObj.previewUrl}
                      alt={fileObj.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-xs text-gray-500">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 16 16"
                        height="1.5em"
                        width="1.5em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"></path>
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition-transform hover:scale-110 hover:text-red-700"
                  >
                    <IoCloseCircle size={24} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative flex cursor-pointer items-center rounded-full">
            <input
              type="checkbox"
              className="before:bg-blue-gray-500 peer cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-gray-50 p-2.5 transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-8 before:w-8 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-primary-color checked:bg-primary-color checked:before:bg-primary-color hover:before:opacity-10"
              checked={isIncognito}
              onChange={(e) => setIsIncognito(e.target.checked)}
            />
            <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          </label>
          <span className="text-sm font-medium text-gray-700">
            {feedbackLanguageData.incognitoMode(lang)}
          </span>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary-color py-4 font-bold text-white shadow-lg transition duration-200 hover:bg-primary-color/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? feedbackLanguageData.submitting(lang)
            : feedbackLanguageData.submit(lang)}
        </button>
      </form>
    </div>
  );
}

export default Feedback;
