import Image from "next/image";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoArrowBack, IoStar } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import { scoreOnSubjectTitlesDefault } from "../../data/socre";
import { studentPointsLanguage } from "../../data/languages";
import { ErrorMessages, Language, ScoreOnSubject } from "../../interfaces";
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
  /** Heading override, e.g. the group name when scoring a whole group. */
  title?: string;
  /** Who is receiving the points, e.g. "3 selected". */
  subtitle?: string;
};

function ScorePanel({
  subjectId,
  onSelectScore,
  selectScore,
  isLoading,
  onCreateScore,
  title,
  subtitle,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const scoreOnSubjects = useGetScoreOnSubject({
    subjectId: subjectId,
  });
  const [triggerFormScoreOnSubject, setTriggerFormScoreOnSubject] =
    React.useState(false);
  const [selectScoreOnSubject, setSelectScoreOnSubject] =
    React.useState<ScoreOnSubject | null>(selectScore?.score ?? null);
  const [editScoreOnSubject, setEditScoreOnSubject] =
    React.useState<ScoreOnSubject | null>(null);
  const [inputScore, setInputScore] = useState<number>(
    selectScore?.inputScore ?? 0,
  );

  const changePoints = (value: number) => {
    setInputScore(value);
    onSelectScore({
      score: selectScoreOnSubject ?? undefined,
      inputScore: value,
    });
  };

  if (triggerFormScoreOnSubject) {
    return (
      <ScoreOnSubjectForm
        lang={lang}
        onClose={(deletedId) => {
          if (deletedId && deletedId === selectScoreOnSubject?.id) {
            setSelectScoreOnSubject(null);
            onSelectScore({ score: undefined, inputScore });
          }
          setEditScoreOnSubject(null);
          setTriggerFormScoreOnSubject(false);
        }}
        subjectId={subjectId}
        scoreOnSubject={editScoreOnSubject}
      />
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col bg-white font-Anuphan">
      <header className="flex flex-col gap-0.5 border-b border-gray-100 px-5 pb-3 pt-5">
        <h2 className="text-lg font-semibold text-icon-color">
          {title ?? studentPointsLanguage.panelTitle(lang)}
        </h2>
        <p className="text-sm text-gray-500">
          {subtitle ?? studentPointsLanguage.panelHint(lang)}
        </p>
      </header>

      <ul className="grid max-h-[45vh] grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 overflow-y-auto p-4">
        {scoreOnSubjects.isLoading
          ? [...Array(8)].map((_, index) => (
              <li
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-background-color"
              />
            ))
          : scoreOnSubjects.data?.map((score) => {
              const isSelected = selectScoreOnSubject?.id === score.id;
              return (
                <li key={score.id} className="group relative">
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectScoreOnSubject(score);
                      setInputScore(score.score);
                      onSelectScore({
                        score: score,
                        inputScore: score.score,
                      });
                    }}
                    className={`flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color active:scale-95 ${
                      isSelected
                        ? "border-primary-color bg-primary-color/5 ring-1 ring-primary-color"
                        : "border-gray-200 bg-white hover:border-primary-color/40 hover:bg-background-color"
                    }`}
                  >
                    <span className="relative h-10 w-10">
                      <Image
                        src={score.icon}
                        alt=""
                        placeholder="blur"
                        blurDataURL={decodeBlurhashToCanvas(score.blurHash)}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </span>
                    <span className="line-clamp-2 w-full break-words text-center text-xs font-medium leading-tight text-icon-color">
                      {score.title}
                    </span>
                  </button>
                  <span
                    className={`pointer-events-none absolute left-2 top-2 rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                      score.score >= 0
                        ? "bg-success-color/10 text-success-color"
                        : "bg-error-color/10 text-error-color"
                    }`}
                  >
                    {score.score > 0 ? `+${score.score}` : score.score}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditScoreOnSubject(score);
                      setTriggerFormScoreOnSubject(true);
                    }}
                    aria-label={studentPointsLanguage.editSkill(lang)}
                    title={studentPointsLanguage.editSkill(lang)}
                    className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-white hover:text-primary-color focus-visible:opacity-100 ${
                      isSelected
                        ? "opacity-100"
                        : "md:opacity-0 md:group-hover:opacity-100"
                    }`}
                  >
                    <MdEdit />
                  </button>
                </li>
              );
            })}
        {!scoreOnSubjects.isLoading && (
          <li>
            <button
              type="button"
              onClick={() => {
                setEditScoreOnSubject(null);
                setTriggerFormScoreOnSubject(true);
              }}
              className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 p-2 text-gray-500 transition hover:border-primary-color hover:text-primary-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background-color text-lg">
                <FiPlus />
              </span>
              <span className="text-xs font-medium">
                {studentPointsLanguage.addSkill(lang)}
              </span>
            </button>
          </li>
        )}
        {!scoreOnSubjects.isLoading && scoreOnSubjects.data?.length === 0 && (
          <li className="col-span-full px-1 text-sm text-gray-500">
            {studentPointsLanguage.noSkills(lang)}
          </li>
        )}
      </ul>

      <footer className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {studentPointsLanguage.pointsLabel(lang)}
          </span>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => changePoints(inputScore - 1)}
              aria-label="-1"
              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-icon-color transition hover:bg-background-color"
            >
              <FiMinus />
            </button>
            <InputNumber
              value={inputScore}
              onValueChange={(e) => changePoints(e.value ?? 0)}
              pt={{
                root: { className: "w-14" },
                input: {
                  root: {
                    className:
                      "h-10 w-14 border-x border-gray-200 text-center text-base font-semibold tabular-nums text-icon-color outline-none focus:bg-background-color",
                  },
                },
              }}
            />
            <button
              type="button"
              onClick={() => changePoints(inputScore + 1)}
              aria-label="+1"
              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-icon-color transition hover:bg-background-color"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={isLoading || !selectScoreOnSubject}
          onClick={() => {
            if (!selectScoreOnSubject) return;
            onCreateScore?.({
              inputScore: inputScore,
              score: selectScoreOnSubject,
            });
          }}
          className="flex h-10 min-w-40 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:active:scale-100"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : selectScoreOnSubject ? (
            <>
              <IoStar />
              {studentPointsLanguage.giveAmount(inputScore)(lang)}
            </>
          ) : (
            studentPointsLanguage.pickSkillFirst(lang)
          )}
        </button>
      </footer>
    </div>
  );
}

export default ScorePanel;

type ScoreOnSubjectFormProps = {
  scoreOnSubject?: ScoreOnSubject | null;
  subjectId: string;
  lang: Language;
  /** Called with the deleted skill id when the skill was deleted. */
  onClose: (deletedId?: string) => void;
};
function ScoreOnSubjectForm({
  scoreOnSubject,
  subjectId,
  lang,
  onClose,
}: ScoreOnSubjectFormProps) {
  const toast = React.useRef<Toast>(null);
  const update = useUpdateScoreOnSubject();
  const create = useCreateScoreOnSubject();
  const remove = useDeleteScoreOnSubject();
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

  const showError = (error: unknown) => {
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
  };

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
          summary: studentPointsLanguage.skillUpdated(lang),
          detail: data.title,
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
          summary: studentPointsLanguage.skillCreated(lang),
          detail: data.title,
          life: 3000,
        });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync({
        scoreOnSubjectId: id,
      });
      toast.current?.show({
        severity: "success",
        summary: studentPointsLanguage.skillDeleted(lang),
        life: 3000,
      });
      setTimeout(() => {
        onClose(id);
      }, 1000);
    } catch (error) {
      showError(error);
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <Toast ref={toast} />
      <form
        onSubmit={handleSummit}
        className="flex w-full min-w-0 flex-col bg-white font-Anuphan"
      >
        {remove.isPending && <LoadingBar />}
        <header className="flex items-center gap-2 border-b border-gray-100 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => onClose()}
            aria-label={studentPointsLanguage.back(lang)}
            title={studentPointsLanguage.back(lang)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-icon-color transition hover:bg-background-color"
          >
            <IoArrowBack />
          </button>
          <h2 className="text-lg font-semibold text-icon-color">
            {scoreOnSubject?.id
              ? studentPointsLanguage.updateSkillTitle(lang)
              : studentPointsLanguage.createSkillTitle(lang)}
          </h2>
        </header>

        <div className="flex flex-col gap-4 p-4">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-icon-color">
              {studentPointsLanguage.skillIcon(lang)}
            </legend>
            <ul className="grid max-h-44 grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5 overflow-y-auto rounded-2xl bg-background-color p-2">
              {scoreOnSubjectTitlesDefault.map((icon, index) => {
                const isSelected = data?.icon === icon.icon;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setData({
                          ...data,
                          icon: icon.icon,
                          blurHash: icon.blurHash,
                        })
                      }
                      className={`relative flex aspect-square w-full items-center justify-center rounded-xl border transition ${
                        isSelected
                          ? "border-primary-color bg-white ring-1 ring-primary-color"
                          : "border-transparent hover:bg-white"
                      }`}
                    >
                      <span className="relative h-8 w-8">
                        <Image
                          src={icon.icon}
                          alt=""
                          placeholder="blur"
                          blurDataURL={decodeBlurhashToCanvas(icon.blurHash)}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-icon-color">
              {studentPointsLanguage.skillName(lang)}
            </span>
            <input
              required
              value={data?.title ?? ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              type="text"
              placeholder={studentPointsLanguage.skillNamePlaceholder(lang)}
              className="main-input h-10"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-icon-color">
              {studentPointsLanguage.defaultPoints(lang)}
            </span>
            <InputNumber
              pt={{
                root: { className: "w-full" },
                input: {
                  root: { className: "w-full main-input h-10" },
                },
              }}
              value={data?.score}
              onValueChange={(e) =>
                setData({
                  ...data,
                  score: e.value ?? 0,
                })
              }
            />
            <span className="text-xs text-gray-500">
              {studentPointsLanguage.defaultPointsHint(lang)}
            </span>
          </label>
        </div>

        <footer className="flex items-center gap-2 border-t border-gray-100 p-4">
          {scoreOnSubject?.id && (
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => {
                ConfirmDeleteMessage({
                  language: lang,
                  callback: async () => {
                    await handleDelete(scoreOnSubject.id);
                  },
                });
              }}
              className="flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-error-color transition hover:bg-error-color/10 disabled:opacity-50"
            >
              {studentPointsLanguage.delete(lang)}
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-icon-color transition hover:bg-background-color"
            >
              {studentPointsLanguage.cancel(lang)}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-10 min-w-24 items-center justify-center rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:opacity-60"
            >
              {isSaving ? (
                <LoadingSpinner />
              ) : scoreOnSubject?.id ? (
                studentPointsLanguage.save(lang)
              ) : (
                studentPointsLanguage.create(lang)
              )}
            </button>
          </div>
        </footer>
      </form>
    </>
  );
}
