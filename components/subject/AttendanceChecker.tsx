import Image from "next/image";
import React, { useEffect } from "react";
import { TbSelectAll } from "react-icons/tb";
import { defaultBlurHash } from "../../data";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
  StudentOnSubject,
} from "../../interfaces";
import {
  useCreateAttendanceRow,
  useGetAttendancesTable,
  useGetLanguage,
  useGetStudentOnSubject,
  useUpdateManyAttendance,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";

import { useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { BiSolidNote } from "react-icons/bi";
import { IoIosArrowBack, IoIosCreate } from "react-icons/io";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import LoadingSpinner from "../common/LoadingSpinner";
import TextEditor from "../common/TextEditor";
import { attendanceCheckerDataLanugae } from "../../data/languages";
type Props = {
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};
function AttendanceChecker({ subjectId, onClose, toast }: Props) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const successSong = useSound("/sounds/ding.mp3");
  const language = useGetLanguage();
  const [loading, setLoading] = React.useState(false);
  const createAttendanceRow = useCreateAttendanceRow();
  const updateAttendance = useUpdateManyAttendance();
  const [triggerNote, setTriggerNote] = React.useState(false);
  const [attendanceData, setAttendanceData] = React.useState<{
    startDate?: string;
    endDate?: string;
    note: string;
  }>({
    note: "",
  });
  const [studentAttendances, setStudentAttendances] = React.useState<
    | (StudentOnSubject & {
        status: string | "UNKNOW";
        note: string;
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
    if (studentOnSubjects.data) {
      setStudentAttendances(
        studentOnSubjects.data.map((student) => ({
          ...student,
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
        return prev?.map((student) =>
          student.id === studentId ? { ...student, status: key } : student,
        );
      });
    },
    [],
  );

  const handleCheckAll = ({ key, check }: { key: string; check: boolean }) => {
    setStudentAttendances((prev) => {
      if (!prev) return null;
      return prev.map((student) => {
        return {
          ...student,
          status: key,
        };
      });
    });
  };

  const handleNoteChange = React.useCallback(
    ({ studentId, note }: { studentId: string; note: string }) => {
      setStudentAttendances((prev) => {
        if (!prev) return null;
        return prev?.map((student) =>
          student.id === studentId ? { ...student, note } : student,
        );
      });
    },
    [],
  );

  const handleCreateAttendance = async () => {
    try {
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
      if (!studentAttendances) {
        throw new Error("No student found");
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

      const data = studentAttendances.map((student) => {
        const attendanceId = create.attendances.find(
          (a) => a.studentOnSubjectId === student.id,
        )?.id;
        if (!attendanceId) return null;
        return {
          query: {
            attendanceId: attendanceId,
          },
          body: {
            status: student.status,
            note: student.note,
          },
        };
      });
      const filterData = data.filter((d) => d !== null);
      await updateAttendance.mutateAsync({
        request: filterData,
      });
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
  return (
    <div className="flex h-full w-full flex-col gap-1 p-1">
      <header className="">
        <section className="hidden w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2 md:flex">
          <div className="text-center sm:text-left">
            <h1 className="text-base font-medium sm:text-base">
              {attendanceCheckerDataLanugae.title(language.data ?? "en")}
            </h1>
            <span className="mt-1 block text-sm text-gray-500">
              {attendanceCheckerDataLanugae.description(language.data ?? "en")}
            </span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4 border-b">
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

                      const [datePart, timePart] = e.target.value.split("T");

                      const [hours, minutes] = timePart.split(":").map(Number);
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
                  {attendanceCheckerDataLanugae.endDate(language.data ?? "en")}
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
            <button
              onClick={() => setTriggerNote((prev) => !prev)}
              className="main-button flex h-8 items-center justify-center whitespace-nowrap px-4 ring-1 ring-blue-600 sm:self-end"
            >
              {triggerNote ? (
                <div className="flex items-center justify-center gap-1">
                  <IoIosArrowBack />
                  {attendanceCheckerDataLanugae.back(language.data ?? "en")}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <BiSolidNote />
                  {attendanceCheckerDataLanugae.addNote(language.data ?? "en")}
                </div>
              )}
            </button>
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
                            className={`flex w-24 cursor-pointer select-none items-center justify-center gap-1 rounded-md p-2 text-center text-sm font-medium transition hover:text-black hover:drop-shadow-md active:scale-105`}
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
                    .map((student, index) => {
                      return (
                        <StudentAttendanceItem
                          key={student.id + selectTable.id}
                          index={index}
                          student={student}
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
            className="second-button flex items-center justify-center gap-1 border"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAttendance}
            disabled={loading}
            className="main-button flex items-center justify-center gap-1"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <IoIosCreate />{" "}
                {attendanceCheckerDataLanugae.create(language.data ?? "en")}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AttendanceChecker;

const StudentAttendanceItem = React.memo(
  ({
    student,
    statusLists,
    handleCheck,
    handleNoteChange,
    index,
  }: {
    student: StudentOnSubject & { status: string; note: string };
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
        key={student.id}
        className={` ${
          odd && "bg-gray-50"
        } border-spacing-2 border-4 border-transparent`}
      >
        <td className={`sticky left-0 z-10 ${odd ? "bg-gray-50" : "bg-white"}`}>
          <div className="flex w-40 gap-2 truncate md:w-60">
            <div className="relative hidden h-10 w-10 overflow-hidden rounded-md ring-1 md:block">
              <Image
                src={student.photo}
                alt={student.firstName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  student.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold">
                {student.firstName} {student.lastName}{" "}
              </h1>
              <p className="text-xs text-gray-500">Number {student.number} </p>
            </div>
          </div>
        </td>

        {statusLists
          .filter((s) => !s.isHidden)
          .sort((a, b) => b.title.localeCompare(a.title))
          .map((status, index) => {
            return (
              <td key={student.id + status.id}>
                <div className="flex w-full items-center justify-center">
                  <input
                    name={status.title}
                    checked={student.status === status.title}
                    onChange={(e) =>
                      handleCheck({
                        studentId: student.id,
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
            value={student.note}
            onChange={(e) =>
              handleNoteChange({
                studentId: student.id,
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
