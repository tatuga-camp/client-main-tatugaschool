import React, { useState } from "react";
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
import { BsQrCode } from "react-icons/bs";
import QRCode from "./QRCode";
import { convertToDateTimeLocalString, timeLeft } from "../../utils";
import Switch from "../common/Switch";

type props = {
  selectRow: AttendanceRow;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};
function AttendanceRowView({ selectRow, onClose, toast }: props) {
  const sucessSoud = useSound("/sounds/ding.mp3");
  const [rowData, setRowData] = React.useState<AttendanceRow>({
    ...selectRow,
    expireAt:
      selectRow?.expireAt &&
      convertToDateTimeLocalString(new Date(selectRow?.expireAt)),
    allowScanAt:
      selectRow?.allowScanAt &&
      convertToDateTimeLocalString(new Date(selectRow?.allowScanAt)),
  });
  const queryClient = useQueryClient();
  const [qrCodeURL, setQrCodeURL] = useState<string | null>(null);
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
            expireAt:
              rowData.expireAt && new Date(rowData.expireAt).toISOString(),
            allowScanAt:
              rowData.allowScanAt &&
              new Date(rowData.allowScanAt).toISOString(),
            isAllowScanManyTime:
              rowData.isAllowScanManyTime && rowData.isAllowScanManyTime,
          },
        },
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
    <>
      {qrCodeURL ? (
        <QRCode
          url={qrCodeURL}
          expireAt={rowData.expireAt ? new Date(rowData.expireAt) : undefined}
          setTriggerQRCode={(vale) => onClose()}
        />
      ) : (
        <div className="bg-white w-7/12 p-2 rounded-md border h-full md:h-4/6 lg:h-5/6 flex flex-col gap-2">
          {(update.isPending || remove.isPending) && (
            <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
          )}

          <header className="w-full border-b flex py-2 justify-between ">
            <div className="text-lg font-semibold">
              View Attendance Detail{" "}
              <span className="text-xs text-gray-400 font-normal">
                ( View / Edit )
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <button
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm("Are you sure you want to delete this row?")) {
                    handleDelete();
                  }
                }}
                className="reject-button flex items-center justify-center gap-1  border "
              >
                Delete
              </button>
              {selectRow.type === "SCAN" && (
                <button
                  onClick={() => {
                    setQrCodeURL(
                      () =>
                        `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${selectRow.id}`
                    );
                  }}
                  className="second-button border w-40 flex items-center justify-center gap-1"
                >
                  <BsQrCode />
                  QR Code
                </button>
              )}
              <button
                disabled={update.isPending}
                onClick={handleUpdate}
                className="second-button flex items-center justify-center gap-1  border "
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
          </header>
          <main className="grow overflow-auto">
            {rowData.type === "SCAN" && (
              <section className="mt-5">
                <h1 className="text-base sm:text-base font-medium">
                  QR Code Setting{" "}
                </h1>
                <h4 className="text-xs sm:text-sm text-gray-500">
                  Manage Your QR code setting here such as set expire time.
                </h4>
              </section>
            )}
            {rowData.type === "SCAN" && (
              <section className="flex  gap-2 mt-5">
                <label className="flex flex-col">
                  <span className="text-gray-400 text-xs">
                    This Qr Code will be allowed to scan at
                  </span>
                  <input
                    required
                    min={new Date().toISOString().slice(0, -8)}
                    value={rowData?.allowScanAt}
                    onChange={(e) =>
                      setRowData((prev) => ({
                        ...prev,
                        allowScanAt: e.target.value,
                      }))
                    }
                    type="datetime-local"
                    className="main-input h-8 w-60"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-gray-400 text-xs">
                    This Qr Code will exipre in the next{" "}
                    {rowData.expireAt &&
                      timeLeft({
                        targetTime: new Date(rowData?.expireAt).toISOString(),
                      })}
                  </span>
                  <input
                    required
                    min={
                      rowData?.allowScanAt &&
                      new Date(rowData?.allowScanAt).toISOString().slice(0, -8)
                    }
                    value={rowData?.expireAt}
                    onChange={(e) =>
                      setRowData((prev) => ({
                        ...prev,
                        expireAt: e.target.value,
                      }))
                    }
                    type="datetime-local"
                    className="main-input h-8 w-60"
                  />
                </label>
                <label className="flex flex-col ">
                  <span className="text-gray-400 text-xs">
                    Allow student to scan multiple times
                  </span>
                  <Switch
                    checked={rowData?.isAllowScanManyTime}
                    setChecked={(data) => {
                      setRowData((prev) => ({
                        ...prev,
                        isAllowScanManyTime: data,
                      }));
                    }}
                  />
                </label>
              </section>
            )}
            <section className="w-full flex h-72 items-center justify-start">
              <div className="w-full h-full ">
                <div className="flex w-full  h-max p-2 flex-col gap-2">
                  <div className="flex flex-col gap-0 border-b">
                    <div className="font-medium leading-4">Attendance Note</div>
                    <span className="text-gray-400 text-xs">
                      Add note or edit note here
                    </span>
                  </div>
                  <div className="h-96 bg-slate-200">
                    <TextEditor
                      schoolId={selectRow.schoolId}
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
        </div>
      )}
    </>
  );
}

export default AttendanceRowView;
