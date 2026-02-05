import React, { useRef, useState } from "react";
import { MdAdd, MdClose, MdDelete } from "react-icons/md";
import Switch from "./Switch";
import { useGetLanguage } from "../../react-query";
import { videoConfigLanguage } from "../../data/languages";
import { Language } from "../../interfaces";

type VideoQuestion = {
  id: string;
  timestamp: number; // in seconds
  question: string;
  options: string[];
  correctOption: number; // index of the correct option
};

type VideoConfig = {
  preventFastForward: boolean;
  questions: VideoQuestion[];
  language?: Language;
};
type Props = {
  fileUrl: string;
  initialConfig?: VideoConfig;
  onSave: (config: VideoConfig) => void;
  onClose: () => void;
};
function FileVideoConfigurator({
  fileUrl,
  initialConfig,
  onSave,
  onClose,
}: Props) {
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
}

export default FileVideoConfigurator;
