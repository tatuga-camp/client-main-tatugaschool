import React from "react";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { BsQrCode } from "react-icons/bs";
import { IoIosCreate } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";
import {
  LuCalendarClock,
  LuClock4,
  LuRepeat,
  LuSparkles,
} from "react-icons/lu";
import Swal from "sweetalert2";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
} from "../../interfaces";
import {
  useCreateAttendanceRow,
  useGetAttendancesTable,
  useGetLanguage,
} from "../../react-query";
import {
  attendanceCheckerDataLanugae,
  attendanceQRCodeDatLanguage,
} from "../../data/languages";
import { timeLeft } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import Switch from "../common/Switch";
import QRCode from "./QRCode";

type Props = {
  onClose: () => void;
  subjectId: string;
  toast: React.RefObject<Toast>;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const addOneHour = (datetimeLocal: string): string => {
  if (!datetimeLocal) return datetimeLocal;
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return datetimeLocal;
  d.setHours(d.getHours() + 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate(),
  )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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
        `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${create.id}`,
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
      <style>{`
        .aqr-shell *::-webkit-scrollbar { height: 8px; width: 8px; }
        .aqr-shell *::-webkit-scrollbar-thumb {
          background: #D6DDEB; border-radius: 999px;
        }
        .aqr-shell *::-webkit-scrollbar-track { background: transparent; }
      `}</style>

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
          className="aqr-shell font-Anuphan relative max-h-dvh w-screen overflow-y-auto bg-background-color text-icon-color shadow-2xl md:max-h-[88vh] md:w-[92vw] md:max-w-3xl md:rounded-[2rem]"
        >
          {/* soft dotted texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #383767 0.6px, transparent 1.2px), radial-gradient(circle at 70% 80%, #383767 0.6px, transparent 1.2px)",
              backgroundSize: "48px 48px, 72px 72px",
            }}
          />
          {/* washi tape top edge in brand blue */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-0 h-2"
            style={{
              background:
                "repeating-linear-gradient(90deg, #2C7CD1 0 22px, transparent 22px 44px)",
            }}
          />

          <div className="relative flex flex-col">
            {/* HEADER */}
            <div className="flex-none border-b border-dashed border-gray-200 bg-white/70 px-4 pb-3 pt-5 backdrop-blur-sm sm:px-6 md:px-8 md:pb-4 md:pt-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="hidden h-11 w-11 flex-none items-center justify-center rounded-2xl bg-info-color/15 text-xl text-info-color md:flex"
                    style={{ transform: "rotate(-4deg)" }}
                  >
                    <BsQrCode />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-icon-color md:text-2xl">
                      {attendanceQRCodeDatLanguage.title(language.data ?? "en")}
                    </h1>
                    <p className="mt-0.5 text-xs text-icon-color/60 sm:text-sm">
                      {attendanceQRCodeDatLanguage.description(
                        language.data ?? "en",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    onClose();
                  }}
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-gray-200 bg-white text-lg text-icon-color/70 transition hover:border-error-color hover:bg-error-color/10 hover:text-error-color"
                  aria-label="Close"
                >
                  <IoCloseOutline />
                </button>
              </div>

              {/* Table tabs + date controls */}
              <div className="mt-4 flex flex-col gap-4">
                {attendanceTables.data &&
                  attendanceTables.data.length > 0 && (
                    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                      {attendanceTables.data?.map((table) => {
                        const active = selectTable?.id === table.id;
                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => setSelectTable(table)}
                            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                              active
                                ? "bg-primary-color text-white shadow-md shadow-primary-color/30"
                                : "text-icon-color/70 hover:bg-primary-color/10 hover:text-icon-color"
                            }`}
                          >
                            {table.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                {selectTable?.description && (
                  <p className="line-clamp-2 text-xs italic text-icon-color/60">
                    “{selectTable.description}”
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FieldLabel
                    icon={<LuCalendarClock />}
                    label={attendanceCheckerDataLanugae.startDate(
                      language.data ?? "en",
                    )}
                  >
                    <BrandInput
                      required
                      value={attendanceData.startDate ?? ""}
                      onChange={(e) =>
                        setAttendanceData((prev) => {
                          if (e.target.value === "") {
                            return {
                              ...prev,
                              startDate: "",
                              endDate: "",
                            };
                          }
                          return {
                            ...prev,
                            startDate: e.target.value,
                            endDate: addOneHour(e.target.value),
                          };
                        })
                      }
                      type="datetime-local"
                    />
                  </FieldLabel>
                  <FieldLabel
                    icon={<LuClock4 />}
                    label={attendanceCheckerDataLanugae.endDate(
                      language.data ?? "en",
                    )}
                  >
                    <BrandInput
                      required
                      value={attendanceData.endDate ?? ""}
                      onChange={(e) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      type="datetime-local"
                    />
                  </FieldLabel>
                </div>

                {createRow.isPending && (
                  <div className="overflow-hidden rounded-full bg-gray-100">
                    <ProgressBar
                      mode="indeterminate"
                      style={{ height: "5px", background: "transparent" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* MAIN — QR settings */}
            <div className="flex-1 px-4 py-4 sm:px-6 md:px-8">
              <div className="rounded-3xl border border-dashed border-info-color/40 bg-info-color/5 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-info-color/15 text-info-color">
                    <BsQrCode />
                  </span>
                  <h3 className="text-sm font-semibold text-icon-color sm:text-base">
                    {attendanceQRCodeDatLanguage.qrSetting(
                      language.data ?? "en",
                    )}
                  </h3>
                </div>
                <p className="mb-4 ml-9 text-xs text-icon-color/60">
                  {attendanceQRCodeDatLanguage.qrSettingDescription(
                    language.data ?? "en",
                  )}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  <FieldLabel
                    icon={<LuCalendarClock />}
                    label={attendanceQRCodeDatLanguage.qrAllowToScan(
                      language.data ?? "en",
                    )}
                  >
                    <BrandInput
                      required
                      min={new Date().toISOString().slice(0, -8)}
                      value={attendanceData?.allowScanAt ?? ""}
                      onChange={(e) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          allowScanAt: e.target.value,
                        }))
                      }
                      type="datetime-local"
                    />
                  </FieldLabel>
                  <FieldLabel
                    icon={<LuClock4 />}
                    label={
                      <span>
                        {attendanceQRCodeDatLanguage.qrExpire(
                          language.data ?? "en",
                        )}{" "}
                        <span className="font-semibold text-primary-color">
                          {attendanceData.expireAt
                            ? timeLeft({
                                targetTime: new Date(
                                  attendanceData?.expireAt,
                                ).toISOString(),
                              })
                            : "—"}
                        </span>
                      </span>
                    }
                  >
                    <BrandInput
                      required
                      min={
                        attendanceData?.allowScanAt
                          ? new Date(attendanceData?.allowScanAt)
                              .toISOString()
                              .slice(0, -8)
                          : undefined
                      }
                      value={attendanceData?.expireAt ?? ""}
                      onChange={(e) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          expireAt: e.target.value,
                        }))
                      }
                      type="datetime-local"
                    />
                  </FieldLabel>
                  <FieldLabel
                    icon={<LuRepeat />}
                    label={attendanceQRCodeDatLanguage.qrAllowStudent(
                      language.data ?? "en",
                    )}
                  >
                    <div className="flex h-10 items-center rounded-2xl border border-gray-200 bg-white px-3">
                      <Switch
                        checked={attendanceData?.isAllowScanManyTime}
                        setChecked={(data) => {
                          setAttendanceData((prev) => ({
                            ...prev,
                            isAllowScanManyTime: data,
                          }));
                        }}
                      />
                      <span className="ml-3 truncate text-xs text-icon-color/70">
                        {attendanceData?.isAllowScanManyTime
                          ? "On — students can scan again"
                          : "Off — single scan only"}
                      </span>
                    </div>
                  </FieldLabel>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 px-1 text-xs text-icon-color/60">
                <LuSparkles className="text-primary-color" />
                <span>
                  Once created, students can scan the QR within the allowed
                  window.
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="flex-none border-t border-dashed border-gray-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:px-8 md:py-4"
              style={{
                boxShadow: "0 -10px 30px -20px rgba(56,55,103,0.15)",
              }}
            >
              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    onClose();
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-icon-color transition hover:border-error-color hover:bg-error-color/10 hover:text-error-color"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRow.isPending}
                  className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary-color px-7 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60 sm:flex-none"
                  style={{
                    boxShadow:
                      "0 12px 24px -10px rgba(44,124,209,0.55), 0 4px 0 0 #275d96",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                  {createRow.isPending ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <IoIosCreate className="text-base text-warning-color" />
                      {attendanceQRCodeDatLanguage.create(
                        language.data ?? "en",
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
}

export default AttendanceQRcode;

/* ---------- helpers ---------- */

const BrandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...rest }, ref) => (
  <input
    ref={ref}
    {...rest}
    className={`h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-icon-color outline-none transition placeholder:text-icon-color/40 focus:border-primary-color focus:bg-white focus:ring-4 focus:ring-primary-color/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-icon-color/50 ${className}`}
  />
));
BrandInput.displayName = "BrandInput";

const FieldLabel: React.FC<{
  label: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <label className="flex flex-col gap-1">
    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-icon-color/60">
      {icon && <span className="text-primary-color">{icon}</span>}
      {label}
    </span>
    {children}
  </label>
);
