import Image from "next/image";
import React, { useEffect, useState } from "react";
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
import { MdUpdate } from "react-icons/md";
import Swal from "sweetalert2";
import { attendanceCheckerDataLanugae } from "../../data/languages";
import { useSound } from "../../hook";
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
  const sound = useSound("/sounds/ringing.mp3");
  const successSong = useSound("/sounds/ding.mp3");
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
      successSong?.play();
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
      sound?.play();
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
  return (
    <>
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
        <div className="h-dvh w-screen rounded-2xl bg-white p-2 md:h-5/6 md:w-10/12">
          <div className="flex h-full w-full flex-col gap-1 p-1">
            {selectAttendanceRow ? (
              <header className="flex w-full flex-col gap-2">
                <section className="flex w-full justify-between border-b py-2">
                  <div className="text-lg font-semibold">
                    View Attendance Detail{" "}
                    <span className="text-xs font-normal text-gray-400">
                      ( View / Edit )
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectAttendanceRow.type === "SCAN" && (
                      <button
                        onClick={() => {
                          setQrCodeURL(
                            () =>
                              `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/qr-code-attendance/${selectAttendanceRow.id}`,
                          );
                        }}
                        className="second-button flex w-40 items-center justify-center gap-1 border"
                      >
                        <BsQrCode />
                        QR Code
                      </button>
                    )}
                    <button
                      onClick={() => setTriggerNote((prev) => !prev)}
                      className="second-button flex w-40 items-center justify-center gap-1 border"
                    >
                      {triggerNote ? (
                        <div className="flex items-center justify-center gap-1">
                          <IoIosArrowBack />
                          {attendanceCheckerDataLanugae.back(
                            language.data ?? "en",
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <BiSolidNote />
                          {attendanceCheckerDataLanugae.addNote(
                            language.data ?? "en",
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </section>
                <section className="flex gap-3">
                  <label className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      {attendanceCheckerDataLanugae.startDate(
                        language.data ?? "en",
                      )}
                    </span>
                    <input
                      required
                      disabled
                      value={attendanceData.startDate}
                      type="datetime-local"
                      className="main-input h-8 w-60"
                    />
                  </label>
                  <label className="flex flex-col">
                    {" "}
                    <span className="text-xs text-gray-400">
                      {attendanceCheckerDataLanugae.endDate(
                        language.data ?? "en",
                      )}
                    </span>
                    <input
                      required
                      disabled
                      value={attendanceData.endDate}
                      type="datetime-local"
                      className="main-input h-8 w-60"
                    />
                  </label>
                </section>
                <section className="flex w-full flex-col">
                  {selectAttendanceRow.type === "SCAN" && (
                    <section className="mt-5">
                      <h1 className="text-base font-medium sm:text-base">
                        QR Code Setting{" "}
                      </h1>
                      <h4 className="text-xs text-gray-500 sm:text-sm">
                        Manage Your QR code setting here such as set expire
                        time.
                      </h4>
                    </section>
                  )}
                  {selectAttendanceRow.type === "SCAN" && (
                    <section className="mt-5 flex gap-2">
                      <label className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          This Qr Code will be allowed to scan at
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
                        <span className="text-xs text-gray-400">
                          This Qr Code will exipre in the next{" "}
                          {attendanceData.expireAt &&
                            timeLeft({
                              targetTime: new Date(
                                attendanceData?.expireAt,
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
                      <label className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          Allow student to scan multiple times
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
                  )}
                </section>
              </header>
            ) : (
              <header className="">
                <section className="hidden w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2 md:flex">
                  <div className="text-center sm:text-left">
                    <h1 className="text-base font-medium sm:text-base">
                      {attendanceCheckerDataLanugae.title(
                        language.data ?? "en",
                      )}
                    </h1>
                    <span className="mt-1 block text-sm text-gray-500">
                      {attendanceCheckerDataLanugae.description(
                        language.data ?? "en",
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => setTriggerNote((prev) => !prev)}
                    className="second-button flex w-40 items-center justify-center gap-1 border"
                  >
                    {triggerNote ? (
                      <div className="flex items-center justify-center gap-1">
                        <IoIosArrowBack />
                        {attendanceCheckerDataLanugae.back(
                          language.data ?? "en",
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <BiSolidNote />
                        {attendanceCheckerDataLanugae.addNote(
                          language.data ?? "en",
                        )}
                      </div>
                    )}
                  </button>
                </section>

                <section className="mb-2 flex w-full flex-col gap-4 border-b pb-2">
                  {/* Table Selection */}
                  <div className="w-full overflow-x-auto">
                    <div className="flex min-w-0 flex-nowrap">
                      {attendanceTables.data?.map((table, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectTable(table)}
                          className={`whitespace-nowrap px-3 py-1 ${
                            selectTable?.id === table.id
                              ? "border-b-2 border-b-black font-semibold"
                              : ""
                          }`}
                        >
                          {table.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Note Controls */}
                  <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <form
                      ref={formRef}
                      className="flex flex-1 flex-col gap-2 sm:flex-row"
                    >
                      <label className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          {attendanceCheckerDataLanugae.startDate(
                            language.data ?? "en",
                          )}
                        </span>
                        <input
                          required
                          value={attendanceData.startDate}
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
                        {" "}
                        <span className="text-xs text-gray-400">
                          {attendanceCheckerDataLanugae.endDate(
                            language.data ?? "en",
                          )}
                        </span>
                        <input
                          required
                          value={attendanceData.endDate}
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
                    </form>
                  </div>
                </section>
                <h2 className="line-clamp-2 hidden w-full text-sm text-gray-400 md:block">
                  {selectTable?.description}
                </h2>
                {(loading ||
                  studentOnSubjects.isLoading ||
                  attendanceTables.isLoading) && (
                  <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
                )}
              </header>
            )}

            {triggerNote && selectTable ? (
              <div className="h-full">
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
                {/* Desktop View */}
                <div className="max-h-full w-full overflow-auto">
                  <table className="w-max min-w-full">
                    <thead>
                      <tr className="sticky top-0 z-30 bg-gray-100">
                        <th className="sticky left-0 z-40 w-40 bg-gray-100 md:w-60">
                          Name
                        </th>
                        {selectTable?.statusLists
                          .filter((s) => !s.isHidden)
                          .sort((a, b) => b.title.localeCompare(a.title))
                          .map((status, index) => {
                            return (
                              <th key={status.id + selectTable.id}>
                                <button
                                  onClick={(e) =>
                                    handleCheckAll({
                                      key: e.currentTarget.name,
                                      check: true,
                                    })
                                  }
                                  style={{ backgroundColor: status.color }}
                                  name={status.title}
                                  className={`flex w-24 cursor-pointer select-none items-center justify-center gap-1 rounded-2xl p-2 text-center text-sm font-medium transition hover:text-black hover:drop-shadow-md active:scale-105`}
                                >
                                  <span className="max-w-20 truncate">
                                    {status.title}
                                  </span>
                                  <TbSelectAll />
                                </button>
                              </th>
                            );
                          })}
                        <th className="z-10 bg-gray-100 text-sm md:sticky md:right-0">
                          <div className="flex w-40 items-center justify-center gap-1">
                            <BiSolidNote /> Note
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectTable?.statusLists &&
                        studentAttendances
                          ?.filter((s) => s.isActive)
                          .sort((a, b) => Number(a.number) - Number(b.number))
                          .map((studentOnSubject, index) => {
                            return (
                              <StudentAttendanceItem
                                key={studentOnSubject.id + selectTable.id}
                                index={index}
                                studentOnSubject={studentOnSubject}
                                statusLists={selectTable?.statusLists}
                                handleCheck={handleCheck}
                                handleNoteChange={handleNoteChange}
                              />
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <footer className="flex w-full justify-end border-t p-1 py-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    onClose();
                  }}
                  type="button"
                  className="second-button flex w-40 items-center justify-center gap-1 border"
                >
                  Cancel
                </button>
                {selectAttendanceRow && (
                  <button
                    disabled={removeRow.isPending}
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this row?")
                      ) {
                        handleDelete();
                      }
                    }}
                    className="reject-button flex w-40 items-center justify-center gap-1 border"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSummitForm}
                  disabled={loading}
                  className="main-button flex w-40 items-center justify-center gap-1"
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : selectAttendanceRow ? (
                    <>
                      <MdUpdate />{" "}
                      {attendanceCheckerDataLanugae.update(
                        language.data ?? "en",
                      )}
                    </>
                  ) : (
                    <>
                      <IoIosCreate />{" "}
                      {attendanceCheckerDataLanugae.create(
                        language.data ?? "en",
                      )}
                    </>
                  )}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

export default AttendanceChecker;

const StudentAttendanceItem = React.memo(
  ({
    studentOnSubject,
    statusLists,
    handleCheck,
    handleNoteChange,
    index,
  }: {
    studentOnSubject: StudentOnSubject & { status?: string; note?: string };
    statusLists: AttendanceStatusList[];
    handleCheck: ({
      studentId,
      key,
    }: {
      studentId: string;
      key: string;
    }) => void;
    handleNoteChange: ({
      studentId,
      note,
    }: {
      studentId: string;
      note: string;
    }) => void;
    index: number;
  }) => {
    const odd = index % 2 === 0;
    return (
      <tr
        key={studentOnSubject.id}
        className={` ${
          odd && "bg-gray-50"
        } border-spacing-2 border-4 border-transparent`}
      >
        <td className={`sticky left-0 z-10 ${odd ? "bg-gray-50" : "bg-white"}`}>
          <div className="flex w-40 gap-2 truncate md:w-60">
            <div className="relative hidden h-10 w-10 overflow-hidden rounded-2xl ring-1 md:block">
              <Image
                src={studentOnSubject.photo}
                alt={studentOnSubject.firstName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  studentOnSubject.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold">
                {studentOnSubject.firstName} {studentOnSubject.lastName}{" "}
              </h1>
              <p className="text-xs text-gray-500">
                Number {studentOnSubject.number}{" "}
              </p>
            </div>
          </div>
        </td>

        {statusLists
          .filter((s) => !s.isHidden)
          .sort((a, b) => b.title.localeCompare(a.title))
          .map((status, index) => {
            return (
              <td key={studentOnSubject.id + status.id}>
                <div className="flex w-full items-center justify-center">
                  <input
                    name={status.title}
                    checked={studentOnSubject.status === status.title}
                    onChange={(e) =>
                      handleCheck({
                        studentId: studentOnSubject.id,
                        key: e.target.name,
                      })
                    }
                    style={{ accentColor: status.color }}
                    type="checkbox"
                    className="h-6 w-6"
                  />
                </div>
              </td>
            );
          })}
        <td
          className={`z-10 ${
            odd ? "bg-gray-50" : "bg-white"
          } md:sticky md:right-0`}
        >
          <textarea
            value={studentOnSubject.note}
            onChange={(e) =>
              handleNoteChange({
                studentId: studentOnSubject.id,
                note: e.target.value,
              })
            }
            className="main-input h-10 w-40 resize-none"
          />
        </td>
      </tr>
    );
  },
);
StudentAttendanceItem.displayName = "StudentAttendanceItem";
