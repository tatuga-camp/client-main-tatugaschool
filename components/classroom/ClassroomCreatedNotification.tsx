import React from "react";
import { useRouter } from "next/router";
import { IoMdClose } from "react-icons/io";
import { FiArrowRight } from "react-icons/fi";
import { useGetLanguage } from "../../react-query";
import { classesDataLanguage } from "../../data/languages";
import { Classroom } from "../../interfaces";

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
    <div className="h-max w-96 overflow-hidden rounded-2xl border bg-white shadow-xl">
      <div className="gradient-bg-success flex items-start justify-between px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-lg">
            ✓
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold">
              {classesDataLanguage.successTitle(lang)}
            </div>
            <div className="max-w-[220px] truncate text-xs opacity-90">
              {classroom.title}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-lg hover:bg-white/20"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-gray-700">
          {classesDataLanguage.successCalloutBody(lang)}
        </p>
      </div>
      <div className="flex gap-2 border-t bg-gray-50 p-3">
        <button
          type="button"
          onClick={onClose}
          className="second-button flex-1 rounded-full border py-2 text-sm"
        >
          {classesDataLanguage.successSkip(lang)}
        </button>
        <button
          type="button"
          onClick={handleGoToSubjects}
          className="main-button flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm"
        >
          {classesDataLanguage.successCreateSubject(lang)}
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
}

export default ClassroomCreatedNotification;
