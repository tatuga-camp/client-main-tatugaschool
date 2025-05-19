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
      className={`flex h-full w-full items-center rounded-md px-2 py-2 text-white ${
        studentOnAssignment.status === "SUBMITTED" &&
        "bg-gradient-to-r from-amber-200 to-yellow-400"
      } ${
        studentOnAssignment.status === "REVIEWD" &&
        "bg-gradient-to-r from-emerald-400 to-cyan-400"
      } ${
        studentOnAssignment.status === "PENDDING" &&
        "bg-gradient-to-r from-stone-500 to-stone-700"
      } ${
        studentOnAssignment.status === "IMPROVED" &&
        "bg-gradient-to-r from-red-400 to-rose-400"
      } justify-center text-sm font-normal`}
    >
      {studentOnAssignment.status === "SUBMITTED" &&
        studentWorkDataLanguage.waitForReview(language.data ?? "en")}
      {studentOnAssignment.status === "REVIEWD" &&
        studentWorkDataLanguage.reviewed(language.data ?? "en")}
      {studentOnAssignment.status === "PENDDING" &&
        studentWorkDataLanguage.noWork(language.data ?? "en")}
      {studentOnAssignment.status === "IMPROVED" &&
        studentWorkDataLanguage.improve(language.data ?? "en")}
    </button>
  );
}

export default StatusAssignmentButton;
