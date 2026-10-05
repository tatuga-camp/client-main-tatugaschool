import Image from "next/image";
import React from "react";
import { MdDelete, MdOutlinePassword } from "react-icons/md";
import { SiGooglegemini } from "react-icons/si";
import { defaultBlurHash } from "../../data";
import { classroomUiLanguage } from "../../data/languages";
import { Student } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { studentDisplayName } from "../../utils/studentRoster";
import StudentSection from "./StudentSection";

export type StudentDetailsPanelProps = {
  student: Student;
  onChange: (
    data: Partial<{
      title: string;
      firstName: string;
      lastName: string;
      number: string;
      photo: string;
      hash: string;
    }>,
  ) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetPassword: () => void;
  resetting: boolean;
  onOpenCareer: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
};

const secondaryButton =
  "flex h-11 items-center justify-center gap-2 rounded-xl border border-icon-color/15 px-4 font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20 disabled:cursor-wait disabled:opacity-60";

// Rendered inside SlideLayout, which is a flex column: header, scrolling
// main, and a footer that stays in view.
function StudentDetailsPanel({
  student,
  onChange,
  onUpload,
  onResetPassword,
  resetting,
  onOpenCareer,
  onDelete,
  onCancel,
  onSave,
  saving,
}: StudentDetailsPanelProps) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-icon-color/10 px-4 pb-4 sm:px-6">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-background-color ring-1 ring-icon-color/10">
          {student.photo && (
            <Image
              src={student.photo}
              alt=""
              fill
              sizes="48px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-icon-color">
            {studentDisplayName(student)}
          </h2>
          <p className="text-sm text-icon-color/60">
            {classroomUiLanguage.studentNumber(lang, student.number)}
          </p>
        </div>
      </div>

      <div className="min-h-0 grow overflow-auto px-4 py-5 sm:px-6">
        <section aria-labelledby="student-panel-details">
          <h3
            id="student-panel-details"
            className="mb-4 text-sm font-bold text-icon-color"
          >
            {classroomUiLanguage.sectionDetails(lang)}
          </h3>
          <StudentSection
            idPrefix="edit-student"
            data={{
              title: student.title,
              firstName: student.firstName,
              lastName: student.lastName,
              number: student.number,
              photo: student.photo,
            }}
            setData={onChange}
            handleUpload={onUpload}
          />
        </section>

        <section
          aria-labelledby="student-panel-account"
          className="mt-8 border-t border-icon-color/10 pt-6"
        >
          <h3 id="student-panel-account" className="text-sm font-bold text-icon-color">
            {classroomUiLanguage.sectionAccount(lang)}
          </h3>
          <p className="mt-1 text-sm text-icon-color/60">
            {classroomUiLanguage.passwordHint(lang)}
          </p>
          <button
            type="button"
            onClick={onResetPassword}
            disabled={resetting}
            className={`${secondaryButton} mt-3`}
          >
            <MdOutlinePassword aria-hidden />
            {classroomUiLanguage.resetPassword(lang)}
          </button>
        </section>

        <section
          aria-labelledby="student-panel-career"
          className="mt-8 border-t border-icon-color/10 pt-6"
        >
          <h3 id="student-panel-career" className="text-sm font-bold text-icon-color">
            {classroomUiLanguage.sectionCareer(lang)}
          </h3>
          <p className="mt-1 text-sm text-icon-color/60">
            {classroomUiLanguage.careerSectionBody(lang, student.firstName)}
          </p>
          <button
            type="button"
            onClick={onOpenCareer}
            className={`${secondaryButton} mt-3`}
          >
            <SiGooglegemini aria-hidden />
            {classroomUiLanguage.openCareer(lang)}
          </button>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-icon-color/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={onDelete}
          className="flex h-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold text-error-color transition-colors hover:bg-error-color/10"
        >
          <MdDelete aria-hidden />
          {classroomUiLanguage.deleteStudent(lang)}
        </button>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={onCancel} className={secondaryButton}>
            {classroomUiLanguage.cancel(lang)}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            aria-busy={saving}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-wait disabled:opacity-80"
          >
            {saving
              ? classroomUiLanguage.saving(lang)
              : classroomUiLanguage.saveChanges(lang)}
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentDetailsPanel;
