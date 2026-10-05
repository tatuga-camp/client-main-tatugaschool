import Link from "next/link";
import { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import {
  subjectsDataLanguage,
  subjectUiLanguage,
} from "../../data/languages";
import { Classroom, EducationYear } from "../../interfaces";
import { useGetLanguage, useGetSubjectFromSchool } from "../../react-query";
import { getDefaultSubjectFilter } from "../../utils";
import { filterSubjects, sortSubjects } from "../../utils/subjectList";
import InputEducationYear from "../common/InputEducationYear";
import PopupLayout from "../layout/PopupLayout";
import SubjectCard from "../subject/SubjectCard";
import SubjectCreate from "../subject/SubjectCreate";

const panelClass =
  "rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]";

// Subjects whose student list comes from this classroom, for one education
// year. The API lists a school's subjects per year; we keep this classroom's.
function ClassroomSubjects({ classroom }: { classroom: Classroom }) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const toast = useRef<Toast>(null);
  const [educationYear, setEducationYear] = useState<EducationYear>();
  const [triggerCreate, setTriggerCreate] = useState(false);
  const subjects = useGetSubjectFromSchool({
    schoolId: classroom.schoolId,
    educationYear: educationYear as EducationYear,
  });

  useEffect(() => {
    const saved = getDefaultSubjectFilter({ schoolId: classroom.schoolId });
    setEducationYear(
      saved?.educationYear ??
        (`1/${new Date().getFullYear()}` as EducationYear),
    );
  }, [classroom.schoolId]);

  const classroomSubjects = useMemo(
    () =>
      sortSubjects(
        filterSubjects(subjects.data ?? [], { classId: classroom.id }),
        "Default",
      ),
    [subjects.data, classroom.id],
  );

  const closeCreate = () => {
    document.body.style.overflow = "auto";
    setTriggerCreate(false);
  };

  // Archived classrooms aren't offered by the create form, so don't offer
  // creating a subject for one.
  const createButton = !classroom.isAchieved && (
    <button
      type="button"
      onClick={() => setTriggerCreate(true)}
      disabled={!educationYear}
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30 disabled:opacity-60"
    >
      <FiPlus aria-hidden />
      {subjectsDataLanguage.create(lang)}
    </button>
  );

  let content: React.ReactNode;
  if (subjects.isLoading || !educationYear) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1].map((index) => (
          <div key={index} className={`${panelClass} h-64 animate-pulse`} />
        ))}
      </div>
    );
  } else if (classroomSubjects.length === 0) {
    content = (
      <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
        <p className="text-lg font-semibold text-icon-color">
          {subjectUiLanguage.classroomEmpty(lang, educationYear)}
        </p>
        <p className="max-w-sm text-sm text-icon-color/70">
          {subjectUiLanguage.classroomEmptyBody(lang)}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {createButton}
          <Link
            href={`/school/${classroom.schoolId}?menu=Subjects`}
            className="flex h-11 items-center rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
          >
            {subjectsDataLanguage.title(lang)}
          </Link>
        </div>
      </div>
    );
  } else {
    content = (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {classroomSubjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            teachers={subject.teachers}
            classroom={subject.class}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      {triggerCreate && educationYear && (
        <PopupLayout onClose={closeCreate}>
          <SubjectCreate
            toast={toast}
            schoolId={classroom.schoolId}
            educationYear={educationYear}
            defaultClassId={classroom.id}
            onClose={closeCreate}
          />
        </PopupLayout>
      )}
      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-icon-color">
              {subjectUiLanguage.subjectsHeading(lang, classroomSubjects.length)}
            </h2>
            <p className="mt-1 text-sm text-icon-color/70">
              {subjectUiLanguage.classroomSubjectsHint(lang)}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {educationYear && (
              <div className="flex flex-col gap-1.5 text-sm font-medium text-icon-color">
                {subjectsDataLanguage.educationYear(lang)}
                <InputEducationYear
                  value={educationYear}
                  onChange={(value) => setEducationYear(value as EducationYear)}
                  required
                />
              </div>
            )}
            {classroomSubjects.length > 0 && createButton}
          </div>
        </div>
        {content}
      </section>
    </>
  );
}

export default ClassroomSubjects;
