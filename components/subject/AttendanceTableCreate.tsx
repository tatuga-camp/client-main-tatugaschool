import { useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { TbTablePlus } from "react-icons/tb";
import Swal from "sweetalert2";
import { attendanceTableUiLanguage } from "../../data/languages";
import { useSound } from "../../hook";
import { ErrorMessages } from "../../interfaces";
import { useCreateAttendanceTable, useGetLanguage } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  onClose: () => void;
  toast: React.RefObject<Toast>;
  subjectId: string;
};

const MAX_LENGTH = 99;

function AttendanceTableCreate({ onClose, toast, subjectId }: Props) {
  const queryClient = useQueryClient();
  const { data: language = "en" } = useGetLanguage();
  const [createData, setCreateData] = React.useState<{
    title?: string;
    description?: string;
  }>();
  const create = useCreateAttendanceTable();
  const handleCreate = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      if (!createData?.title || !createData?.description) {
        throw new Error("Title and Description is required");
      }
      await create.mutateAsync({
        request: {
          title: createData?.title,
          description: createData?.description,
          subjectId: subjectId,
        },
        queryClient,
      });
      show();

      onClose();
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  const show = () => {
    toast.current?.show({
      severity: "success",
      summary: "Created",
      detail: "Attendance Table Created",
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-icon-color outline-none transition placeholder:text-gray-400 focus:border-primary-color focus:ring-2 focus:ring-primary-color/20";

  return (
    <form
      onSubmit={handleCreate}
      className="flex w-[95vw] max-w-md flex-col overflow-hidden rounded-2xl bg-white font-Anuphan text-icon-color"
    >
      <header className="flex items-start justify-between gap-3 border-b p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            <TbTablePlus />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight">
              {attendanceTableUiLanguage.createTitle(language)}
            </h2>
            <p className="text-xs text-icon-color/60">
              {attendanceTableUiLanguage.createDescription(language)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onClose()}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl transition hover:bg-background-color"
        >
          <IoCloseOutline />
        </button>
      </header>

      {create.isPending && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "3px", borderRadius: 0 }}
        />
      )}

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-icon-color/70">
            {attendanceTableUiLanguage.titleLabel(language)}
          </span>
          <input
            autoFocus
            required
            maxLength={MAX_LENGTH}
            value={createData?.title ?? ""}
            onChange={(e) =>
              setCreateData((prev) => ({ ...prev, title: e.target.value }))
            }
            type="text"
            className={`${inputClass} h-10`}
            placeholder={attendanceTableUiLanguage.titlePlaceholder(language)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex items-center justify-between text-xs font-medium text-icon-color/70">
            {attendanceTableUiLanguage.descriptionLabel(language)}
            <span className="font-normal tabular-nums text-gray-400">
              {createData?.description?.length ?? 0}/{MAX_LENGTH}
            </span>
          </span>
          <textarea
            required
            rows={3}
            maxLength={MAX_LENGTH}
            value={createData?.description ?? ""}
            onChange={(e) =>
              setCreateData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder={attendanceTableUiLanguage.descriptionPlaceholder(
              language,
            )}
            className={`${inputClass} resize-none py-2`}
          />
        </label>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t p-3 md:px-6">
        <button
          type="button"
          onClick={() => onClose()}
          className="h-10 rounded-lg px-4 text-sm font-semibold transition hover:bg-background-color"
        >
          {attendanceTableUiLanguage.cancel(language)}
        </button>
        <button
          type="submit"
          disabled={create.isPending}
          className="flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60"
        >
          {create.isPending ? (
            <LoadingSpinner />
          ) : (
            attendanceTableUiLanguage.createButton(language)
          )}
        </button>
      </footer>
    </form>
  );
}

export default AttendanceTableCreate;
