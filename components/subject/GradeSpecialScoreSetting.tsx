import { Toast } from "primereact/toast";
import {
  ErrorMessages,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import React, { useEffect, useRef } from "react";
import { useCreateCustomScoreOnStudent } from "../../react-query";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import InputNumber from "../common/InputNumber";

type PropsGradeSpecialScoreSetting = {
  toast: React.RefObject<Toast>;
  onClose: () => void;
  studentSubject: StudentOnSubject;
  scoreOnSubject: ScoreOnSubject;
};

export function GradeSpecialScoreSetting({
  toast,
  onClose,
  studentSubject,
  scoreOnSubject,
}: PropsGradeSpecialScoreSetting) {
  const refInput = useRef<HTMLInputElement>(null);
  const [score, setScore] = React.useState<number | undefined>();
  const update = useCreateCustomScoreOnStudent();
  const handleUpdate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        score: score ?? 0,
        scoreOnSubjectId: scoreOnSubject.id,
        studentOnSubjectId: studentSubject.id,
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refInput.current?.focus();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  return (
    <form
      onSubmit={handleUpdate}
      className="flex h-max w-96 flex-col gap-1 rounded-md border bg-gray-100 p-3"
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
              src={studentSubject.photo}
              alt="Student"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-full"
            />
          </div>
          <div className="flex h-16 w-full flex-col items-center justify-center md:w-40">
            <span className="text-sm font-semibold text-gray-800">
              {studentSubject.firstName} {studentSubject.lastName}
            </span>
            <span className="text-xs text-gray-500">
              Number {studentSubject.number}
            </span>
          </div>
        </div>
        <div className="flex w-80 flex-col gap-5">
          <div className="flex flex-col gap-0">
            <h1 className="max-w-60 truncate">{scoreOnSubject.title}</h1>
            <span className="text-xs text-gray-500">
              Update Score{" "}
              {scoreOnSubject.weight && `/ ${scoreOnSubject.weight}% weight `}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="w-full">
              <InputNumber
                inputRef={refInput}
                onValueChange={(value) => {
                  setScore(value);
                }}
                required
                maxFractionDigits={3}
                value={score}
                placeholder={"Enter custom score"}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default GradeSpecialScoreSetting;
