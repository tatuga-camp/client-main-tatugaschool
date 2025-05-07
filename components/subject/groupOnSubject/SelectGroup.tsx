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
import { useEffect, useState } from "react";
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
  useCreateScoreOnStudent,
  useCreateStudentOnGroup,
  useCreateUnitOnGroup,
  useDeleteGroupOnSubject,
  useDeleteStudentOnGroup,
  useGetGroupOnSubject,
  useGetLanguage,
  useGetStudentOnSubject,
  useRefetchGroupOnSubject,
  useReorderStudentOnGroup,
  useReorderUnitGroup,
  useUpdateStudentOnGroup,
  useUpdateUnitOnGroup,
} from "../../../react-query";
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
  const [units, setUnits] = useState<
    (UnitOnGroup & { students: StudentOnGroup[] })[]
  >([]);

  const reorderUnit = useReorderUnitGroup();
  const createColum = useCreateUnitOnGroup();
  const language = useGetLanguage();
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
  const unGroupStudents = studentOnSubjects.data
    ?.filter((s) => s.isActive === true)
    .filter(
      (studentOnSubject) =>
        !groupOnSubject.data?.units
          .map((u) => u.students)
          .flat()
          .some(
            (studentOnGroup) =>
              studentOnGroup.studentOnSubjectId === studentOnSubject.id
          )
    );

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

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
        summary: "Delete",
        detail: "Group has been deleted",
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
    console.log(active);
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
        (u) => u.id === id.studentOnSubjectId
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
      if (over !== null && active.id !== over?.id) {
        const activeId = JSON.parse(active.id as string) as SortableIdType;
        const overId = JSON.parse(over.id as string) as SortableIdType;
        console.log("activeId", activeId);
        console.log("overId", overId);
        if (activeId.type === "unitOnGroup") {
          let newSort: (UnitOnGroup & { students: StudentOnGroup[] })[] = [];

          setUnits((prevs) => {
            const oldIndex = prevs.findIndex(
              (item) => item.id === activeId.unitOnGroupId
            );
            const newIndex = prevs.findIndex(
              (item) => item.id === overId.unitOnGroupId
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
                  (item) => item.id === activeId.studentOnGroupId
                );
                const newIndex = prev.students.findIndex(
                  (item) => item.id === overId.studentOnGroupId
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
            let newSort: StudentOnGroup[] = [];
            setUnits((prevs) => {
              let targetStudent: StudentOnGroup | undefined = prevs
                .find((u) => u.id === activeId.unitOnGroupId)
                ?.students.find((s) => s.id === activeId.studentOnGroupId);

              if (targetStudent) {
                targetStudent = {
                  ...targetStudent,
                  unitOnGroupId: overId.unitOnGroupId as string,
                };
              }

              return prevs.map((prev) => {
                if (prev.id === activeId.unitOnGroupId) {
                  return {
                    ...prev,
                    students: prev.students.filter(
                      (s) => s.id !== activeId.studentOnGroupId
                    ),
                  };
                } else if (prev.id === overId.unitOnGroupId && targetStudent) {
                  newSort = [...prev.students, targetStudent];
                  updatestudentOnGroup.mutateAsync({
                    query: {
                      studentOnGroupId: targetStudent.id,
                    },
                    body: {
                      unitOnGroupId: targetStudent.unitOnGroupId,
                      order: newSort.length,
                    },
                  });
                  return {
                    ...prev,
                    students: newSort.map((s, index) => {
                      return {
                        ...s,
                        order: index,
                      };
                    }),
                  };
                }
                return prev;
              });
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
                  (s) => s.id !== activeId.studentOnGroupId
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
  }, [groupOnSubject.isFetching]);

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

        <section className="w-full flex  gap-3 justify-between">
          <div>
            <h3 className="text-base font-semibold max-w-40 truncate">
              {groupOnSubject.data?.title}
            </h3>
            <p className="text-gray-600 max-w-40 truncate text-sm">
              {groupOnSubject.data?.description}
            </p>
          </div>
          <div className="flex justify-center items-center gap-3">
            <button
              disabled={refetchGroup.isPending}
              onClick={handleRefetchGroup}
              className="second-button w-52
                        flex items-center justify-center gap-1 py-1 border"
            >
              {refetchGroup.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MdAutoAwesome />
                  Auto Refetch Group
                </>
              )}
            </button>
            <button
              onClick={() => {
                setTriggerUpdate(true);
              }}
              className="main-button w-max
                        flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              <>
                <IoMdSettings />
                Group Setting
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
              className="reject-button w-max flex items-center justify-center gap-1 py-1 ring-1 ring-red-600"
            >
              <>
                <MdDelete />
                Group Delete
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
        <SortableContext items={units} strategy={rectSortingStrategy}>
          <ul className="grid mt-5 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <ColumMemo type="ungroupStudent" students={unGroupStudents} />
            {units
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((unit) => {
                return (
                  <ColumMemo type="unitOnGroup" unit={unit} key={unit.id} />
                );
              })}

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
                  />
                )}
              {activeSortableId &&
                activeSortableId.type === "unitOnGroup" &&
                activeSortableId.unit && (
                  <ColumMemo type="unitOnGroup" unit={activeSortableId.unit} />
                )}
            </DragOverlay>

            <button
              onClick={handleCreate}
              className="w-full active:scale-105 min-h-40 hover:bg-primary-color hover:text-white
             transition text-gray-500 h-full flex-col text-xl
           bg-white border border-dashed  rounded-md flex items-center justify-center"
            >
              {createColum.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  Create New Colum
                  <MdCreate />
                </>
              )}
            </button>
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}

export default ShowSelectGroup;
