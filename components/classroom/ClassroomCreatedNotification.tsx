import React from "react";
import { useRouter } from "next/router";
import { FiArrowRight } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { MdCheck } from "react-icons/md";
import { classesDataLanguage, classroomUiLanguage } from "../../data/languages";
import { Classroom } from "../../interfaces";
import { useGetLanguage } from "../../react-query";

type Props = {
  classroom: Classroom;
  schoolId: string;
  onClose: () => void;
};

function ClassroomCreatedNotification({ classroom, schoolId, onClose }: Props) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  const handleGoToSubjects = () => {
    router.push(`/school/${schoolId}?menu=Subjects`);
    onClose();
  };

  return (
    <div className="w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-white p-5 font-Anuphan shadow-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-color text-xl text-white">
          <MdCheck aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-icon-color">
            {classesDataLanguage.successTitle(lang)}
          </p>
          <p className="truncate text-sm text-icon-color/60">{classroom.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={classroomUiLanguage.close(lang)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-icon-color/70 transition-colors hover:bg-background-color"
        >
          <IoMdClose aria-hidden />
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-icon-color/80">
        {classesDataLanguage.successCalloutBody(lang)}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl border border-icon-color/15 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
        >
          {classesDataLanguage.successSkip(lang)}
        </button>
        <button
          type="button"
          onClick={handleGoToSubjects}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-color text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover"
        >
          {classesDataLanguage.successCreateSubject(lang)}
          <FiArrowRight aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default ClassroomCreatedNotification;
