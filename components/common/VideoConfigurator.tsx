import React, { useRef, useState } from "react";
import { MdAdd, MdClose, MdDelete } from "react-icons/md";
import { VideoConfig, VideoQuestion } from "../../interfaces/VideoConfig";
import Switch from "./Switch";
import { useGetLanguage } from "../../react-query";
import { videoConfigLanguage } from "../../data/languages";

type Props = {
  fileUrl: string;
  initialConfig?: VideoConfig;
  onSave: (config: VideoConfig) => void;
  onClose: () => void;
};

const VideoConfigurator = ({
  fileUrl,
  initialConfig,
  onSave,
  onClose,
}: Props) => {
  const { data: language = "en" } = useGetLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [preventFastForward, setPreventFastForward] = useState(
    initialConfig?.preventFastForward || false,
  );
  const [questions, setQuestions] = useState<VideoQuestion[]>(
    initialConfig?.questions || [],
  );

  // New question form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctOption, setCorrectOption] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddQuestion = () => {
    if (videoRef.current) {
      setCurrentTimestamp(videoRef.current.currentTime);
      setIsAddingQuestion(true);
    }
  };

  const saveQuestion = () => {
    if (!questionText) return;

    const newQuestion: VideoQuestion = {
      id: Date.now().toString(),
      timestamp: currentTimestamp,
      question: questionText,
      options: options.filter((o) => o.trim() !== ""),
      correctOption,
    };

    setQuestions(
      [...questions, newQuestion].sort((a, b) => a.timestamp - b.timestamp),
    );
    setIsAddingQuestion(false);
    resetForm();
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectOption(0);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    onSave({
      preventFastForward,
      questions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col gap-5 rounded-2xl bg-white p-5 md:flex-row">
        {/* Left Side: Video Preview */}
        <div className="flex h-full w-full flex-col gap-2 md:w-2/3">
          <h2 className="text-xl font-semibold">
            {videoConfigLanguage.videoPreview(language)}
          </h2>
          <div className="relative flex flex-grow items-center justify-center overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              src={fileUrl}
              controls
              className="max-h-full w-full"
            />
          </div>
          {/* <div className="flex items-center justify-between">
            <button
              onClick={handleAddQuestion}
              className="gradient-bg flex items-center gap-2 rounded-xl px-4 py-2 text-white hover:opacity-90 active:scale-95"
            >
              <MdAdd /> {videoConfigLanguage.addQuestionAtCurrentTime(language)}
            </button>
            <div className="text-sm text-gray-500">
              {videoConfigLanguage.pauseVideoTip(language)}
            </div>
          </div> */}
        </div>

        {/* Right Side: Configuration */}
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto border-l pl-5 md:w-1/3">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold">
              {videoConfigLanguage.configuration(language)}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <MdClose size={24} />
            </button>
          </div>

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
                setChecked={setPreventFastForward}
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
                        type="radio"
                        name="correctOption"
                        checked={correctOption === idx}
                        onChange={() => setCorrectOption(idx)}
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
                          const newOptions = options.filter(
                            (_, i) => i !== idx,
                          );
                          setOptions(newOptions);
                          if (correctOption === idx) setCorrectOption(0);
                          else if (correctOption > idx)
                            setCorrectOption(correctOption - 1);
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
                  onClick={saveQuestion}
                  className="rounded-xl bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  {videoConfigLanguage.saveQuestion(language)}
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
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <MdDelete />
                      </button>
                    </div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <ul className="list-inside list-disc pl-1 text-xs text-gray-500">
                      {q.options.map((opt, i) => (
                        <li
                          key={i}
                          className={
                            i === q.correctOption
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

          <div className="mt-auto border-t pt-4">
            <button
              onClick={handleSave}
              className="w-full rounded-2xl bg-black py-3 text-white transition hover:bg-gray-800"
            >
              {videoConfigLanguage.saveConfiguration(language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConfigurator;
