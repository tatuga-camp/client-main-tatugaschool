import React from "react";
import InviteJoinSchool from "./InviteJoinSchool";
import useClickOutside from "../../hook/useClickOutside";
import { useGetLanguage } from "../../react-query";
import { schoolDataLanguage } from "../../data/languages";

interface InviteJoinSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

const InviteJoinSchoolModal: React.FC<InviteJoinSchoolModalProps> = ({
  isOpen,
  onClose,
  schoolId,
}) => {
  const lanague = useGetLanguage();
  const divRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(divRef, () => {
    onClose();
  });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-md">
      <div
        ref={divRef}
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="mb-4 text-xl font-bold">
          {schoolDataLanguage.inviteTitle(lanague.data ?? "en")}
        </h2>
        <InviteJoinSchool schoolId={schoolId} hideFinishButton={true} />

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="main-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteJoinSchoolModal;
