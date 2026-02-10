import React, { useEffect, useState } from "react";
import { SiMicrosoftexcel } from "react-icons/si";
import { Classroom, EducationYear, Student } from "../../interfaces";
import { FaUser } from "react-icons/fa6";
import Image from "next/image";
import { decodeBlurhashToCanvas, getDefaultSubjectFilter } from "../../utils";
import { defaultBlurHash } from "../../data";
import {
  useGetGradeSummaryReportOnClassroom,
  useGetLanguage,
} from "../../react-query";
import {
  gradeOnClassroomDataLanguage,
  subjectsDataLanguage,
} from "../../data/languages";
import InputEducationYear from "../common/InputEducationYear";
import LoadingBar from "../common/LoadingBar";
import Link from "next/link";

function GradeSummaryReport({
  students,
  classroom,
}: {
  students: Student[];
  classroom: Classroom;
}) {
  const defaultFilter = getDefaultSubjectFilter({
    schoolId: classroom.schoolId,
  });

  const langugae = useGetLanguage();
  const [educationYear, setEducationYear] = useState<
    EducationYear | undefined
  >();
  const grades = useGetGradeSummaryReportOnClassroom({
    classId: classroom.id,
    educationYear: educationYear as EducationYear,
  });

  useEffect(() => {
    if (defaultFilter) {
      setEducationYear(defaultFilter.educationYear);
    } else {
      const year = new Date().getFullYear();
      setEducationYear(() => `1/${year}`);
    }
  }, []);

  return (
    <>
      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
        <section className="text-center md:text-left">
          <h1 className="text-2xl font-semibold md:text-3xl">
            {gradeOnClassroomDataLanguage.title(langugae.data ?? "en")}
          </h1>
          <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
            {gradeOnClassroomDataLanguage.description(langugae.data ?? "en")}
          </p>
        </section>
        <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
          {/* <button className="main-button w-full xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600">
            <SiMicrosoftexcel />
            Export
          </button> */}
          <div>
            <span>
              {subjectsDataLanguage.educationYear(langugae.data ?? "en")}
            </span>
            {educationYear && (
              <InputEducationYear
                value={educationYear}
                onChange={(v) => setEducationYear(v as EducationYear)}
                required
              />
            )}
          </div>
        </section>
      </header>
      {grades.isLoading && <LoadingBar />}
      <main className="mx-auto flex w-full flex-col justify-between gap-4 rounded-2xl bg-white p-3 md:max-w-screen-md md:flex-row md:gap-0 xl:max-w-screen-lg">
        <div className="relative mt-5 h-[30rem] w-full overflow-auto rounded-2xl">
          <table className="table-fixed bg-white md:min-w-[640px]">
            <thead className="">
              <tr className="sticky top-0 z-40 border-b bg-white">
                <th className="sticky left-0 z-40 bg-white text-sm font-semibold">
                  <div className="flex w-48 items-center justify-start gap-2 md:w-96">
                    <FaUser />
                    Name
                  </div>
                </th>
                {grades.data?.map((grade) => {
                  return (
                    <th key={grade.id}>
                      <div className="flex w-44 flex-col items-start gap-1 truncate hover:w-max">
                        <Link
                          href={`/subject/${grade.id}`}
                          className="w-40 truncate text-start text-xs font-semibold text-blue-700 underline md:text-sm"
                        >
                          {grade.title}
                        </Link>
                        <p className="line-clamp-2 text-start text-xs font-normal text-gray-500 hover:line-clamp-none">
                          {grade.description}
                        </p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {students
                ?.sort((a, b) => Number(a.number) - Number(b.number))
                ?.map((student, index) => {
                  const odd = index % 2 === 0;
                  return (
                    <tr
                      className={` ${
                        odd ? "bg-gray-200/20" : "bg-white"
                      } group hover:bg-gray-200/40`}
                      key={student.id}
                    >
                      <td
                        className={`sticky left-0 z-30 text-sm font-semibold ${odd ? "bg-gray-100" : "bg-white"} group-hover:bg-gray-200`}
                      >
                        <div className="flex h-14 items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-2xl ring-1 md:h-10 md:w-10">
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
                      {grades.data?.map((grades) => {
                        const studentGrade = grades.students.find(
                          (s) => s.id === student.id,
                        );
                        return (
                          <td
                            key={grades.id + student.id}
                            className={`text-center text-sm font-normal group-hover:bg-gray-200 ${odd ? "bg-gray-100" : "bg-white"} `}
                          >
                            <div className="w-44 text-center">
                              {studentGrade?.totalScore?.toFixed(2) ?? "-"}
                            </div>
                          </td>
                        );
                      })}
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

export default GradeSummaryReport;
