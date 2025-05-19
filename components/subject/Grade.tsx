import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { SiMicrosoftexcel } from "react-icons/si";
import {
  useGetAssignmentOverview,
  useGetLanguage,
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
import { MdMoodBad } from "react-icons/md";
import { FaCheckSquare } from "react-icons/fa";
import { gradeData } from "../../data/languages";

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
  const language = useGetLanguage();
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
      link.download = `grade.xlsx`;
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
          <div className="h-max w-max rounded-md border bg-background-color p-2">
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

      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
        <section className="text-center md:text-left">
          <h1 className="text-2xl font-semibold md:text-3xl">
            {gradeData.title(language.data ?? "en")}
          </h1>
          <span className="text-sm text-gray-400 md:text-base">
            {gradeData.description(language.data ?? "en")}
          </span>
        </section>
        <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
          <button
            onClick={() => setTriggerGradeSetting(true)}
            className="main-button flex w-max items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
          >
            <>
              <IoMdSettings />
              {gradeData.setting(language.data ?? "en")}
            </>
          </button>
          <button
            disabled={loading}
            onClick={handleExportExcel}
            className="main-button flex w-32 items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
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
      <main className="mx-auto mt-5 flex w-full flex-col items-center md:max-w-screen-md md:px-0 xl:max-w-screen-lg">
        <div className="relative mt-5 h-[30rem] w-full overflow-auto rounded-md bg-white px-2">
          <table className="table-fixed bg-white md:min-w-[640px]">
            <thead className="">
              <tr className="sticky top-0 z-40 border-b bg-white">
                <th className="sticky left-0 z-40 bg-white text-sm font-semibold">
                  <div className="flex w-48 items-center justify-start gap-2 md:w-96">
                    <FaUser />
                    Name
                  </div>
                </th>
                {assignmentsOverview.isLoading
                  ? [...Array(20)].map((_, index) => {
                      const number = getRandomSlateShade();
                      const color = getSlateColorStyle(number);
                      return (
                        <th key={index} className="text-sm font-semibold">
                          <div
                            style={color}
                            className="h-14 w-40 animate-pulse"
                          ></div>
                        </th>
                      );
                    })
                  : [
                      assignmentsOverview.data?.assignments.map((data) => {
                        return (
                          <th
                            key={data.assignment.id}
                            className="group text-sm font-semibold"
                          >
                            <button
                              onClick={() =>
                                setSelectStudentOnAssignment({
                                  assignment: data.assignment,
                                })
                              }
                              className="relative flex w-52 min-w-52 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200 group-hover:w-max"
                            >
                              <span className="w-max max-w-40 truncate group-hover:max-w-none">
                                {data.assignment.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                {data.assignment.maxScore}{" "}
                                {gradeData.score(language.data ?? "en")}
                                {data.assignment.weight !== null &&
                                  ` / ${
                                    data.assignment.weight
                                  }% ${gradeData.weight(
                                    language.data ?? "en",
                                  )}`}
                              </span>
                              <div className="rounded-md bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 text-xs text-white">
                                {gradeData.assignment_score(
                                  language.data ?? "en",
                                )}{" "}
                              </div>
                            </button>
                          </th>
                        );
                      }),
                      assignmentsOverview.data?.scoreOnSubjects.map((data) => {
                        return (
                          <th
                            key={data.scoreOnSubject.id}
                            className="group text-sm font-semibold"
                          >
                            <button className="relative flex w-40 min-w-40 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200 group-hover:w-max">
                              <span className="w-max max-w-40 truncate group-hover:max-w-none">
                                {data.scoreOnSubject.title}
                              </span>
                              <div className="gradient-bg rounded-md px-2 text-xs text-white">
                                {gradeData.speical_score(
                                  language.data ?? "en",
                                )}{" "}
                              </div>
                            </button>
                          </th>
                        );
                      }),
                    ]}
                <th className="group text-sm font-semibold">
                  <div className="relative flex w-40 min-w-40 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200 group-hover:w-max">
                    <span className="w-max max-w-40 truncate group-hover:max-w-none">
                      Total Score
                    </span>
                    <span className="text-xs text-gray-500">
                      student total score
                    </span>
                  </div>
                </th>
                <th className="group text-sm font-semibold">
                  <div className="relative flex w-40 min-w-40 flex-col items-start p-2 hover:bg-gray-100 hover:ring-1 active:bg-gray-200 group-hover:w-max">
                    <span className="w-max max-w-40 truncate group-hover:max-w-none">
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
                  let totalScore =
                    assignmentsOverview.data?.assignments.reduce(
                      (prev, current) => {
                        let score =
                          current.students.find(
                            (s) => s.studentOnSubjectId === student.id,
                          )?.score ?? 0;
                        if (current.assignment.weight !== null) {
                          const originalScore =
                            score / current.assignment.maxScore;
                          score = originalScore * current.assignment.weight;
                        }

                        return prev + score;
                      },
                      0,
                    ) ?? 0;

                  totalScore =
                    assignmentsOverview.data?.scoreOnSubjects.reduce(
                      (prev, scoreOnSubject) => {
                        const summaryScore = scoreOnSubject.students.reduce(
                          (prev, studentOnScore) => {
                            if (
                              studentOnScore.studentOnSubjectId === student.id
                            ) {
                              return (prev += studentOnScore.score);
                            }
                            return prev;
                          },
                          0,
                        );

                        return (prev += summaryScore);
                      },
                      totalScore,
                    ) ?? 0;

                  const grade = calulateGrade(
                    assignmentsOverview.data?.grade?.gradeRules ??
                      defaultGradeRule,
                    totalScore,
                  );
                  return (
                    <tr
                      className={` ${
                        odd ? "bg-gray-200/20" : "bg-white"
                      } group hover:bg-gray-200/40`}
                      key={student.id}
                    >
                      <td
                        className={`sticky left-0 z-30 text-sm font-semibold ${
                          odd ? "bg-gray-100" : "bg-white"
                        } group-hover:bg-gray-200`}
                      >
                        <div className="flex h-14 items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-md ring-1 md:h-10 md:w-10">
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
                            <h1 className="text-xs font-semibold md:text-sm">
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
                                  className="flex h-14 w-full animate-pulse"
                                ></div>
                              </td>
                            );
                          })
                        : [
                            assignmentsOverview.data?.assignments
                              .filter((a) => a.assignment.type !== "Material")
                              .map((data, index) => {
                                const studentOnAssignment = data.students.find(
                                  (a) => a.studentOnSubjectId === student.id,
                                );
                                if (!studentOnAssignment) {
                                  return (
                                    <td key={data.assignment.id + student.id}>
                                      <button className="relative flex h-14 w-full cursor-pointer select-none flex-col items-center justify-center bg-black text-white ring-black transition hover:ring-1 hover:drop-shadow-md">
                                        NO DATA
                                      </button>
                                    </td>
                                  );
                                }

                                let score:
                                  | number
                                  | "No Work"
                                  | "Not Graded"
                                  | string = 0;

                                if (studentOnAssignment.status === "REVIEWD") {
                                  score = studentOnAssignment.score;
                                }
                                if (studentOnAssignment.status === "PENDDING") {
                                  score = "No Work";
                                }
                                if (
                                  studentOnAssignment.status === "SUBMITTED"
                                ) {
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
                                      data.assignment.id +
                                      studentOnAssignment.id
                                    }
                                    className="text-sm font-semibold"
                                  >
                                    <button
                                      onClick={() => {
                                        setSelectStudentOnAssignment({
                                          assignment: data.assignment,
                                          studentOnAssignment,
                                        });
                                      }}
                                      className="h-14 w-full"
                                    >
                                      {score === "No Work" ? (
                                        <div className="relative flex h-14 w-full cursor-pointer select-none flex-col items-center justify-center bg-red-500 text-white ring-red-500 transition hover:ring-1 hover:drop-shadow-md">
                                          <span>
                                            {gradeData.no_work(
                                              language.data ?? "en",
                                            )}
                                          </span>
                                          <MdMoodBad />
                                        </div>
                                      ) : score === "Not Graded" ? (
                                        <div className="relative flex h-14 w-full cursor-pointer select-none flex-col items-center justify-center bg-orange-500 text-white ring-orange-500 transition hover:ring-1 hover:drop-shadow-md">
                                          <span>
                                            {gradeData.wait_reviewed(
                                              language.data ?? "en",
                                            )}
                                          </span>
                                          <FaCheckSquare />
                                        </div>
                                      ) : (
                                        <div className="relative flex h-14 w-full cursor-pointer flex-col items-center justify-center ring-black transition hover:ring-1 hover:drop-shadow-md">
                                          <span>{score}</span>
                                        </div>
                                      )}
                                    </button>
                                  </td>
                                );
                              }),
                            assignmentsOverview.data?.scoreOnSubjects.map(
                              (data) => {
                                const scoreOnStudents = data.students.filter(
                                  (s) => s.studentOnSubjectId === student.id,
                                );

                                if (scoreOnStudents.length === 0) {
                                  return (
                                    <td
                                      key={data.scoreOnSubject.id + student.id}
                                    >
                                      <button className="relative flex h-14 w-full cursor-pointer select-none flex-col items-center justify-center bg-black text-white ring-black transition hover:ring-1 hover:drop-shadow-md">
                                        NO DATA
                                      </button>
                                    </td>
                                  );
                                }

                                const totalScore = scoreOnStudents.reduce(
                                  (previousValue, current) => {
                                    return (previousValue += current.score);
                                  },
                                  0,
                                );
                                return (
                                  <td
                                    key={
                                      data.scoreOnSubject.id +
                                      scoreOnStudents[0].id
                                    }
                                    className="text-sm font-semibold"
                                  >
                                    <button className="relative flex h-14 w-full cursor-pointer flex-col items-center justify-center ring-black transition hover:ring-1 hover:drop-shadow-md">
                                      <span>{totalScore}</span>
                                    </button>
                                  </td>
                                );
                              },
                            ),
                          ]}
                      <td className="text-sm font-semibold">
                        <div className="relative flex h-14 w-full flex-col items-center justify-center ring-black">
                          <span>{totalScore.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="text-sm font-semibold">
                        <div className="relative flex h-14 w-full flex-col items-center justify-center ring-black">
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
