import React, { useEffect, useRef, useState } from "react";
import {
  MdAdd,
  MdClose,
  MdCloudUpload,
  MdDelete,
  MdEdit,
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

  const handleAddQuestion = () => {
    if (videoRef.current) {
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

  return (
    <div className="flex h-[90vh] w-full max-w-6xl flex-col gap-5 p-5 md:flex-row">
      {/* Left Side: Video Preview */}
      {videoURL ? (
        <div className="flex h-full w-full flex-col gap-2 md:w-2/3">
          <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-xl bg-black 2xl:grow">
            <video
              ref={videoRef}
              src={videoURL}
              controls
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddQuestion}
              className="gradient-bg flex items-center gap-2 rounded-xl px-4 py-2 text-white hover:opacity-90 active:scale-95"
            >
              <MdAdd /> {videoConfigLanguage.addQuestionAtCurrentTime(language)}
            </button>
            <div className="text-sm text-gray-500">
              {videoConfigLanguage.pauseVideoTip(language)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col gap-2 md:w-2/3">
          <h2 className="text-xl font-semibold">Upload Video</h2>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border-4 border-dashed border-blue-200 bg-blue-50/50 p-10 transition-all hover:bg-blue-50">
            {isUploading ? (
              <div className="flex w-full max-w-md flex-col items-center gap-4">
                <div className="text-2xl font-bold text-blue-600">
                  Uploading Video...
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex w-full justify-between text-sm font-medium text-gray-500">
                  <span>{Math.round(uploadProgress)}%</span>
                  <span>
                    {estimatedTime
                      ? `Remaining: ${estimatedTime}`
                      : "Calculating..."}
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 text-white shadow-lg transition-transform hover:scale-110">
                  <MdCloudUpload className="text-5xl" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-700">
                    Upload Video
                  </h3>
                  <p className="text-gray-500">
                    Click to browse or drag file here
                  </p>
                  <p className="mt-2 text-xs font-semibold text-blue-400">
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
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto border-l pl-5 md:w-1/3">
        {/* Settings */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <h3 className="font-medium text-gray-700">
            {videoConfigLanguage.playbackSettings(language)}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {videoConfigLanguage.preventFastForward(language)}
            </span>
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
        </div>

        {/* Questions List */}
        <div className="flex flex-grow flex-col gap-2">
          <h3 className="font-medium text-gray-700">
            {videoConfigLanguage.popupQuestions(language)}
          </h3>

          {isAddingQuestion ? (
            <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-800">
                  {videoConfigLanguage.newQuestionAt(language)}{" "}
                  {formatTime(currentTimestamp)}
                </span>
                <button
                  onClick={() => setIsAddingQuestion(false)}
                  className="text-gray-500 hover:text-red-500"
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
                <span className="text-xs font-medium">
                  {videoConfigLanguage.options(language)}
                </span>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={correctOptions.includes(idx)}
                      onChange={() => {
                        if (correctOptions.includes(idx)) {
                          setCorrectOptions(
                            correctOptions.filter((o) => o !== idx),
                          );
                        } else {
                          setCorrectOptions([...correctOptions, idx]);
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`${videoConfigLanguage.optionPlaceholder(language)} ${idx + 1}`}
                      className="main-input w-full py-1 text-sm"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx] = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <button
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== idx);
                        setOptions(newOptions);
                        setCorrectOptions(
                          correctOptions
                            .filter((c) => c !== idx)
                            .map((c) => (c > idx ? c - 1 : c)),
                        );
                      }}
                      className="text-red-400 hover:text-red-600"
                      disabled={options.length <= 2}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setOptions([...options, ""])}
                  className="self-start text-xs text-blue-600 hover:underline"
                >
                  {videoConfigLanguage.addOption(language)}
                </button>
              </div>

              <button
                disabled={updateQuestion.isPending || createQuestion.isPending}
                onClick={saveQuestion}
                className="rounded-xl bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                {updateQuestion.isPending || createQuestion.isPending
                  ? "Loading.."
                  : videoConfigLanguage.saveQuestion(language)}
              </button>
            </div>
          ) : (
            <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
              {questions.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-400">
                  {videoConfigLanguage.noQuestions(language)}
                </p>
              )}
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="relative flex flex-col gap-1 rounded-xl border bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                      {formatTime(q.timestamp)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{q.question}</p>
                  <ul className="list-inside list-disc pl-1 text-xs text-gray-500">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={
                          q.correctOptions.some((a) => a === i)
                            ? "font-semibold text-green-600"
                            : ""
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoConfigurator;
