import React, { useEffect, useRef, useState } from "react";
import {
  MdAdd,
  MdCheckCircle,
  MdClose,
  MdCloudUpload,
  MdDelete,
  MdEdit,
  MdHelpOutline,
  MdLock,
  MdPlayCircleOutline,
  MdQuiz,
  MdSave,
  MdTune,
} from "react-icons/md";
import { videoConfigLanguage } from "../../data/languages";
import { Assignment, QuestionOnVideo } from "../../interfaces";
import {
  useCreateQuestionOnVideo,
  useDeleteQuestionOnVideo,
  useGetLanguage,
  useGetQuestionOnVideoByAssignmentId,
  useUpdateAssignment,
  useUpdateQuestionOnVideo,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLWithProgressService,
} from "../../services";
import Switch from "./Switch";

type Props = {
  assignment: Assignment;
  onClose: () => void;
};

const VideoConfigurator = ({ assignment, onClose }: Props) => {
  const { data: language = "en" } = useGetLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateAssignment = useUpdateAssignment();
  const createQuestion = useCreateQuestionOnVideo();
  const updateQuestion = useUpdateQuestionOnVideo();
  const deleteQuestion = useDeleteQuestionOnVideo();
  const getQuestions = useGetQuestionOnVideoByAssignmentId({
    assignmentId: assignment.id,
  });
  const [preventFastForward, setPreventFastForward] = useState(
    assignment?.preventFastForward || false,
  );
  const [questions, setQuestions] = useState<QuestionOnVideo[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(
    assignment?.videoURL || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  // New question form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctOptions, setCorrectOptions] = useState<number[]>([0]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (getQuestions.data) {
      setQuestions(getQuestions.data);
    }
  }, [getQuestions.data]);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.pause();
    }
  };

  const handleAddQuestion = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setCurrentTimestamp(videoRef.current.currentTime);
      setIsAddingQuestion(true);
      setEditingId(null);
      resetForm();
    }
  };

  const handleEditQuestion = (q: QuestionOnVideo) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setOptions(q.options);
    setCorrectOptions(q.correctOptions);
    setCurrentTimestamp(q.timestamp);
    setIsAddingQuestion(true);
  };

  const saveQuestion = async () => {
    if (!questionText) return;

    try {
      if (editingId) {
        await updateQuestion.mutateAsync({
          id: editingId,
          data: {
            question: questionText,
            options,
            correctOptions,
          },
        });
      } else {
        await createQuestion.mutateAsync({
          assignmentId: assignment.id,
          question: questionText,
          options,
          correctOptions,
          timestamp: currentTimestamp,
        });
      }
      setIsAddingQuestion(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectOptions([0]);
    setEditingId(null);
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion.mutateAsync({ id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert("File size limit is 2GB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const signURL = await getSignedURLTeacherService({
        schoolId: assignment.schoolId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const startTime = Date.now();

      await UploadSignURLWithProgressService({
        contentType: file.type,
        file: file,
        signURL: signURL.signURL,
        onProgress: (percentComplete, event) => {
          setUploadProgress(percentComplete);

          const elapsedTime = (Date.now() - startTime) / 1000;
          if (elapsedTime > 0) {
            const uploadSpeed = event.loaded / elapsedTime;
            const remainingBytes = event.total - event.loaded;
            const remainingSeconds = remainingBytes / uploadSpeed;

            if (remainingSeconds < 60) {
              setEstimatedTime(`${Math.round(remainingSeconds)}s`);
            } else {
              setEstimatedTime(
                `${Math.round(remainingSeconds / 60)}m ${Math.round(remainingSeconds % 60)}s`,
              );
            }
          }
        },
      });

      await updateAssignment.mutateAsync({
        query: {
          assignmentId: assignment.id,
        },
        data: {
          videoURL: signURL.originalURL,
        },
      });
      setVideoURL(signURL.originalURL);
      setIsUploading(false);
      setEstimatedTime(null);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      setEstimatedTime(null);
    }
  };

  const isSaving = updateQuestion.isPending || createQuestion.isPending;

  return (
    <div className="flex h-[90vh] w-full max-w-6xl flex-col gap-5 p-5 md:flex-row">
      {/* Left Side: Video Preview / Upload */}
      {videoURL ? (
        <div className="flex h-full w-full flex-col gap-3 md:w-2/3">
          <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-[0_18px_40px_-20px_rgba(15,23,42,0.5)] ring-1 ring-slate-200 2xl:grow">
            <video
              ref={videoRef}
              src={videoURL}
              controls
              className="h-full w-full"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 p-3 shadow-sm backdrop-blur">
            <button
              onClick={handleAddQuestion}
              className="gradient-bg flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95"
            >
              <MdAdd className="text-lg" />
              {videoConfigLanguage.addQuestionAtCurrentTime(language)}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MdHelpOutline className="text-base text-slate-400" />
              {videoConfigLanguage.pauseVideoTip(language)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col gap-2 md:w-2/3">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            <MdCloudUpload className="text-blue-500" />
            Upload Video
          </h2>
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-purple-50/60 p-10 transition-all hover:border-blue-300 hover:from-blue-50">
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-200/40 blur-3xl" />

            {isUploading ? (
              <div className="relative flex w-full max-w-md flex-col items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg">
                  <MdCloudUpload className="animate-pulse text-4xl" />
                </div>
                <div className="text-xl font-bold text-slate-700">
                  Uploading Video...
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <div
                    className="vc-shimmer absolute inset-y-0"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex w-full justify-between text-sm font-medium text-slate-500">
                  <span className="font-bold text-blue-600">
                    {Math.round(uploadProgress)}%
                  </span>
                  <span>
                    {estimatedTime
                      ? `Remaining: ${estimatedTime}`
                      : "Calculating..."}
                  </span>
                </div>
              </div>
            ) : (
              <label className="relative flex cursor-pointer flex-col items-center justify-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
                  <div className="vc-float relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-300/50 transition-transform hover:scale-110">
                    <MdCloudUpload className="text-5xl" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Upload Video
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Click to browse or drag a file here
                  </p>
                  <p className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                    Max Size: 2GB
                  </p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Right Side: Configuration */}
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto pl-0 md:w-1/3 md:border-l md:pl-5">
        {/* Settings */}
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
              <MdTune className="text-sm" />
            </span>
            {videoConfigLanguage.playbackSettings(language)}
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MdLock className="text-base text-slate-400" />
              {videoConfigLanguage.preventFastForward(language)}
            </div>
            <Switch
              checked={preventFastForward}
              setChecked={(data) => {
                setPreventFastForward(data);
                updateAssignment.mutate({
                  query: {
                    assignmentId: assignment.id,
                  },
                  data: {
                    preventFastForward: data,
                  },
                });
              }}
            />
          </div>
        </section>

        {/* Questions List */}
        <section className="flex flex-grow flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                <MdQuiz className="text-sm" />
              </span>
              {videoConfigLanguage.popupQuestions(language)}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {questions.length}
            </span>
          </div>

          {isAddingQuestion ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <MdPlayCircleOutline className="text-base" />
                  {videoConfigLanguage.newQuestionAt(language)}{" "}
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs text-blue-700 shadow-sm ring-1 ring-blue-200">
                    {formatTime(currentTimestamp)}
                  </span>
                </span>
                <button
                  onClick={() => setIsAddingQuestion(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500"
                  aria-label="Close"
                >
                  <MdClose />
                </button>
              </div>

              <input
                type="text"
                placeholder={videoConfigLanguage.questionTextPlaceholder(
                  language,
                )}
                className="main-input w-full"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {videoConfigLanguage.options(language)}
                </span>
                {options.map((opt, idx) => {
                  const isCorrect = correctOptions.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded-xl border bg-white p-1.5 transition ${
                        isCorrect
                          ? "border-emerald-300 ring-2 ring-emerald-200/60"
                          : "border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isCorrect) {
                            setCorrectOptions(
                              correctOptions.filter((o) => o !== idx),
                            );
                          } else {
                            setCorrectOptions([...correctOptions, idx]);
                          }
                        }}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                          isCorrect
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        aria-label={isCorrect ? "Correct" : "Mark correct"}
                      >
                        {isCorrect ? (
                          <MdCheckCircle className="text-base" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </button>
                      <input
                        type="text"
                        placeholder={`${videoConfigLanguage.optionPlaceholder(language)} ${idx + 1}`}
                        className="w-full border-0 bg-transparent px-1 py-1 text-sm outline-none focus:ring-0"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[idx] = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                      <button
                        onClick={() => {
                          const newOptions = options.filter(
                            (_, i) => i !== idx,
                          );
                          setOptions(newOptions);
                          setCorrectOptions(
                            correctOptions
                              .filter((c) => c !== idx)
                              .map((c) => (c > idx ? c - 1 : c)),
                          );
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={options.length <= 2}
                        aria-label="Delete option"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => setOptions([...options, ""])}
                  className="flex items-center gap-1 self-start rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  <MdAdd /> {videoConfigLanguage.addOption(language)}
                </button>
              </div>

              <button
                disabled={isSaving || !questionText}
                onClick={saveQuestion}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 py-2.5 font-semibold text-white shadow-md shadow-blue-200 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Loading..
                  </>
                ) : (
                  <>
                    <MdSave />
                    {videoConfigLanguage.saveQuestion(language)}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
              {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                  <MdHelpOutline className="text-3xl text-slate-300" />
                  <p className="text-sm text-slate-400">
                    {videoConfigLanguage.noQuestions(language)}
                  </p>
                </div>
              )}
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="group relative flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => seekTo(q.timestamp)}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                      title="Jump to timestamp"
                    >
                      <MdPlayCircleOutline className="text-sm" />
                      {formatTime(q.timestamp)}
                    </button>
                    <div className="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
                        aria-label="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Delete"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {q.question}
                  </p>
                  <ul className="flex flex-col gap-1 text-xs">
                    {q.options.map((opt, i) => {
                      const isCorrect = q.correctOptions.some((a) => a === i);
                      return (
                        <li
                          key={i}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                            isCorrect
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                              isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isCorrect ? "✓" : String.fromCharCode(65 + i)}
                          </span>
                          <span className={isCorrect ? "font-semibold" : ""}>
                            {opt}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .vc-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: vc-shimmer 1.6s linear infinite;
        }
        @keyframes vc-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .vc-float {
          animation: vc-float 3s ease-in-out infinite;
        }
        @keyframes vc-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoConfigurator;
