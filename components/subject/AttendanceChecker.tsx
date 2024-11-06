import React, { useEffect } from "react";
import {
  useGetAttendancesTable,
  useGetStudentOnSubject,
} from "../../react-query";
import { AttendanceTable, StudentOnSubject } from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { TbSelectAll } from "react-icons/tb";
type Props = {
  subjectId: string;
};
function AttendanceChecker({ subjectId }: Props) {
  const [selectTable, setSelectTable] = React.useState<AttendanceTable | null>(
    null
  );
  const [studentAttendances, setStudentAttendances] = React.useState<
    | (StudentOnSubject & {
        status: {
          absent: boolean;
          present: boolean;
          holiday: boolean;
          sick: boolean;
          late: boolean;
        };
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
          status: {
            absent: false,
            present: false,
            holiday: false,
            sick: false,
            late: false,
          },
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
          const updatedStatus = Object.keys(student.status).reduce((acc, k) => {
            acc[k as keyof typeof student.status] = false;
            return acc;
          }, {} as typeof student.status);

          // Set the selected key to `check` (true or false)
          updatedStatus[key as keyof typeof student.status] = check;

          return {
            ...student,
            status: updatedStatus,
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
        const updatedStatus = Object.keys(student.status).reduce((acc, k) => {
          acc[k as keyof typeof student.status] = false;
          return acc;
        }, {} as typeof student.status);

        // Set the selected key to `check` (true or false)
        updatedStatus[key as keyof typeof student.status] = check;
        return {
          ...student,
          status: updatedStatus,
        };
      });
    });
  };
  return (
    <div className="w-full h-full flex flex-col gap-1">
      <header className="">
        <h1 className="text-xl font-medium">Attendance Checker</h1>
        <span className="text-sm text-gray-500">
          You can check the attendance of the students here
        </span>

        <section className="w-full overflow-auto mt-5 border-b  gap-2">
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
        </section>
      </header>
      <main className="flex flex-col gap-2">
        <h2 className="w-full line-clamp-2 text-sm text-gray-400">
          {selectTable?.description}
        </h2>
        <li className="p-2 py-4 grid bg-gray-200/50 grid-cols-8">
          <div className="col-span-2">Name</div>
          <button
            onClick={(e) =>
              handleCheckAll({ key: e.currentTarget.name, check: true })
            }
            name="present"
            className="text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
             hover:bg-white transition hover:text-black
           flex items-center justify-center gap-1"
          >
            Present <TbSelectAll />
          </button>
          <button
            name="absent"
            onClick={(e) =>
              handleCheckAll({ key: e.currentTarget.name, check: true })
            }
            className="text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
             hover:bg-white transition hover:text-black
           flex items-center justify-center gap-1"
          >
            Absent <TbSelectAll />
          </button>
          <button
            onClick={(e) =>
              handleCheckAll({ key: e.currentTarget.name, check: true })
            }
            name="holiday"
            className="text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
             hover:bg-white transition hover:text-black
           flex items-center justify-center gap-1"
          >
            Holiday <TbSelectAll />
          </button>
          <button
            onClick={(e) =>
              handleCheckAll({ key: e.currentTarget.name, check: true })
            }
            name="sick"
            className="text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
             hover:bg-white transition hover:text-black
           flex items-center justify-center gap-1"
          >
            Sick <TbSelectAll />
          </button>
          <button
            onClick={(e) =>
              handleCheckAll({ key: e.currentTarget.name, check: true })
            }
            name="late"
            className="text-center select-none rounded-md hover:drop-shadow-md cursor-pointer active:scale-105
             hover:bg-white transition hover:text-black
           flex items-center justify-center gap-1"
          >
            Late <TbSelectAll />
          </button>
        </li>
        <ul className="grid grid-cols-1 max-h-72 overflow-auto">
          {studentAttendances
            ?.filter((s) => s.isActive)
            .sort(
              (a, b) =>
                a.number.localeCompare(a.number) -
                b.number.localeCompare(b.number)
            )
            .map((student, index) => {
              const odd = index % 2 === 0;
              return (
                <li
                  key={student.id}
                  className={`${
                    index === 0 && "pt-0"
                  } hover:bg-gray-300/30 p-2 grid grid-cols-8 ${
                    odd && "bg-gray-200/20"
                  } gap-2`}
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
                  <div className="w-full flex justify-center items-center ">
                    <input
                      name="present"
                      checked={student.status.present}
                      onChange={(e) =>
                        handleCheck({
                          studentId: student.id,
                          key: e.target.name,
                          check: e.target.checked,
                        })
                      }
                      type="checkbox"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="w-full flex justify-center items-center ">
                    <input
                      checked={student.status.absent}
                      onChange={(e) =>
                        handleCheck({
                          studentId: student.id,
                          key: e.target.name,
                          check: e.target.checked,
                        })
                      }
                      name="absent"
                      type="checkbox"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="w-full flex justify-center items-center ">
                    <input
                      checked={student.status.holiday}
                      onChange={(e) =>
                        handleCheck({
                          studentId: student.id,
                          key: e.target.name,
                          check: e.target.checked,
                        })
                      }
                      name="holiday"
                      type="checkbox"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="w-full flex justify-center items-center ">
                    <input
                      checked={student.status.sick}
                      onChange={(e) =>
                        handleCheck({
                          studentId: student.id,
                          key: e.target.name,
                          check: e.target.checked,
                        })
                      }
                      name="sick"
                      type="checkbox"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="w-full flex justify-center items-center ">
                    <input
                      checked={student.status.late}
                      onChange={(e) =>
                        handleCheck({
                          studentId: student.id,
                          key: e.target.name,
                          check: e.target.checked,
                        })
                      }
                      name="late"
                      type="checkbox"
                      className="w-6 h-6"
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      </main>
    </div>
  );
}

export default AttendanceChecker;
