import React, { useEffect } from "react";
import {
  Attendance,
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
  StudentOnSubject,
} from "../../interfaces";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import TextEditor from "../common/TextEditor";
import { BiCustomize } from "react-icons/bi";
import { CiSaveUp2 } from "react-icons/ci";
import { useCreateAttendance, useUpdateAttendance } from "../../react-query";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import { ProgressBar } from "primereact/progressbar";
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
    <main className="flex flex-col gap-2 max-h-screen overflow-y-auto">
      {updateAttendance.isPending && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <section className="w-full border-b flex flex-col md:flex-row py-2 justify-between">
        <div className="text-lg font-semibold">
          View Attendance Detail{" "}
          <span className="text-xs text-gray-400 font-normal">
            ( View / Edit )
          </span>
        </div>
        <div className="flex gap-2 items-center md:order-2">
          {selectAttendance?.id ? (
            <button
              ref={saveRef}
              disabled={updateAttendance.isPending}
              onClick={handleUpdate}
              className="second-button flex items-center justify-center gap-1 py-1 border "
            >
              <CiSaveUp2 />
              Save Change
            </button>
          ) : (
            <button
              ref={saveRef}
              disabled={createAttendance.isPending}
              onClick={handleCreate}
              className="second-button flex items-center justify-center gap-1 py-1 border "
            >
              <CiSaveUp2 />
              Create
            </button>
          )}
          <button
            onClick={() => onClose()}
            className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
          >
            <IoMdClose />
          </button>
        </div>
      </section>

      <div className="flex flex-col md:flex-row w-full h-full md:h-max  md:max-h-96 overflow-auto ">
        <div className="w-full md:w-1/4 bg-white flex flex-col gap-1 items-center justify-center overflow-y-auto">
          <div className="w-20 h-20 relative">
            <Image
              src={selectAttendance.student.photo}
              alt="Student"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-full object-contain"
            />
          </div>
          <div className="w-full h-16 flex flex-col items-center justify-center">
            <span className="text-gray-800 font-semibold text-sm">
              {selectAttendance.student.firstName}{" "}
              {selectAttendance.student.lastName}
            </span>
            <span className="text-gray-500 text-xs">
              Number {selectAttendance.student.number}
            </span>
          </div>
        </div>
        <div className="w-full md:w-3/4 h-full overflow-y-auto">
          <div className="flex w-full h-full p-2 flex-col gap-2">
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Status</div>
              <span className="text-gray-400 text-xs">
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
                      className={`w-full hover:bg-gray-100 h-8 flex items-center justify-between px-2 ${
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
                        className="w-5 h-5"
                        name={status.title}
                        checked={attendanceData?.status === status.title}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Note</div>
              <span className="text-gray-400 text-xs">
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
