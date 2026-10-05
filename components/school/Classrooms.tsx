import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Link from "next/link";
import { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { classesDataLanguage, classroomUiLanguage } from "../../data/languages";
import { Classroom } from "../../interfaces";
import {
  useGetClassrooms,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useReorderClassrooms,
} from "../../react-query";
import { fullGradeLabel } from "../../utils/classLevel";
import {
  groupClassroomsByGrade,
  NO_LEVEL_KEY,
  reorderVisible,
} from "../../utils/classroomGroups";
import ClassesCreate from "../classroom/ClassroomCreate";
import ClassroomCreatedNotification from "../classroom/ClassroomCreatedNotification";
import ClassroomRow, { ClassroomItem } from "../classroom/ClassroomRow";
import { fieldInputClass } from "../common/FormField";
import PopupLayout from "../layout/PopupLayout";

const byOrder = (a: ClassroomItem, b: ClassroomItem) =>
  (a.order ?? 0) - (b.order ?? 0);

const panelClass =
  "rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]";

type Props = {
  schoolId: string;
};
function Classrooms({ schoolId }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const reorder = useReorderClassrooms();
  const memberOnSchools = useGetMemberOnSchoolBySchool({ schoolId });
  const [showArchived, setShowArchived] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("all");
  const [classroomData, setClassroomData] = useState<ClassroomItem[]>([]);
  const [triggerCreateClass, setTriggerCreateClass] = useState(false);
  const [notifiedClassroom, setNotifiedClassroom] = useState<Classroom | null>(
    null,
  );
  const toast = useRef<Toast>(null);
  const classrooms = useGetClassrooms({ schoolId, isAchieved: showArchived });
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (classrooms.data) setClassroomData([...classrooms.data].sort(byOrder));
  }, [classrooms.data]);

  const visible = useMemo(
    () =>
      teacherId === "all"
        ? classroomData
        : classroomData.filter((classroom) => classroom.userId === teacherId),
    [classroomData, teacherId],
  );
  const groups = useMemo(() => groupClassroomsByGrade(visible), [visible]);

  const closeCreate = () => {
    setTriggerCreateClass(false);
    document.body.style.overflow = "auto";
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const fullIds = reorderVisible(
      classroomData,
      visible,
      String(active.id),
      String(over.id),
    );
    if (!fullIds) return;
    const byId = new Map(classroomData.map((item) => [item.id, item]));
    setClassroomData(
      fullIds.flatMap((id, index) => {
        const item = byId.get(id);
        return item ? [{ ...item, order: index }] : [];
      }),
    );
    try {
      await reorder.mutateAsync({
        classIds: fullIds,
        schoolId,
        isAchieved: showArchived,
      });
    } catch (error) {
      console.log(error);
      if (classrooms.data) setClassroomData([...classrooms.data].sort(byOrder));
      toast.current?.show({
        severity: "error",
        summary: classroomUiLanguage.reorderFailed(lang),
        life: 4000,
      });
    }
  };

  const createButton = (
    <button
      type="button"
      onClick={() => setTriggerCreateClass(true)}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30 active:bg-primary-color-focus sm:w-auto"
    >
      <FiPlus aria-hidden />
      {classroomUiLanguage.createClassroom(lang)}
    </button>
  );

  let content: React.ReactNode;
  if (classrooms.isLoading) {
    content = (
      <div className={`${panelClass} divide-y divide-icon-color/10`}>
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-2xl bg-background-color" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-background-color" />
              <div className="h-3 w-1/2 rounded bg-background-color" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (classroomData.length === 0) {
    content = (
      <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
        <p className="text-lg font-semibold text-icon-color">
          {showArchived
            ? classroomUiLanguage.emptyArchived(lang)
            : classroomUiLanguage.emptyActiveTitle(lang)}
        </p>
        {!showArchived && (
          <>
            <p className="max-w-sm text-sm text-icon-color/70">
              {classroomUiLanguage.emptyActiveBody(lang)}
            </p>
            {createButton}
          </>
        )}
      </div>
    );
  } else if (visible.length === 0) {
    content = (
      <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
        <p className="font-semibold text-icon-color">
          {classroomUiLanguage.emptyTeacher(lang)}
        </p>
        <button
          type="button"
          onClick={() => setTeacherId("all")}
          className="h-10 rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
        >
          {classroomUiLanguage.showAllTeachers(lang)}
        </button>
      </div>
    );
  } else {
    content = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-8">
          {groups.map((group) => {
            const headingId = `grade-${group.key}`;
            return (
              <section key={group.key} aria-labelledby={headingId}>
                <h2
                  id={headingId}
                  className="mb-3 flex items-baseline gap-2 text-base font-bold text-icon-color"
                >
                  {group.key === NO_LEVEL_KEY
                    ? classroomUiLanguage.noLevel(lang)
                    : fullGradeLabel(group.key, lang)}
                  <span className="text-sm font-normal text-icon-color/50">
                    {classroomUiLanguage.classroomCount(lang, group.items.length)}
                  </span>
                </h2>
                <SortableContext
                  items={group.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className={`${panelClass} divide-y divide-icon-color/10`}>
                    {group.items.map((classroom) => (
                      <ClassroomRow key={classroom.id} classroom={classroom} />
                    ))}
                  </ul>
                </SortableContext>
              </section>
            );
          })}
        </div>
      </DndContext>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      {triggerCreateClass && (
        <PopupLayout onClose={closeCreate}>
          <div className="w-[min(28rem,calc(100vw-2rem))] rounded-3xl bg-white p-5 font-Anuphan shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-icon-color">
                {classroomUiLanguage.createClassroom(lang)}
              </h2>
              <button
                type="button"
                onClick={closeCreate}
                aria-label={classroomUiLanguage.close(lang)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color/70 transition-colors hover:bg-background-color"
              >
                <IoMdClose aria-hidden />
              </button>
            </div>
            <ClassesCreate
              schoolId={schoolId}
              toast={toast}
              onClose={closeCreate}
              onSuccess={(created) => setNotifiedClassroom(created)}
            />
          </div>
        </PopupLayout>
      )}
      {notifiedClassroom && (
        <PopupLayout
          onClose={() => {
            setNotifiedClassroom(null);
            document.body.style.overflow = "auto";
          }}
        >
          <ClassroomCreatedNotification
            classroom={notifiedClassroom}
            schoolId={schoolId}
            onClose={() => {
              setNotifiedClassroom(null);
              document.body.style.overflow = "auto";
            }}
          />
        </PopupLayout>
      )}
      <div className="w-full bg-background-color">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-icon-color sm:text-3xl">
                {classroomUiLanguage.classroomsTitle(lang)}
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-icon-color/70 sm:text-base">
                {classesDataLanguage.description(lang)}
              </p>
              <p className="mt-2 text-sm text-icon-color/70">
                {classroomUiLanguage.subjectsHint(lang)}{" "}
                <Link
                  href={`/school/${schoolId}?menu=Subjects`}
                  className="font-semibold text-primary-color underline-offset-4 hover:underline"
                >
                  {classroomUiLanguage.openSubjects(lang)}
                </Link>
              </p>
            </div>
            {createButton}
          </header>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div
              role="group"
              aria-label={classroomUiLanguage.classroomStatus(lang)}
              className="inline-flex w-full rounded-xl bg-white p-1 shadow-sm ring-1 ring-icon-color/10 sm:w-auto"
            >
              {[false, true].map((archived) => (
                <button
                  key={String(archived)}
                  type="button"
                  aria-pressed={showArchived === archived}
                  onClick={() => setShowArchived(archived)}
                  className={`h-9 flex-1 rounded-lg px-4 text-sm font-semibold transition-colors sm:flex-none ${
                    showArchived === archived
                      ? "bg-primary-color text-white"
                      : "text-icon-color/70 hover:bg-background-color"
                  }`}
                >
                  {archived
                    ? classroomUiLanguage.archived(lang)
                    : classroomUiLanguage.active(lang)}
                </button>
              ))}
            </div>
            <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-icon-color sm:w-64">
              {classroomUiLanguage.teacherFilter(lang)}
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={memberOnSchools.isLoading}
                className={`${fieldInputClass()} cursor-pointer`}
              >
                <option value="all">{classroomUiLanguage.allTeachers(lang)}</option>
                {(memberOnSchools.data ?? []).map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8">{content}</div>
        </div>
      </div>
    </>
  );
}

export default Classrooms;
