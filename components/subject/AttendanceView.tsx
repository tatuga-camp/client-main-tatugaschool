import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import { useCreateAttendance, useUpdateAttendance } from "../../react-query";
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
  const sucessSoud = useSound("/sounds/ding.mp3");
  const queryClient = useQueryClient();
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
      sucessSoud?.play();
      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Attendance has been updated",
      });
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
        throw new Error("Status is required");
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
      sucessSoud?.play();
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

  return (
    <main className="flex max-h-screen flex-col gap-2 overflow-y-auto">
      {updateAttendance.isPending && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <section className="flex w-full flex-col justify-between border-b py-2 md:flex-row">
        <div className="text-lg font-semibold">
          View Attendance Detail{" "}
          <span className="text-xs font-normal text-gray-400">
            ( View / Edit )
          </span>
        </div>
        <div className="flex items-center gap-2 md:order-2">
          {selectAttendance?.id ? (
            <button
              ref={saveRef}
              disabled={updateAttendance.isPending}
              onClick={handleUpdate}
              className="second-button flex items-center justify-center gap-1 border py-1"
            >
              <CiSaveUp2 />
              Save Change
            </button>
          ) : (
            <button
              ref={saveRef}
              disabled={createAttendance.isPending}
              onClick={handleCreate}
              className="second-button flex items-center justify-center gap-1 border py-1"
            >
              <CiSaveUp2 />
              Create
            </button>
          )}
          <button
            onClick={() => onClose()}
            className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
          >
            <IoMdClose />
          </button>
        </div>
      </section>

      <div className="flex h-full w-full flex-col overflow-auto md:h-max md:max-h-96 md:flex-row">
        <div className="flex w-full flex-col items-center justify-center gap-1 overflow-y-auto bg-white md:w-1/4">
          <div className="relative h-20 w-20">
            <Image
              src={selectAttendance.student.photo}
              alt="Student"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-full object-contain"
            />
          </div>
          <div className="flex h-16 w-full flex-col items-center justify-center">
            <span className="text-sm font-semibold text-gray-800">
              {selectAttendance.student.firstName}{" "}
              {selectAttendance.student.lastName}
            </span>
            <span className="text-xs text-gray-500">
              Number {selectAttendance.student.number}
            </span>
          </div>
        </div>
        <div className="h-full w-full overflow-y-auto md:w-3/4">
          <div className="flex h-full w-full flex-col gap-2 p-2">
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Status</div>
              <span className="text-xs text-gray-400">
                modify attendance status here
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {attendanceTable.statusLists
                .filter((s) => !s.isHidden)
                .map((status, index) => {
                  const odd = index % 2 === 0;
                  return (
                    <div
                      onClick={(e) => handleCheck({ key: status.title })}
                      key={status.id}
                      className={`flex h-8 w-full items-center justify-between px-2 hover:bg-gray-100 ${
                        odd ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <span
                        style={{ color: status.color }}
                        className="font-semibold"
                      >
                        {status.title}
                      </span>
                      <input
                        onChange={(e) => handleCheck({ key: status.title })}
                        type="checkbox"
                        style={{ accentColor: status.color }}
                        className="h-5 w-5"
                        name={status.title}
                        checked={attendanceData?.status === status.title}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Note</div>
              <span className="text-xs text-gray-400">
                Add note or edit note here
              </span>
            </div>
            {attendanceTable && (
              <div className="h-96 bg-slate-200">
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AttendanceView;
