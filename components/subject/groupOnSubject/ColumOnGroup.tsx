import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, memo, useRef, useState } from "react";
import { MdDelete, MdDragIndicator } from "react-icons/md";
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
  useGetScoreOnStudent,
  useUpdateUnitOnGroup,
} from "../../../react-query";
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
};

function Colum({ unit, type, students, toast }: ColumProps) {
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
  const scoreOnStudents = useGetScoreOnStudent({
    subjectId: unit?.subjectId ?? "",
  });
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
  const deleteColum = useDeleteUnitOnGroup();
  const update = useUpdateUnitOnGroup();

  if (!unit) {
    return (
      <li
        ref={setNodeRef}
        className="flex h-max min-h-full w-full flex-col rounded-2xl"
      >
        <header className="relative flex h-max w-full items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-rose-400 to-red-500 px-2 py-2 font-semibold text-white">
          Ungroup Students
        </header>

        <ul className="grid min-h-40 grid-cols-1 place-content-start bg-white">
          {students?.map((studentOnSubject) => {
            return (
              <StudentOnGroupMemo
                key={studentOnSubject.id}
                student={{ ...studentOnSubject }}
                unitOnGroupId={null}
                studentOnGroupId={null}
                studentOnSubjectId={studentOnSubject.id}
                type="ungroupStudent"
              />
            );
          })}
        </ul>
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
          summary: "Updated",
          detail: "Group has been updated",
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
          <ScorePanel
            onSelectScore={(data) => {}}
            onCreateScore={(data) => {
              handleUpdateScoreOnUnitGroup({
                unitId: triggerUnitGroupId,
                points: data.inputScore,
                scoreOnSubjectId: data.score.id,
              });
            }}
            subjectId={unit.subjectId}
          />
        </PopupLayout>
      )}

      <li
        ref={setNodeRef}
        className="flex h-max min-h-full w-full flex-col rounded-2xl"
      >
        {(update.isPending || deleteColum.isPending || loadingScore) && (
          <LoadingBar />
        )}
        <header className="gradient-bg relative flex h-max w-full items-center justify-between gap-2 rounded-2xl px-2 py-2">
          <form ref={formRef} className="flex flex-col">
            <input
              disabled={update.isPending}
              onBlur={handleOnSave}
              value={data.title}
              onChange={(e) => {
                setData((prev) => {
                  return {
                    ...prev,
                    title: e.target.value,
                  };
                });
              }}
              required
              className="w-40 bg-transparent font-semibold text-white focus:border-b focus:outline-none"
            />
            <input
              disabled={update.isPending}
              required
              onBlur={handleOnSave}
              value={data.description}
              onChange={(e) => {
                setData((prev) => {
                  return {
                    ...prev,
                    description: e.target.value,
                  };
                });
              }}
              className="w-52 bg-transparent text-xs font-normal text-white focus:border-b focus:outline-none"
            />
          </form>
          <section>
            <section className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  ConfirmDeleteMessage({
                    language: language.data ?? "en",
                    callback: async () => {
                      await handleDelete();
                    },
                  });
                }}
                disabled={deleteColum.isPending}
                className="z-20 flex h-6 w-6 items-center justify-center rounded-2xl text-red-700 hover:bg-white"
              >
                <MdDelete />
              </button>
              <button
                {...listeners}
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
                className="z-20 flex h-6 w-6 items-center justify-center rounded-2xl text-gray-700 hover:bg-gray-300/50"
              >
                <MdDragIndicator />
              </button>
            </section>
            <button
              onClick={() => {
                setTriggerUnitGroupId(unit.id);
              }}
              className="flex flex-col gap-1"
            >
              <h1 className="border-b text-center text-xl font-semibold text-white">
                {unit.totalScore}{" "}
                <span className="text-sm font-normal">score</span>
              </h1>
              <ListMemberCircle maxShow={4} members={unit.students} />
            </button>
          </section>
        </header>
        {unit.students.length > 0 ? (
          <ul className="grid grid-cols-1">
            {unit.students
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((studentOnGroup) => {
                return (
                  <StudentOnGroupMemo
                    key={studentOnGroup.id + studentOnGroup.unitOnGroupId}
                    studentOnGroupId={studentOnGroup.id}
                    type="studentOnGroup"
                    studentOnSubjectId={null}
                    unitOnGroupId={studentOnGroup.unitOnGroupId}
                    student={{
                      ...studentOnGroup,
                      score: scoreOnStudents.data
                        ?.filter(
                          (s) =>
                            s.studentOnSubjectId ===
                            studentOnGroup.studentOnSubjectId,
                        )
                        .reduce((prev, current) => {
                          return (prev += current.score);
                        }, 0),
                    }}
                  />
                );
              })}
          </ul>
        ) : (
          <div className="flex w-full grow items-center justify-center bg-white">
            No Students
          </div>
        )}
      </li>
    </>
  );
}
const ColumMemo = memo(Colum);
export default ColumMemo;
