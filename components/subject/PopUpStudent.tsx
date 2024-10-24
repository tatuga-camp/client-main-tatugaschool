import React, { memo, useRef } from "react";
import {
  ErrorMessages,
  ScoreOnStudent,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import Image from "next/image";
import { getScoreOnSubject } from "../../react-query";
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

type Props = {
  student: StudentOnSubject;
};
function PopUpStudent({ student }: Props) {
  const successSound = useSound("/sounds/ding.mp3");
  const failSound = useSound("/sounds/fail.mp3");
  const queryClient = useQueryClient();
  const scoreOnSubjects = getScoreOnSubject({
    subjectId: student.subjectId,
  });
  const [totalScore, setTotalScore] = React.useState<number>(
    student.totalSpeicalScore
  );
  const scoreRef = React.useRef<HTMLButtonElement>(null);
  const toast = useRef<Toast>(null);

  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });

  const createScoreOnStudent = useMutation({
    mutationKey: ["createScoreOnStudent"],
    mutationFn: (request: RequestCreateScoreOnStudentService) =>
      CreateScoreOnStudentService(request),
    onSuccess(data, variables, context) {
      const newScore: StudentOnSubject = {
        ...student,
        totalSpeicalScore: totalScore + data.score,
      };

      queryClient.setQueryData(
        ["scoreOnStudents", { subjectId: student.subjectId }],
        (prev: ScoreOnStudent[]) => {
          return [...prev, data];
        }
      );

      queryClient.setQueryData(
        ["studentOnSubjects", { subjectId: student.subjectId }],
        (
          prev: (StudentOnSubject & {
            scores: ScoreOnStudent[];
            totalScore: number;
          })[]
        ) => {
          const newData = prev?.map((student) => {
            if (student.id === newScore.id) {
              return newScore;
            }
            return student;
          });
          return newData;
        }
      );
    },
  });

  const handleCreateScore = async () => {
    try {
      if (!selectScore?.score) {
        scoreRef.current?.style.setProperty("border", "1px solid red");
        scoreRef.current?.classList.add("scale-110");
        setTimeout(() => {
          scoreRef.current?.classList.remove("scale-110");
          scoreRef.current?.style.removeProperty("border");
        }, 100);
        return;
      }

      const data = await createScoreOnStudent.mutateAsync({
        studentOnSubjectId: student.id,
        scoreOnSubjectId: selectScore?.score.id,
        score: selectScore?.inputScore,
      });
      setTotalScore((prev) => prev + data.score);
      if (data.score >= 0) {
        successSound.play();
      } else {
        failSound.play();
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
    <section className="w-full border  p-5 items-center  flex gap-5  bg-background-color rounded-md">
      <Toast position="bottom-right" ref={toast} />

      <div className="w-40 h-max border bg-white rounded-md flex flex-col gap-1 items-center justify-center">
        <div className="w-40 h-10 gradient-bg rounded-t-md flex items-center justify-center">
          <span className="text-white font-semibold text-lg">{totalScore}</span>
        </div>
        <div className="w-20 h-20 relative">
          <Image
            src="/favicon.ico"
            alt="Student"
            fill
            className=" rounded-full"
          />
        </div>
        <div className="w-40 h-16 flex flex-col items-center justify-center">
          <span className="text-gray-800 font-semibold text-sm">
            {student.firstName} {student.lastName}
          </span>
          <span className="text-gray-500 text-xs">Number {student.number}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold border-b ">
          Give You Student A Score!
        </div>
        <ul className="grid max-h-48 p-2 overflow-auto grid-cols-4 gap-3">
          {scoreOnSubjects.isLoading
            ? [...Array(12)].map((_, index) => {
                return (
                  <div
                    key={index}
                    className="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse"
                  ></div>
                );
              })
            : scoreOnSubjects.data?.map((score, index) => {
                return (
                  <button
                    ref={index === 0 ? scoreRef : null}
                    onClick={() =>
                      setSelectScore(() => {
                        return {
                          score: score,
                          inputScore: score.score,
                        };
                      })
                    }
                    key={score.id}
                    className={` ${
                      selectScore?.score?.id === score.id &&
                      "gradient-bg ring-1 ring-black"
                    } p-2 bg-white active:gradient-bg transition rounded-md group hover:bg-secondary-color 
                         flex flex-col items-center justify-center gap-2`}
                  >
                    <div className="w-10 h-10 rounded-lg relative">
                      <Image
                        src={score.icon}
                        alt={score.title}
                        fill
                        className="object-contain"
                      />
                      <div
                        className={`min-w-5 max-w-10 truncate -top-2 -right-2 flex items-center justify-center z-20 absolute text-white h-5 rounded-full ${
                          score.score >= 0 ? "bg-green-400" : "bg-red-500"
                        } `}
                      >
                        {score.score}
                      </div>
                    </div>
                    <span
                      className={`text-xs w-20 break-words line-clamp-2
                     group-hover:text-white text-gray-500 ${
                       selectScore?.score?.id === score.id && "text-white"
                     }`}
                    >
                      {score.title}
                    </span>
                  </button>
                );
              })}
        </ul>
        <div className="flex gap-2">
          <InputNumber
            pt={{
              input: {
                root: { className: "w-60 h-10" },
              },
            }}
            style={{ width: "15rem" }}
            value={selectScore?.inputScore}
            onValueChange={(e) =>
              setSelectScore((prev) => {
                return { score: prev?.score, inputScore: e.value ?? 0 };
              })
            }
          />

          <button
            disabled={createScoreOnStudent.isPending}
            onClick={handleCreateScore}
            className="main-button w-56 flex items-center justify-center"
          >
            {createScoreOnStudent.isPending ? (
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="w-5 h-5"
                strokeWidth="8"
              />
            ) : (
              <div className=" flex items-center justify-center gap-1">
                Give Score <IoStar />
              </div>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(PopUpStudent);
