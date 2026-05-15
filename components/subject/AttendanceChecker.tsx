import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { TbSelectAll } from "react-icons/tb";
import { defaultBlurHash } from "../../data";
import {
  Attendance,
  AttendanceRow,
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
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
  timeLeft,
} from "../../utils";

import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { BiSolidNote } from "react-icons/bi";
import { BsQrCode } from "react-icons/bs";
import { IoIosArrowBack, IoIosCreate } from "react-icons/io";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import {
  LuCalendarClock,
  LuClock4,
  LuRepeat,
  LuSparkles,
} from "react-icons/lu";
import { MdUpdate } from "react-icons/md";
import Swal from "sweetalert2";
import { attendanceCheckerDataLanugae } from "../../data/languages";
import LoadingSpinner from "../common/LoadingSpinner";
import Switch from "../common/Switch";
import TextEditor from "../common/TextEditor";
import QRCode from "./QRCode";

type Props = {
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
  selectAttendanceRow?: AttendanceRow & { attendances: Attendance[] };
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
  const [loading, setLoading] = React.useState(false);
  const createAttendanceRow = useCreateAttendanceRow();
  const updateAttendance = useUpdateManyAttendance();
  const updateAttendanceRow = useUpdateRowAttendance();
  const [triggerNote, setTriggerNote] = React.useState(false);
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
      setSelectTable(attendanceTables.data[0]);
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
            ? { ...studentOnSubject, status: key }
            : studentOnSubject,
        );
      });
    },
    [],
  );

  const handleCheckAll = ({ key, check }: { key: string; check: boolean }) => {
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
        setLoading(true);

        const update = await updateAttendanceRow.mutateAsync({
          query: {
            attendanceRowId: selectAttendanceRow.id,
          },
          body: {
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
      summary: "Created",
      detail: "Attendance has been created",
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

  const visibleStatusLists = useMemo(
    () =>
      (selectTable?.statusLists ?? [])
        .filter((s) => !s.isHidden)
        .sort((a, b) => b.title.localeCompare(a.title)),
    [selectTable?.statusLists],
  );

  const sortedStudents = useMemo(
    () =>
      (studentAttendances ?? [])
        .filter((s) => s.isActive)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [studentAttendances],
  );

  const totalMarked = useMemo(
    () =>
      sortedStudents.filter((s) => s.status && s.status !== "UNKNOW").length,
    [sortedStudents],
  );

  return (
    <>
      <style>{`
        .ac-shell *::-webkit-scrollbar { height: 8px; width: 8px; }
        .ac-shell *::-webkit-scrollbar-thumb {
          background: #D6DDEB; border-radius: 999px;
        }
        .ac-shell *::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {qrCodeURL && selectAttendanceRow ? (
        <QRCode
          url={qrCodeURL}
          expireAt={
            selectAttendanceRow.expireAt
              ? new Date(selectAttendanceRow.expireAt)
              : undefined
          }
          setTriggerQRCode={(vale) => onClose()}
        />
      ) : (
        <div
          className="ac-shell font-Anuphan relative h-dvh w-screen overflow-hidden bg-background-color text-icon-color shadow-2xl md:h-[88vh] md:w-[92vw] md:max-w-7xl md:rounded-[2rem]"
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

          <div className="relative flex h-full flex-col">
            {/* HEADER */}
            <div className="flex-none border-b border-dashed border-gray-200 bg-white/70 px-4 pb-3 pt-5 backdrop-blur-sm sm:px-6 md:px-8 md:pb-4 md:pt-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="hidden h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary-color/10 text-xl text-primary-color md:flex"
                    style={{ transform: "rotate(-4deg)" }}
                  >
                    <LuSparkles />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-icon-color md:text-2xl">
                      {selectAttendanceRow
                        ? "Attendance details"
                        : attendanceCheckerDataLanugae.title(
                            language.data ?? "en",
                          )}
                    </h1>
                    <p className="mt-0.5 text-xs text-icon-color/60 sm:text-sm">
                      {selectAttendanceRow
                        ? "Review or update what was taken on this day."
                        : attendanceCheckerDataLanugae.description(
                            language.data ?? "en",
                          )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-none items-center gap-1.5">
                  {selectAttendanceRow?.type === "SCAN" && (
                    <button
                      type="button"
                      onClick={() => {
                        setQrCodeURL(
                          () =>
                            `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${selectAttendanceRow.id}`,
                        );
                      }}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 text-xs font-medium text-icon-color transition hover:border-primary-color hover:bg-primary-color/5 hover:text-primary-color sm:text-sm"
                    >
                      <BsQrCode className="text-primary-color" />
                      <span className="hidden sm:inline">QR Code</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTriggerNote((prev) => !prev)}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-2xl border px-3 text-xs font-medium transition sm:text-sm ${
                      triggerNote
                        ? "border-primary-color bg-primary-color text-white"
                        : "border-gray-200 bg-white text-icon-color hover:border-warning-color hover:bg-warning-color/10"
                    }`}
                  >
                    {triggerNote ? (
                      <>
                        <IoIosArrowBack />
                        <span className="hidden sm:inline">
                          {attendanceCheckerDataLanugae.back(
                            language.data ?? "en",
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <BiSolidNote className="text-warning-color" />
                        <span className="hidden sm:inline">
                          {attendanceCheckerDataLanugae.addNote(
                            language.data ?? "en",
                          )}
                        </span>
                      </>
                    )}
                  </button>
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
              </div>

              {/* Date controls + tabs */}
              {!selectAttendanceRow ? (
                <div className="mt-4 flex flex-col gap-4">
                  {/* Table tabs */}
                  {attendanceTables.data &&
                    attendanceTables.data.length > 0 && (
                      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                        {attendanceTables.data?.map((table) => {
                          const active = selectTable?.id === table.id;
                          return (
                            <button
                              key={table.id}
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

                  <form
                    ref={formRef}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
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
                          setAttendanceData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                            endDate: addOneHour(e.target.value),
                          }))
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
                  </form>

                  {(loading ||
                    studentOnSubjects.isLoading ||
                    attendanceTables.isLoading) && (
                    <div className="overflow-hidden rounded-full bg-gray-100">
                      <ProgressBar
                        mode="indeterminate"
                        style={{ height: "5px", background: "transparent" }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FieldLabel
                      icon={<LuCalendarClock />}
                      label={attendanceCheckerDataLanugae.startDate(
                        language.data ?? "en",
                      )}
                    >
                      <BrandInput
                        required
                        disabled
                        value={attendanceData.startDate ?? ""}
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
                        disabled
                        value={attendanceData.endDate ?? ""}
                        type="datetime-local"
                      />
                    </FieldLabel>
                  </div>

                  {selectAttendanceRow.type === "SCAN" && (
                    <div className="rounded-3xl border border-dashed border-info-color/40 bg-info-color/5 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-info-color/15 text-info-color">
                          <BsQrCode />
                        </span>
                        <h3 className="text-sm font-semibold text-icon-color sm:text-base">
                          QR code settings
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <FieldLabel
                          icon={<LuCalendarClock />}
                          label="Allowed scan start"
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
                              Expires in{" "}
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
                              attendanceData?.allowScanAt &&
                              new Date(attendanceData?.allowScanAt)
                                .toISOString()
                                .slice(0, -8)
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
                          label="Allow multiple scans"
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
                            <span className="ml-3 text-xs text-icon-color/70">
                              {attendanceData?.isAllowScanManyTime
                                ? "On — students can scan again"
                                : "Off — single scan only"}
                            </span>
                          </div>
                        </FieldLabel>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary chip strip */}
              {!triggerNote && selectTable && sortedStudents.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-color/10 px-3 py-1 text-xs font-semibold text-primary-color"
                    style={{ transform: "rotate(-1deg)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-color" />
                    {totalMarked} / {sortedStudents.length} marked
                  </span>
                  {visibleStatusLists.map((s) => {
                    const n = sortedStudents.filter(
                      (st) => st.status === s.title,
                    ).length;
                    if (n === 0) return null;
                    return (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-icon-color"
                        style={{ background: `${s.color}22` }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: s.color }}
                        />
                        {s.title} · {n}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MAIN */}
            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 md:px-8">
              {triggerNote && selectTable ? (
                <div className="mx-auto h-96 max-w-3xl rounded-3xl border border-dashed border-gray-200 bg-white p-2 sm:p-3">
                  <div className="mb-2 flex items-center gap-2 px-2 pt-1">
                    <BiSolidNote className="text-warning-color" />
                    <h3 className="text-sm font-semibold text-icon-color sm:text-base">
                      General note
                    </h3>
                  </div>
                  <TextEditor
                    schoolId={selectTable?.schoolId}
                    value={attendanceData?.note}
                    onChange={(content) =>
                      setAttendanceData((prev) => ({
                        ...prev,
                        note: content,
                      }))
                    }
                  />
                </div>
              ) : (
                <>
                  {/* MOBILE CARD LIST */}
                  <div className="space-y-3 md:hidden">
                    {visibleStatusLists.length > 0 && (
                      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        {visibleStatusLists.map((status) => (
                          <button
                            key={`all-${status.id}`}
                            onClick={() =>
                              handleCheckAll({
                                key: status.title,
                                check: true,
                              })
                            }
                            className="flex flex-none items-center gap-1.5 rounded-full border border-dashed border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-icon-color transition active:scale-95"
                          >
                            <TbSelectAll style={{ color: status.color }} />
                            <span>All · {status.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {sortedStudents.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: Math.min(index * 0.012, 0.25),
                            duration: 0.25,
                          }}
                        >
                          <StudentMobileCard
                            studentOnSubject={student}
                            statusLists={visibleStatusLists}
                            handleCheck={handleCheck}
                            handleNoteChange={handleNoteChange}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {sortedStudents.length === 0 &&
                      !studentOnSubjects.isLoading && <EmptyState />}
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                      <div className="max-h-[60vh] w-full overflow-auto">
                        <table className="w-max min-w-full text-sm">
                          <thead>
                            <tr
                              className="sticky top-0 z-30"
                              style={{
                                background:
                                  "linear-gradient(180deg, #EEF4FB 0%, #FFFFFF 100%)",
                              }}
                            >
                              <th
                                className="sticky left-0 z-40 w-56 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-icon-color/60"
                                style={{
                                  background: "#EEF4FB",
                                  borderRight: "1px dashed #E5E7EB",
                                }}
                              >
                                Student
                              </th>
                              {visibleStatusLists.map((status) => (
                                <th
                                  key={status.id + (selectTable?.id ?? "")}
                                  className="px-2 py-3"
                                >
                                  <button
                                    onClick={(e) =>
                                      handleCheckAll({
                                        key: e.currentTarget.name,
                                        check: true,
                                      })
                                    }
                                    name={status.title}
                                    className="flex w-full select-none items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold text-icon-color transition hover:translate-y-[-1px] hover:shadow-md active:scale-[0.97]"
                                    style={{
                                      background: `${status.color}25`,
                                      boxShadow: `0 2px 0 ${status.color}55`,
                                    }}
                                    title={`Mark all ${status.title}`}
                                  >
                                    <span
                                      className="h-2 w-2 flex-none rounded-full"
                                      style={{ background: status.color }}
                                    />
                                    <span className="max-w-[7rem] truncate">
                                      {status.title}
                                    </span>
                                    <TbSelectAll className="opacity-60" />
                                  </button>
                                </th>
                              ))}
                              <th
                                className="sticky right-0 z-30 w-44 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-icon-color/60"
                                style={{
                                  background: "#EEF4FB",
                                  borderLeft: "1px dashed #E5E7EB",
                                }}
                              >
                                <span className="flex items-center gap-1.5">
                                  <BiSolidNote className="text-warning-color" />
                                  Note
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedStudents.map((student, index) => (
                              <StudentDesktopRow
                                key={student.id + (selectTable?.id ?? "")}
                                index={index}
                                studentOnSubject={student}
                                statusLists={visibleStatusLists}
                                handleCheck={handleCheck}
                                handleNoteChange={handleNoteChange}
                              />
                            ))}
                            {sortedStudents.length === 0 &&
                              !studentOnSubjects.isLoading && (
                                <tr>
                                  <td
                                    colSpan={visibleStatusLists.length + 2}
                                    className="py-10"
                                  >
                                    <EmptyState />
                                  </td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="flex-none border-t border-dashed border-gray-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:px-8 md:py-4"
              style={{
                boxShadow: "0 -10px 30px -20px rgba(56,55,103,0.15)",
              }}
            >
              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                {selectAttendanceRow && (
                  <button
                    type="button"
                    disabled={removeRow.isPending}
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this row?")
                      ) {
                        handleDelete();
                      }
                    }}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-error-color/30 bg-error-color/10 px-5 text-sm font-semibold text-error-color transition hover:bg-error-color/15 active:scale-[0.98] disabled:opacity-50"
                  >
                    <IoTrashOutline />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSummitForm}
                  disabled={loading}
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
                  {loading ? (
                    <LoadingSpinner />
                  ) : selectAttendanceRow ? (
                    <>
                      <MdUpdate className="text-base text-warning-color" />
                      {attendanceCheckerDataLanugae.update(
                        language.data ?? "en",
                      )}
                    </>
                  ) : (
                    <>
                      <IoIosCreate className="text-base text-warning-color" />
                      {attendanceCheckerDataLanugae.create(
                        language.data ?? "en",
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AttendanceChecker;

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

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
    <div
      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color"
      style={{ transform: "rotate(-6deg)" }}
    >
      <LuSparkles />
    </div>
    <h4 className="text-base font-semibold text-icon-color">No students yet</h4>
    <p className="mt-1 max-w-xs text-xs text-icon-color/60">
      Once students are added to this subject they will appear here for
      attendance marking.
    </p>
  </div>
);

/* ---------- mobile card ---------- */

const StudentMobileCard = React.memo(
  ({
    studentOnSubject,
    statusLists,
    handleCheck,
    handleNoteChange,
  }: {
    studentOnSubject: StudentOnSubject & { status?: string; note?: string };
    statusLists: AttendanceStatusList[];
    handleCheck: (input: { studentId: string; key: string }) => void;
    handleNoteChange: (input: { studentId: string; note: string }) => void;
  }) => {
    const activeStatus = statusLists.find(
      (s) => s.title === studentOnSubject.status,
    );
    return (
      <div
        className="rounded-3xl border border-gray-200 bg-white p-4 transition"
        style={{
          boxShadow: activeStatus
            ? `0 6px 0 -2px ${activeStatus.color}55, 0 10px 24px -12px rgba(56,55,103,0.18)`
            : "0 6px 0 -2px #E5E7EB, 0 10px 24px -12px rgba(56,55,103,0.10)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 flex-none">
            <div
              className="absolute inset-0 rounded-2xl bg-primary-color/15"
              style={{ transform: "rotate(-4deg)" }}
            />
            <div
              className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-white"
              style={{ transform: "rotate(2deg)" }}
            >
              <Image
                src={studentOnSubject.photo}
                alt={studentOnSubject.firstName}
                fill
                sizes="56px"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  studentOnSubject.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-color/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary-color">
                #{studentOnSubject.number}
              </span>
              {activeStatus && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-icon-color"
                  style={{ background: `${activeStatus.color}30` }}
                >
                  {activeStatus.title}
                </span>
              )}
            </div>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-icon-color">
              {studentOnSubject.firstName} {studentOnSubject.lastName}
            </h3>
          </div>
        </div>

        <div className="mt-3 -mx-1 flex flex-wrap gap-1.5 px-1">
          {statusLists.map((status) => {
            const isActive = studentOnSubject.status === status.title;
            return (
              <motion.button
                key={status.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() =>
                  handleCheck({
                    studentId: studentOnSubject.id,
                    key: status.title,
                  })
                }
                className="flex-1 rounded-2xl border px-2 py-2 text-xs font-semibold transition"
                style={{
                  minWidth: "5rem",
                  background: isActive ? status.color : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#383767",
                  borderColor: isActive ? status.color : "#E5E7EB",
                  boxShadow: isActive
                    ? `0 4px 0 -1px ${status.color}99`
                    : "none",
                }}
              >
                {status.title}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-icon-color/60">
            <BiSolidNote className="text-warning-color" />
            Note
          </label>
          <textarea
            value={studentOnSubject.note ?? ""}
            onChange={(e) =>
              handleNoteChange({
                studentId: studentOnSubject.id,
                note: e.target.value,
              })
            }
            placeholder="Optional note for this student…"
            rows={2}
            className="mt-1 w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-icon-color placeholder:text-icon-color/40 focus:border-primary-color focus:outline-none focus:ring-4 focus:ring-primary-color/15"
          />
        </div>
      </div>
    );
  },
);
StudentMobileCard.displayName = "StudentMobileCard";

/* ---------- desktop row ---------- */

const StudentDesktopRow = React.memo(
  ({
    studentOnSubject,
    statusLists,
    handleCheck,
    handleNoteChange,
    index,
  }: {
    studentOnSubject: StudentOnSubject & { status?: string; note?: string };
    statusLists: AttendanceStatusList[];
    handleCheck: (input: { studentId: string; key: string }) => void;
    handleNoteChange: (input: { studentId: string; note: string }) => void;
    index: number;
  }) => {
    console.log(studentOnSubject.id)
    const odd = index % 2 === 0;
    const rowBg = odd ? "#F9FBFD" : "#FFFFFF";
    return (
      <tr
        style={{
          background: rowBg,
          borderTop: index === 0 ? "none" : "1px dashed #E5E7EB",
        }}
      >
        <td
          className="sticky left-0 z-10 px-5 py-3"
          style={{
            background: rowBg,
            borderRight: "1px dashed #E5E7EB",
          }}
        >
          <div className="flex w-56 items-center gap-3">
            <div className="relative h-11 w-11 flex-none">
              <div
                className="absolute inset-0 rounded-2xl bg-primary-color/15"
                style={{ transform: "rotate(-4deg)" }}
              />
              <div
                className="relative h-11 w-11 overflow-hidden rounded-2xl ring-2 ring-white"
                style={{ transform: "rotate(2deg)" }}
              >
                <Image
                  src={studentOnSubject.photo}
                  alt={studentOnSubject.firstName}
                  fill
                  sizes="44px"
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(
                    studentOnSubject.blurHash ?? defaultBlurHash,
                  )}
                  className="object-cover"
                />
              </div>
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
        </td>

        {statusLists.map((status) => {
          const isActive = studentOnSubject.status === status.title;
          return (
            <td key={studentOnSubject.id + status.id} className="px-2 py-3">
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() =>
                    handleCheck({
                      studentId: studentOnSubject.id,
                      key: status.title,
                    })
                  }
                  aria-pressed={isActive}
                  className="group flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95"
                  style={{
                    background: isActive ? status.color : "transparent",
                    border: isActive
                      ? `2px solid ${status.color}`
                      : "2px solid #E5E7EB",
                    boxShadow: isActive
                      ? `0 4px 12px -4px ${status.color}99`
                      : "none",
                  }}
                  title={status.title}
                >
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 600,
                        damping: 20,
                      }}
                      className="block h-3.5 w-3.5 rounded-full bg-white"
                    />
                  )}
                </button>
              </div>
            </td>
          );
        })}

        <td
          className="sticky right-0 z-10 px-3 py-3"
          style={{
            background: rowBg,
            borderLeft: "1px dashed #E5E7EB",
          }}
        >
          <textarea
            value={studentOnSubject.note ?? ""}
            onChange={(e) =>
              handleNoteChange({
                studentId: studentOnSubject.id,
                note: e.target.value,
              })
            }
            placeholder="Add a note…"
            rows={1}
            className="h-9 w-40 resize-none rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-icon-color placeholder:text-icon-color/40 focus:border-primary-color focus:outline-none focus:ring-4 focus:ring-primary-color/15"
          />
        </td>
      </tr>
    );
  },
);
StudentDesktopRow.displayName = "StudentDesktopRow";
