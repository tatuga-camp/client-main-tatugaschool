import React from "react";
import { StudentOnAssignment } from "../../interfaces";
import { studentWorkDataLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type Props = {
  studentOnAssignment: StudentOnAssignment;
};
function StatusAssignmentButton({ studentOnAssignment }: Props) {
  const language = useGetLanguage();
  return (
    <button
      type="button"
      className={`flex w-full items-center h-full 
              text-white py-2 rounded-md px-2 
  
              ${
                studentOnAssignment.status === "SUBMITTED" &&
                "bg-gradient-to-r from-amber-200 to-yellow-400"
              }
  
              ${
                studentOnAssignment.status === "REVIEWD" &&
                "bg-gradient-to-r from-emerald-400 to-cyan-400"
              }
  
              ${
                studentOnAssignment.status === "PENDDING" &&
                "bg-gradient-to-r from-stone-500 to-stone-700"
              }
              justify-center text-sm font-normal `}
    >
      {studentOnAssignment.status === "SUBMITTED" &&
        studentWorkDataLanguage.waitForReview(language.data ?? "en")}
      {studentOnAssignment.status === "REVIEWD" &&
        studentWorkDataLanguage.reviewed(language.data ?? "en")}
      {studentOnAssignment.status === "PENDDING" &&
        studentWorkDataLanguage.noWork(language.data ?? "en")}
    </button>
  );
}

export default StatusAssignmentButton;
