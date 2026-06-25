import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { Toast } from "primereact/toast";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdSettings } from "react-icons/io";
import { MdAutoAwesome, MdCreate, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  StudentOnGroup,
  StudentOnSubject,
  UnitOnGroup,
} from "../../../interfaces";
import {
  useCreateStudentOnGroup,
  useCreateUnitOnGroup,
  useDeleteGroupOnSubject,
  useDeleteStudentOnGroup,
  useGetGroupOnSubject,
  useGetLanguage,
  useGetScoreOnStudent,
  useGetStudentOnSubject,
  useRefetchGroupOnSubject,
  useReorderStudentOnGroup,
  useReorderUnitGroup,
  useUpdateStudentOnGroup,
} from "../../../react-query";
import { groupOnSubjectLanguage } from "../../../data/languages";
import ConfirmDeleteMessage from "../../common/ConfirmDeleteMessage";
import LoadingBar from "../../common/LoadingBar";
import LoadingSpinner from "../../common/LoadingSpinner";
import PopupLayout from "../../layout/PopupLayout";
import ColumMemo from "./ColumOnGroup";
import GroupSetting from "./GroupSetting";
import StudentOnGroupMemo from "./StudentOnGroup";

export type SortableIdType = {
  type: "ungroupStudent" | "studentOnGroup" | "unitOnGroup";
  studentOnGroupId: string | null;
  unitOnGroupId: string | null;
  studentOnSubjectId: string | null;
};

type ShowSelectGroupProps = {
  subjectId: string;
  groupOnSubjectId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function ShowSelectGroup({
  subjectId,
  toast,
  groupOnSubjectId,
  onClose,
}: ShowSelectGroupProps) {
  const groupOnSubject = useGetGroupOnSubject({
    id: groupOnSubjectId,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const scoreOnStudents = useGetScoreOnStudent({
    subjectId,
  });
  const [units, setUnits] = useState<
    (UnitOnGroup & { students: StudentOnGroup[] })[]
  >([]);

  const reorderUnit = useReorderUnitGroup();
  const createColum = useCreateUnitOnGroup();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const deleteGroup = useDeleteGroupOnSubject();
  const reorderStudent = useReorderStudentOnGroup();
  const updatestudentOnGroup = useUpdateStudentOnGroup();
  const createStudentOnGroup = useCreateStudentOnGroup();
  const refetchGroup = useRefetchGroupOnSubject();

  const deleteStudentOnGroup = useDeleteStudentOnGroup();

  const [activeSortableId, setActiveSortableId] = useState<
    | (SortableIdType & {
        student?: StudentOnGroup | StudentOnSubject;
        unit?: UnitOnGroup & { students: StudentOnGroup[] };
      })
    | null
  >(null);
  const [triggerUpdate, setTriggerUpdate] = useState<boolean>(false);
  const unGroupStudents = useMemo(
    () =>
      studentOnSubjects.data
        ?.filter((s) => s.isActive === true)
        .filter(
          (studentOnSubject) =>
            !groupOnSubject.data?.units
              .map((u) => u.students)
              .flat()
              .some(
                (studentOnGroup) =>
                  studentOnGroup.studentOnSubjectId === studentOnSubject.id,
              ),
        ),
    [studentOnSubjects.data, groupOnSubject.data],
  );

  // Sorted copy + the matching sortable identifiers for SortableContext.
  // The identifiers MUST equal the ids each unit registers via useSortable
  // (JSON.stringify of its SortableIdType), otherwise the sorting strategy
  // can't track the items. Never sort `units` in place — it mutates state.
  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [units],
  );
  const unitSortableIds = useMemo(
    () =>
      sortedUnits.map((unit) =>
        JSON.stringify({
          type: "unitOnGroup",
          studentOnGroupId: null,
          unitOnGroupId: unit.id,
          studentOnSubjectId: null,
        } as SortableIdType),
      ),
    [sortedUnits],
  );

  // One score query for the whole board (lifted out of every column). The
  // aggregated, memoized map is handed down so each column/student receives a
  // stable primitive score instead of re-subscribing and re-rendering.
  const scoreByStudentOnSubjectId = useMemo(() => {
    const map = new Map<string, number>();
    scoreOnStudents.data?.forEach((s) => {
      map.set(
        s.studentOnSubjectId,
        (map.get(s.studentOnSubjectId) ?? 0) + s.score,
      );
    });
    return map;
  }, [scoreOnStudents.data]);

  // Activation constraints stop a plain click (or a tiny accidental move) from
  // starting the drag lifecycle. Without them, every pointer-down on a student
  // fires onDragStart/onDragEnd, and dnd-kit re-renders EVERY sortable node
  // (all students + columns) twice per click — the click-time perf spike.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 8 },
    }),
  );

  const handleRefetchGroup = async () => {
    try {
      await refetchGroup.mutateAsync({
        groupOnSubjectId: groupOnSubjectId,
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

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync({
        groupOnSubjectId: groupOnSubjectId,
      });
      toast.current?.show({
        severity: "success",
        summary: groupOnSubjectLanguage.deleteToastSummary(lang),
        detail: groupOnSubjectLanguage.deleteToastDetail(lang),
      });
      onClose();
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

  const handleCreate = async () => {
    try {
      if (!groupOnSubject.data) return;
      await createColum.mutateAsync({
        title: `Group ${(groupOnSubject.data?.units.length ?? 0) + 1}`,
        description: `this is group number ${
          (groupOnSubject.data?.units.length ?? 0) + 1
        }`,
        groupOnSubjectId: groupOnSubject.data?.id,
        icon: "",
        order: (groupOnSubject.data?.units.length ?? 0) + 1,
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
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = JSON.parse(active.id as string) as SortableIdType;
    if (id.type === "studentOnGroup") {
      const student = units
        .find((u) => u.id === id.unitOnGroupId)
        ?.students.find((s) => s.id === id.studentOnGroupId);
      setActiveSortableId({
        ...id,
        student: student,
      });
    }
    if (id.type === "unitOnGroup") {
      const unit = units.find((u) => u.id === id.unitOnGroupId);
      setActiveSortableId({
        ...id,
        unit: unit,
      });
    }
    if (id.type === "ungroupStudent") {
      const student = studentOnSubjects.data?.find(
        (u) => u.id === id.studentOnSubjectId,
      );
      setActiveSortableId({
        ...id,
        student: student,
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    try {
      if (!over) {
        return;
      }
      if (over !== null && active.id !== over?.id) {
        const activeId = JSON.parse(active.id as string) as SortableIdType;
        const overId = JSON.parse(over.id as string) as SortableIdType;

        if (activeId.type === "unitOnGroup") {
          let newSort: (UnitOnGroup & { students: StudentOnGroup[] })[] = [];

          setUnits((prevs) => {
            const oldIndex = prevs.findIndex(
              (item) => item.id === activeId.unitOnGroupId,
            );
            const newIndex = prevs.findIndex(
              (item) => item.id === overId.unitOnGroupId,
            );
            newSort = arrayMove(prevs, oldIndex, newIndex);

            return newSort.map((s, index) => {
              return {
                ...s,
                order: index,
              };
            });
          });
          await reorderUnit.mutateAsync({
            unitOnGroupIds: newSort.map((unit) => unit.id),
          });
        } else if (
          activeId.type === "studentOnGroup" &&
          overId.type !== "ungroupStudent"
        ) {
          if (activeId.unitOnGroupId === overId.unitOnGroupId) {
            let newSort: StudentOnGroup[] = [];
            setUnits((prevs) => {
              return prevs.map((prev) => {
                if (prev.id !== activeId.unitOnGroupId) {
                  return prev;
                }
                const oldIndex = prev.students.findIndex(
                  (item) => item.id === activeId.studentOnGroupId,
                );
                const newIndex = prev.students.findIndex(
                  (item) => item.id === overId.studentOnGroupId,
                );
                newSort = arrayMove(prev.students, oldIndex, newIndex);
                return {
                  ...prev,
                  students: newSort.map((s, index) => {
                    return {
                      ...s,
                      order: index,
                    };
                  }),
                };
              });
            });
            await reorderStudent.mutateAsync({
              studentOnGroupIds: newSort.map((unit) => unit.id),
            });
          }

          if (activeId.unitOnGroupId !== overId.unitOnGroupId) {
            // Compute the move BEFORE updating state so the setUnits updater
            // stays pure — no mutations fired from inside a reducer (which
            // StrictMode double-invokes and React may replay).
            const sourceStudent = units
              .find((u) => u.id === activeId.unitOnGroupId)
              ?.students.find((s) => s.id === activeId.studentOnGroupId);

            if (!sourceStudent) {
              return;
            }

            const movedStudent: StudentOnGroup = {
              ...sourceStudent,
              unitOnGroupId: overId.unitOnGroupId as string,
            };

            const targetUnit = units.find((u) => u.id === overId.unitOnGroupId);
            const newSort: StudentOnGroup[] = [
              ...(targetUnit?.students ?? []),
              movedStudent,
            ].map((s, index) => ({ ...s, order: index }));

            setUnits((prevs) =>
              prevs.map((prev) => {
                if (prev.id === activeId.unitOnGroupId) {
                  return {
                    ...prev,
                    students: prev.students.filter(
                      (s) => s.id !== activeId.studentOnGroupId,
                    ),
                  };
                }
                if (prev.id === overId.unitOnGroupId) {
                  return { ...prev, students: newSort };
                }
                return prev;
              }),
            );

            // Persist the unit change first, then the new order, so the two
            // cache writes land in a deterministic order.
            await updatestudentOnGroup.mutateAsync({
              query: { studentOnGroupId: movedStudent.id },
              body: {
                unitOnGroupId: movedStudent.unitOnGroupId,
                order: newSort.length,
              },
            });

            if (newSort.length > 0) {
              await reorderStudent.mutateAsync({
                studentOnGroupIds: newSort.map((unit) => unit.id),
              });
            }
          }
        } else if (
          activeId.type === "ungroupStudent" &&
          (overId.type === "unitOnGroup" || overId.type === "studentOnGroup")
        ) {
          const create = await createStudentOnGroup.mutateAsync({
            studentOnSubjectId: activeId.studentOnSubjectId as string,
            unitOnGroupId: overId.unitOnGroupId as string,
          });
          setUnits((prevs) => {
            return prevs.map((prev) => {
              if (prev.id !== create.unitOnGroupId) {
                return prev;
              }
              return {
                ...prev,
                students: [...prev.students, create],
              };
            });
          });
        } else if (
          activeId.type === "studentOnGroup" &&
          overId.type === "ungroupStudent"
        ) {
          setUnits((prevs) => {
            return prevs.map((prev) => {
              if (prev.id !== activeId.unitOnGroupId) {
                return prev;
              }
              return {
                ...prev,
                students: prev.students.filter(
                  (s) => s.id !== activeId.studentOnGroupId,
                ),
              };
            });
          });
          await deleteStudentOnGroup.mutateAsync({
            studentOnGroupId: activeId.studentOnGroupId as string,
          });
        }
      }
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

  useEffect(() => {
    if (groupOnSubject.data) {
      setUnits(() => groupOnSubject.data.units);
    }
    // Sync from the query cache only when the data reference actually changes.
    // Keying this on `isFetching` re-ran on every (often unrelated) refetch and
    // clobbered the locally-managed optimistic drag state.
  }, [groupOnSubject.data]);

  useEffect(() => {
    groupOnSubject.refetch();
  }, [groupOnSubjectId]);

  return (
    <>
      {triggerUpdate && (
        <PopupLayout onClose={() => setTriggerUpdate(() => false)}>
          <GroupSetting
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerUpdate(() => false);
            }}
            data={groupOnSubject.data}
            subjectId={subjectId}
            toast={toast}
          />
        </PopupLayout>
      )}

      <header className="mt-2">
        {deleteGroup.isPending && <LoadingBar />}

        <section className="flex w-full justify-between gap-3">
          <div>
            <h3 className="max-w-40 truncate text-base font-semibold">
              {groupOnSubject.data?.title}
            </h3>
            <p className="max-w-40 truncate text-sm text-gray-600">
              {groupOnSubject.data?.description}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={refetchGroup.isPending}
              onClick={() => {
                if (confirm(groupOnSubjectLanguage.confirmAutoRefresh(lang))) {
                  handleRefetchGroup();
                }
              }}
              className="second-button flex w-52 items-center justify-center gap-1 border py-1"
            >
              {refetchGroup.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MdAutoAwesome />
                  {groupOnSubjectLanguage.autoRefreshGroup(lang)}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setTriggerUpdate(true);
              }}
              className="main-button flex w-max items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              <>
                <IoMdSettings />
                {groupOnSubjectLanguage.groupSetting(lang)}
              </>
            </button>
            <button
              disabled={deleteGroup.isPending}
              onClick={() => {
                ConfirmDeleteMessage({
                  language: language.data ?? "en",
                  callback: async () => {
                    await handleDeleteGroup();
                  },
                });
              }}
              className="reject-button flex w-max items-center justify-center gap-1 py-1 ring-1 ring-red-600"
            >
              <>
                <MdDelete />
                {groupOnSubjectLanguage.groupDelete(lang)}
              </>
            </button>
          </div>
        </section>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={unitSortableIds} strategy={rectSortingStrategy}>
          <ul className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {groupOnSubject.isLoading ? (
              <LoadingBar />
            ) : (
              <ColumMemo type="ungroupStudent" students={unGroupStudents} />
            )}
            {sortedUnits.map((unit) => {
              return (
                <ColumMemo
                  type="unitOnGroup"
                  unit={unit}
                  key={unit.id}
                  scoreByStudentOnSubjectId={scoreByStudentOnSubjectId}
                  toast={toast}
                />
              );
            })}

            <button
              onClick={handleCreate}
              className="flex h-full min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-white text-xl text-gray-500 transition hover:bg-primary-color hover:text-white active:scale-105"
            >
              {createColum.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  {groupOnSubjectLanguage.createNewColumn(lang)}
                  <MdCreate />
                </>
              )}
            </button>
          </ul>
        </SortableContext>

        {/* DragOverlay is rendered once, outside SortableContext, and portaled
            to <body> so it escapes the modal's stacking context and is not
            coupled to the sortable list's re-renders (dnd-kit best practice). */}
        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeSortableId &&
                activeSortableId.type === "studentOnGroup" &&
                activeSortableId.student && (
                  <StudentOnGroupMemo
                    type="studentOnGroup"
                    studentOnGroupId={activeSortableId.studentOnGroupId}
                    unitOnGroupId={activeSortableId.unitOnGroupId}
                    studentOnSubjectId={null}
                    student={activeSortableId.student}
                    isDragOver={true}
                    lang={lang}
                  />
                )}

              {activeSortableId &&
                activeSortableId.type === "ungroupStudent" &&
                activeSortableId.student && (
                  <StudentOnGroupMemo
                    type="ungroupStudent"
                    studentOnGroupId={null}
                    unitOnGroupId={null}
                    studentOnSubjectId={null}
                    student={activeSortableId.student}
                    isDragOver={true}
                    lang={lang}
                  />
                )}
              {activeSortableId &&
                activeSortableId.type === "unitOnGroup" &&
                activeSortableId.unit && (
                  <ColumMemo type="unitOnGroup" unit={activeSortableId.unit} />
                )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </>
  );
}

export default ShowSelectGroup;
