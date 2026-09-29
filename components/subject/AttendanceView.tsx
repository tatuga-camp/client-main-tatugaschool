import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { LuCheck } from "react-icons/lu";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import { attendanceTableUiLanguage } from "../../data/languages";
import { useSound } from "../../hook";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import {
  useCreateAttendance,
  useGetLanguage,
  useUpdateAttendance,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import TextEditor from "../common/TextEditor";
import { SelectAttendance } from "./Attendance";

type props = {
  selectAttendance: SelectAttendance;
  onClose: () => void;
  toast: React.RefObject<Toast>;

  attendanceTable: AttendanceTable & { statusLists: AttendanceStatusList[] };
};
function AttendanceView({
  selectAttendance,
  onClose,
  attendanceTable,
  toast,
}: props) {
  const queryClient = useQueryClient();
  const { data: language = "en" } = useGetLanguage();
  const [attendanceData, setAttendanceData] =
    React.useState<SelectAttendance | null>();
  const updateAttendance = useUpdateAttendance();
  const createAttendance = useCreateAttendance();
  React.useEffect(() => {
    setAttendanceData(selectAttendance);
  }, [selectAttendance]);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const handleCheck = ({ key }: { key: string }) => {
    setAttendanceData((prev) => {
      if (!prev) return prev;
      return { ...prev, status: key };
    });
  };

  const handleUpdate = async () => {
    try {
      if (!selectAttendance?.id) {
        throw new Error("Attendance not found");
      }
      await updateAttendance.mutateAsync({
        request: {
          query: {
            attendanceId: selectAttendance.id,
          },
          body: {
            status: attendanceData?.status,
            note: attendanceData?.note,
          },
        },
        queryClient,
      });
      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Attendance has been updated",
      });
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

  const handleCreate = async () => {
    try {
      if (!attendanceData?.status) {
        throw new Error(attendanceTableUiLanguage.pickStatus(language));
      }
      await createAttendance.mutateAsync({
        request: {
          status: attendanceData?.status,
          note: attendanceData?.note,
          attendanceRowId: selectAttendance.attendanceRowId,
          studentOnSubjectId: selectAttendance.student.id,
        },
        queryClient,
      });
      toast.current?.show({
        severity: "success",
        summary: "created",
        detail: "Attendance has been created",
      });
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

  const handleClickEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      saveRef.current?.click();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleClickEnter);

    return () => {
      document.removeEventListener("keydown", handleClickEnter);
    };
  }, [attendanceData]);

  const isEdit = !!selectAttendance?.id;
  const isPending = updateAttendance.isPending || createAttendance.isPending;
  // Hidden statuses stay pickable when the record already uses one.
  const statusOptions = attendanceTable.statusLists.filter(
    (s) => !s.isHidden || s.title === selectAttendance.status,
  );
  const { student } = selectAttendance;

  return (
    <div className="flex max-h-[92dvh] w-[95vw] max-w-lg flex-col overflow-hidden rounded-2xl bg-white font-Anuphan text-icon-color">
      <header className="flex items-start justify-between gap-3 border-b p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              sizes="48px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-icon-color/60">
              {attendanceTableUiLanguage.recordTitle(language)} ·{" "}
              {attendanceTable.title}
            </p>
            <h2 className="truncate text-lg font-bold leading-tight">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-xs text-icon-color/60">
              {attendanceTableUiLanguage.number(language)} {student.number}
              {!isEdit &&
                ` · ${attendanceTableUiLanguage.notRecorded(language)}`}
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

      {isPending && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "3px", borderRadius: 0 }}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold">
            {attendanceTableUiLanguage.statusLabel(language)}
          </h3>
          <div
            role="radiogroup"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {statusOptions.map((status) => {
              const active = attendanceData?.status === status.title;
              return (
                <button
                  key={status.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleCheck({ key: status.title })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[0.98] ${
                    active
                      ? "border-transparent"
                      : "border-gray-200 hover:bg-background-color"
                  }`}
                  style={
                    active
                      ? {
                          boxShadow: `inset 0 0 0 2px ${status.color}`,
                          backgroundColor: `${status.color}1f`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                    style={{ background: status.color }}
                  >
                    {active && <LuCheck />}
                  </span>
                  <span className="truncate">{status.title}</span>
                  {status.isHidden && (
                    <span className="ml-auto text-[10px] font-normal text-gray-400">
                      {attendanceTableUiLanguage.hidden(language)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold">
            {attendanceTableUiLanguage.noteLabel(language)}
            <span className="text-xs font-normal text-gray-400">
              {attendanceTableUiLanguage.noteHint(language)}
            </span>
          </h3>
          <div className="h-64 overflow-hidden rounded-xl border border-gray-200">
            <TextEditor
              schoolId={attendanceTable.schoolId}
              value={attendanceData?.note || ""}
              onChange={(value) =>
                setAttendanceData((prev) => {
                  if (!prev) return prev;
                  return { ...prev, note: value };
                })
              }
            />
          </div>
        </section>
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
          ref={saveRef}
          type="button"
          disabled={isPending}
          onClick={isEdit ? handleUpdate : handleCreate}
          className="flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? (
            <LoadingSpinner />
          ) : (
            <>
              <LuCheck />
              {attendanceTableUiLanguage.save(language)}
            </>
          )}
        </button>
      </footer>
    </div>
  );
}

export default AttendanceView;
