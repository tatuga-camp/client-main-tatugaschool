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
        }))
      );
    }
  }, [studentOnSubjects.data]);

  const handleCheck = React.useCallback(
    ({ studentId, key }: { studentId: string; key: string }) => {
      setStudentAttendances((prev) => {
        if (!prev) return null;
        return prev?.map((student) =>
          student.id === studentId ? { ...student, status: key } : student
        );
      });
    },
    []
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
          student.id === studentId ? { ...student, note } : student
        );
      });
    },
    []
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
          (a) => a.studentOnSubjectId === student.id
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
    <div className="w-full h-full flex flex-col gap-1 p-1">
      <header className="">
        <section className="w-full hidden md:flex flex-col gap-4 sm:gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div className="text-center sm:text-left">
            <h1 className="text-base sm:text-base font-medium">
              {attendanceCheckerDataLanugae.title(language.data ?? "en")}
            </h1>
            <span className="text-sm text-gray-500 block mt-1">
              {attendanceCheckerDataLanugae.description(language.data ?? "en")}
            </span>
          </div>
        </section>

        <section className="w-full flex flex-col gap-4  border-b">
          {/* Table Selection */}
          <div className="w-full overflow-x-auto">
            <div className="flex flex-nowrap min-w-0">
              {attendanceTables.data?.map((table, index) => (
                <button
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
            <form
              ref={formRef}
              className="flex-1 flex flex-col sm:flex-row gap-2"
            >
              <label className="flex flex-col">
                <span className="text-gray-400 text-xs">
                  {attendanceCheckerDataLanugae.startDate(
                    language.data ?? "en"
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
                <span className="text-gray-400 text-xs">
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
              className="main-button flex items-center justify-center h-8 px-4
               ring-1 ring-blue-600 whitespace-nowrap sm:self-end"
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
        <h2 className="w-full hidden md:block line-clamp-2 text-sm text-gray-400">
          {selectTable?.description}
        </h2>
        {loading && (
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
          <div className="w-full max-h-full overflow-auto">
            <table className=" w-max min-w-full">
              <thead>
                <tr className="bg-gray-100 z-30 sticky top-0">
                  <th className="sticky left-0 z-40 w-40 md:w-60 bg-gray-100">
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
                            className={`text-center w-24 p-2 select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105 transition hover:text-black text-sm font-medium flex items-center justify-center gap-1`}
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
      <footer className="w-full flex justify-end p-1 py-4 border-t">
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
          <div className="flex w-40 md:w-60 truncate gap-2">
            <div className="md:block hidden w-10 h-10 relative rounded-md ring-1 overflow-hidden">
              <Image
                src={student.photo}
                alt={student.firstName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  student.blurHash ?? defaultBlurHash
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
                <div className="w-full flex justify-center items-center">
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
                    className="w-6 h-6"
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
            className="main-input w-40 h-10 resize-none"
          />
        </td>
      </tr>
    );
  }
);
StudentAttendanceItem.displayName = "StudentAttendanceItem";
