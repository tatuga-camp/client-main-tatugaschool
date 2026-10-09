import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MdAdd,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdOutlineFileUpload,
  MdOutlineVideoLibrary,
  MdSchedule,
} from "react-icons/md";
import { SiYoutube } from "react-icons/si";
import { videoConfigLanguage as t } from "../../data/languages";
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
import {
  parseYouTubeId,
  youTubeErrorKind,
  youTubeWatchUrl,
} from "../../utils/youtube";
import GradeSegmentedControl from "../subject/grade/GradeSegmentedControl";
import Switch from "./Switch";
import YouTubeEmbed, { YouTubeEmbedHandle } from "./YouTubeEmbed";

type Props = {
  assignment: Assignment;
  onClose?: () => void;
};

type Draft = {
  id: string | null;
  timestamp: number;
  question: string;
  options: string[];
  correctOptions: number[];
};

const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

const card = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";
const iconButton =
  "rounded-full p-2 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-icon-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40";
const outlineButton =
  "flex items-center justify-center gap-1.5 rounded-xl border border-primary-color/30 px-4 py-2 text-sm font-medium text-primary-color transition hover:bg-primary-color/5 active:scale-[0.98]";

const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const mm = hrs > 0 ? mins.toString().padStart(2, "0") : mins.toString();
  return `${hrs > 0 ? `${hrs}:` : ""}${mm}:${secs.toString().padStart(2, "0")}`;
};

const VideoConfigurator = ({ assignment }: Props) => {
  const { data: language = "en" } = useGetLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<YouTubeEmbedHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
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
  const [videoURL, setVideoURL] = useState<string | null>(
    assignment?.videoURL || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const youTubeId = useMemo(
    () => (videoURL ? parseYouTubeId(videoURL) : null),
    [videoURL],
  );
  const [changingSource, setChangingSource] = useState(false);
  const [sourceTab, setSourceTab] = useState<"upload" | "youtube">(
    youTubeId ? "youtube" : "upload",
  );
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [savingLink, setSavingLink] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const questions = useMemo(
    () =>
      [...(getQuestions.data ?? [])].sort((a, b) => a.timestamp - b.timestamp),
    [getQuestions.data],
  );

  // A video swap resets the clock; stale duration would misplace the pins.
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setPlayerError(null);
  }, [videoURL]);

  // One surface over the uploaded <video> and the YouTube player.
  const player = {
    pause: () =>
      youTubeId ? ytRef.current?.pause() : videoRef.current?.pause(),
    seek: (seconds: number) => {
      if (youTubeId) ytRef.current?.seek(seconds);
      else if (videoRef.current) videoRef.current.currentTime = seconds;
    },
    time: () =>
      (youTubeId
        ? ytRef.current?.getTime()
        : videoRef.current?.currentTime) ?? currentTime,
  };

  const seekTo = (seconds: number) => {
    player.pause();
    player.seek(seconds);
    setCurrentTime(seconds);
  };

  const openNewQuestion = () => {
    player.pause();
    setSaveError(null);
    setDraft({
      id: null,
      timestamp: player.time(),
      question: "",
      options: ["", ""],
      correctOptions: [0],
    });
  };

  const openEditQuestion = (q: QuestionOnVideo) => {
    setSaveError(null);
    seekTo(q.timestamp);
    setDraft({
      id: q.id,
      timestamp: q.timestamp,
      question: q.question,
      options: [...q.options],
      correctOptions: [...q.correctOptions],
    });
  };

  const focusQuestion = (q: QuestionOnVideo) => {
    seekTo(q.timestamp);
    setFocusedId(q.id);
    rowRefs.current[q.id]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  };

  const draftProblem = (() => {
    if (!draft) return null;
    if (draft.options.some((o) => !o.trim())) return t.needOptions(language);
    if (draft.correctOptions.length === 0) return t.needCorrect(language);
    return null;
  })();

  const saveDraft = async () => {
    if (!draft || !draft.question.trim() || draftProblem) return;
    setSaveError(null);
    const data = {
      question: draft.question.trim(),
      options: draft.options.map((o) => o.trim()),
      correctOptions: draft.correctOptions,
      timestamp: draft.timestamp,
    };
    try {
      if (draft.id) {
        await updateQuestion.mutateAsync({ id: draft.id, data });
      } else {
        await createQuestion.mutateAsync({ assignmentId: assignment.id, ...data });
      }
      setDraft(null);
    } catch (error) {
      console.error(error);
      setSaveError(
        (error as { message?: string })?.message?.toString() ||
          t.saveFailed(language),
      );
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm(t.deleteConfirm(language))) return;
    try {
      await deleteQuestion.mutateAsync({ id });
      if (draft?.id === id) setDraft(null);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadVideo = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("video/")) {
      setUploadError(t.notAVideo(language));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError(t.fileTooLarge(language));
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setEstimatedTime(null);

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
          if (elapsedTime > 0 && event.loaded > 0) {
            const uploadSpeed = event.loaded / elapsedTime;
            const remainingSeconds = (event.total - event.loaded) / uploadSpeed;
            setEstimatedTime(formatTime(remainingSeconds));
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
      setChangingSource(false);
    } catch (error) {
      console.error(error);
      setUploadError(t.uploadFailed(language));
    } finally {
      setIsUploading(false);
      setEstimatedTime(null);
    }
  };

  const saveYouTubeLink = async () => {
    const id = parseYouTubeId(linkInput);
    if (!id) {
      setLinkError(t.notYouTubeLink(language));
      return;
    }
    setLinkError(null);
    setSavingLink(true);
    try {
      const url = youTubeWatchUrl(id);
      await updateAssignment.mutateAsync({
        query: { assignmentId: assignment.id },
        data: { videoURL: url },
      });
      setVideoURL(url);
      setLinkInput("");
      setChangingSource(false);
    } catch (error) {
      console.error(error);
      setLinkError(t.linkSaveFailed(language));
    } finally {
      setSavingLink(false);
    }
  };

  const openSourcePicker = () => {
    player.pause();
    setDraft(null);
    setUploadError(null);
    setLinkError(null);
    setSourceTab(youTubeId ? "youtube" : "upload");
    setChangingSource(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires onChange.
    e.target.value = "";
    if (file) uploadVideo(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !isUploading) uploadVideo(file);
  };

  const isSaving = updateQuestion.isPending || createQuestion.isPending;
  const pct = (seconds: number) =>
    duration > 0 ? Math.min(100, Math.max(0, (seconds / duration) * 100)) : 0;

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="video/*"
      className="hidden"
      onChange={handleFileSelect}
    />
  );

  const renderEditor = (d: Draft) => {
    const moved = Math.abs(currentTime - d.timestamp) >= 1;
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-primary-color/30 bg-primary-color/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-icon-color">
            <MdSchedule className="text-base text-primary-color" />
            {t.editQuestionAt(language)}
            <span className="rounded-lg bg-white px-2 py-0.5 tabular-nums text-primary-color ring-1 ring-primary-color/20">
              {formatTime(d.timestamp)}
            </span>
          </span>
          {moved && (
            <button
              type="button"
              onClick={() => {
                player.pause();
                setDraft({ ...d, timestamp: currentTime });
              }}
              className="rounded-lg px-2 py-0.5 text-sm font-medium text-primary-color transition hover:bg-primary-color/10"
            >
              {t.useCurrentTime(language)}{" "}
              <span className="tabular-nums">{formatTime(currentTime)}</span>
            </button>
          )}
        </div>

        <textarea
          autoFocus
          rows={3}
          placeholder={t.questionTextPlaceholder(language)}
          className="main-input w-full resize-y"
          value={d.question}
          onChange={(e) => setDraft({ ...d, question: e.target.value })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-icon-color">
              {t.options(language)}
            </span>
            <span className="text-xs text-gray-400">
              {t.correctHint(language)}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {d.options.map((opt, idx) => {
              const isCorrect = d.correctOptions.includes(idx);
              return (
                <li key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isCorrect}
                    aria-label={t.markCorrect(language)}
                    title={t.markCorrect(language)}
                    onClick={() =>
                      setDraft({
                        ...d,
                        correctOptions: isCorrect
                          ? d.correctOptions.filter((o) => o !== idx)
                          : [...d.correctOptions, idx].sort((a, b) => a - b),
                      })
                    }
                    className={`text-2xl transition ${
                      isCorrect
                        ? "text-success-color"
                        : "text-icon-color/30 hover:text-icon-color/60"
                    }`}
                  >
                    {isCorrect ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                  </button>
                  <input
                    type="text"
                    placeholder={`${t.optionPlaceholder(language)} ${idx + 1}`}
                    className={`main-input min-w-0 flex-1 ${
                      isCorrect ? "border-success-color/50" : ""
                    }`}
                    value={opt}
                    onChange={(e) => {
                      const options = [...d.options];
                      options[idx] = e.target.value;
                      setDraft({ ...d, options });
                    }}
                  />
                  {d.options.length > 2 && (
                    <button
                      type="button"
                      aria-label={t.removeOption(language)}
                      onClick={() =>
                        setDraft({
                          ...d,
                          options: d.options.filter((_, i) => i !== idx),
                          correctOptions: d.correctOptions
                            .filter((c) => c !== idx)
                            .map((c) => (c > idx ? c - 1 : c)),
                        })
                      }
                      className="text-xl text-icon-color/40 transition hover:text-error-color"
                    >
                      <MdDelete />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setDraft({ ...d, options: [...d.options, ""] })}
            className="w-max text-sm font-medium text-primary-color hover:underline"
          >
            {t.addOption(language)}
          </button>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-primary-color/10 pt-3">
          {(saveError || (d.question.trim() && draftProblem)) && (
            <span
              className={`mr-auto text-xs ${saveError ? "text-error-color" : "text-gray-400"}`}
              role="status"
            >
              {saveError || draftProblem}
            </span>
          )}
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {t.cancel(language)}
          </button>
          <button
            type="button"
            disabled={isSaving || !d.question.trim() || !!draftProblem}
            onClick={saveDraft}
            className="rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? t.saving(language) : t.saveQuestion(language)}
          </button>
        </footer>
      </div>
    );
  };

  const uploadPanel = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex aspect-video max-h-[28rem] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition ${
        isDragging
          ? "border-primary-color bg-primary-color/5"
          : "border-gray-200"
      }`}
    >
      {isUploading ? (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <span className="text-sm font-medium text-icon-color">
            {t.uploading(language)}
          </span>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(uploadProgress)}
          >
            <div
              className="h-full rounded-full bg-primary-color transition-[width] duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs tabular-nums text-gray-400">
            <span className="font-semibold text-primary-color">
              {Math.round(uploadProgress)}%
            </span>
            <span>
              {estimatedTime
                ? `${estimatedTime} ${t.timeLeft(language)}`
                : t.calculating(language)}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-color/10 text-3xl text-primary-color">
            <MdOutlineVideoLibrary />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-icon-color">
              {t.uploadTitle(language)}
            </span>
            <span className="text-sm text-gray-400">
              {t.uploadHint(language)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={outlineButton}
          >
            <MdOutlineFileUpload className="text-lg" />
            {t.chooseVideo(language)}
          </button>
        </>
      )}
      {uploadError && !isUploading && (
        <span className="text-sm text-error-color" role="alert">
          {uploadError}
        </span>
      )}
    </div>
  );

  const linkLooksWrong = !!linkInput.trim() && !parseYouTubeId(linkInput);
  const howToSteps = [
    t.howToStep1(language),
    t.howToStep2(language),
    t.howToStep3(language),
    t.howToStep4(language),
  ];

  const youTubePanel = (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          saveYouTubeLink();
        }}
      >
        <label
          htmlFor="video-quiz-youtube-link"
          className="text-sm font-medium text-icon-color"
        >
          {t.youTubeLabel(language)}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="video-quiz-youtube-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={linkInput}
            onChange={(e) => {
              setLinkInput(e.target.value);
              setLinkError(null);
            }}
            placeholder={t.youTubePlaceholder(language)}
            aria-invalid={linkLooksWrong || !!linkError}
            aria-describedby="video-quiz-youtube-error"
            className="main-input min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={savingLink || !parseYouTubeId(linkInput)}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SiYoutube className="text-base" />
            {savingLink ? t.saving(language) : t.useThisVideo(language)}
          </button>
        </div>
        <span
          id="video-quiz-youtube-error"
          role="status"
          className="min-h-4 text-xs text-error-color"
        >
          {linkError || (linkLooksWrong ? t.notYouTubeLink(language) : "")}
        </span>
      </form>

      <div className="grid gap-5 rounded-xl bg-background-color p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-icon-color">
            {t.howToTitle(language)}
          </h3>
          <ol className="flex flex-col gap-2.5">
            {howToSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-icon-color">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-[11px] font-semibold tabular-nums text-primary-color">
                  {i + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="flex flex-col gap-3 md:border-l md:border-gray-200 md:pl-5">
          <h3 className="text-sm font-semibold text-icon-color">
            {t.goodToKnow(language)}
          </h3>
          <ul className="flex list-disc flex-col gap-2 pl-4 text-xs leading-relaxed text-gray-500 marker:text-gray-300">
            <li>{t.noteControls(language)}</li>
            <li>{t.noteAds(language)}</li>
            <li>{t.noteAvailability(language)}</li>
          </ul>
        </section>
      </div>
    </div>
  );

  const showSourcePicker = !videoURL || isUploading || changingSource;

  const sourcePicker = (
    <div className="flex flex-col gap-4">
      {!isUploading && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <GradeSegmentedControl
            value={sourceTab}
            onChange={setSourceTab}
            options={[
              {
                value: "upload",
                label: t.sourceUpload(language),
                icon: <MdOutlineFileUpload className="text-base" />,
              },
              {
                value: "youtube",
                label: t.sourceYouTube(language),
                icon: <SiYoutube className="text-base" />,
              },
            ]}
          />
          {changingSource && videoURL && (
            <button
              type="button"
              onClick={() => setChangingSource(false)}
              className="rounded-xl border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              {t.cancel(language)}
            </button>
          )}
        </div>
      )}
      {isUploading || sourceTab === "upload" ? uploadPanel : youTubePanel}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {fileInput}

      {/* Video + question track */}
      <section className={card}>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h2 className="text-base font-semibold text-icon-color">
              {t.videoTitle(language)}
            </h2>
            <span className="text-xs text-gray-400">
              {t.videoHelper(language)}
            </span>
          </div>
          {videoURL && !isUploading && !changingSource && (
            <button
              type="button"
              onClick={openSourcePicker}
              className={`${outlineButton} shrink-0`}
            >
              <MdOutlineVideoLibrary className="text-lg" />
              {t.changeVideo(language)}
            </button>
          )}
        </div>

        {showSourcePicker ? (
          sourcePicker
        ) : (
          <>
            {uploadError && (
              <p className="mb-3 rounded-lg bg-error-color/10 px-3 py-2 text-sm text-error-color">
                {uploadError}
              </p>
            )}
            {playerError && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-error-color/10 px-3 py-2 text-sm text-error-color"
              >
                {playerError}
              </p>
            )}
            <div className="overflow-hidden rounded-xl bg-black">
              {youTubeId ? (
                <YouTubeEmbed
                  ref={ytRef}
                  videoId={youTubeId}
                  className="aspect-video max-h-[32rem] w-full"
                  onReady={(d) => {
                    setPlayerError(null);
                    setDuration(d);
                  }}
                  onTime={(time, d) => {
                    setCurrentTime((prev) =>
                      Math.abs(prev - time) < 0.05 ? prev : time,
                    );
                    if (d > 0) setDuration((prev) => (prev === d ? prev : d));
                  }}
                  onError={(code) => {
                    const kind = youTubeErrorKind(code);
                    setPlayerError(
                      kind === "embedBlocked"
                        ? t.ytEmbedBlocked(language)
                        : kind === "notFound"
                          ? t.ytNotFound(language)
                          : t.ytOther(language),
                    );
                  }}
                  onLoadFailed={() => setPlayerError(t.ytLoadFailed(language))}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoURL ?? undefined}
                  controls
                  playsInline
                  className="aspect-video max-h-[32rem] w-full"
                  onLoadedMetadata={(e) =>
                    setDuration(e.currentTarget.duration || 0)
                  }
                  onDurationChange={(e) =>
                    setDuration(e.currentTarget.duration || 0)
                  }
                  onTimeUpdate={(e) =>
                    setCurrentTime(e.currentTarget.currentTime)
                  }
                  onSeeked={(e) => setCurrentTime(e.currentTarget.currentTime)}
                />
              )}
            </div>
            {youTubeId && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <SiYoutube className="text-sm text-[#FF0000]" />
                  {t.fromYouTube(language)}
                </span>
                <a
                  href={youTubeWatchUrl(youTubeId)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary-color hover:underline"
                >
                  {t.openOnYouTube(language)}
                </a>
              </div>
            )}

            {/* Question track: where each question interrupts the video */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="relative h-9 select-none">
                <button
                  type="button"
                  aria-label={t.jumpTo(language)}
                  tabIndex={-1}
                  disabled={duration <= 0}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    seekTo(Math.max(0, Math.min(1, ratio)) * duration);
                  }}
                  className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 cursor-pointer disabled:cursor-default"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-100" />
                  <span
                    className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-color/30"
                    style={{ width: `${pct(currentTime)}%` }}
                  />
                </button>
                {duration > 0 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-color"
                    style={{ left: `${pct(currentTime)}%` }}
                  />
                )}
                {duration > 0 &&
                  questions.map((q, i) => {
                    const active = draft?.id === q.id || focusedId === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => focusQuestion(q)}
                        title={`${formatTime(q.timestamp)} · ${q.question}`}
                        aria-label={`${t.jumpTo(language)} ${formatTime(q.timestamp)}: ${q.question}`}
                        className={`absolute top-1/2 flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 px-1 text-[11px] font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40 ${
                          active
                            ? "z-10 scale-110 border-primary-color bg-primary-color text-white"
                            : "border-primary-color bg-white text-primary-color hover:bg-primary-color/10"
                        }`}
                        style={{ left: `${pct(q.timestamp)}%` }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                {duration > 0 && draft && !draft.id && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-primary-color bg-white text-sm text-primary-color"
                    style={{ left: `${pct(draft.timestamp)}%` }}
                  >
                    <MdAdd />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm tabular-nums text-gray-400">
                  <span className="font-medium text-icon-color">
                    {formatTime(currentTime)}
                  </span>{" "}
                  / {formatTime(duration)}
                </span>
                <button
                  type="button"
                  onClick={openNewQuestion}
                  disabled={!!draft && !draft.id}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MdAdd className="text-lg" />
                  {t.addQuestionAt(language)}{" "}
                  <span className="tabular-nums">{formatTime(currentTime)}</span>
                </button>
              </div>
            </div>
          </>
        )}

        <label className="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-icon-color">
              {t.preventFastForward(language)}
            </span>
            <span className="text-xs text-gray-400">
              {t.preventFastForwardHelper(language)}
            </span>
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
        </label>
      </section>

      {/* Questions */}
      {videoURL && (
        <section className={card}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <h2 className="flex items-center gap-2 text-base font-semibold text-icon-color">
                {t.popupQuestions(language)}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium tabular-nums text-gray-600">
                  {questions.length}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {t.questionsHelper(language)}
              </span>
            </div>
          </div>

          {draft && !draft.id && <div className="mb-3">{renderEditor(draft)}</div>}

          {questions.length === 0 && !draft && (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
              <span className="text-sm text-gray-400">
                {t.noQuestions(language)}
              </span>
              <button
                type="button"
                onClick={openNewQuestion}
                className={outlineButton}
              >
                <MdAdd className="text-lg" />
                {t.addQuestionAt(language)}{" "}
                <span className="tabular-nums">{formatTime(currentTime)}</span>
              </button>
            </div>
          )}

          <ol className="flex flex-col gap-2">
            {questions.map((q, i) =>
              draft?.id === q.id ? (
                <li
                  key={q.id}
                  ref={(el) => {
                    rowRefs.current[q.id] = el;
                  }}
                >
                  {renderEditor(draft)}
                </li>
              ) : (
                <li
                  key={q.id}
                  ref={(el) => {
                    rowRefs.current[q.id] = el;
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                    focusedId === q.id
                      ? "border-primary-color/40 bg-primary-color/[0.03]"
                      : "border-gray-100"
                  }`}
                >
                  <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary-color px-1 text-[11px] font-semibold tabular-nums text-primary-color">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <button
                        type="button"
                        onClick={() => focusQuestion(q)}
                        aria-label={`${t.jumpTo(language)} ${formatTime(q.timestamp)}`}
                        className="rounded-md bg-primary-color/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary-color transition hover:bg-primary-color/20"
                      >
                        {formatTime(q.timestamp)}
                      </button>
                      <p className="min-w-0 break-words text-sm font-medium text-icon-color">
                        {q.question}
                      </p>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {q.options.map((opt, oi) => {
                        const isCorrect = q.correctOptions.includes(oi);
                        return (
                          <li
                            key={oi}
                            className={`flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
                              isCorrect
                                ? "bg-success-color/10 font-medium text-success-color"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isCorrect && (
                              <MdCheckCircle className="shrink-0 text-sm" />
                            )}
                            <span className="truncate">{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label={t.edit(language)}
                      onClick={() => openEditQuestion(q)}
                      className={iconButton}
                    >
                      <MdEdit />
                    </button>
                    <button
                      type="button"
                      aria-label={t.remove(language)}
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="rounded-full p-2 text-lg text-gray-400 transition hover:bg-error-color/10 hover:text-error-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-color/40"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>
      )}
    </div>
  );
};

export default VideoConfigurator;
