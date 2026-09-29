import React from "react";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { BsQrCode } from "react-icons/bs";
import { IoCloseOutline, IoInformationCircleOutline } from "react-icons/io5";
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
  attendanceQRCodeDatLanguage,
  attendanceSessionDataLanguage,
} from "../../data/languages";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  addOneHour,
  ClassTimeFields,
  ScanSettingsFields,
  SectionHeading,
  TablePills,
} from "./AttendanceSessionFields";
import QRCode from "./QRCode";

type Props = {
  onClose: () => void;
  subjectId: string;
  toast: React.RefObject<Toast>;
};

type AttendanceData = {
  startDate?: string;
  endDate?: string;
  expireAt?: string;
  allowScanAt?: string;
  isAllowScanManyTime?: boolean;
};

function AttendanceQRcode({ onClose, subjectId, toast }: Props) {
  const createRow = useCreateAttendanceRow();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [attendanceData, setAttendanceData] = React.useState<AttendanceData>({
    isAllowScanManyTime: false,
  });
  // Until the teacher edits the scanning window it follows the class time,
  // so the common case only needs a start time.
  const [scanWindowTouched, setScanWindowTouched] = React.useState(false);
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

  const withScanWindow = (next: AttendanceData): AttendanceData =>
    scanWindowTouched
      ? next
      : { ...next, allowScanAt: next.startDate, expireAt: next.endDate };

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
      setScanWindowTouched(false);
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

  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  if (qrcodeURL) {
    return (
      <QRCode
        url={qrcodeURL}
        setTriggerQRCode={() => {
          document.body.style.overflow = "auto";
          setQrcodeURL(null);
          onClose();
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleCreate}
      className="flex max-h-[92dvh] w-[95vw] flex-col overflow-hidden rounded-2xl bg-white font-Anuphan text-icon-color md:max-h-[90vh] md:max-w-2xl"
    >
      {/* HEADER */}
      <header className="flex shrink-0 items-start justify-between gap-3 border-b p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            <BsQrCode />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight text-icon-color">
              {attendanceQRCodeDatLanguage.title(lang)}
            </h2>
            <p className="text-xs text-icon-color/60">
              {attendanceQRCodeDatLanguage.description(lang)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label={attendanceSessionDataLanguage.close(lang)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-icon-color transition hover:bg-background-color"
        >
          <IoCloseOutline />
        </button>
      </header>

      {createRow.isPending && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "3px", borderRadius: 0 }}
        />
      )}

      {/* BODY */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
        {attendanceTables.data && attendanceTables.data.length > 0 && (
          <section>
            <SectionHeading title={attendanceSessionDataLanguage.table(lang)} />
            <TablePills
              tables={attendanceTables.data}
              selectedId={selectTable?.id}
              onSelect={(table) =>
                setSelectTable(
                  attendanceTables.data?.find((t) => t.id === table.id) ?? null,
                )
              }
            />
            {selectTable?.description && (
              <p className="mt-2 line-clamp-2 text-xs text-icon-color/60">
                {selectTable.description}
              </p>
            )}
          </section>
        )}

        <section>
          <SectionHeading
            title={attendanceSessionDataLanguage.classTime(lang)}
          />
          <ClassTimeFields
            language={lang}
            startDate={attendanceData.startDate}
            endDate={attendanceData.endDate}
            onStartChange={(value) =>
              setAttendanceData((prev) =>
                withScanWindow(
                  value === ""
                    ? { ...prev, startDate: "", endDate: "" }
                    : { ...prev, startDate: value, endDate: addOneHour(value) },
                ),
              )
            }
            onEndChange={(value) =>
              setAttendanceData((prev) =>
                withScanWindow({ ...prev, endDate: value }),
              )
            }
          />
        </section>

        <section className="border-t pt-6">
          <SectionHeading
            title={attendanceSessionDataLanguage.scanWindow(lang)}
            description={attendanceSessionDataLanguage.scanWindowHint(lang)}
          />
          <ScanSettingsFields
            language={lang}
            allowScanAt={attendanceData.allowScanAt}
            expireAt={attendanceData.expireAt}
            isAllowScanManyTime={attendanceData.isAllowScanManyTime}
            onAllowScanAtChange={(value) => {
              setScanWindowTouched(true);
              setAttendanceData((prev) => ({ ...prev, allowScanAt: value }));
            }}
            onExpireAtChange={(value) => {
              setScanWindowTouched(true);
              setAttendanceData((prev) => ({ ...prev, expireAt: value }));
            }}
            onAllowScanManyTimeChange={(value) =>
              setAttendanceData((prev) => ({
                ...prev,
                isAllowScanManyTime: value,
              }))
            }
          />
        </section>

        <div className="flex items-start gap-2 rounded-xl bg-primary-color/5 p-3 text-xs text-icon-color/80">
          <IoInformationCircleOutline className="mt-0.5 shrink-0 text-base text-primary-color" />
          <p>{attendanceSessionDataLanguage.qrInfo(lang)}</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex shrink-0 items-center justify-end gap-2 border-t p-3 md:px-6">
        <button
          type="button"
          onClick={handleClose}
          className="h-10 rounded-lg px-4 text-sm font-semibold text-icon-color transition hover:bg-background-color"
        >
          {attendanceSessionDataLanguage.cancel(lang)}
        </button>
        <button
          type="submit"
          disabled={createRow.isPending}
          className="flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60"
        >
          {createRow.isPending ? (
            <LoadingSpinner />
          ) : (
            <>
              <BsQrCode />
              {attendanceSessionDataLanguage.createQRCode(lang)}
            </>
          )}
        </button>
      </footer>
    </form>
  );
}

export default AttendanceQRcode;
