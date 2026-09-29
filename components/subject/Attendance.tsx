import html2canvas from "html2canvas";
import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { useEffect, useState } from "react";
import { BsQrCode } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineSpeakerNotes } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import {
  TbAdjustmentsHorizontal,
  TbCalendarStats,
  TbChevronDown,
  TbPhotoDown,
  TbPlus,
  TbSum,
  TbTable,
} from "react-icons/tb";
import { defaultBlurHash } from "../../data";
import {
  attendanceLanguageData,
  attendanceOverviewData,
} from "../../data/languages";
import useClickOutside from "../../hook/useClickOutside";
import {
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  Attendance as AttendanceType,
  Language,
  PartialExcept,
  StudentOnSubject,
} from "../../interfaces";
import {
  useGetAttendanceRowByTableId,
  useGetAttendancesTable,
  useGetLanguage,
  useGetStudentOnSubject,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import AttendanceChecker from "./AttendanceChecker";
import AttendanceDowload from "./AttendanceDowload";
import AttendanceTableCreate from "./AttendanceTableCreate";
import AttendanceTableSetting from "./AttendanceTableSetting";
import AttendanceView from "./AttendanceView";
import GradeSegmentedControl, {
  SECONDARY_BUTTON,
} from "./grade/GradeSegmentedControl";

type AttendanceViewMode = "attendances" | "summary";

type TableWithStatus = AttendanceTable & {
  statusLists: AttendanceStatusList[];
};

export type SelectAttendance = PartialExcept<
  AttendanceType,
  "attendanceRowId"
> & {
  student: StudentOnSubject;
};

// Same widths as the Grade page so the two tabs line up.
const PAGE_WIDTH =
  "mx-auto w-full md:max-w-screen-md lg:max-w-screen-lg 2xl:max-w-screen-2xl";

function Attendance({
  subjectId,
  toast,
}: {
  subjectId: string;
  toast: React.RefObject<Toast>;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [triggerCreateAttendanceTable, setTriggerCreateAttendanceTable] =
    React.useState(false);
  const [triggerSetting, setTriggerSetting] = React.useState(false);
  const tables = useGetAttendancesTable({
    subjectId,
  });
  const [triggerAttendanceDowload, setTriggerAttendanceDowload] =
    useState(false);
  const [selectAttendance, setSelectAttendance] =
    React.useState<SelectAttendance | null>(null);
  const [selectTable, setSelectTable] = React.useState<TableWithStatus | null>(
    null,
  );
  const [selectRow, setSelectRow] = React.useState<
    (AttendanceRow & { attendances: AttendanceType[] }) | null
  >(null);
  const [view, setView] = React.useState<AttendanceViewMode>("attendances");
  const [search, setSearch] = React.useState("");
  const saveImageRef = React.useRef<(() => Promise<void>) | null>(null);
  const [isSavingImage, setIsSavingImage] = React.useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(exportMenuRef, () => {
    setIsExportMenuOpen(false);
  });

  const handleSaveImage = async () => {
    if (!saveImageRef.current || isSavingImage) return;
    setIsSavingImage(true);
    try {
      await saveImageRef.current();
    } finally {
      setIsSavingImage(false);
    }
  };

  useEffect(() => {
    if (!selectTable && tables.data) {
      setSelectTable(tables.data?.[0]);
    } else if (selectTable && tables.data) {
      const findTable = tables.data.find((t) => t.id === selectTable.id);
      if (!findTable) return;
      setSelectTable(findTable);
    }
  }, [tables.data]);

  return (
    <>
      {selectAttendance && selectTable && (
        <PopupLayout onClose={() => setSelectAttendance(null)}>
          <AttendanceView
            toast={toast}
            selectAttendance={selectAttendance}
            attendanceTable={selectTable}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectAttendance(null);
            }}
          />
        </PopupLayout>
      )}

      {selectRow && (
        <PopupLayout onClose={() => setSelectRow(null)}>
          <AttendanceChecker
            subjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectRow(null);
            }}
            selectAttendanceRow={selectRow}
            toast={toast}
          />
        </PopupLayout>
      )}
      {triggerAttendanceDowload && (
        <PopupLayout onClose={() => setTriggerAttendanceDowload(false)}>
          <AttendanceDowload
            toast={toast}
            subjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerAttendanceDowload(false);
            }}
          />
        </PopupLayout>
      )}

      {triggerCreateAttendanceTable && (
        <PopupLayout onClose={() => setTriggerCreateAttendanceTable(false)}>
          <AttendanceTableCreate
            toast={toast}
            subjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateAttendanceTable(false);
            }}
          />
        </PopupLayout>
      )}

      {/* HEADER — mirrors Grade.tsx */}
      <header
        className={`${PAGE_WIDTH} flex flex-col justify-between gap-4 p-3 md:px-5 lg:flex-row lg:items-end`}
      >
        <section className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold text-icon-color md:text-3xl">
            {attendanceLanguageData.title(lang)}
          </h1>
          <span className="text-sm text-gray-400 md:text-base">
            {attendanceLanguageData.description(lang)}
          </span>
        </section>
        <section className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          {!triggerSetting && (
            <GradeSegmentedControl
              value={view}
              onChange={setView}
              options={[
                {
                  value: "attendances",
                  label: attendanceLanguageData.attendance_data(lang),
                  icon: <TbCalendarStats />,
                },
                {
                  value: "summary",
                  label: attendanceLanguageData.attendance_summary(lang),
                  icon: <TbSum />,
                },
              ]}
            />
          )}
          <button
            type="button"
            onClick={() => setTriggerSetting((prev) => !prev)}
            disabled={!selectTable}
            aria-pressed={triggerSetting}
            className={`${SECONDARY_BUTTON} ${
              triggerSetting
                ? "border-primary-color bg-primary-color/10 text-primary-color hover:bg-primary-color/10"
                : ""
            }`}
          >
            {triggerSetting ? <TbTable /> : <TbAdjustmentsHorizontal />}
            {triggerSetting
              ? attendanceLanguageData.view(lang)
              : attendanceLanguageData.edit(lang)}
          </button>
          <div ref={exportMenuRef} className="relative">
            <button
              type="button"
              disabled={isSavingImage}
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              aria-expanded={isExportMenuOpen}
              className={`${SECONDARY_BUTTON} min-w-28`}
            >
              {isSavingImage ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SiMicrosoftexcel />
                  {attendanceLanguageData.export(lang)}
                  <TbChevronDown
                    className={`transition-transform ${isExportMenuOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    setTriggerAttendanceDowload(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-icon-color transition-colors hover:bg-background-color"
                >
                  <SiMicrosoftexcel className="text-success-color" />
                  {attendanceLanguageData.export_excel(lang)}
                </button>
                <button
                  type="button"
                  disabled={triggerSetting || !selectTable}
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleSaveImage();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-icon-color transition-colors hover:bg-background-color disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <TbPhotoDown className="text-primary-color" />
                  {attendanceLanguageData.save_image(lang)}
                </button>
              </div>
            )}
          </div>
        </section>
      </header>

      {/* TABLE TABS + TOOLBAR */}
      <div className={`${PAGE_WIDTH} flex flex-col gap-3 px-3 md:px-0`}>
        {tables.isLoading ? (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-32 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : tables.data && tables.data.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tables.data.map((table) => {
              const active = table.id === selectTable?.id;
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setSelectTable(table)}
                  aria-pressed={active}
                  className={`shrink-0 whitespace-nowrap rounded-xl border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-primary-color bg-primary-color text-white"
                      : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
                  }`}
                >
                  {table.title}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setTriggerCreateAttendanceTable(true)}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-dashed border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-500 transition-colors hover:border-primary-color hover:text-primary-color"
            >
              <TbPlus />
              {attendanceLanguageData.create(lang)}
            </button>
          </div>
        ) : (
          <EmptyState
            title={attendanceOverviewData.noTables(lang)}
            hint={attendanceOverviewData.noTablesHint(lang)}
            action={
              <button
                type="button"
                onClick={() => setTriggerCreateAttendanceTable(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover"
              >
                <TbPlus />
                {attendanceLanguageData.create(lang)}
              </button>
            }
          />
        )}

        {selectTable && !triggerSetting && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              {selectTable.description && (
                <p className="line-clamp-1 text-sm text-gray-500">
                  {selectTable.description}
                </p>
              )}
              {selectTable.statusLists.length > 0 && (
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {selectTable.statusLists.map((status) => (
                    <li
                      key={status.id}
                      className="flex items-center gap-1.5 text-xs text-icon-color"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: status.color }}
                      />
                      {status.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="relative w-full shrink-0 md:w-64">
              <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={attendanceOverviewData.searchStudent(lang)}
                className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-icon-color outline-none transition placeholder:text-gray-400 focus:border-primary-color focus:ring-2 focus:ring-primary-color/20"
              />
            </label>
          </div>
        )}
      </div>

      <main className={`${PAGE_WIDTH} mt-3 flex flex-col px-3 pb-10 md:px-0`}>
        {triggerSetting && selectTable ? (
          <div className="w-full">
            <AttendanceTableSetting
              table={selectTable}
              toast={toast}
              onDelete={() => setSelectTable(null)}
            />
          </div>
        ) : (
          selectTable && (
            <DisplayAttendanceTable
              selectTable={selectTable}
              statusLists={selectTable.statusLists}
              view={view}
              search={search}
              language={lang}
              setSelectRow={setSelectRow}
              setSelectAttendance={setSelectAttendance}
              toast={toast}
              saveImageRef={saveImageRef}
            />
          )
        )}
      </main>
    </>
  );
}

export default Attendance;

/* ---------- helpers ---------- */

// rgba() rather than 8-digit hex so html2canvas (Save as Image) renders it.
const tint = (color: string | undefined, alpha: number) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(color ?? "");
  if (!match) return `rgba(148, 163, 184, ${alpha})`;
  const n = parseInt(match[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Opaque equivalent of bg-primary-color/5 over white — matches GradeTable.
const TINT = "bg-[#F4F8FD]";
const HEAD =
  "border-b border-r border-gray-100 bg-background-color p-0 text-left align-bottom font-normal";

const EmptyState: React.FC<{
  title: string;
  hint?: string;
  action?: React.ReactNode;
}> = ({ title, hint, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
      <TbCalendarStats />
    </span>
    <h4 className="text-sm font-semibold text-icon-color">{title}</h4>
    {hint && <p className="mt-1 max-w-sm text-xs text-gray-500">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

type Props = {
  selectTable: TableWithStatus;
  statusLists: AttendanceStatusList[];
  view: AttendanceViewMode;
  search: string;
  language: Language;
  setSelectRow: React.Dispatch<
    React.SetStateAction<
      (AttendanceRow & { attendances: AttendanceType[] }) | null
    >
  >;
  setSelectAttendance: React.Dispatch<
    React.SetStateAction<SelectAttendance | null>
  >;
  toast: React.RefObject<Toast>;
  saveImageRef: React.MutableRefObject<(() => Promise<void>) | null>;
};
function DisplayAttendanceTable({
  selectTable,
  statusLists,
  view,
  search,
  language,
  setSelectRow,
  setSelectAttendance,
  toast,
  saveImageRef,
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const tableRef = React.useRef<HTMLTableElement | null>(null);
  const rows = useGetAttendanceRowByTableId({
    attendanceTableId: selectTable.id,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: selectTable.subjectId,
  });
  const locale = language === "th" ? "th-TH" : "en-GB";

  const sortedRows = React.useMemo(
    () =>
      [...(rows.data ?? [])].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [rows.data],
  );

  const students = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return (studentOnSubjects.data ?? [])
      .filter((s) => s.isActive)
      .filter(
        (s) =>
          !query ||
          `${s.number} ${s.firstName} ${s.lastName}`
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) => Number(a.number) - Number(b.number));
  }, [studentOnSubjects.data, search]);

  // Latest session first in view: jump to the right edge once data arrives.
  useEffect(() => {
    if (rows.isSuccess && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [rows.isSuccess, view]);

  const handleSaveImage = async () => {
    if (!tableRef.current || !scrollRef.current || rows.isLoading) return;
    const scrollContainer = scrollRef.current;
    const previousScrollLeft = scrollContainer.scrollLeft;
    const previousScrollTop = scrollContainer.scrollTop;
    try {
      // sticky header/name column render offset unless the container sits at 0,0
      scrollContainer.scrollLeft = 0;
      scrollContainer.scrollTop = 0;

      const images = Array.from(tableRef.current.getElementsByTagName("img"));
      // photos below the scroll fold are loading="lazy" and never start
      // loading on their own — flip them to eager so the wait can finish
      images.forEach((img) => {
        if (img.loading === "lazy") img.loading = "eager";
      });
      await Promise.race([
        Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }),
        ),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);

      const liveTable = tableRef.current;
      const liveHeaderCells = Array.from(
        liveTable.querySelectorAll("thead th"),
      );
      const canvas = await html2canvas(liveTable, {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
        onclone: (clonedDocument, clonedTable) => {
          // Tailwind preflight's `img { display: block }` makes html2canvas
          // draw text lower than the browser does, and `truncate` then clips
          // it — relax both in the clone only.
          const style = clonedDocument.createElement("style");
          style.textContent =
            "img { display: inline-block !important; } .truncate { overflow: visible !important; } thead th > button, thead th > div { padding-bottom: 1rem !important; }";
          clonedDocument.head.appendChild(style);
          const clonedContainer = clonedTable.parentElement;
          if (clonedContainer) {
            clonedContainer.style.overflow = "visible";
            clonedContainer.style.height = "auto";
            clonedContainer.style.width = "max-content";
          }
          // html2canvas shifts sticky cells; scroll is reset to 0 so static
          // positioning puts them in the same place without the offset bug
          clonedTable
            .querySelectorAll<HTMLElement>(".sticky")
            .forEach((el) => (el.style.position = "static"));
          // pin column widths so the clone's layout matches the live table
          clonedTable.style.tableLayout = "fixed";
          clonedTable.style.width = `${liveTable.scrollWidth}px`;
          clonedTable
            .querySelectorAll<HTMLElement>("thead th")
            .forEach((cell, index) => {
              const liveCell = liveHeaderCells[index];
              if (!liveCell) return;
              const width = `${liveCell.getBoundingClientRect().width}px`;
              cell.style.width = width;
              cell.style.minWidth = width;
              cell.style.maxWidth = width;
            });
        },
      });

      const suffix = view === "attendances" ? "attendance" : "summary";
      const fileName = `${selectTable.title.replace(/[\\/:*?"<>|]/g, "-")}-${suffix}.png`;
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error("Error saving attendance image:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save the table as an image",
      });
    } finally {
      scrollContainer.scrollLeft = previousScrollLeft;
      scrollContainer.scrollTop = previousScrollTop;
    }
  };

  useEffect(() => {
    saveImageRef.current = handleSaveImage;
    return () => {
      saveImageRef.current = null;
    };
  });

  const loading = rows.isLoading || studentOnSubjects.isLoading;

  if (!loading && sortedRows.length === 0) {
    return (
      <EmptyState
        title={attendanceOverviewData.noSessions(language)}
        hint={attendanceOverviewData.noSessionsHint(language)}
      />
    );
  }

  const today = new Date();

  return (
    <div
      ref={scrollRef}
      className="relative h-[30rem] w-full overflow-auto rounded-2xl border border-gray-200 bg-white 2xl:h-[40rem]"
    >
      <table
        ref={tableRef}
        className="min-w-full border-separate border-spacing-0"
      >
        <thead className="sticky top-0 z-30">
          <tr>
            <th
              className={`sticky left-0 z-40 ${HEAD} px-1.5 py-1.5 align-middle text-[11px] font-medium text-gray-500 md:px-3 md:py-2 md:text-xs`}
            >
              <div className="flex w-[5.25rem] flex-col items-start md:w-72 md:flex-row md:items-center md:justify-between md:gap-2">
                <span>{attendanceOverviewData.student(language)}</span>
                {!loading && (
                  <span className="font-normal text-gray-400">
                    {attendanceOverviewData.sessions(sortedRows.length)(
                      language,
                    )}
                  </span>
                )}
              </div>
            </th>
            {loading
              ? [...Array(6)].map((_, index) => (
                  <th key={index} className={HEAD}>
                    <div className="m-1.5 h-9 w-11 animate-pulse rounded-xl bg-gray-100 md:m-2 md:w-28" />
                  </th>
                ))
              : view === "attendances"
                ? sortedRows.map((row) => {
                    const start = new Date(row.startDate);
                    const isToday = isSameDay(start, today);
                    return (
                      <th key={row.id} className={HEAD}>
                        <button
                          type="button"
                          onClick={() => setSelectRow(row)}
                          title={attendanceOverviewData.openSession(language)}
                          className="flex w-14 flex-col items-start gap-0.5 px-1.5 py-1.5 text-left transition-colors hover:bg-gray-100 md:w-32 md:px-3 md:py-2"
                        >
                          <span
                            className={`flex w-full items-center gap-1 text-[10px] md:text-[11px] ${
                              isToday
                                ? "font-semibold text-primary-color"
                                : "text-gray-500"
                            }`}
                          >
                            {isToday
                              ? attendanceOverviewData.today(language)
                              : start.toLocaleDateString(locale, {
                                  weekday: "short",
                                })}
                            <span className="ml-auto flex items-center gap-1 text-gray-400">
                              {row.note && (
                                <MdOutlineSpeakerNotes
                                  title={attendanceOverviewData.hasNote(
                                    language,
                                  )}
                                />
                              )}
                              {row.type === "SCAN" && (
                                <BsQrCode
                                  title={attendanceOverviewData.scanSession(
                                    language,
                                  )}
                                />
                              )}
                            </span>
                          </span>
                          <span
                            className={`whitespace-nowrap text-[11px] font-semibold md:text-xs ${
                              isToday ? "text-primary-color" : "text-icon-color"
                            }`}
                          >
                            {start.toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                              year:
                                start.getFullYear() === today.getFullYear()
                                  ? undefined
                                  : "numeric",
                            })}
                          </span>
                          <span className="text-[10px] tabular-nums text-gray-500 md:text-[11px]">
                            {start.toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      </th>
                    );
                  })
                : statusLists.map((status) => (
                    <th key={status.id} className={HEAD}>
                      <div className="flex w-14 flex-col items-start gap-0.5 px-1.5 py-1.5 md:w-28 md:px-3 md:py-2">
                        <span className="flex w-full items-center gap-1 text-[11px] font-semibold text-icon-color md:gap-1.5 md:text-xs">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: status.color }}
                          />
                          <span className="truncate" title={status.title}>
                            {status.title}
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-500 md:text-[11px]">
                          {attendanceOverviewData.total(language)}
                        </span>
                      </div>
                    </th>
                  ))}
            {!loading && view === "summary" && (
              <th
                className={`z-30 border-b border-gray-100 px-1.5 py-1.5 text-left align-bottom font-normal md:px-3 md:py-2 lg:sticky lg:right-0 ${TINT}`}
              >
                <div className="flex w-16 flex-col gap-0.5 md:w-28">
                  <span className="text-[11px] font-semibold leading-tight text-icon-color md:text-xs">
                    {attendanceOverviewData.totalPresents(language)}
                  </span>
                  <span className="hidden text-[11px] text-gray-500 md:inline">
                    {attendanceOverviewData.totalPresentsHint(language)}
                  </span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(8)].map((_, row) => (
              <tr key={row}>
                {[...Array(7)].map((__, cell) => (
                  <td key={cell} className="border-b border-gray-100 p-2">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : students.length === 0 ? (
            <tr>
              <td
                colSpan={
                  1 +
                  (view === "attendances"
                    ? sortedRows.length
                    : statusLists.length + 1)
                }
                className="px-3 py-12 text-left text-sm text-gray-500 md:text-center"
              >
                {attendanceOverviewData.noMatch(language)}
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const attendances = sortedRows.flatMap((row) =>
                row.attendances.filter(
                  (a) => a.studentOnSubjectId === student.id,
                ),
              );
              const totalPresents = attendances.reduce(
                (sum, a) =>
                  sum +
                  (selectTable.statusLists.find((s) => s.title === a.status)
                    ?.value ?? 0),
                0,
              );

              return (
                <tr key={student.id} className="group">
                  <StudentCell student={student} language={language} />
                  {view === "attendances"
                    ? sortedRows.map((row) => {
                        const attendance = row.attendances.find(
                          (a) => a.studentOnSubjectId === student.id,
                        );
                        return (
                          <td
                            key={row.id}
                            className="border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color"
                          >
                            <StatusCell
                              attendance={attendance}
                              status={selectTable.statusLists.find(
                                (s) => s.title === attendance?.status,
                              )}
                              language={language}
                              onClick={() =>
                                setSelectAttendance(
                                  attendance
                                    ? { ...attendance, student }
                                    : { attendanceRowId: row.id, student },
                                )
                              }
                            />
                          </td>
                        );
                      })
                    : statusLists.map((status) => {
                        const total = attendances.filter(
                          (a) => a.status === status.title,
                        ).length;
                        return (
                          <td
                            key={status.id}
                            className="border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color"
                          >
                            <div
                              className={`flex h-11 items-center justify-center text-xs tabular-nums md:h-14 md:text-sm ${
                                total === 0
                                  ? "text-gray-300"
                                  : "font-semibold text-icon-color"
                              }`}
                            >
                              {total}
                            </div>
                          </td>
                        );
                      })}
                  {view === "summary" && (
                    <td
                      className={`z-20 border-b border-gray-100 p-0 lg:sticky lg:right-0 ${TINT}`}
                    >
                      <div className="flex h-11 items-center justify-center text-xs font-semibold tabular-nums text-primary-color md:h-14 md:text-sm">
                        {totalPresents}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const StudentCell: React.FC<{
  student: StudentOnSubject;
  language: Language;
}> = ({ student, language }) => (
  <td className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white p-0 group-hover:bg-background-color">
    <div
      className="flex h-11 w-24 items-center gap-3 px-1.5 md:h-14 md:w-72 md:px-3"
      title={`${student.firstName} ${student.lastName}`}
    >
      <div className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 md:block">
        <Image
          src={student.photo}
          alt={student.firstName}
          fill
          sizes="36px"
          placeholder="blur"
          blurDataURL={decodeBlurhashToCanvas(
            student.blurHash ?? defaultBlurHash,
          )}
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-icon-color md:text-sm">
          {student.firstName} {student.lastName}
        </p>
        <p className="text-[11px] text-gray-500 md:text-xs">
          {attendanceOverviewData.number(language)} {student.number}
        </p>
      </div>
    </div>
  </td>
);

const StatusCell: React.FC<{
  attendance?: AttendanceType;
  status?: AttendanceStatusList;
  language: Language;
  onClick: () => void;
}> = ({ attendance, status, language, onClick }) => {
  const recorded =
    attendance && attendance.status && attendance.status !== "UNKNOW";
  if (!recorded) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={attendanceOverviewData.notRecorded(language)}
        className="relative flex h-11 w-full items-center justify-center text-sm text-gray-300 transition hover:bg-gray-100 hover:text-primary-color md:h-14"
      >
        {attendance?.note && <NoteDot />}—
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={attendance.note || attendance.status}
      className="relative flex h-11 w-full items-center justify-center px-1 transition hover:shadow-[inset_0_0_0_2px_rgba(44,124,209,0.35)] md:h-14 md:px-2"
      style={{ backgroundColor: tint(status?.color, 0.16) }}
    >
      {attendance.note && <NoteDot />}
      <span className="flex max-w-full items-center gap-1.5 text-[11px] font-semibold text-icon-color md:text-xs">
        <span
          className="hidden h-2 w-2 shrink-0 rounded-full md:block"
          style={{ background: status?.color ?? "#94a3b8" }}
        />
        <span className="truncate">{attendance.status}</span>
      </span>
    </button>
  );
};

const NoteDot = () => (
  <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] text-icon-color shadow-sm md:right-1.5 md:top-1.5 md:h-4 md:w-4 md:text-[10px]">
    <MdOutlineSpeakerNotes />
  </span>
);
