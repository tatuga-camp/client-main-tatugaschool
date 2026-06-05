import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { useMemo, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { RiSparkling2Line } from "react-icons/ri";
import { rubricLanguage } from "../../../data/languages";
import { ErrorMessages, RubricDraft } from "../../../interfaces";
import { useGenerateRubricDraft, useGetLanguage } from "../../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../../services";
import InputNumber from "../../common/InputNumber";

type Props = {
  subjectId: string;
  onDraft: (draft: RubricDraft) => void;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};

// AI-supported curriculum file types.
const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const ACCEPT_ATTR = ".pdf,.txt,image/png,image/jpeg,image/webp";

type FormState = {
  topic: string;
  gradeLevel: string;
  learningGoal: string;
  levelCount: number;
  criteriaCount?: number;
  maxPointsPerLevel: number;
  language: "th" | "en";
};

function RubricAiAssistant({ subjectId, onDraft, onClose, toast }: Props) {
  const generate = useGenerateRubricDraft();
  const uiLanguage = useGetLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    topic: "",
    gradeLevel: "",
    learningGoal: "",
    levelCount: 4,
    criteriaCount: undefined,
    maxPointsPerLevel: 4,
    language: "en",
  });
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "generating">(
    "idle",
  );
  const [result, setResult] = useState<{
    curriculumSummary?: string;
    draft: RubricDraft;
  } | null>(null);

  const busy = phase !== "idle";

  const validationError = useMemo<string | null>(() => {
    const lang = uiLanguage.data ?? "en";
    if (!form.topic.trim()) return rubricLanguage.topicRequired(lang);
    if (!form.gradeLevel.trim()) return rubricLanguage.gradeLevelRequired(lang);
    if (!form.learningGoal.trim())
      return rubricLanguage.learningGoalRequired(lang);
    return null;
  }, [form, uiLanguage.data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.current?.show({
        severity: "error",
        summary: rubricLanguage.unsupportedFile(uiLanguage.data ?? "en"),
        detail: rubricLanguage.unsupportedFileDetail(uiLanguage.data ?? "en"),
        life: 5000,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (validationError || busy) return;
    try {
      let curriculum: { url: string; type: string } | undefined;

      if (file) {
        setPhase("uploading");
        const { signURL, originalURL } = await getSignedURLTeacherService({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        await UploadSignURLService({
          contentType: file.type,
          file,
          signURL,
        });
        curriculum = { url: originalURL, type: file.type };
      }

      setPhase("generating");
      const res = await generate.mutateAsync({
        subjectId,
        topic: form.topic.trim(),
        gradeLevel: form.gradeLevel.trim(),
        learningGoal: form.learningGoal.trim(),
        levelCount: form.levelCount,
        criteriaCount: form.criteriaCount,
        maxPointsPerLevel: form.maxPointsPerLevel,
        language: form.language,
        curriculum,
      });

      setPhase("idle");
      setResult(res);
    } catch (error) {
      console.log(error);
      setPhase("idle");
      const result =
        (error as { response?: { data?: ErrorMessages } })?.response?.data ??
        (error as ErrorMessages);
      toast.current?.show({
        severity: "error",
        summary: result?.error
          ? result.error
          : rubricLanguage.somethingWentWrong(uiLanguage.data ?? "en"),
        detail: rubricLanguage.couldNotGenerateDraft(uiLanguage.data ?? "en"),
        life: 5000,
      });
    }
  };

  const handleApply = () => {
    if (!result) return;
    onDraft(result.draft);
    onClose();
  };

  return (
    <div className="flex h-max w-full flex-col gap-3 rounded-2xl border bg-gray-100 p-4">
      {busy && <ProgressBar mode="indeterminate" style={{ height: "6px" }} />}

      <header className="flex w-full items-center justify-between gap-2 border-b pb-3">
        <h1 className="flex items-center gap-2 text-lg font-medium">
          <RiSparkling2Line />{" "}
          {rubricLanguage.draftRubricWithAi(uiLanguage.data ?? "en")}
        </h1>
        <button
          type="button"
          title={rubricLanguage.close(uiLanguage.data ?? "en")}
          onClick={onClose}
          className="rounded p-1 text-gray-500 hover:bg-gray-200"
        >
          <IoMdClose />
        </button>
      </header>

      {result ? (
        <main className="flex w-full flex-col gap-3">
          <p className="text-sm text-gray-600">
            {rubricLanguage.draftReadyPrefix(uiLanguage.data ?? "en")}{" "}
            <span className="font-semibold">{result.draft.title}</span>{" "}
            {rubricLanguage.draftReadySuffix(uiLanguage.data ?? "en")(
              result.draft.criteria.length,
            )}
          </p>
          {result.curriculumSummary && (
            <div className="flex w-full flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                {rubricLanguage.curriculumSummary(uiLanguage.data ?? "en")}
              </label>
              <textarea
                readOnly
                value={result.curriculumSummary}
                className="main-input max-h-60 w-full resize-none overflow-auto"
                rows={6}
              />
            </div>
          )}
          <div className="flex w-full justify-end gap-3 border-t pt-3">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="second-button flex items-center justify-center gap-1 border"
            >
              {rubricLanguage.back(uiLanguage.data ?? "en")}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="main-button flex items-center justify-center gap-1"
            >
              <RiSparkling2Line />{" "}
              {rubricLanguage.applyDraft(uiLanguage.data ?? "en")}
            </button>
          </div>
        </main>
      ) : (
        <main className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-1">
            <label className="text-sm text-gray-600">
              {rubricLanguage.topic(uiLanguage.data ?? "en")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={rubricLanguage.topicPlaceholder(
                uiLanguage.data ?? "en",
              )}
              value={form.topic}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, topic: e.target.value }))
              }
              disabled={busy}
              className="main-input w-full"
            />
          </div>

          <div className="flex w-full flex-col gap-1">
            <label className="text-sm text-gray-600">
              {rubricLanguage.gradeLevel(uiLanguage.data ?? "en")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={rubricLanguage.gradeLevelPlaceholder(
                uiLanguage.data ?? "en",
              )}
              value={form.gradeLevel}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gradeLevel: e.target.value }))
              }
              disabled={busy}
              className="main-input w-full"
            />
          </div>

          <div className="flex w-full flex-col gap-1">
            <label className="text-sm text-gray-600">
              {rubricLanguage.learningGoal(uiLanguage.data ?? "en")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder={rubricLanguage.learningGoalPlaceholder(
                uiLanguage.data ?? "en",
              )}
              value={form.learningGoal}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, learningGoal: e.target.value }))
              }
              disabled={busy}
              className="main-input w-full resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                {rubricLanguage.levelsPerCriterion(uiLanguage.data ?? "en")}
              </label>
              <InputNumber
                value={form.levelCount}
                min={2}
                disabled={busy}
                placeholder="4"
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, levelCount: value ?? 4 }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                {rubricLanguage.numberOfCriteria(uiLanguage.data ?? "en")}
              </label>
              <InputNumber
                value={form.criteriaCount}
                min={1}
                disabled={busy}
                placeholder={rubricLanguage.auto(uiLanguage.data ?? "en")}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    criteriaCount: value ?? undefined,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                {rubricLanguage.maxPointsPerLevel(uiLanguage.data ?? "en")}
              </label>
              <InputNumber
                value={form.maxPointsPerLevel}
                min={1}
                disabled={busy}
                placeholder="4"
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    maxPointsPerLevel: value ?? 4,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">
                {rubricLanguage.languageLabel(uiLanguage.data ?? "en")}
              </label>
              <select
                value={form.language}
                disabled={busy}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    language: e.target.value as "th" | "en",
                  }))
                }
                className="main-input w-full"
              >
                <option value="en">English</option>
                <option value="th">ไทย (Thai)</option>
              </select>
            </div>
          </div>

          <footer className="flex w-full flex-col gap-2 border-t pt-3">
            <div className="flex w-full items-center justify-between text-sm text-gray-500">
              <span>
                {phase === "uploading"
                  ? rubricLanguage.uploadingCurriculum(uiLanguage.data ?? "en")
                  : phase === "generating"
                    ? rubricLanguage.generatingDraft(uiLanguage.data ?? "en")
                    : ""}
              </span>
              {validationError && (
                <span className="text-red-500">{validationError}</span>
              )}
            </div>
            <div className="flex w-full justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="second-button flex items-center justify-center gap-1 border"
              >
                {rubricLanguage.cancel(uiLanguage.data ?? "en")}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!!validationError || busy}
                className="main-button flex items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                <RiSparkling2Line />
                {busy
                  ? rubricLanguage.working(uiLanguage.data ?? "en")
                  : rubricLanguage.generate(uiLanguage.data ?? "en")}
              </button>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}

export default RubricAiAssistant;
