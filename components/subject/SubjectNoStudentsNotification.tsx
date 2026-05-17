import React from "react";
import { useRouter } from "next/router";
import { IoMdClose } from "react-icons/io";
import { FiArrowRight } from "react-icons/fi";
import { BsPeople } from "react-icons/bs";
import { useGetLanguage, useGetSubject } from "../../react-query";
import { subjectDataLanguage } from "../../data/languages";

type Props = {
  subjectId: string;
  onClose: () => void;
};

function SubjectNoStudentsNotification({ subjectId, onClose }: Props) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const subject = useGetSubject({ subjectId });
  const classId = subject.data?.classId;

  const handleGoToClassroom = () => {
    if (!classId) return;
    router.push(`/classroom/${classId}`);
    onClose();
  };

  return (
    <div className="h-max w-96 overflow-hidden rounded-2xl border bg-white shadow-xl">
      <div className="gradient-bg flex items-start justify-between px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-lg">
            <BsPeople />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold">
              {subjectDataLanguage.noStudentsTitle(lang)}
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
          {subjectDataLanguage.noStudentsBody(lang)}
        </p>
      </div>
      <div className="flex gap-2 border-t bg-gray-50 p-3">
        <button
          type="button"
          onClick={onClose}
          className="second-button flex-1 rounded-full border py-2 text-sm"
        >
          {subjectDataLanguage.noStudentsLater(lang)}
        </button>
        <button
          type="button"
          onClick={handleGoToClassroom}
          disabled={!classId}
          className="main-button flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {subjectDataLanguage.goToClassroom(lang)}
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
}

export default SubjectNoStudentsNotification;
