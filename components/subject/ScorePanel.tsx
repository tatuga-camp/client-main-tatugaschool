import React from "react";
import { ScoreOnSubject } from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { IoStar } from "react-icons/io5";
import { UseQueryResult } from "@tanstack/react-query";

type Props = {
  scoreOnSubjects: UseQueryResult<ScoreOnSubject[], Error>;
  onSelectScore: ({
    score,
    inputScore,
  }: {
    score?: ScoreOnSubject;
    inputScore: number;
  }) => void;
  selectScore: { score?: ScoreOnSubject } & { inputScore: number };
  isLoading: boolean;
  onCreateScore: () => void;
};

function ScorePanel({
  scoreOnSubjects,
  onSelectScore,
  selectScore,
  isLoading,
  onCreateScore,
}: Props) {
  const scoreRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="text-lg font-semibold border-b">
        Give Your Student A Score!
      </div>
      <ul className="grid max-h-48 p-2 overflow-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                    onSelectScore({ score: score, inputScore: score.score })
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
                      placeholder="blur"
                      blurDataURL={decodeBlurhashToCanvas(score.blurHash)}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
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
      <div className="flex flex-col sm:flex-row gap-2">
        <InputNumber
          pt={{
            input: {
              root: { className: "w-full sm:w-60 main-input h-10" },
            },
          }}
          style={{ width: "15rem" }}
          value={selectScore?.inputScore}
          onValueChange={(e) =>
            onSelectScore({
              score: selectScore.score,
              inputScore: e.value ?? 0,
            })
          }
        />

        <button
          disabled={isLoading}
          onClick={() => {
            if (!selectScore?.score) {
              scoreRef.current?.style.setProperty("border", "1px solid red");
              scoreRef.current?.classList.add("scale-110");
              setTimeout(() => {
                scoreRef.current?.classList.remove("scale-110");
                scoreRef.current?.style.removeProperty("border");
              }, 100);
              return;
            }
            onCreateScore();
          }}
          className="main-button w-full sm:w-56 flex items-center justify-center"
        >
          {isLoading ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="w-5 h-5"
              strokeWidth="8"
            />
          ) : (
            <div className="flex items-center justify-center gap-1">
              Give Score <IoStar />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default ScorePanel;
