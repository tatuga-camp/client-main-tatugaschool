import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React from "react";
import { BiEdit } from "react-icons/bi";
import { CiSquarePlus } from "react-icons/ci";
import { IoStar } from "react-icons/io5";
import Swal from "sweetalert2";
import { scoreOnSubjectTitlesDefault } from "../../data/socre";
import { ErrorMessages, ScoreOnSubject } from "../../interfaces";
import {
  useCreateScoreOnSubject,
  useDeleteScoreOnSubject,
  useGetLanguage,
  useUpdateScoreOnSubject,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import LoadingBar from "../common/LoadingBar";

type Props = {
  scoreOnSubjects: UseQueryResult<ScoreOnSubject[], Error>;
  subjectId: string;
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
  subjectId,
  onSelectScore,
  selectScore,
  isLoading,
  onCreateScore,
}: Props) {
  const scoreRef = React.useRef<HTMLButtonElement>(null);
  const [triggerFormScoreOnSubject, setTriggerFormScoreOnSubject] =
    React.useState(false);
  const [selectScoreOnSubject, setSelectScoreOnSubject] =
    React.useState<ScoreOnSubject | null>(null);
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6 md:p-8 lg:p-10">
      {triggerFormScoreOnSubject ? (
        <ScoreOnSubjectForm
          onClose={() => {
            setSelectScoreOnSubject(null);
            setTriggerFormScoreOnSubject(false);
          }}
          subjectId={subjectId}
          scoreOnSubject={selectScoreOnSubject}
        />
      ) : (
        <>
          <div className="text-lg font-semibold border-b">
            Give Your Student A Score!
          </div>
          <ul
            className="grid  max-h-48 p-2 overflow-auto grid-cols-2 sm:grid-cols-3
           md:grid-cols-4 lg:grid-cols-4 gap-3"
          >
            <button
              onClick={() => {
                setSelectScoreOnSubject(null);
                setTriggerFormScoreOnSubject(true);
              }}
              className="w-full p-2 rounded-md text-gray-500 second-button border flex items-center justify-center flex-col gap-1"
            >
              <CiSquarePlus size={50} />
            </button>
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
                      onClick={() => {
                        setSelectScoreOnSubject(score);
                        onSelectScore({
                          score: score,
                          inputScore: score.score,
                        });
                      }}
                      key={score.id}
                      className={` ${
                        selectScore?.score?.id === score.id
                          ? "gradient-bg "
                          : "bg-white "
                      } p-2  w-32 active:gradient-bg transition rounded-md group hover:bg-secondary-color 
                    flex flex-col items-center relative justify-center gap-2`}
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
                  scoreRef.current?.style.setProperty(
                    "border",
                    "1px solid red"
                  );
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
            {selectScoreOnSubject && (
              <button
                onClick={() => setTriggerFormScoreOnSubject(true)}
                className="second-button border w-20 flex items-center justify-center"
              >
                <BiEdit />
                Edit
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ScorePanel;

type ScoreOnSubjectFormProps = {
  scoreOnSubject?: ScoreOnSubject | null;
  subjectId: string;
  onClose: () => void;
};
function ScoreOnSubjectForm({
  scoreOnSubject,
  subjectId,
  onClose,
}: ScoreOnSubjectFormProps) {
  const toast = React.useRef<Toast>(null);
  const update = useUpdateScoreOnSubject();
  const create = useCreateScoreOnSubject();
  const remove = useDeleteScoreOnSubject();
  const language = useGetLanguage();
  const [data, setData] = React.useState<{
    title?: string;
    score?: number;
    blurHash?: string;
    icon?: string;
  }>({
    title: scoreOnSubject?.title,
    score: scoreOnSubject?.score ?? 1,
    blurHash:
      scoreOnSubject?.blurHash ?? scoreOnSubjectTitlesDefault[0].blurHash,
    icon: scoreOnSubject?.icon ?? scoreOnSubjectTitlesDefault[0].icon,
  });

  const handleSummit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (scoreOnSubject) {
        await update.mutateAsync({
          query: { socreOnSubjectId: scoreOnSubject.id },
          body: {
            title: data.title,
            score: data.score,
            icon: data.icon,
            blurHash: data.blurHash,
          },
        });
        toast.current?.show({
          severity: "success",
          summary: "Score Updated",
          detail: `Score ${data.title} has been updated`,
          life: 3000,
        });
      } else {
        if (
          data.score === undefined ||
          data.title === undefined ||
          data.icon === undefined ||
          data.blurHash === undefined
        ) {
          throw new Error("All field must be filled");
        }
        await create.mutateAsync({
          title: data.title,
          score: data.score,
          icon: data.icon,
          blurHash: data.blurHash,
          subjectId: subjectId,
        });

        toast.current?.show({
          severity: "success",
          summary: "Score Created",
          detail: `Score ${data.title} has been created`,
          life: 3000,
        });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync({
        scoreOnSubjectId: id,
      });
      toast.current?.show({
        severity: "success",
        summary: "Score Deleted",
        life: 3000,
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSummit} className="w-96 h-72 flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          {scoreOnSubject?.id ? "Update" : "Create"} Score
          <IoStar />
        </h1>
        <ul className="w-full grid grid-cols-5 p-2 gap-2 max-h-60 overflow-auto">
          {scoreOnSubjectTitlesDefault.map((icon, index) => {
            return (
              <li
                onClick={() =>
                  setData({ ...data, icon: icon.icon, blurHash: icon.blurHash })
                }
                key={index}
                className={`w-full h-16
              ${data?.icon === icon.icon && "ring-1 ring-black"}
              second-button border relative`}
              >
                <Image
                  src={icon.icon}
                  alt={"icon"}
                  placeholder="blur"
                  blurDataURL={decodeBlurhashToCanvas(icon.blurHash)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              </li>
            );
          })}
        </ul>
        <input
          required
          value={data?.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          type="text"
          placeholder="Title"
          className="main-input h-10"
        />
        <InputNumber
          pt={{
            input: {
              root: { className: "w-full  main-input h-10" },
            },
          }}
          value={data?.score}
          placeholder="Default Score"
          onValueChange={(e) =>
            setData({
              ...data,
              score: e.value ?? 0,
            })
          }
        />
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
            }}
            className="second-button border w-full"
          >
            Cancel
          </button>
          <button
            disabled={create.isPending || update.isPending}
            className="main-button w-full flex items-center justify-center"
          >
            {create.isPending || update.isPending ? (
              <LoadingSpinner />
            ) : scoreOnSubject?.id ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
          {scoreOnSubject?.id && (
            <button
              type="button"
              onClick={() => {
                if (scoreOnSubject) {
                  ConfirmDeleteMessage({
                    language: language.data ?? "en",
                    callback: async () => {
                      handleDelete(scoreOnSubject.id);
                    },
                  });
                }
              }}
              className="reject-button w-full flex items-center justify-center"
            >
              Delete
            </button>
          )}
        </div>
        {remove.isPending && <LoadingBar />}
      </form>
    </>
  );
}
