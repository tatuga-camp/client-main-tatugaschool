import React from "react";
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
import { useUpdateAttendance } from "../../react-query";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import { ProgressBar } from "primereact/progressbar";

type props = {
  selectAttendance: Attendance & { student: StudentOnSubject };
  onClose: () => void;
  toast: React.RefObject<Toast>;

  attendanceTable: AttendanceTable & { statusList: AttendanceStatusList[] };
};
function AttendanceView({
  selectAttendance,
  onClose,
  attendanceTable,
  toast,
}: props) {
  const sucessSoud = useSound("/sounds/ding.mp3");
  const queryClient = useQueryClient();
  const [attendanceData, setAttendanceData] = React.useState<Attendance>();
  const updateAttendance = useUpdateAttendance();
  React.useEffect(() => {
    setAttendanceData(selectAttendance);
  }, [selectAttendance]);

  const handleCheck = ({ key }: { key: string }) => {
    setAttendanceData((prev) => {
      if (!prev) return prev;
      return { ...prev, status: key };
    });
  };

  const handleUpdate = async () => {
    try {
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
      show();
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
      summary: "Updated",
      detail: "Attendance has been updated",
    });
  };
  return (
    <main className="h-96 flex flex-col gap-2">
      {updateAttendance.isPending && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <section className="w-full border-b flex py-2 justify-between ">
        <div className="text-lg font-semibold">
          View Attendance Detail{" "}
          <span className="text-xs text-gray-400 font-normal">
            ( View / Edit )
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            disabled={updateAttendance.isPending}
            onClick={handleUpdate}
            className="second-button flex items-center justify-center gap-1 py-1 border "
          >
            <CiSaveUp2 />
            Save Change
          </button>
          <button
            onClick={() => onClose()}
            className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
         flex items-center justify-center font-semibold"
          >
            <IoMdClose />
          </button>
        </div>
      </section>

      <section className="w-full flex h-72 items-center justify-start">
        <div
          className="w-40 border-r h-full  bg-white 
        flex flex-col gap-1 items-center justify-center"
        >
          <div className="w-20 h-20 relative">
            <Image
              src="/favicon.ico"
              alt="Student"
              fill
              className=" rounded-full"
            />
          </div>
          <div className="w-40 h-16 flex flex-col items-center justify-center">
            <span className="text-gray-800 font-semibold text-sm">
              {selectAttendance.student.firstName}{" "}
              {selectAttendance.student.lastName}
            </span>
            <span className="text-gray-500 text-xs">
              Number {selectAttendance.student.number}
            </span>
          </div>
        </div>
        <div className="w-full h-full overflow-y-auto">
          <div className="flex w-full  h-max p-2 flex-col gap-2">
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Status</div>
              <span className="text-gray-400 text-xs">
                modify attendance status here
              </span>
            </div>
            <div className="flex flex-col">
              {attendanceTable.statusList.map((status, index) => {
                const odd = index % 2 === 0;
                return (
                  <div
                    onClick={(e) => handleCheck({ key: status.title })}
                    key={status.id}
                    className={`w-full hover:bg-gray-100 h-8  flex items-center justify-between px-2 ${
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
            <div className="h-96 bg-slate-200">
              <TextEditor
                value={attendanceData?.note || ""}
                onChange={(value) =>
                  setAttendanceData((prev) => {
                    if (!prev) return prev;
                    return { ...prev, note: value };
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AttendanceView;
