import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, memo, useRef, useState } from "react";
import { MdDelete, MdDragIndicator } from "react-icons/md";
import { IoStar } from "react-icons/io5";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  StudentOnGroup,
  StudentOnSubject,
  UnitOnGroup,
} from "../../../interfaces";
import {
  useCreateScoreOnStudent,
  useDeleteUnitOnGroup,
  useGetLanguage,
  useUpdateUnitOnGroup,
} from "../../../react-query";
import {
  groupBoardLanguage,
  groupOnSubjectLanguage,
} from "../../../data/languages";
import ConfirmDeleteMessage from "../../common/ConfirmDeleteMessage";
import LoadingBar from "../../common/LoadingBar";
import ListMemberCircle from "../../member/ListMemberCircle";
import { SortableIdType } from "./SelectGroup";
import StudentOnGroupMemo from "./StudentOnGroup";
import PopupLayout from "../../layout/PopupLayout";
import ScorePanel from "../ScorePanel";
import { Toast } from "primereact/toast";

type ColumProps = {
  unit?: UnitOnGroup & {
    students: StudentOnGroup[];
  };
  type: "unitOnGroup" | "ungroupStudent";
  students?: StudentOnSubject[];
  toast?: React.RefObject<Toast>;
  /** Aggregated score per studentOnSubjectId, lifted to and memoized by SelectGroup. */
  scoreByStudentOnSubjectId?: Map<string, number>;
};

function Colum({
  unit,
  type,
  students,
  toast,
  scoreByStudentOnSubjectId,
}: ColumProps) {
  const sortableId = {
    type: type,
    studentOnGroupId: null,
    unitOnGroupId: unit ? unit.id : null,
    studentOnSubjectId: null,
  } as SortableIdType;

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: JSON.stringify(sortableId) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };
  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    ...style,
  };

  const updateUnitOnGroup = useUpdateUnitOnGroup();
  const createStudentScore = useCreateScoreOnStudent();
  const [triggerUnitGroupId, setTriggerUnitGroupId] = useState<string | null>(
    null,
  );
  const [loadingScore, setLoadingScore] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<{
    title: string;
    description: string;
  }>({
    title: unit?.title ?? "",
    description: unit?.description ?? "",
  });
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const deleteColum = useDeleteUnitOnGroup();
  const update = useUpdateUnitOnGroup();

  if (!unit) {
    return (
      <li
        ref={setNodeRef}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-background-color"
      >
        <header className="flex flex-col gap-0.5 px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-icon-color">
              {groupBoardLanguage.ungrouped(lang)}
            </h3>
            <span className="rounded-full bg-white px-2 text-xs font-semibold tabular-nums text-gray-500 ring-1 ring-gray-200">
              {students?.length ?? 0}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {students && students.length > 0
              ? groupBoardLanguage.ungroupedHint(lang)
              : groupBoardLanguage.everyoneGrouped(lang)}
          </p>
        </header>

        {students && students.length > 0 && (
          <ul className="mx-2 mb-2 flex flex-col divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {students.map((studentOnSubject) => {
              return (
                <StudentOnGroupMemo
                  key={studentOnSubject.id}
                  student={{ ...studentOnSubject }}
                  unitOnGroupId={null}
                  studentOnGroupId={null}
                  studentOnSubjectId={studentOnSubject.id}
                  type="ungroupStudent"
                  lang={lang}
                />
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  const handleOnSave = async (
    e: React.FocusEvent<HTMLInputElement, Element>,
  ) => {
    if (formRef.current?.reportValidity()) {
      try {
        await update.mutateAsync({
          query: {
            unitOnGroupId: unit.id,
          },
          body: {
            title: data.title,
            description: data.description,
          },
        });
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
    }
  };

  const handleDelete = async () => {
    try {
      await deleteColum.mutateAsync({
        unitOnGroupId: unit.id,
      });
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

  const handleUpdateScoreOnUnitGroup = async (data: {
    unitId: string;
    scoreOnSubjectId: string;
    points: number;
  }) => {
    try {
      setTriggerUnitGroupId(null);
      document.body.style.overflow = "auto";
      setLoadingScore(() => true);
      await updateUnitOnGroup.mutateAsync({
        query: {
          unitOnGroupId: data.unitId,
        },
        body: {
          score: data.points,
        },
      });

      const studentOnSubjectIds = unit.students
        .filter((s) => s.unitOnGroupId === data.unitId)
        .map((s) => s.studentOnSubjectId);

      await Promise.allSettled(
        studentOnSubjectIds.map((id) =>
          createStudentScore.mutateAsync({
            score: data.points,
            scoreOnSubjectId: data.scoreOnSubjectId,
            studentOnSubjectId: id,
          }),
        ),
      );
      if (toast) {
        toast.current?.show({
          severity: "success",
          summary: groupOnSubjectLanguage.updatedToastSummary(lang),
          detail: groupOnSubjectLanguage.updatedToastDetail(lang),
        });
      }

      setLoadingScore(() => false);
    } catch (error) {
      setLoadingScore(() => false);
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

  return (
    <>
      {triggerUnitGroupId && (
        <PopupLayout
          onClose={() => {
            setTriggerUnitGroupId(null);
          }}
        >
          <div className="m-4 w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-xl">
            <ScorePanel
              title={groupBoardLanguage.givePoints(lang)}
              subtitle={groupBoardLanguage.givePointsTo(
                unit.title,
                unit.students.length,
              )(lang)}
              onSelectScore={() => {}}
              onCreateScore={(data) => {
                handleUpdateScoreOnUnitGroup({
                  unitId: triggerUnitGroupId,
                  points: data.inputScore,
                  scoreOnSubjectId: data.score.id,
                });
              }}
              subjectId={unit.subjectId}
            />
          </div>
        </PopupLayout>
      )}

      <li
        ref={setNodeRef}
        style={{ opacity: isDragging ? 0.4 : 1 }}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white font-Anuphan"
      >
        {(update.isPending || deleteColum.isPending || loadingScore) && (
          <LoadingBar />
        )}
        <header className="flex flex-col gap-3 border-b border-gray-100 px-2 pb-3 pt-3">
          <div className="flex items-start gap-1">
            <button
              type="button"
              {...listeners}
              aria-label={groupBoardLanguage.dragGroup(lang)}
              title={groupBoardLanguage.dragGroup(lang)}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
              className="mt-0.5 flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-background-color hover:text-icon-color"
            >
              <MdDragIndicator />
            </button>
            <form
              ref={formRef}
              onSubmit={(e) => e.preventDefault()}
              className="flex min-w-0 grow flex-col"
            >
              <input
                disabled={update.isPending}
                onBlur={handleOnSave}
                value={data.title}
                aria-label={groupBoardLanguage.groupName(lang)}
                onChange={(e) => {
                  setData((prev) => {
                    return {
                      ...prev,
                      title: e.target.value,
                    };
                  });
                }}
                required
                className="w-full truncate rounded-lg bg-transparent px-1.5 py-1 text-base font-semibold text-icon-color transition-colors hover:bg-background-color focus:bg-background-color focus:outline-none focus:ring-1 focus:ring-primary-color"
              />
              <input
                disabled={update.isPending}
                required
                onBlur={handleOnSave}
                value={data.description}
                aria-label={groupBoardLanguage.groupNote(lang)}
                placeholder={groupBoardLanguage.groupNote(lang)}
                onChange={(e) => {
                  setData((prev) => {
                    return {
                      ...prev,
                      description: e.target.value,
                    };
                  });
                }}
                className="w-full truncate rounded-lg bg-transparent px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-background-color focus:bg-background-color focus:outline-none focus:ring-1 focus:ring-primary-color"
              />
            </form>
            <span className="mt-1 shrink-0 whitespace-nowrap rounded-full bg-primary-color/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary-color">
              {unit.totalScore}{" "}
              <span className="text-xs font-medium">
                {groupBoardLanguage.points(lang)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                ConfirmDeleteMessage({
                  language: language.data ?? "en",
                  callback: async () => {
                    await handleDelete();
                  },
                });
              }}
              disabled={deleteColum.isPending}
              aria-label={groupBoardLanguage.deleteGroup(lang)}
              title={groupBoardLanguage.deleteGroup(lang)}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-color/10 hover:text-error-color"
            >
              <MdDelete />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pl-7">
            <div className="flex min-w-0 items-center gap-2">
              {unit.students.length > 0 && (
                <ListMemberCircle maxShow={4} members={unit.students} />
              )}
              <span className="truncate text-xs text-gray-500">
                {groupBoardLanguage.students(unit.students.length)(lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTriggerUnitGroupId(unit.id);
              }}
              disabled={loadingScore || unit.students.length === 0}
              title={groupOnSubjectLanguage.addScoreTooltip(lang)}
              className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl bg-primary-color px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <IoStar />
              {groupBoardLanguage.givePoints(lang)}
            </button>
          </div>
        </header>
        {unit.students.length > 0 ? (
          <ul className="flex flex-col divide-y divide-gray-100">
            {[...unit.students]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((studentOnGroup) => {
                return (
                  <StudentOnGroupMemo
                    key={studentOnGroup.id + studentOnGroup.unitOnGroupId}
                    studentOnGroupId={studentOnGroup.id}
                    type="studentOnGroup"
                    studentOnSubjectId={null}
                    unitOnGroupId={studentOnGroup.unitOnGroupId}
                    student={studentOnGroup}
                    score={
                      scoreByStudentOnSubjectId?.get(
                        studentOnGroup.studentOnSubjectId,
                      ) ?? 0
                    }
                    lang={lang}
                  />
                );
              })}
          </ul>
        ) : (
          <div className="m-2 flex min-h-20 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
            {groupBoardLanguage.dropHere(lang)}
          </div>
        )}
      </li>
    </>
  );
}
const ColumMemo = memo(Colum);
export default ColumMemo;
