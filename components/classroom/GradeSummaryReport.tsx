import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { defaultBlurHash } from "../../data";
import {
  classroomUiLanguage,
  gradeOnClassroomDataLanguage,
  subjectsDataLanguage,
} from "../../data/languages";
import { Classroom, EducationYear, Student } from "../../interfaces";
import {
  useGetGradeSummaryReportOnClassroom,
  useGetLanguage,
} from "../../react-query";
import { decodeBlurhashToCanvas, getDefaultSubjectFilter } from "../../utils";
import { sortStudents } from "../../utils/studentRoster";
import InputEducationYear from "../common/InputEducationYear";
import LoadingBar from "../common/LoadingBar";

function GradeSummaryReport({
  students,
  classroom,
}: {
  students: Student[];
  classroom: Classroom;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [educationYear, setEducationYear] = useState<EducationYear | undefined>();
  const grades = useGetGradeSummaryReportOnClassroom({
    classId: classroom.id,
    educationYear: educationYear as EducationYear,
  });
  const sortedStudents = useMemo(
    () => sortStudents(students, "Default"),
    [students],
  );

  useEffect(() => {
    const defaultFilter = getDefaultSubjectFilter({
      schoolId: classroom.schoolId,
    });
    if (defaultFilter) {
      setEducationYear(defaultFilter.educationYear);
    } else {
      setEducationYear(`1/${new Date().getFullYear()}` as EducationYear);
    }
  }, [classroom.schoolId]);

  const subjects = grades.data ?? [];

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-icon-color">
            {gradeOnClassroomDataLanguage.title(lang)}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-icon-color/70">
            {gradeOnClassroomDataLanguage.description(lang)}
          </p>
        </div>
        {educationYear && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-icon-color">
              {subjectsDataLanguage.educationYear(lang)}
            </span>
            <InputEducationYear
              value={educationYear}
              onChange={(value) => setEducationYear(value as EducationYear)}
              required
            />
          </div>
        )}
      </div>

      {grades.isLoading && <LoadingBar />}

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]">
        {!grades.isLoading && subjects.length === 0 ? (
          <p className="px-6 py-10 text-center text-icon-color/70">
            {classroomUiLanguage.noGrades(lang)}
          </p>
        ) : (
          <div className="max-h-[calc(100dvh-12rem)] min-h-[20rem] overflow-auto">
            <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 top-0 z-30 border-b border-icon-color/10 bg-white px-4 py-3 text-left font-semibold text-icon-color"
                  >
                    {classroomUiLanguage.studentColumn(lang)}
                  </th>
                  {subjects.map((subject) => (
                    <th
                      key={subject.id}
                      scope="col"
                      className="sticky top-0 z-20 border-b border-icon-color/10 bg-white px-4 py-3 text-left align-bottom font-normal"
                    >
                      <div className="w-40">
                        <Link
                          href={`/subject/${subject.id}`}
                          className="line-clamp-2 font-semibold text-primary-color hover:underline"
                        >
                          {subject.title}
                        </Link>
                        {subject.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-icon-color/60">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  const zebra = index % 2 === 1 ? "bg-background-color" : "bg-white";
                  return (
                    <tr key={student.id}>
                      <th
                        scope="row"
                        className={`sticky left-0 z-10 px-4 py-2 text-left font-normal ${zebra}`}
                      >
                        <div className="flex w-44 items-center gap-2 sm:w-60">
                          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-background-color ring-1 ring-icon-color/10">
                            {student.photo && (
                              <Image
                                src={student.photo}
                                alt=""
                                fill
                                sizes="32px"
                                placeholder="blur"
                                blurDataURL={decodeBlurhashToCanvas(
                                  student.blurHash ?? defaultBlurHash,
                                )}
                                className="object-cover"
                              />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-icon-color">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-xs text-icon-color/60">
                              {classroomUiLanguage.studentNumber(lang, student.number)}
                            </span>
                          </span>
                        </div>
                      </th>
                      {subjects.map((subject) => {
                        const score = subject.students.find(
                          (item) => item.id === student.id,
                        )?.totalScore;
                        return (
                          <td
                            key={subject.id + student.id}
                            className={`px-4 py-2 tabular-nums text-icon-color ${zebra}`}
                          >
                            {typeof score === "number" ? score.toFixed(2) : "–"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default GradeSummaryReport;
