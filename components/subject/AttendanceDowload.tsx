import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { SiMicrosoftexcel } from "react-icons/si";
import { TbCalendarEvent, TbDownload, TbPhotoDown } from "react-icons/tb";
import { attendanceExportData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { ExportAttendanceService } from "../../services";
import { downloadDataUri } from "../../utils";
import {
  DATE_PRESETS,
  DateBounds,
  DatePreset,
  presetRange,
  toDateBounds,
} from "../../utils/attendanceDateRange";
import LoadingSpinner from "../common/LoadingSpinner";
import GradeSegmentedControl from "./grade/GradeSegmentedControl";

export type AttendanceExportFormat = "excel" | "image";
export type SaveImageResult = "saved" | "empty" | "failed";

type Props = {
  subjectId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
  initialFormat: AttendanceExportFormat;
  /** What the image will contain; undefined when no table is on screen. */
  imageTarget?: { tableTitle: string; summary: boolean };
  onSaveImage: (bounds: DateBounds) => Promise<SaveImageResult>;
};

const INPUT =
  "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-icon-color outline-none transition focus:border-primary-color focus:ring-2 focus:ring-primary-color/20";
const LABEL = "text-xs font-medium text-icon-color/70";

function AttendanceDowload({
  subjectId,
  toast,
  onClose,
  initialFormat,
  imageTarget,
  onSaveImage,
}: Props) {
  const { data: language = "en" } = useGetLanguage();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<AttendanceExportFormat>(
    imageTarget ? initialFormat : "excel",
  );
  const [preset, setPreset] = useState<DatePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const selectPreset = (next: DatePreset) => {
    setPreset(next);
    const range = presetRange(next);
    setFromDate(range.from);
    setToDate(range.to);
  };

  const showError = (detail: string) =>
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail,
      life: 3000,
    });

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const bounds = toDateBounds(fromDate, toDate);
    setLoading(true);
    try {
      if (format === "image") {
        const result = await onSaveImage(bounds);
        if (result === "empty") {
          toast.current?.show({
            severity: "warn",
            summary: attendanceExportData.noSessionsInRange(language),
            life: 3000,
          });
        } else if (result === "failed") {
          showError(attendanceExportData.imageFailed(language));
        } else {
          onClose();
        }
        return;
      }
      const response = await ExportAttendanceService({
        subjectId,
        ...(bounds.start && { startDate: bounds.start.toISOString() }),
        ...(bounds.end && { endDate: bounds.end.toISOString() }),
      });
      downloadDataUri(response, "attendance.xlsx");
      onClose();
    } catch (error) {
      console.error("Failed to download the file", error);
      showError(attendanceExportData.excelFailed(language));
    } finally {
      setLoading(false);
    }
  };

  const locale = language === "th" ? "th-TH" : "en-GB";
  const bounds = toDateBounds(fromDate, toDate);
  const formatDay = (date: Date) =>
    date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <form
      onSubmit={handleDownload}
      className="flex w-[95vw] max-w-md flex-col overflow-hidden rounded-2xl bg-white font-Anuphan text-icon-color"
    >
      <header className="flex items-start justify-between gap-3 border-b p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color">
            <TbDownload />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight">
              {attendanceExportData.title(language)}
            </h2>
            <p className="text-xs text-icon-color/60">
              {attendanceExportData.description(language)}
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

      {loading && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "3px", borderRadius: 0 }}
        />
      )}

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <section className="flex flex-col gap-2">
          <span className={LABEL}>{attendanceExportData.format(language)}</span>
          {imageTarget ? (
            <div className="w-max">
              <GradeSegmentedControl
                value={format}
                onChange={setFormat}
                options={[
                  {
                    value: "excel",
                    label: attendanceExportData.excel(language),
                    icon: <SiMicrosoftexcel />,
                  },
                  {
                    value: "image",
                    label: attendanceExportData.image(language),
                    icon: <TbPhotoDown />,
                  },
                ]}
              />
            </div>
          ) : (
            <div className="flex w-max items-center gap-1.5 rounded-xl bg-primary-color px-3 py-1 text-sm font-semibold text-white">
              <SiMicrosoftexcel />
              {attendanceExportData.excel(language)}
            </div>
          )}
          <p className="text-xs text-gray-500">
            {format === "image" && imageTarget
              ? attendanceExportData.imageHint(
                  imageTarget.tableTitle,
                  imageTarget.summary,
                )(language)
              : attendanceExportData.excelHint(language)}
            {!imageTarget &&
              ` ${attendanceExportData.imageUnavailable(language)}`}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <span className={LABEL}>
            {attendanceExportData.dateRange(language)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((option) => {
              const active = option === preset;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectPreset(option)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-primary-color bg-primary-color/10 text-primary-color"
                      : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
                  }`}
                >
                  {attendanceExportData.presets[option](language)}
                </button>
              );
            })}
          </div>

          {preset === "custom" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className={LABEL}>
                  {attendanceExportData.startDate(language)}
                </span>
                <input
                  required
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={INPUT}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>
                  {attendanceExportData.endDate(language)}
                </span>
                <input
                  required
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                  className={INPUT}
                />
              </label>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-xl bg-background-color px-3 py-2 text-sm">
              <TbCalendarEvent className="shrink-0 text-primary-color" />
              {bounds.start && bounds.end
                ? `${formatDay(bounds.start)} – ${formatDay(bounds.end)}`
                : attendanceExportData.allDates(language)}
            </p>
          )}
        </section>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t p-3 md:px-6">
        <button
          type="button"
          onClick={() => onClose()}
          className="h-10 rounded-lg px-4 text-sm font-semibold transition hover:bg-background-color"
        >
          {attendanceExportData.cancel(language)}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <TbDownload />
              {attendanceExportData.download(language)}
            </>
          )}
        </button>
      </footer>
    </form>
  );
}

export default AttendanceDowload;
