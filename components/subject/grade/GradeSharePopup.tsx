import { Toast } from "primereact/toast";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { TbCopy, TbExternalLink, TbLink } from "react-icons/tb";
import Swal from "sweetalert2";
import { gradeTableData } from "../../../data/languages";
import {
  ErrorMessages,
  PublicProgressLevel,
  Subject,
} from "../../../interfaces";
import {
  useCreatePublicProgress,
  useDeletePublicProgress,
  useGetLanguage,
  useUpdatePublicProgressLevel,
} from "../../../react-query";
import LoadingSpinner from "../../common/LoadingSpinner";
import { SECONDARY_BUTTON } from "./GradeSegmentedControl";

function GradeSharePopup({
  subject,
  toast,
  onClose,
}: {
  subject: Subject;
  toast: React.RefObject<Toast>;
  onClose: () => void;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const create = useCreatePublicProgress();
  const update = useUpdatePublicProgressLevel();
  const revoke = useDeletePublicProgress();
  const token = subject.publicProgressToken ?? null;
  const [level, setLevel] = useState<PublicProgressLevel>(
    subject.publicProgressLevel ?? "STATUS",
  );
  const url = token
    ? `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/progress/${token}`
    : "";

  const levels: { value: PublicProgressLevel; label: string; hint: string }[] =
    [
      {
        value: "STATUS",
        label: gradeTableData.levelStatus(lang),
        hint: gradeTableData.levelStatusHint(lang),
      },
      {
        value: "SCORE",
        label: gradeTableData.levelScore(lang),
        hint: gradeTableData.levelScoreHint(lang),
      },
      {
        value: "GRADE",
        label: gradeTableData.levelGrade(lang),
        hint: gradeTableData.levelGradeHint(lang),
      },
    ];

  const showError = (error: unknown) => {
    const result = error as ErrorMessages | undefined;
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: result?.message?.toString(),
      life: 3000,
    });
  };

  const handleLevel = async (next: PublicProgressLevel) => {
    const previous = level;
    setLevel(next);
    if (!token) return; // saved on Create link
    try {
      await update.mutateAsync({ subjectId: subject.id, level: next });
      toast.current?.show({
        severity: "success",
        summary: gradeTableData.levelSaved(lang),
        life: 2000,
      });
    } catch (error) {
      setLevel(previous);
      showError(error);
    }
  };

  const handleCreate = async () => {
    try {
      await create.mutateAsync({ subjectId: subject.id, level });
    } catch (error) {
      showError(error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.current?.show({
        severity: "success",
        summary: gradeTableData.copied(lang),
        life: 2000,
      });
    } catch {
      showError({ message: gradeTableData.copyFailed(lang) });
    }
  };

  const handleStop = async () => {
    const { isConfirmed } = await Swal.fire({
      title: gradeTableData.stopSharing(lang),
      text: gradeTableData.stopSharingConfirm(lang),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: gradeTableData.stopSharing(lang),
      cancelButtonText: gradeTableData.cancel(lang),
      confirmButtonColor: "#F04438", // error-color
    });
    if (!isConfirmed) return;
    try {
      await revoke.mutateAsync({ subjectId: subject.id });
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="flex w-[92vw] max-w-lg flex-col gap-4 rounded-2xl bg-white p-5 font-Anuphan">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-icon-color">
            {gradeTableData.shareTitle(lang)}
          </h2>
          <p className="text-sm text-gray-500">
            {gradeTableData.shareDescription(lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={gradeTableData.close(lang)}
          className="shrink-0 text-2xl text-icon-color"
        >
          <IoMdClose />
        </button>
      </header>

      {token && (
        <section className="flex flex-col gap-1">
          <span className="text-sm text-gray-400">
            {gradeTableData.linkLabel(lang)}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-background-color px-3 py-2 text-sm text-icon-color"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={SECONDARY_BUTTON}
              >
                <TbCopy />
                {gradeTableData.copy(lang)}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={SECONDARY_BUTTON}
              >
                <TbExternalLink />
                {gradeTableData.open(lang)}
              </a>
            </div>
          </div>
        </section>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-gray-400">
          {gradeTableData.visibility(lang)}
        </legend>
        {levels.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
              level === option.value
                ? "border-primary-color bg-primary-color/5"
                : "border-gray-200 hover:bg-background-color"
            }`}
          >
            <input
              type="radio"
              name="public-progress-level"
              value={option.value}
              checked={level === option.value}
              disabled={update.isPending}
              onChange={() => handleLevel(option.value)}
              className="mt-1 accent-primary-color"
            />
            <span>
              <span className="block text-sm font-semibold text-icon-color">
                {option.label}
              </span>
              <span className="block text-xs text-gray-500">
                {option.hint}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <footer className="flex items-center justify-between gap-2">
        {token ? (
          <button
            type="button"
            onClick={handleStop}
            disabled={revoke.isPending}
            className="text-sm font-semibold text-error-color hover:underline disabled:opacity-50"
          >
            {gradeTableData.stopSharing(lang)}
          </button>
        ) : (
          <span />
        )}
        {!token && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={create.isPending}
            className="main-button flex items-center gap-1 px-4 py-2"
          >
            {create.isPending ? (
              <LoadingSpinner />
            ) : (
              <>
                <TbLink />
                {gradeTableData.createLink(lang)}
              </>
            )}
          </button>
        )}
      </footer>
    </div>
  );
}

export default GradeSharePopup;
