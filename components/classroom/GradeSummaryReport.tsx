import React, { useState } from "react";
import { SiMicrosoftexcel } from "react-icons/si";
import { Classroom, EducationYear, Student } from "../../interfaces";
import { FaUser } from "react-icons/fa6";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
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
  const langugae = useGetLanguage();
  const [educationYear, setEducationYear] = useState<EducationYear>(() => {
    const year = new Date().getFullYear();
    return `1/${year}`;
  });
  const grades = useGetGradeSummaryReportOnClassroom({
    classId: classroom.id,
    educationYear: educationYear,
  });
  return (
    <>
      <header
        className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 
        md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
      >
        <section className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold">
            {gradeOnClassroomDataLanguage.title(langugae.data ?? "en")}
          </h1>
          <p className="text-gray-400 max-w-96 break-words text-sm md:text-base">
            {gradeOnClassroomDataLanguage.description(langugae.data ?? "en")}
          </p>
        </section>
        <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
          {/* <button className="main-button w-full xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600">
            <SiMicrosoftexcel />
            Export
          </button> */}
          <div>
            <span>
              {subjectsDataLanguage.educationYear(langugae.data ?? "en")}
            </span>
            <InputEducationYear
              value={educationYear}
              onChange={(v) => setEducationYear(v as EducationYear)}
              required
            />
          </div>
        </section>
      </header>
      {grades.isLoading && <LoadingBar />}
      <main
        className="w-full flex flex-col md:flex-row justify-between p-3 bg-white rounded-md 
        md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
      >
        <div className="w-full h-[30rem] overflow-auto relative rounded-md mt-5">
          <table className="table-fixed bg-white md:min-w-[640px]">
            <thead className="">
              <tr className="border-b  bg-white sticky top-0 z-40">
                <th className="text-sm z-40 sticky left-0 bg-white font-semibold">
                  <div className="w-48 md:w-96 flex justify-start items-center gap-2">
                    <FaUser />
                    Name
                  </div>
                </th>
                {grades.data?.map((grade) => {
                  return (
                    <th key={grade.id}>
                      <div className="flex items-start hover:w-max w-44  truncate flex-col gap-1">
                        <Link
                          href={`/subject/${grade.id}`}
                          className="text-xs underline text-blue-700 md:text-sm truncate w-40 font-semibold text-start"
                        >
                          {grade.title}
                        </Link>
                        <p className="text-xs font-normal hover:line-clamp-none text-start line-clamp-2 text-gray-500">
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
                      } hover:bg-gray-200/40 group`}
                      key={student.id}
                    >
                      <td
                        className={`text-sm sticky left-0 z-30 font-semibold
                  ${odd ? "bg-gray-100" : "bg-white"} group-hover:bg-gray-200
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
                      {grades.data?.map((grades) => {
                        const studentGrade = grades.students.find(
                          (s) => s.id === student.id
                        );
                        return (
                          <td
                            key={grades.id + student.id}
                            className={`text-sm font-normal text-center group-hover:bg-gray-200
                            ${odd ? "bg-gray-100" : "bg-white"}
                            `}
                          >
                            <div className="w-44 text-center">
                              {studentGrade?.totalScore.toFixed(2) ?? "-"}
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
