import React, { memo, useRef } from "react";
import {
  ErrorMessages,
  ScoreOnStudent,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import Image from "next/image";
import {
  useCreateScoreOnStudent,
  useGetScoreOnSubject,
} from "../../react-query";
import { IoStar } from "react-icons/io5";
import { InputNumber } from "primereact/inputnumber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateScoreOnStudentService,
  RequestCreateScoreOnStudentService,
} from "../../services";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useSound } from "../../hook";
import { decodeBlurhashToCanvas } from "../../utils";
import ScorePanel from "./ScorePanel";

type Props = {
  student: StudentOnSubject;
  toast: React.RefObject<Toast>;
};
function PopUpStudent({ student, toast }: Props) {
  const successSound = useSound("/sounds/ding.mp3");
  const failSound = useSound("/sounds/fail.mp3");
  const queryClient = useQueryClient();

  const createScoreOnStudent = useCreateScoreOnStudent();
  const scoreOnSubjects = useGetScoreOnSubject({
    subjectId: student.subjectId,
  });
  const [totalScore, setTotalScore] = React.useState<number>(
    student.totalSpeicalScore
  );

  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });

  const handleCreateScore = async () => {
    try {
      if (!selectScore?.score) {
        Swal.fire({
          title: "Score Not Found",
          text: "Please select score first",
          icon: "error",
        });
        return;
      }

      const data = await createScoreOnStudent.mutateAsync({
        request: {
          studentOnSubjectId: student.id,
          scoreOnSubjectId: selectScore?.score.id,
          score: selectScore?.inputScore,
        },
        studentOnSubject: student,
        totalScore: totalScore,
        queryClient,
      });

      setTotalScore((prev) => prev + data.score);
      if (data.score >= 0) {
        successSound?.play();
      } else {
        failSound?.play();
      }
      showSuccess();
    } catch (error) {
      console.log(error);
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

  const showSuccess = () => {
    toast.current?.show({
      severity: selectScore?.inputScore > 0 ? "success" : "error",
      summary: `${selectScore?.score?.title}`,
      detail: `${student.firstName} ${
        student.lastName
      } has been given a score ${(selectScore?.inputScore ?? 0) > 0 && "+"} ${
        selectScore?.inputScore
      }`,
      life: 3000,
    });
  };

  return (
    <section className="w-full border p-5 items-center flex flex-col md:flex-row gap-5 bg-background-color rounded-md">
      <div className="w-full md:w-40 h-max border bg-white rounded-md flex flex-col gap-1 items-center justify-center">
        <div className="w-full md:w-40 h-10 gradient-bg rounded-t-md flex items-center justify-center">
          <span className="text-white font-semibold text-lg">{totalScore}</span>
        </div>
        <div className="w-20 h-20 relative">
          <Image
            src={student.photo}
            alt="Student"
            fill
            className="rounded-full"
          />
        </div>
        <div className="w-full md:w-40 h-16 flex flex-col items-center justify-center">
          <span className="text-gray-800 font-semibold text-sm">
            {student.firstName} {student.lastName}
          </span>
          <span className="text-gray-500 text-xs">Number {student.number}</span>
        </div>
      </div>
      <ScorePanel
        scoreOnSubjects={scoreOnSubjects}
        onSelectScore={({ inputScore, score }) => {
          setSelectScore({ inputScore, score });
        }}
        selectScore={{
          score: selectScore?.score,
          inputScore: selectScore?.inputScore,
        }}
        isLoading={createScoreOnStudent.isPending}
        onCreateScore={handleCreateScore}
      />
    </section>
  );
}

export default memo(PopUpStudent);
