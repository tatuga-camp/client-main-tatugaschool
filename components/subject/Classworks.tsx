import {
  closestCenter,
  DndContext,
  DragEndEvent,
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
import React, { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { Assignment } from "../../interfaces";
import {
  useGetAssignments,
  useGetLanguage,
  useReoderAssignment,
} from "../../react-query";
import { ResponseGetAssignmentsService } from "../../services";
import ClassworkCard from "./ClassworkCard";
import ClassworkCreate from "./ClassworkCreate";
import { classworksDataLanguage } from "../../data/languages";
import { MdImportContacts, MdImportExport } from "react-icons/md";
import PopupLayout from "../layout/PopupLayout";
import ImportAssignment from "./ImportAssignment";

type Props = {
  toast: React.RefObject<Toast>;
  subjectId: string;
  schoolId: string;
};
function Classworks({ toast, subjectId, schoolId }: Props) {
  const language = useGetLanguage();
  const [triggerCreate, setTriggerCreate] = React.useState(false);
  const classworks = useGetAssignments({ subjectId: subjectId });
  const [selectClasswork, setSelectClasswork] =
    React.useState<Assignment | null>(null);
  const [triggerImportAssignment, setTriggerImportAssignment] = useState(false);
  const [classworksData, setClassworksData] =
    React.useState<ResponseGetAssignmentsService>([]);
  const reorderAssignment = useReoderAssignment();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    let newSort: ResponseGetAssignmentsService = [];
    if (active.id !== over?.id) {
      setClassworksData((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort;
      });
    }

    if (newSort.length > 0) {
      await reorderAssignment.mutateAsync({
        request: {
          assignmentIds: newSort.map((item) => item.id),
        },
        subjectId: subjectId,
      });
    }
  }, []);

  useEffect(() => {
    if (classworks.data) {
      setClassworksData(classworks.data.sort((a, b) => a.order - b.order));
    }
  }, [classworks.data]);
  return (
    <>
      {triggerCreate && (
        <PopupLayout onClose={() => {}}>
          <div className="h-screen w-screen bg-background-color">
            <ClassworkCreate
              schoolId={schoolId}
              subjectId={subjectId}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreate(false);
              }}
            />
          </div>
        </PopupLayout>
      )}
      {triggerImportAssignment && (
        <PopupLayout
          onClose={() => {
            setTriggerImportAssignment(false);
          }}
        >
          <ImportAssignment
            schoolId={schoolId}
            toast={toast}
            targetSubjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerImportAssignment(false);
            }}
          />
        </PopupLayout>
      )}
      <header className="flex w-full justify-between px-40">
        <section>
          <h1 className="text-3xl font-semibold">
            {classworksDataLanguage.title(language.data ?? "en")}
          </h1>
          <span className="text-gray-400">
            {classworksDataLanguage.description(language.data ?? "en")}{" "}
          </span>
        </section>

        <section className="flex items-center gap-1 font-Anuphan">
          <button
            onClick={() => setTriggerImportAssignment(true)}
            className="second-button relative flex w-52 items-center justify-center gap-1 border py-1"
          >
            <div className="flex items-center justify-center gap-2">
              <MdImportContacts />
              {classworksDataLanguage.import(language.data ?? "en")}
            </div>
          </button>
          <button
            onClick={() => setTriggerCreate((prev) => !prev)}
            className="second-button relative flex w-52 items-center justify-center gap-1 border py-1"
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus />
              {classworksDataLanguage.create(language.data ?? "en")}
            </div>
          </button>
        </section>
      </header>

      <main className="mt-20 flex w-full flex-col items-center gap-5 px-0 lg:px-10 2xl:px-40">
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
                <div key={classwork.id} className="w-full md:w-9/12 xl:w-8/12">
                  <ClassworkCard
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
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      </main>
    </>
  );
}

export default Classworks;
