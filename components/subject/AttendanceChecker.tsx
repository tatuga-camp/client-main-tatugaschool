import React, { useEffect } from "react";
import {
  useCreateAttendanceRow,
  useGetAttendancesTable,
  useGetStudentOnSubject,
  useUpdateAttendance,
  useUpdateManyAttendance,
} from "../../react-query";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
  StudentOnSubject,
} from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { TbSelectAll } from "react-icons/tb";

import TextEditor from "../common/TextEditor";
import { IoIosArrowBack, IoIosCreate } from "react-icons/io";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import { SiMicrosoftexcel } from "react-icons/si";
import { BiSolidNote } from "react-icons/bi";
type Props = {
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};
function AttendanceChecker({ subjectId, onClose, toast }: Props) {
  const queryClient = useQueryClient();
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusLists: AttendanceStatusList[];
      })
    | null
  >(null);
  const successSong = useSound("/sounds/ding.mp3");

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
        },
        queryClient,
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
        queryClient,
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
    <div className="w-full h-full flex flex-col gap-1 p-2 md:p-4">
      <header className="">
        <section className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
          <div>
            <h1 className="text-xl font-medium">Attendance Checker</h1>
            <span className="text-sm text-gray-500">
              You can check the attendance of the students here
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateAttendance}
              disabled={loading}
              className="main-button w-full md:w-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "20px" }}
                  className="w-5 h-5"
                  strokeWidth="8"
                />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create <IoIosCreate />
                </div>
              )}
            </button>
          </div>
        </section>

        <section className="w-full flex flex-col md:flex-row h-14 justify-between items-end mt-5 border-b gap-2">
          <div className="max-w-full md:max-w-8/12 flex flex-nowrap overflow-auto">
            {attendanceTables.data?.map((table, index) => (
              <button
                key={index}
                onClick={() => setSelectTable(table)}
                className={`px-3 w-max py-1 ${
                  selectTable?.id === table.id
                    ? "font-semibold border-b-2 border-b-black"
                    : ""
                }`}
              >
                <span className="w-max text-nowrap">{table.title}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <label className="flex flex-col">
              <span className="text-gray-400 text-xs">Start Date</span>
              <input
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
                className="main-input h-8"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-gray-400 text-xs">End Date</span>
              <input
                value={attendanceData.endDate}
                onChange={(e) =>
                  setAttendanceData((prev) => {
                    return {
                      ...prev,
                      endDate: e.target.value,
                    };
                  })
                }
                type="datetime-local"
                className="main-input h-8"
              />
            </label>
            <button
              onClick={() => setTriggerNote((prev) => !prev)}
              className="main-button flex items-center justify-center w-full md:w-36 h-8 ring-1 ring-blue-600"
            >
              {triggerNote ? (
                <div className="flex items-center justify-center gap-1">
                  <IoIosArrowBack />
                  Back
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <BiSolidNote />
                  Add Note
                </div>
              )}
            </button>
          </div>
        </section>
        <h2 className="w-full line-clamp-2 text-sm text-gray-400">
          {selectTable?.description}
        </h2>
        {loading && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
      </header>

      {triggerNote ? (
        <div className="h-full">
          <TextEditor
            value={attendanceData?.note}
            onChange={(content) =>
              setAttendanceData((prev) => {
                return {
                  ...prev,
                  note: content,
                };
              })
            }
          />
        </div>
      ) : (
        <div className="w-full max-h-full overflow-auto">
          <table className="table-fixed w-max min-w-full">
            <thead>
              <tr className="bg-gray-100 z-30 sticky top-0">
                <th className="sticky left-0 z-40 bg-gray-100">Name</th>
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
                <th className="z-10 bg-gray-100 text-sm sticky right-0">
                  <div className="flex items-center justify-center gap-1">
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
      )}
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
        className={` ${odd && "bg-gray-50"} border-spacing-2 border-4 border-transparent`}
      >
        <td
          className={`sticky left-0 z-10 ${odd ? "bg-gray-50" : "bg-white"}`}
        >
          <div className="flex w-80 gap-2">
            <div className="w-10 h-10 relative rounded-md ring-1 overflow-hidden">
              <Image
                src={student.photo}
                alt={student.firstName}
                fill
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
        <td className={`z-10 ${odd ? "bg-gray-50" : "bg-white"} sticky right-0`}>
          <textarea
            value={student.note}
            onChange={(e) =>
              handleNoteChange({
                studentId: student.id,
                note: e.target.value,
              })
            }
            className="main-input w-full h-10 resize-none"
          />
        </td>
      </tr>
    );
  }
);
StudentAttendanceItem.displayName = "StudentAttendanceItem";
