import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React, { useState } from "react";
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
  useGetScoreOnSubject,
  useUpdateScoreOnSubject,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import LoadingBar from "../common/LoadingBar";

type Props = {
  subjectId: string;
  onSelectScore: ({
    score,
    inputScore,
  }: {
    score?: ScoreOnSubject;
    inputScore: number;
  }) => void;
  selectScore?: { score?: ScoreOnSubject } & { inputScore: number };
  isLoading?: boolean;
  onCreateScore?: (data: { score: ScoreOnSubject; inputScore: number }) => void;
};

function ScorePanel({
  subjectId,
  onSelectScore,
  selectScore,
  isLoading,
  onCreateScore,
}: Props) {
  const scoreOnSubjects = useGetScoreOnSubject({
    subjectId: subjectId,
  });
  const scoreRef = React.useRef<HTMLButtonElement>(null);
  const [triggerFormScoreOnSubject, setTriggerFormScoreOnSubject] =
    React.useState(false);
  const [selectScoreOnSubject, setSelectScoreOnSubject] =
    React.useState<ScoreOnSubject | null>(selectScore?.score ?? null);
  const [inputScore, setInputScore] = useState<number | null>(
    selectScore?.inputScore ?? null,
  );
  return (
    <div className="flex h-96 flex-col gap-3 bg-white p-4 sm:p-6 md:p-8 lg:p-10">
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
          <div className="border-b text-lg font-semibold">
            Give Your Student A Score!
          </div>
          <ul className="grid max-h-48 grid-cols-2 gap-3 overflow-auto p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            <button
              onClick={() => {
                setSelectScoreOnSubject(null);
                setTriggerFormScoreOnSubject(true);
              }}
              className="second-button flex w-full flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-gray-500"
            >
              <CiSquarePlus size={50} />
            </button>
            {scoreOnSubjects.isLoading
              ? [...Array(12)].map((_, index) => {
                  return (
                    <div
                      key={index}
                      className="h-20 w-20 animate-pulse rounded-2xl bg-gray-200"
                    ></div>
                  );
                })
              : scoreOnSubjects.data?.map((score, index) => {
                  return (
                    <button
                      ref={index === 0 ? scoreRef : null}
                      onClick={() => {
                        setSelectScoreOnSubject(score);
                        setInputScore(score.score);
                        onSelectScore({
                          score: score,
                          inputScore: score.score,
                        });
                      }}
                      key={score.id}
                      className={` ${
                        selectScoreOnSubject?.id === score.id
                          ? "gradient-bg"
                          : "bg-white"
                      } active:gradient-bg group relative flex w-32 flex-col items-center justify-center gap-2 rounded-2xl p-2 transition hover:bg-secondary-color`}
                    >
                      <div className="relative h-10 w-10 rounded-2xl">
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
                          className={`absolute -right-2 -top-2 z-20 flex h-5 min-w-5 max-w-10 items-center justify-center truncate rounded-full text-white ${
                            score.score >= 0 ? "bg-green-400" : "bg-red-500"
                          } `}
                        >
                          {score.score}
                        </div>
                      </div>
                      <span
                        className={`line-clamp-2 w-20 break-words text-xs text-gray-500 group-hover:text-white ${
                          selectScoreOnSubject?.id === score.id && "text-white"
                        }`}
                      >
                        {score.title}
                      </span>
                    </button>
                  );
                })}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <InputNumber
              pt={{
                input: {
                  root: { className: "w-full sm:w-60 main-input h-10" },
                },
              }}
              style={{ width: "15rem" }}
              value={inputScore}
              onValueChange={(e) => {
                setInputScore(e.value ?? 0);
                onSelectScore({
                  score: selectScore?.score,
                  inputScore: e.value ?? 0,
                });
              }}
            />

            <button
              disabled={isLoading}
              onClick={() => {
                if (!selectScoreOnSubject) {
                  scoreRef.current?.style.setProperty(
                    "border",
                    "1px solid red",
                  );
                  scoreRef.current?.classList.add("scale-110");
                  setTimeout(() => {
                    scoreRef.current?.classList.remove("scale-110");
                    scoreRef.current?.style.removeProperty("border");
                  }, 100);
                  return;
                }
                onCreateScore?.({
                  inputScore: inputScore ?? 0,
                  score: selectScoreOnSubject,
                });
              }}
              className="main-button flex w-full items-center justify-center sm:w-56"
            >
              {isLoading ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "20px" }}
                  className="h-5 w-5"
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
                className="second-button flex w-20 items-center justify-center border"
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
      <form onSubmit={handleSummit} className="flex h-72 w-96 flex-col gap-2">
        <h1 className="flex items-center justify-center gap-2 text-center text-lg font-semibold">
          {scoreOnSubject?.id ? "Update" : "Create"} Score
          <IoStar />
        </h1>
        <ul className="grid max-h-60 w-full grid-cols-5 gap-2 overflow-auto p-2">
          {scoreOnSubjectTitlesDefault.map((icon, index) => {
            return (
              <li
                onClick={() =>
                  setData({ ...data, icon: icon.icon, blurHash: icon.blurHash })
                }
                key={index}
                className={`h-16 w-full ${data?.icon === icon.icon && "ring-1 ring-black"} second-button relative border`}
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
            className="second-button w-full border"
          >
            Cancel
          </button>
          <button
            disabled={create.isPending || update.isPending}
            className="main-button flex w-full items-center justify-center"
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
              className="reject-button flex w-full items-center justify-center"
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
