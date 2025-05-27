import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React from "react";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import {
  Assignment,
  ErrorMessages,
  StudentOnAssignment,
} from "../../interfaces";
import {
  useUpdateAssignmentOverview,
  useUpdateStudentAssignmentOverview,
} from "../../react-query";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";
import Link from "next/link";

type Props = {
  toast: React.RefObject<Toast>;
  onClose: () => void;
  assignment: Assignment;
  studentOnAssignment: StudentOnAssignment | undefined;
};
function GradePopup({
  toast,
  onClose,
  assignment,
  studentOnAssignment,
}: Props) {
  const update = useUpdateAssignmentOverview();
  const [assignmentData, setAssignmentData] = React.useState<
    Assignment & { allowWeight: boolean }
  >({ ...assignment, allowWeight: assignment.weight !== null ? true : false });
  if (studentOnAssignment) {
    return (
      <StudentUpdateGrade
        toast={toast}
        onClose={onClose}
        assignment={assignment}
        studentOnAssignment={studentOnAssignment}
      />
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        query: {
          assignmentId: assignment.id,
        },
        data: {
          weight: assignmentData.weight,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Update Success",
        detail: "Assignment has been updated",
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
      className="flex h-max w-full min-w-96 flex-col items-start gap-2"
    >
      <div className="flex w-full items-center justify-end gap-2 border-b pb-2">
        {update.isPending ? (
          <div className="h-8">
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="h-5 w-5"
              strokeWidth="8"
            />
          </div>
        ) : (
          <button className="second-button flex h-8 items-center justify-center gap-1 border py-1">
            <CiSaveUp2 />
            Save Change
          </button>
        )}
        <button
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="flex w-full justify-center gap-3">
        <div className="flex w-80 flex-col gap-5">
          <div className="flex flex-col gap-0">
            <Link
              target="_blank"
              href={`/subject/${assignment.subjectId}/assignment/${assignment.id}`}
              className="max-w-60 truncate text-blue-700 underline"
            >
              {assignment.title}
            </Link>
            <span className="text-xs text-gray-500">
              Update Assignment Weight{" "}
              {assignment.weight && `/ ${assignment.weight}% weight `}
            </span>
          </div>

          <label className="flex w-full items-center justify-between gap-2">
            <span className="text-base font-medium">
              Allow Weight of Classwork
            </span>
            <Switch
              checked={assignmentData.allowWeight}
              setChecked={(e) => {
                setAssignmentData((prev) => {
                  return {
                    ...prev,
                    weight: e ? 0 : null,
                    allowWeight: e,
                  };
                });
              }}
            />
          </label>
          {assignmentData.allowWeight && (
            <label className="flex w-full flex-col">
              <span className="text-base font-medium">
                Weight of Classwork (Optional)
              </span>
              <InputNumber
                value={assignmentData?.weight || 0}
                max={100}
                suffix="%"
                min={0}
                required
                placeholder="percentage of classwork"
                onValueChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    weight: e,
                  })
                }
              />
            </label>
          )}
        </div>
      </div>
    </form>
  );
}

type PropsStudentUpdateGrade = {
  toast: React.RefObject<Toast>;
  onClose: () => void;
  assignment: Assignment;
  studentOnAssignment: StudentOnAssignment;
};

function StudentUpdateGrade({
  toast,
  onClose,
  assignment,
  studentOnAssignment,
}: PropsStudentUpdateGrade) {
  const [score, setScore] = React.useState<number | undefined>(
    studentOnAssignment.score,
  );
  const update = useUpdateStudentAssignmentOverview();

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
      className="flex h-max w-full flex-col items-start gap-2"
    >
      <div className="flex w-full items-center justify-end gap-2 border-b pb-2">
        {update.isPending ? (
          <div className="h-8">
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="h-5 w-5"
              strokeWidth="8"
            />
          </div>
        ) : (
          <button className="second-button flex h-8 items-center justify-center gap-1 border py-1">
            <CiSaveUp2 />
            Save Change
          </button>
        )}
        <button
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="flex w-full justify-between gap-3">
        <div className="flex w-40 flex-col items-center justify-center">
          <div className="relative h-20 w-20">
            <Image
              src={studentOnAssignment.photo}
              alt="Student"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-full"
            />
          </div>
          <div className="flex h-16 w-full flex-col items-center justify-center md:w-40">
            <span className="text-sm font-semibold text-gray-800">
              {studentOnAssignment.firstName} {studentOnAssignment.lastName}
            </span>
            <span className="text-xs text-gray-500">
              Number {studentOnAssignment.number}
            </span>
          </div>
        </div>
        <div className="flex w-80 flex-col gap-5">
          <div className="flex flex-col gap-0">
            <h1 className="max-w-60 truncate">{assignment.title}</h1>
            <span className="text-xs text-gray-500">
              Update Score{" "}
              {assignment.weight && `/ ${assignment.weight}% weight `}
            </span>
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

export default GradePopup;
