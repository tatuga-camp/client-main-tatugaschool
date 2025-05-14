import React from "react";
import { IoIosCreate, IoMdClose } from "react-icons/io";
import {
  useCreateAttendanceRow,
  useGetAttendancesTable,
  useGetLanguage,
} from "../../react-query";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import Switch from "../common/Switch";
import Swal from "sweetalert2";
import LoadingSpinner from "../common/LoadingSpinner";
import LoadingBar from "../common/LoadingBar";
import { Toast } from "primereact/toast";
import { timeLeft } from "../../utils";
import QRCode from "./QRCode";
import {
  attendanceCheckerDataLanugae,
  attendanceQRCodeDatLanguage,
} from "../../data/languages";

type Props = {
  onClose: () => void;
  subjectId: string;
  toast: React.RefObject<Toast>;
};
function AttendanceQRcode({ onClose, subjectId, toast }: Props) {
  const createRow = useCreateAttendanceRow();
  const language = useGetLanguage();
  const [attendanceData, setAttendanceData] = React.useState<{
    startDate?: string;
    endDate?: string;
    expireAt?: string;
    allowScanAt?: string;
    isAllowScanManyTime?: boolean;
  }>({
    isAllowScanManyTime: false,
  });
  const [qrcodeURL, setQrcodeURL] = React.useState<string | null>(null);
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const attendanceTables = useGetAttendancesTable({
    subjectId: subjectId,
  });

  React.useEffect(() => {
    if (attendanceTables.data) {
      setSelectTable(attendanceTables.data[0]);
    }
  }, [attendanceTables.data]);

  const handleCreate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (
        !attendanceData?.startDate ||
        !attendanceData?.endDate ||
        !selectTable ||
        !attendanceData?.expireAt ||
        !attendanceData?.allowScanAt
      ) {
        throw new Error("Start Date and End Date is required");
      }
      const create = await createRow.mutateAsync({
        request: {
          startDate: new Date(attendanceData.startDate).toISOString(),
          endDate: new Date(attendanceData.endDate).toISOString(),
          isAllowScanManyTime: attendanceData.isAllowScanManyTime,
          expireAt: new Date(attendanceData.expireAt).toISOString(),
          allowScanAt: new Date(attendanceData.allowScanAt).toISOString(),
          attendanceTableId: selectTable?.id,
          type: "SCAN",
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Attendance has been created",
      });
      setAttendanceData(() => ({
        isAllowScanManyTime: false,
      }));
      setQrcodeURL(
        `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${create.id}`
      );
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

  return (
    <>
      {qrcodeURL ? (
        <QRCode
          url={qrcodeURL}
          setTriggerQRCode={(value) => {
            document.body.style.overflow = "auto";
            setQrcodeURL(null);
            onClose();
          }}
        />
      ) : (
        <form
          onSubmit={handleCreate}
          className="w-full md:w-10/12 lg:w-9/12 xl:w-6/12 h-max md:h-max bg-white rounded-md p-3"
        >
          <header className="w-full flex border-b pb-2 justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-xl font-medium">
                {attendanceQRCodeDatLanguage.title(language.data ?? "en")}
              </h1>
              <span className="text-sm text-gray-500 block mt-1">
                {attendanceQRCodeDatLanguage.description(language.data ?? "en")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                document.body.style.overflow = "auto";
                onClose();
              }}
              className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
                 flex items-center justify-center font-semibold"
            >
              <IoMdClose />
            </button>
          </header>
          {createRow.isPending && <LoadingBar />}
          <main className="py-3 w-96 md:w-full overflow-auto">
            <section className="w-full flex flex-col gap-4 mt-5">
              {/* Table Selection */}
              <div className="w-full overflow-x-auto">
                <div className="flex flex-nowrap min-w-0">
                  {attendanceTables.data?.map((table, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setSelectTable(table)}
                      className={`px-3 py-1 whitespace-nowrap ${
                        selectTable?.id === table.id
                          ? "font-semibold border-b-2 border-b-black"
                          : ""
                      }`}
                    >
                      {table.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Note Controls */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 flex  gap-2">
                  <label className=" flex flex-col">
                    <span className="text-gray-400 text-xs">
                      {attendanceCheckerDataLanugae.startDate(
                        language.data ?? "en"
                      )}
                    </span>
                    <input
                      required
                      value={attendanceData?.startDate}
                      onChange={(e) =>
                        setAttendanceData((prev) => {
                          if (e.target.value === "") {
                            return {
                              ...prev,
                              startDate: e.target.value,
                              endDate: e.target.value,
                            };
                          }

                          const [datePart, timePart] =
                            e.target.value.split("T");

                          const [hours, minutes] = timePart
                            .split(":")
                            .map(Number);
                          const plusOneHour = `${datePart}T${
                            hours + 1 < 10 ? `0${hours + 1}` : hours + 1
                          }:${minutes < 10 ? `0${minutes}` : minutes}`;

                          return {
                            ...prev,
                            startDate: e.target.value,
                            endDate: plusOneHour,
                          };
                        })
                      }
                      type="datetime-local"
                      className="main-input h-8 w-60"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-gray-400 text-xs">
                      {attendanceCheckerDataLanugae.endDate(
                        language.data ?? "en"
                      )}
                    </span>
                    <input
                      required
                      value={attendanceData?.endDate}
                      onChange={(e) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      type="datetime-local"
                      className="main-input h-8 w-60"
                    />
                  </label>
                </div>
              </div>
            </section>
            <section className="mt-5">
              <h1 className="text-base sm:text-base font-medium">
                {attendanceQRCodeDatLanguage.qrSetting(language.data ?? "en")}
              </h1>
              <h4 className="text-xs sm:text-sm text-gray-500">
                {attendanceQRCodeDatLanguage.qrSettingDescription(
                  language.data ?? "en"
                )}
              </h4>
            </section>
            <section className="flex flex-wrap  gap-2 mt-5">
              <label className="flex flex-col">
                <span className="text-gray-400 text-xs">
                  {attendanceQRCodeDatLanguage.qrAllowToScan(
                    language.data ?? "en"
                  )}
                </span>
                <input
                  required
                  min={new Date().toISOString().slice(0, -8)}
                  value={attendanceData?.allowScanAt}
                  onChange={(e) =>
                    setAttendanceData((prev) => ({
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
                  {attendanceQRCodeDatLanguage.qrExpire(language.data ?? "en")}
                  {attendanceData.expireAt &&
                    timeLeft({
                      targetTime: new Date(
                        attendanceData?.expireAt
                      ).toISOString(),
                    })}
                </span>
                <input
                  required
                  min={
                    attendanceData?.allowScanAt &&
                    new Date(attendanceData?.allowScanAt)
                      .toISOString()
                      .slice(0, -8)
                  }
                  value={attendanceData?.expireAt}
                  onChange={(e) =>
                    setAttendanceData((prev) => ({
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
                  {attendanceQRCodeDatLanguage.qrAllowStudent(
                    language.data ?? "en"
                  )}
                </span>
                <Switch
                  checked={attendanceData?.isAllowScanManyTime}
                  setChecked={(data) => {
                    setAttendanceData((prev) => ({
                      ...prev,
                      isAllowScanManyTime: data,
                    }));
                  }}
                />
              </label>
            </section>
          </main>
          <footer className="w-full flex justify-end p-1 border-t">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  document.body.style.overflow = "auto";
                  onClose();
                }}
                type="button"
                className="second-button border flex items-center justify-center gap-1"
              >
                Cancel
              </button>
              <button className="main-button flex items-center justify-center gap-1">
                {createRow.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <IoIosCreate />{" "}
                    {attendanceQRCodeDatLanguage.create(language.data ?? "en")}
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      )}
    </>
  );
}

export default AttendanceQRcode;
