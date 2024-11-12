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
import { IoIosCreate } from "react-icons/io";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
type Props = {
  subjectId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
};
function AttendanceChecker({ subjectId, onClose, toast }: Props) {
  const queryClient = useQueryClient();
  const [selectTable, setSelectTable] = React.useState<
    | (AttendanceTable & {
        statusList: AttendanceStatusList[];
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

  const handleCheck = ({
    studentId,
    key,
    check,
  }: {
    studentId: string;
    key: string;
    check: boolean;
  }) => {
    setStudentAttendances((prev) => {
      if (!prev) return null;
      return prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            status: key,
          };
        }
        return student;
      });
    });
  };

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
    <div className="w-full h-full flex flex-col gap-1">
      <header className="">
        <section className="w-full flex justify-between items-center gap-2">
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
              className="main-button w-40 flex items-center justify-center gap-2"
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

        <section className="w-full flex h-14 justify-between mt-5 border-b  gap-2">
          <div className="max-w-8/12 flex flex-nowrap overflow-auto  ">
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
          <div className="flex gap-2">
            <label className=" flex flex-col">
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
                    const plusOneHour = `${datePart}T${hours + 1}:${minutes}`;
                    return {
                      ...prev,
                      startDate: e.target.value,
                      endDate: plusOneHour,
                    };
                  })
                }
                type="datetime-local"
                className="main-input h-8 "
              />
            </label>
            <label className=" flex flex-col">
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
                className="main-input h-8 "
              />
            </label>
          </div>
        </section>
      </header>
      {loading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      <main className="flex flex-col gap-2">
        <h2 className="w-full line-clamp-2 text-sm text-gray-400">
          {selectTable?.description}
        </h2>
        <li className="p-2  gap-2 grid bg-gray-200/50 grid-cols-9">
          <div className="col-span-2 flex items-center">Name</div>
          {selectTable?.statusList.map((status, index) => {
            return (
              <button
                key={status.id}
                onClick={(e) =>
                  handleCheckAll({ key: e.currentTarget.name, check: true })
                }
                style={{ backgroundColor: status.color }}
                name={status.title}
                className={`text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
            transition hover:text-black
           flex items-center justify-center gap-1`}
              >
                {status.title} <TbSelectAll />
              </button>
            );
          })}

          <button
            onClick={() => setTriggerNote((prev) => !prev)}
            name="note"
            className="col-span-2 border-2 ring-2 font-medium rounded-md h-full p-2 bg-white
           flex items-center justify-center gap-1"
          >
            {triggerNote ? "Close Note" : "Add Note"}
          </button>
        </li>
        {triggerNote ? (
          <div className="h-72">
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
          <ul className="grid  grid-cols-1 max-h-72 hideScrollBar overflow-auto">
            {studentAttendances
              ?.filter((s) => s.isActive)
              .sort((a, b) => Number(a.number) - Number(b.number))
              .map((student, index) => {
                const odd = index % 2 === 0;
                return (
                  <li
                    key={student.id}
                    className={`${
                      index === 0 && "pt-0"
                    } p-2 py-4 gap-2 grid grid-cols-9 ${
                      odd && "bg-gray-200/20"
                    }`}
                  >
                    <div className="flex gap-2 col-span-2">
                      <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                        <Image
                          src="/favicon.ico"
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
                        <p className="text-xs text-gray-500">
                          Number {student.number}{" "}
                        </p>
                      </div>
                    </div>
                    {selectTable?.statusList.map((status, index) => {
                      return (
                        <div
                          key={student.id + status.id}
                          className="w-full flex justify-center items-center "
                        >
                          <input
                            name={status.title}
                            checked={student.status === status.title}
                            onChange={(e) =>
                              handleCheck({
                                studentId: student.id,
                                key: e.target.name,
                                check: e.target.checked,
                              })
                            }
                            style={{ accentColor: status.color }}
                            type="checkbox"
                            className="w-6 h-6 "
                          />
                        </div>
                      );
                    })}

                    <textarea
                      value={student.note}
                      onChange={(e) =>
                        setStudentAttendances((prev) => {
                          if (!prev) return null;
                          return prev.map((s) => {
                            if (s.id === student.id) {
                              return {
                                ...s,
                                note: e.target.value,
                              };
                            }
                            return s;
                          });
                        })
                      }
                      className="main-input col-span-2 h-10 resize-none"
                    />
                  </li>
                );
              })}
          </ul>
        )}
      </main>
    </div>
  );
}

export default AttendanceChecker;
