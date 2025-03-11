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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-md flex justify-center items-center z-50">
      <div
        ref={divRef}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
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
        <h2 className="text-xl font-bold mb-4">
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
