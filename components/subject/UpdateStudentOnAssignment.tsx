import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import {
  Assignment,
  ErrorMessages,
  StudentOnAssignment,
} from "../../interfaces";
import Image from "next/image";
import InputNumber from "../common/InputNumber";
import {
  useUpdateAssignmentOverview,
  useUpdateStudentOnAssignments,
} from "../../react-query";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";

type Props = {
  toast: React.RefObject<Toast>;
  onClose: () => void;
  assignment: Assignment;
  studentOnAssignment: StudentOnAssignment;
};
function UpdateStudentOnAssignment({
  toast,
  onClose,
  assignment,
  studentOnAssignment,
}: Props) {
  const [score, setScore] = React.useState<number | undefined>(
    studentOnAssignment.score
  );
  const update = useUpdateAssignmentOverview();

  const handleUpdate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        query: {
          studentOnAssignmentId: studentOnAssignment.id,
        },
        body: {
          score: score,
          status: "REVIEWD",
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Update Success",
        detail: "Score has been updated",
      });
      onClose();
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <form
      onSubmit={handleUpdate}
      className="w-full h-max flex flex-col gap-2 items-start"
    >
      <div className="flex gap-2 border-b pb-2 items-center w-full justify-end">
        {update.isPending ? (
          <div className="h-8">
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="w-5 h-5"
              strokeWidth="8"
            />
          </div>
        ) : (
          <button className="second-button h-8 flex items-center justify-center gap-1 py-1 border ">
            <CiSaveUp2 />
            Save Change
          </button>
        )}
        <button
          onClick={() => onClose()}
          className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="w-full flex justify-between gap-3 ">
        <div className="flex flex-col w-40 items-center justify-center">
          <div className="w-20 h-20 relative">
            <Image
              src={studentOnAssignment.photo}
              alt="Student"
              fill
              className="rounded-full"
            />
          </div>
          <div className="w-full md:w-40 h-16 flex flex-col items-center justify-center">
            <span className="text-gray-800 font-semibold text-sm">
              {studentOnAssignment.firstName} {studentOnAssignment.lastName}
            </span>
            <span className="text-gray-500 text-xs">
              Number {studentOnAssignment.number}
            </span>
          </div>
        </div>
        <div className="w-80 flex flex-col gap-5">
          <div className="flex flex-col gap-0">
            <h1 className="max-w-60 truncate">{assignment.title}</h1>
            <span className="text-xs text-gray-500">Update Score</span>
          </div>
          <div className="flex gap-2">
            <div className="w-full">
              <InputNumber
                onValueChange={(value) => {
                  setScore(value);
                }}
                required
                maxFractionDigits={3}
                value={score}
                min={0}
                placeholder={score ? "Enter score" : "Not graded"}
                suffix={`/${assignment.maxScore}`}
                max={assignment.maxScore}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default UpdateStudentOnAssignment;