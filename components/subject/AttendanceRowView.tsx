import React from "react";
import {
  Attendance,
  AttendanceRow,
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
import {
  useDeleteRowAttendance,
  useUpdateAttendance,
  useUpdateRowAttendance,
} from "../../react-query";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import { ProgressBar } from "primereact/progressbar";

type props = {
  selectRow: AttendanceRow;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};
function AttendanceRowView({ selectRow, onClose, toast }: props) {
  const sucessSoud = useSound("/sounds/ding.mp3");
  const [rowData, setRowData] = React.useState<AttendanceRow>(selectRow);
  const queryClient = useQueryClient();
  const update = useUpdateRowAttendance();
  const remove = useDeleteRowAttendance();

  const handleUpdate = async () => {
    try {
      await update.mutateAsync({
        request: {
          query: {
            attendanceRowId: rowData.id,
          },
          body: {
            note: rowData.note,
          },
        },
        queryClient,
      });
      sucessSoud?.play();
      show({
        title: "Update Success",
        description: "Attendance Note has been updated",
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

  const handleDelete = async () => {
    try {
      await remove.mutateAsync({
        request: {
          attendanceRowId: selectRow.id,
        },
        queryClient,
      });
      sucessSoud?.play();
      show({
        title: "Delete Success",
        description: "Attendance Row has been deleted",
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

  const show = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    toast.current?.show({
      severity: "success",
      summary: title,
      detail: description,
    });
  };

  return (
    <main className="h-96 flex flex-col gap-2">
      {update.isPending && (
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
            disabled={remove.isPending}
            onClick={handleDelete}
            className="reject-button flex items-center justify-center gap-1 py-1 border "
          >
            Delete
          </button>
          <button
            disabled={update.isPending}
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
        <div className="w-full h-full overflow-y-auto">
          <div className="flex w-full  h-max p-2 flex-col gap-2">
            <div className="flex flex-col gap-0 border-b">
              <div className="font-medium leading-4">Attendance Note</div>
              <span className="text-gray-400 text-xs">
                Add note or edit note here
              </span>
            </div>
            <div className="h-96 bg-slate-200">
              <TextEditor
                value={rowData?.note || ""}
                onChange={(value) =>
                  setRowData((prev) => {
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

export default AttendanceRowView;
