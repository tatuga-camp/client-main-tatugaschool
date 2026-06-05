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
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import AssignmentTagFilterBar from "./AssignmentTagFilterBar";
import RubricList from "./rubric/RubricList";

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

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const uniqueTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of classworksData) {
      for (const t of a.tags ?? []) {
        const key = t.toLowerCase();
        if (!map.has(key)) map.set(key, t);
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [classworksData]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of classworksData) {
      for (const t of c.tags ?? []) {
        const key = t.toLowerCase();
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return out;
  }, [classworksData]);

  const visibleClassworks = useMemo(() => {
    if (selectedTags.size === 0) return classworksData;
    return classworksData.filter((c) =>
      (c.tags ?? []).some((t) => selectedTags.has(t.toLowerCase())),
    );
  }, [classworksData, selectedTags]);

  useEffect(() => {
    const lower = new Set(uniqueTags.map((t) => t.toLowerCase()));
    setSelectedTags((prev) => {
      const filtered = new Set([...prev].filter((t) => lower.has(t)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [uniqueTags]);

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
      <header className="flex w-full flex-col justify-between px-5 md:flex-row md:px-40">
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

      <section className="mt-8 w-full px-5 md:px-40">
        <h1 className="text-lg font-medium sm:text-xl">Rubrics</h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          Create and manage grading rubrics for this subject&apos;s
          assignments.
        </h4>
        <RubricList subjectId={subjectId} toast={toast} />
      </section>

      <section className="mt-4 w-full">
        <AssignmentTagFilterBar
          uniqueTags={uniqueTags}
          counts={counts}
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          totalCount={classworksData.length}
        />
      </section>

      <main className="mt-20 flex w-full flex-col items-center gap-5 px-0 lg:px-10 2xl:px-40">
        {classworks.isLoading && <div>Loading...</div>}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleClassworks}
            strategy={rectSortingStrategy}
          >
            {visibleClassworks?.map((classwork) => {
              return (
                <div key={classwork.id} className="w-full md:w-9/12 xl:w-8/12">
                  <ClassworkCard
                    classwork={classwork}
                    selectClasswork={selectClasswork}
                    subjectId={subjectId}
                    uniqueTags={uniqueTags}
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
