import { Toast } from "primereact/toast";
import React, { useCallback, useEffect } from "react";
import { FaBook, FaPlus } from "react-icons/fa6";
import { MdAssignment, MdDragIndicator } from "react-icons/md";
import ClassworkCreate, { classworkLists } from "./ClassworkCreate";
import { useGetAssignments, useReoderAssignment } from "../../react-query";
import parse from "html-react-parser";
import { Assignment } from "../../interfaces";
import Link from "next/link";
import ClassworkCard from "./ClassworkCard";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ResponseGetAssignmentsService } from "../../services";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";

type Props = {
  toast: React.RefObject<Toast>;
  subjectId: string;
};
function Classwork({ toast, subjectId }: Props) {
  const [triggerCreate, setTriggerCreate] = React.useState(false);
  const classworks = useGetAssignments({ subjectId: subjectId });
  const [selectClasswork, setSelectClasswork] =
    React.useState<Assignment | null>(null);
  const [classworksData, setClassworksData] =
    React.useState<ResponseGetAssignmentsService>([]);
  const reorderAssignment = useReoderAssignment();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    let newSort: ResponseGetAssignmentsService = [];
    if (active.id !== over?.id) {
      setClassworksData((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort;
      });
    }

    await reorderAssignment.mutateAsync({
      request: {
        assignmentIds: newSort.map((item) => item.id),
      },
      subjectId: subjectId,
    });
  }, []);

  useEffect(() => {
    if (classworks.data) {
      setClassworksData(classworks.data.sort((a, b) => a.order - b.order));
    }
  }, [classworks.data]);
  return (
    <>
      {triggerCreate && (
        <div
          className={`fixed flex
          } top-0 bottom-0 right-0 left-0 flex items-center justify-center m-auto z-50`}
        >
          <div className="bg-background-color w-screen h-screen ">
            <ClassworkCreate
              subjectId={subjectId}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreate(false);
              }}
            />
          </div>
        </div>
      )}
      <header className="w-full flex justify-between px-40">
        <section>
          <h1 className="text-3xl font-semibold">Classwork</h1>
          <span className="text-gray-400">
            You can assign a task to your students here and track their progress
          </span>
        </section>

        <section className="flex font-Anuphan items-center gap-1">
          <button
            onClick={() => setTriggerCreate((prev) => !prev)}
            className="second-button relative   flex items-center w-52 justify-center gap-1 py-1 border "
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus />
              Create Classwork
            </div>
          </button>
        </section>
      </header>

      <main className="w-full mt-20 place-items-center grid gap-5 px-40">
        {classworks.isLoading && <div>Loading...</div>}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={classworksData}
            strategy={rectSortingStrategy}
          >
            {classworksData?.map((classwork) => {
              return (
                <ClassworkCard
                  key={classwork.id}
                  classwork={classwork}
                  selectClasswork={selectClasswork}
                  subjectId={subjectId}
                  onSelect={(classwork) => {
                    setSelectClasswork((prev) => {
                      if (prev?.id === classwork.id) {
                        return null;
                      }
                      return classwork;
                    });
                  }}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </main>
    </>
  );
}

export default Classwork;
