import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { defaultBlurHash } from "../../data";
import {
  Attendance,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
  Language,
  StudentOnSubject,
} from "../../interfaces";
import {
  useCreateAttendanceRow,
  useDeleteRowAttendance,
  useGetAttendancesTable,
  useGetLanguage,
  useGetStudentOnSubject,
  useUpdateManyAttendance,
  useUpdateRowAttendance,
} from "../../react-query";
import {
  convertToDateTimeLocalString,
  decodeBlurhashToCanvas,
} from "../../utils";

import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { BsQrCode } from "react-icons/bs";
import {
  IoCloseOutline,
  IoSearchOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  LuCalendarClock,
  LuCheck,
  LuStickyNote,
  LuUsers,
} from "react-icons/lu";
import Swal from "sweetalert2";
import {
  attendanceCheckerDataLanugae,
  attendanceSessionDataLanguage,
} from "../../data/languages";
import LoadingSpinner from "../common/LoadingSpinner";
import TextEditor from "../common/TextEditor";
import {
  addOneHour,
  ClassTimeFields,
  ScanSettingsFields,
  SectionHeading,
  TablePills,
} from "./AttendanceSessionFields";
import QRCode from "./QRCode";

type Props = {
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
  selectAttendanceRow?: AttendanceRow & { attendances: Attendance[] };
};

type StudentAttendance = StudentOnSubject & { status?: string; note?: string };

// Status colors are picked by teachers, so choose a text color that stays
// readable on top of whatever they chose.
const readableTextOn = (color: string) => {
  const match = /^#?([0-9a-f]{6})/i.exec(color);
  if (!match) return "#FFFFFF";
  const n = parseInt(match[1], 16);
  const luminance =
    0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luminance > 170 ? "#383767" : "#FFFFFF";
};

const hasText = (html: string) => html.replace(/<[^>]*>/g, "").trim() !== "";

function AttendanceChecker({
  subjectId,
  onClose,
  toast,
  selectAttendanceRow,
}: Props) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const [qrCodeURL, setQrCodeURL] = useState<string | null>(null);
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [loading, setLoading] = React.useState(false);
  const createAttendanceRow = useCreateAttendanceRow();
  const updateAttendance = useUpdateManyAttendance();
  const updateAttendanceRow = useUpdateRowAttendance();
  const [tab, setTab] = React.useState<"students" | "note">("students");
  const [search, setSearch] = React.useState("");
  const removeRow = useDeleteRowAttendance();
  const [attendanceData, setAttendanceData] = React.useState<{
    startDate?: string | undefined;
    endDate?: string | undefined;
    note: string;
    expireAt?: string | undefined;
    allowScanAt?: string | undefined;
    isAllowScanManyTime?: boolean;
  }>({
    note: "",
  });
  const [studentAttendances, setStudentAttendances] = React.useState<
    | (StudentOnSubject & {
        status?: string | "UNKNOW";
        note?: string;
      })[]
    | null
  >(null);
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const attendanceTables = useGetAttendancesTable({
    subjectId: subjectId,
  });

  useEffect(() => {
    if (attendanceTables.data) {
      // When editing, show the statuses of the table this row belongs to.
      setSelectTable(
        attendanceTables.data.find(
          (table) => table.id === selectAttendanceRow?.attendanceTableId,
        ) ?? attendanceTables.data[0],
      );
    }
  }, [attendanceTables.data]);

  useEffect(() => {
    if (studentOnSubjects.data && selectAttendanceRow) {
      setAttendanceData((prev) => {
        return {
          ...prev,
          note: selectAttendanceRow.note ?? "",
          isAllowScanManyTime: selectAttendanceRow.isAllowScanManyTime,
          allowScanAt:
            selectAttendanceRow.allowScanAt &&
            convertToDateTimeLocalString(
              new Date(selectAttendanceRow.allowScanAt),
            ),
          startDate:
            selectAttendanceRow.startDate &&
            convertToDateTimeLocalString(
              new Date(selectAttendanceRow.startDate),
            ),
          endDate:
            selectAttendanceRow.endDate &&
            convertToDateTimeLocalString(new Date(selectAttendanceRow.endDate)),
          expireAt:
            selectAttendanceRow.expireAt &&
            convertToDateTimeLocalString(
              new Date(selectAttendanceRow.expireAt),
            ),
        };
      });
      setStudentAttendances(
        studentOnSubjects.data.map((studentOnSubject) => {
          const attendance = selectAttendanceRow.attendances.find(
            (a) => a.studentOnSubjectId === studentOnSubject.id,
          );
          return {
            ...studentOnSubject,
            status: attendance?.status,
            note: attendance?.note,
          };
        }),
      );
    } else if (studentOnSubjects.data) {
      setStudentAttendances(
        studentOnSubjects.data.map((studentOnSubject) => ({
          ...studentOnSubject,
          status: "UNKNOW",
          note: "",
        })),
      );
    }
  }, [studentOnSubjects.data]);

  const handleCheck = React.useCallback(
    ({ studentId, key }: { studentId: string; key: string }) => {
      setStudentAttendances((prev) => {
        if (!prev) return null;
        return prev?.map((studentOnSubject) =>
          studentOnSubject.id === studentId
            ? {
                ...studentOnSubject,
                status: studentOnSubject.status === key ? "UNKNOW" : key,
              }
            : studentOnSubject,
        );
      });
    },
    [],
  );

  const handleCheckAll = ({ key }: { key: string }) => {
    setStudentAttendances((prev) => {
      if (!prev) return null;
      return prev.map((studentOnSubject) => {
        return {
          ...studentOnSubject,
          status: key,
        };
      });
    });
  };

  const handleNoteChange = React.useCallback(
    ({ studentId, note }: { studentId: string; note: string }) => {
      setStudentAttendances((prev) => {
        if (!prev) return null;
        return prev?.map((studentOnSubject) =>
          studentOnSubject.id === studentId
            ? { ...studentOnSubject, note }
            : studentOnSubject,
        );
      });
    },
    [],
  );

  const handleSummitForm = async () => {
    try {
      if (!studentAttendances) {
        throw new Error("No studentOnSubject found");
      }
      if (selectAttendanceRow) {
        if (!attendanceData.startDate || !attendanceData.endDate) {
          throw new Error("Start Date and End Date is required");
        }
        setLoading(true);

        await updateAttendanceRow.mutateAsync({
          query: {
            attendanceRowId: selectAttendanceRow.id,
          },
          body: {
            startDate: new Date(attendanceData.startDate).toISOString(),
            endDate: new Date(attendanceData.endDate).toISOString(),
            note: attendanceData.note,
            expireAt:
              attendanceData.expireAt &&
              new Date(attendanceData.expireAt).toISOString(),
            allowScanAt:
              attendanceData.allowScanAt &&
              new Date(attendanceData.allowScanAt).toISOString(),
            isAllowScanManyTime:
              attendanceData.isAllowScanManyTime &&
              attendanceData.isAllowScanManyTime,
          },
        });

        const data = studentAttendances.map((studentOnSubject) => {
          const attendanceId = selectAttendanceRow.attendances.find(
            (a) => a.studentOnSubjectId === studentOnSubject.id,
          )?.id;
          if (!attendanceId) return null;
          return {
            query: {
              attendanceId: attendanceId,
            },
            body: {
              status: studentOnSubject.status,
              note: studentOnSubject.note,
            },
          };
        });
        const filterData = data.filter((d) => d !== null);
        await updateAttendance.mutateAsync({
          request: filterData,
        });
      } else {
        if (formRef.current?.reportValidity() === false) {
          return;
        }
        if (
          !attendanceData.startDate ||
          !attendanceData.endDate ||
          !selectTable
        ) {
          throw new Error("Start Date and End Date is required");
        }

        setLoading(true);

        const create = await createAttendanceRow.mutateAsync({
          request: {
            startDate: new Date(attendanceData.startDate).toISOString(),
            endDate: new Date(attendanceData.endDate).toISOString(),
            note: attendanceData.note,
            attendanceTableId: selectTable?.id,
            type: "NORMAL",
          },
        });

        const data = studentAttendances.map((studentOnSubject) => {
          const attendanceId = create.attendances.find(
            (a) => a.studentOnSubjectId === studentOnSubject.id,
          )?.id;
          if (!attendanceId) return null;
          return {
            query: {
              attendanceId: attendanceId,
            },
            body: {
              status: studentOnSubject.status,
              note: studentOnSubject.note,
            },
          };
        });
        const filterData = data.filter((d) => d !== null);
        await updateAttendance.mutateAsync({
          request: filterData,
        });
      }

      show();
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
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
      summary: selectAttendanceRow ? "Updated" : "Created",
      detail: selectAttendanceRow
        ? "Attendance has been updated"
        : "Attendance has been created",
    });
  };

  const handleDelete = async () => {
    try {
      if (!selectAttendanceRow) {
        return;
      }
      await removeRow.mutateAsync({
        attendanceRowId: selectAttendanceRow.id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Delete Success",
        detail: "Attendance Row has been deleted",
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

  const confirmDelete = async () => {
    const result = await Swal.fire({
      title: attendanceSessionDataLanguage.deleteConfirm(lang),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: attendanceSessionDataLanguage.delete(lang),
      cancelButtonText: attendanceSessionDataLanguage.cancel(lang),
      confirmButtonColor: "#F04438",
    });
    if (result.isConfirmed) {
      handleDelete();
    }
  };

  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  const visibleStatusLists = useMemo(
    () =>
      (selectTable?.statusLists ?? [])
        .filter((s) => !s.isHidden)
        .sort((a, b) =>
          b.title.localeCompare(a.title, undefined, { numeric: true }),
        ),
    [selectTable?.statusLists],
  );

  const sortedStudents = useMemo(
    () =>
      (studentAttendances ?? [])
        .filter((s) => s.isActive)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [studentAttendances],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedStudents;
    return sortedStudents.filter((s) =>
      `${s.number} ${s.firstName} ${s.lastName}`.toLowerCase().includes(query),
    );
  }, [sortedStudents, search]);

  const totalMarked = useMemo(
    () =>
      sortedStudents.filter((s) => s.status && s.status !== "UNKNOW").length,
    [sortedStudents],
  );

  const statusCounts = useMemo(
    () =>
      visibleStatusLists.map((status) => ({
        status,
        count: sortedStudents.filter((s) => s.status === status.title).length,
      })),
    [visibleStatusLists, sortedStudents],
  );

  const isLoadingList =
    studentOnSubjects.isLoading || attendanceTables.isLoading;

  if (qrCodeURL && selectAttendanceRow) {
    return (
      <QRCode
        url={qrCodeURL}
        expireAt={
          selectAttendanceRow.expireAt
            ? new Date(selectAttendanceRow.expireAt)
            : undefined
        }
        setTriggerQRCode={() => onClose()}
      />
    );
  }

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-white font-Anuphan text-icon-color md:h-[90vh] md:w-[94vw] md:max-w-6xl md:rounded-2xl">
      {/* HEADER */}
      <header className="flex shrink-0 items-start justify-between gap-3 border-b p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color sm:flex">
            <LuCalendarClock />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-icon-color">
              {selectAttendanceRow
                ? attendanceSessionDataLanguage.detailTitle(lang)
                : attendanceCheckerDataLanugae.title(lang)}
            </h2>
            <p className="line-clamp-1 text-xs text-icon-color/60">
              {selectAttendanceRow
                ? attendanceSessionDataLanguage.detailDescription(lang)
                : attendanceCheckerDataLanugae.description(lang)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {selectAttendanceRow?.type === "SCAN" && (
            <button
              type="button"
              onClick={() =>
                setQrCodeURL(
                  `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${selectAttendanceRow.id}`,
                )
              }
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-icon-color transition hover:border-primary-color hover:text-primary-color"
            >
              <BsQrCode />
              <span className="hidden sm:inline">
                {attendanceSessionDataLanguage.showQRCode(lang)}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label={attendanceSessionDataLanguage.close(lang)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-icon-color transition hover:bg-background-color"
          >
            <IoCloseOutline />
          </button>
        </div>
      </header>

      {/* BODY — phones scroll the whole body, desktop scrolls each column */}
      <div className="min-h-0 flex-1 overflow-y-auto md:flex md:overflow-hidden">
        {/* SESSION SETUP */}
        <aside className="flex flex-col gap-6 border-b p-4 md:w-80 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r md:p-5">
          {!selectAttendanceRow && (
            <section>
              <SectionHeading
                title={attendanceSessionDataLanguage.table(lang)}
              />
              {attendanceTables.data && attendanceTables.data.length > 0 && (
                <TablePills
                  tables={attendanceTables.data}
                  selectedId={selectTable?.id}
                  onSelect={(table) =>
                    setSelectTable(
                      attendanceTables.data?.find((t) => t.id === table.id) ??
                        null,
                    )
                  }
                />
              )}
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
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <ClassTimeFields
                language={lang}
                stackOnDesktop
                startDate={attendanceData.startDate}
                endDate={attendanceData.endDate}
                onStartChange={(value) =>
                  setAttendanceData((prev) => ({
                    ...prev,
                    startDate: value,
                    endDate: addOneHour(value),
                  }))
                }
                onEndChange={(value) =>
                  setAttendanceData((prev) => ({ ...prev, endDate: value }))
                }
              />
            </form>
          </section>

          {selectAttendanceRow?.type === "SCAN" && (
            <section>
              <SectionHeading
                icon={<BsQrCode />}
                title={attendanceSessionDataLanguage.qrSettings(lang)}
                description={attendanceSessionDataLanguage.scanWindowHint(lang)}
              />
              <ScanSettingsFields
                language={lang}
                stackOnDesktop
                allowScanAt={attendanceData.allowScanAt}
                expireAt={attendanceData.expireAt}
                isAllowScanManyTime={attendanceData.isAllowScanManyTime}
                onAllowScanAtChange={(value) =>
                  setAttendanceData((prev) => ({ ...prev, allowScanAt: value }))
                }
                onExpireAtChange={(value) =>
                  setAttendanceData((prev) => ({ ...prev, expireAt: value }))
                }
                onAllowScanManyTimeChange={(value) =>
                  setAttendanceData((prev) => ({
                    ...prev,
                    isAllowScanManyTime: value,
                  }))
                }
              />
            </section>
          )}

          {sortedStudents.length > 0 && (
            <section className="hidden md:block">
              <SummaryBar
                marked={totalMarked}
                total={sortedStudents.length}
                statusCounts={statusCounts}
                language={lang}
              />
            </section>
          )}
        </aside>

        {/* STUDENTS / NOTE */}
        <section className="flex min-w-0 flex-col md:min-h-0 md:flex-1">
          <div className="flex shrink-0 flex-col gap-3 border-b p-4 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-lg bg-background-color p-1">
                <TabButton
                  active={tab === "students"}
                  onClick={() => setTab("students")}
                  icon={<LuUsers />}
                  label={attendanceSessionDataLanguage.studentsTab(lang)}
                  badge={
                    sortedStudents.length > 0
                      ? `${totalMarked}/${sortedStudents.length}`
                      : undefined
                  }
                />
                <TabButton
                  active={tab === "note"}
                  onClick={() => setTab("note")}
                  icon={<LuStickyNote />}
                  label={attendanceSessionDataLanguage.noteTab(lang)}
                  dot={hasText(attendanceData.note)}
                />
              </div>
              {tab === "students" && (
                <label className="relative w-full sm:w-64">
                  <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-color/50" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={attendanceSessionDataLanguage.searchStudent(
                      lang,
                    )}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary-color focus:ring-2 focus:ring-primary-color/20"
                  />
                </label>
              )}
            </div>

            {tab === "students" &&
              sortedStudents.length > 0 &&
              visibleStatusLists.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 text-xs font-medium text-icon-color/60">
                    {attendanceSessionDataLanguage.markAll(lang)}
                  </span>
                  {visibleStatusLists.map((status) => (
                    <button
                      key={`all-${status.id}`}
                      type="button"
                      onClick={() => handleCheckAll({ key: status.title })}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-icon-color transition hover:border-primary-color hover:bg-primary-color/5 active:scale-95"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: status.color }}
                      />
                      {status.title}
                    </button>
                  ))}
                </div>
              )}
          </div>

          {(loading || isLoadingList) && (
            <ProgressBar
              mode="indeterminate"
              style={{ height: "3px", borderRadius: 0 }}
            />
          )}

          <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
            {tab === "note" ? (
              <div className="p-4 md:p-5">
                <SectionHeading
                  title={attendanceSessionDataLanguage.generalNote(lang)}
                  description={attendanceSessionDataLanguage.generalNoteHint(
                    lang,
                  )}
                />
                <div className="h-96 overflow-y-auto rounded-xl border border-gray-200">
                  {selectTable && (
                    <TextEditor
                      schoolId={selectTable.schoolId}
                      value={attendanceData.note}
                      onChange={(content) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          note: content,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
            ) : isLoadingList ? (
              <SkeletonRows />
            ) : sortedStudents.length === 0 ? (
              <EmptyState
                title={attendanceSessionDataLanguage.noStudents(lang)}
                hint={attendanceSessionDataLanguage.noStudentsHint(lang)}
              />
            ) : filteredStudents.length === 0 ? (
              <EmptyState title={attendanceSessionDataLanguage.noMatch(lang)} />
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <StudentRow
                    key={student.id + (selectTable?.id ?? "")}
                    studentOnSubject={student}
                    statusLists={visibleStatusLists}
                    handleCheck={handleCheck}
                    handleNoteChange={handleNoteChange}
                    notePlaceholder={attendanceSessionDataLanguage.notePlaceholder(
                      lang,
                    )}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t p-3 md:px-6">
        <div className="min-w-0">
          {selectAttendanceRow ? (
            <button
              type="button"
              disabled={removeRow.isPending}
              onClick={confirmDelete}
              className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-error-color transition hover:bg-error-color/10 disabled:opacity-50"
            >
              <IoTrashOutline />
              <span className="hidden sm:inline">
                {attendanceSessionDataLanguage.delete(lang)}
              </span>
            </button>
          ) : (
            sortedStudents.length > 0 && (
              <span className="text-xs text-icon-color/60 md:hidden">
                {attendanceSessionDataLanguage.marked(
                  totalMarked,
                  sortedStudents.length,
                )(lang)}
              </span>
            )
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="hidden h-10 rounded-lg px-4 text-sm font-semibold text-icon-color transition hover:bg-background-color sm:block"
          >
            {attendanceSessionDataLanguage.cancel(lang)}
          </button>
          <button
            type="button"
            onClick={handleSummitForm}
            disabled={loading}
            className="flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <LuCheck />
                {selectAttendanceRow
                  ? attendanceSessionDataLanguage.saveChanges(lang)
                  : attendanceSessionDataLanguage.save(lang)}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AttendanceChecker;

/* ---------- helpers ---------- */

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  dot?: boolean;
}> = ({ active, onClick, icon, label, badge, dot }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-white text-primary-color shadow-sm"
        : "text-icon-color/70 hover:text-icon-color"
    }`}
  >
    {icon}
    {label}
    {badge && (
      <span
        className={`rounded-full px-1.5 text-[11px] ${
          active
            ? "bg-primary-color/10 text-primary-color"
            : "bg-white text-icon-color/70"
        }`}
      >
        {badge}
      </span>
    )}
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-primary-color" />}
  </button>
);

const SummaryBar: React.FC<{
  marked: number;
  total: number;
  statusCounts: { status: AttendanceStatusList; count: number }[];
  language: Language;
}> = ({ marked, total, statusCounts, language }) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between">
      <span className="text-sm font-semibold text-icon-color">
        {attendanceSessionDataLanguage.marked(marked, total)(language)}
      </span>
      <span className="text-xs text-icon-color/60">
        {total > 0 ? Math.round((marked / total) * 100) : 0}%
      </span>
    </div>
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
      {statusCounts.map(
        ({ status, count }) =>
          count > 0 && (
            <div
              key={status.id}
              className="h-full transition-all"
              style={{
                width: `${(count / total) * 100}%`,
                background: status.color,
              }}
            />
          ),
      )}
    </div>
    <ul className="mt-3 flex flex-col gap-1.5">
      {statusCounts.map(({ status, count }) => (
        <li
          key={status.id}
          className="flex items-center justify-between text-xs text-icon-color/80"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: status.color }}
            />
            <span className="truncate">{status.title}</span>
          </span>
          <span className="font-semibold text-icon-color">{count}</span>
        </li>
      ))}
    </ul>
  </div>
);

const EmptyState: React.FC<{ title: string; hint?: string }> = ({
  title,
  hint,
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
      <LuUsers />
    </span>
    <h4 className="text-sm font-semibold text-icon-color">{title}</h4>
    {hint && <p className="mt-1 max-w-xs text-xs text-icon-color/60">{hint}</p>}
  </div>
);

const SkeletonRows: React.FC = () => (
  <ul className="divide-y divide-gray-100">
    {Array.from({ length: 6 }).map((_, i) => (
      <li key={i} className="flex animate-pulse items-center gap-3 px-4 py-4">
        <span className="h-10 w-10 rounded-full bg-gray-100" />
        <span className="h-3 w-40 rounded-full bg-gray-100" />
        <span className="ml-auto hidden h-7 w-56 rounded-full bg-gray-100 md:block" />
      </li>
    ))}
  </ul>
);

/* ---------- student row (one layout for phones and desktop) ---------- */

const StudentRow = React.memo(
  ({
    studentOnSubject,
    statusLists,
    handleCheck,
    handleNoteChange,
    notePlaceholder,
  }: {
    studentOnSubject: StudentAttendance;
    statusLists: AttendanceStatusList[];
    handleCheck: (input: { studentId: string; key: string }) => void;
    handleNoteChange: (input: { studentId: string; note: string }) => void;
    notePlaceholder: string;
  }) => {
    const activeStatus = statusLists.find(
      (s) => s.title === studentOnSubject.status,
    );
    return (
      <li
        className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-background-color/60 md:px-5 lg:flex-row lg:items-center"
        style={{
          boxShadow: activeStatus
            ? `inset 3px 0 0 ${activeStatus.color}`
            : undefined,
        }}
      >
        <div className="flex min-w-0 items-center gap-3 lg:w-56 lg:shrink-0">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-background-color">
            <Image
              src={studentOnSubject.photo}
              alt={studentOnSubject.firstName}
              fill
              sizes="40px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                studentOnSubject.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-icon-color">
              {studentOnSubject.firstName} {studentOnSubject.lastName}
            </h4>
            <p className="text-xs text-icon-color/60">
              #{studentOnSubject.number}
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label={`${studentOnSubject.firstName} ${studentOnSubject.lastName}`}
          className="flex flex-1 flex-wrap gap-1.5"
        >
          {statusLists.map((status) => {
            const isActive = studentOnSubject.status === status.title;
            return (
              <button
                key={status.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() =>
                  handleCheck({
                    studentId: studentOnSubject.id,
                    key: status.title,
                  })
                }
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95"
                style={
                  isActive
                    ? {
                        background: status.color,
                        borderColor: status.color,
                        color: readableTextOn(status.color),
                      }
                    : {
                        background: "#FFFFFF",
                        borderColor: "#E5E7EB",
                        color: "#383767",
                      }
                }
              >
                {isActive ? (
                  <LuCheck className="text-sm" />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: status.color }}
                  />
                )}
                <span className="max-w-[8rem] truncate">{status.title}</span>
              </button>
            );
          })}
        </div>

        <input
          value={studentOnSubject.note ?? ""}
          onChange={(e) =>
            handleNoteChange({
              studentId: studentOnSubject.id,
              note: e.target.value,
            })
          }
          placeholder={notePlaceholder}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-icon-color outline-none transition placeholder:text-icon-color/40 focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 lg:w-48 lg:shrink-0"
        />
      </li>
    );
  },
);
StudentRow.displayName = "StudentRow";
