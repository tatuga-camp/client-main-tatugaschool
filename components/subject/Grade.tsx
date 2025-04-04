import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { SiMicrosoftexcel } from "react-icons/si";
import {
  useGetAssignmentOverview,
  useGetStudentOnSubject,
} from "../../react-query";
import {
  calulateGrade,
  decodeBlurhashToCanvas,
  defaultGradeRule,
  getRandomSlateShade,
  getSlateColorStyle,
} from "../../utils";
import Image from "next/image";
import { defaultBlurHash } from "../../data";
import { Assignment, GradeRule, StudentOnAssignment } from "../../interfaces";
import GradePopup from "./GradePopup";
import { Toast } from "primereact/toast";
import { ExportAssignmentService } from "@/services";
import LoadingSpinner from "../common/LoadingSpinner";
import { IoMdSettings } from "react-icons/io";
import PopupLayout from "../layout/PopupLayout";
import GradeSetting from "./GradeSetting";

function Grade({
  subjectId,
  toast,
}: {
  subjectId: string;
  toast: React.RefObject<Toast>;
}) {
  const [loading, setLoading] = React.useState(false);
  const assignmentsOverview = useGetAssignmentOverview({
    subjectId,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const [triggerGradeSetting, setTriggerGradeSetting] = useState(false);
  const handleExportExcel = async () => {
    try {
      setLoading(true);

      const response = await ExportAssignmentService({ subjectId });
      const link = document.createElement("a");
      link.href = response;
      link.download = `attendance.xlsx`;
      link.click();

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to download the file", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download the file",
        life: 3000,
      });
    }
  };
  const [selectStudentOnAssignment, setSelectStudentOnAssignment] =
    React.useState<{
      assignment: Assignment;
      studentOnAssignment?: StudentOnAssignment;
    } | null>(null);

  return (
    <>
      {selectStudentOnAssignment && (
        <PopupLayout
          onClose={() => {
            setSelectStudentOnAssignment(null);
          }}
        >
          <div className=" w-max h-max bg-background-color p-2 rounded-md border">
            {selectStudentOnAssignment && (
              <GradePopup
                studentOnAssignment={
                  selectStudentOnAssignment.studentOnAssignment
                }
                assignment={selectStudentOnAssignment.assignment}
                toast={toast}
                onClose={() => setSelectStudentOnAssignment(null)}
              />
            )}
          </div>
        </PopupLayout>
      )}

      {triggerGradeSetting && assignmentsOverview.data && (
        <PopupLayout onClose={() => setTriggerGradeSetting(false)}>
          <GradeSetting
            toast={toast}
            subjectId={subjectId}
            grade={assignmentsOverview.data?.grade}
            onClose={() => {
              setTriggerGradeSetting(false);
            }}
          />
        </PopupLayout>
      )}

      <header className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto">
        <section className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold">Grade Overview</h1>
          <span className="text-gray-400 text-sm md:text-base">
            You can view student grades here
          </span>
        </section>
        <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
          <button
            onClick={() => setTriggerGradeSetting(true)}
            className="main-button w-max
            flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            <>
              <IoMdSettings />
              Grade Setting
            </>
          </button>
          <button
            disabled={loading}
            onClick={handleExportExcel}
            className="main-button w-32
            flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SiMicrosoftexcel />
                Export
              </>
            )}
          </button>
        </section>
      </header>
      <main className="w-full mt-5 flex flex-col items-center md:px-0 md:max-w-screen-md xl:max-w-screen-lg mx-auto">
        <div className="w-full h-[30rem] px-2 overflow-auto relative bg-white rounded-md mt-5">
          <table className="table-fixed bg-white md:min-w-[640px]">
            <thead className="">
              <tr className="border-b  bg-white sticky top-0 z-40">
                <th className="text-sm z-40 sticky left-0 bg-white font-semibold">
                  <div className="w-48 md:w-96 flex justify-start items-center gap-2">
                    <FaUser />
                    Name
                  </div>
                </th>
                {assignmentsOverview.isLoading
                  ? [...Array(20)].map((_, index) => {
                      const number = getRandomSlateShade();
                      const color = getSlateColorStyle(number);
                      return (
                        <th key={index} className="text-sm  font-semibold">
                          <div
                            style={color}
                            className="w-40 h-14  animate-pulse"
                          ></div>
                        </th>
                      );
                    })
                  : assignmentsOverview.data?.assignments.map((data) => {
                      return (
                        <th
                          key={data.assignment.id}
                          className="text-sm group  font-semibold"
                        >
                          <button
                            onClick={() =>
                              setSelectStudentOnAssignment({
                                assignment: data.assignment,
                              })
                            }
                            className="w-40 min-w-40 group-hover:w-max  p-2 relative active:bg-gray-200
                           hover:bg-gray-100  hover:ring-1 flex items-start flex-col"
                          >
                            <span className="w-max group-hover:max-w-none max-w-40 truncate">
                              {data.assignment.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {data.assignment.maxScore} points
                              {data.assignment.weight !== null &&
                                ` / ${data.assignment.weight}% weight`}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                <th className="text-sm group  font-semibold">
                  <div
                    className="w-40 min-w-40 group-hover:w-max  p-2 relative active:bg-gray-200
                           hover:bg-gray-100  hover:ring-1 flex items-start flex-col"
                  >
                    <span className="w-max group-hover:max-w-none max-w-40 truncate">
                      Total Score
                    </span>
                    <span className="text-xs text-gray-500">
                      student total score
                    </span>
                  </div>
                </th>
                <th className="text-sm group  font-semibold">
                  <div
                    className="w-40 min-w-40 group-hover:w-max  p-2 relative active:bg-gray-200
                           hover:bg-gray-100  hover:ring-1 flex items-start flex-col"
                  >
                    <span className="w-max group-hover:max-w-none max-w-40 truncate">
                      Grade
                    </span>
                    <span className="text-xs text-gray-500">
                      show student grade
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {studentOnSubjects.data
                ?.filter((s) => s.isActive)
                ?.sort((a, b) => Number(a.number) - Number(b.number))
                ?.map((student, index) => {
                  const odd = index % 2 === 0;
                  const totalScore =
                    assignmentsOverview.data?.assignments.reduce(
                      (prev, current) => {
                        let score =
                          current.students.find(
                            (s) => s.studentOnSubjectId === student.id
                          )?.score ?? 0;
                        if (current.assignment.weight !== null) {
                          const originalScore =
                            score / current.assignment.maxScore;
                          score = originalScore * current.assignment.weight;
                        }

                        return prev + score;
                      },
                      0
                    ) ?? 0;
                  const grade = calulateGrade(
                    assignmentsOverview.data?.grade?.gradeRules ??
                      defaultGradeRule,
                    totalScore
                  );
                  return (
                    <tr
                      className={` ${
                        odd ? "bg-gray-200/20" : "bg-white"
                      } hover:bg-gray-200/40 group`}
                      key={student.id}
                    >
                      <td
                        className={`text-sm sticky left-0 z-30 font-semibold
                        ${
                          odd ? "bg-gray-100" : "bg-white"
                        } group-hover:bg-gray-200
                        `}
                      >
                        <div className="flex items-center h-14 gap-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 relative rounded-md ring-1 overflow-hidden">
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
                            <h1 className="text-xs md:text-sm font-semibold">
                              {student.firstName} {student.lastName}
                            </h1>
                            <p className="text-xs text-gray-500">
                              Number {student.number}
                            </p>
                          </div>
                        </div>
                      </td>
                      {assignmentsOverview.isLoading
                        ? [...Array(20)].map((_, index) => {
                            const number = getRandomSlateShade();
                            const color = getSlateColorStyle(number);
                            return (
                              <td key={index}>
                                <div
                                  style={color}
                                  className="flex w-full h-14 animate-pulse"
                                ></div>
                              </td>
                            );
                          })
                        : assignmentsOverview.data?.assignments
                            ?.sort(
                              (a, b) => a.assignment.order - b.assignment.order
                            )
                            .map((data, index) => {
                              const studentOnAssignment = data.students.find(
                                (a) => a.studentOnSubjectId === student.id
                              );
                              if (!studentOnAssignment) {
                                return (
                                  <td key={data.assignment.id + student.id}>
                                    <button
                                      className="flex w-full h-14
                               relative hover:ring-1  bg-black select-none
                                text-white ring-black hover:drop-shadow-md cursor-pointer   
                               items-center transition
                               justify-center flex-col"
                                    >
                                      NO DATA
                                    </button>
                                  </td>
                                );
                              }

                              let score: number | string = 0;

                              if (studentOnAssignment.status === "REVIEWD") {
                                score = studentOnAssignment.score;
                              }
                              if (studentOnAssignment.status === "PENDDING") {
                                score = "No Work";
                              }
                              if (studentOnAssignment.status === "SUBMITTED") {
                                score = "Not Graded";
                              }

                              if (
                                data.assignment.weight !== null &&
                                studentOnAssignment.status === "REVIEWD"
                              ) {
                                const originalScore =
                                  studentOnAssignment.score /
                                  data.assignment.maxScore;
                                score = (
                                  originalScore * data.assignment.weight
                                ).toFixed(2);
                              }
                              return (
                                <td
                                  key={
                                    data.assignment.id + studentOnAssignment.id
                                  }
                                  className="text-sm  font-semibold"
                                >
                                  <button
                                    onClick={() => {
                                      setSelectStudentOnAssignment({
                                        assignment: data.assignment,
                                        studentOnAssignment,
                                      });
                                    }}
                                    className="flex w-full h-14
                               relative hover:ring-1  ring-black hover:drop-shadow-md cursor-pointer   
                               items-center transition
                               justify-center flex-col"
                                  >
                                    <span>{score}</span>
                                  </button>
                                </td>
                              );
                            })}
                      <td className="text-sm  font-semibold">
                        <div
                          className="flex w-full h-14
                               relative  ring-black    
                               items-center 
                               justify-center flex-col"
                        >
                          <span>{totalScore.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="text-sm  font-semibold">
                        <div
                          className="flex w-full h-14
                               relative  ring-black    
                               items-center 
                               justify-center flex-col"
                        >
                          <span>{grade}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

export default Grade;
