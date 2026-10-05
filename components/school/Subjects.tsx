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
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { SortByOption, sortByOptions } from "../../data";
import {
  classroomUiLanguage,
  sortByOptionsDataLanguage,
  subjectsDataLanguage,
  subjectUiLanguage,
} from "../../data/languages";
import { EducationYear, Subject } from "../../interfaces";
import {
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSubjectFromSchool,
  useGetUser,
  useReorderSubjects,
} from "../../react-query";
import { ResponseGetSubjectBySchoolsService } from "../../services";
import { getDefaultSubjectFilter, setDefaultSubjectFilter } from "../../utils";
import { mergeVisibleOrder } from "../../utils/classroomGroups";
import {
  canReorderSubjects,
  filterSubjects,
  sortSubjects,
} from "../../utils/subjectList";
import { fieldInputClass } from "../common/FormField";
import InputEducationYear from "../common/InputEducationYear";
import PopupLayout from "../layout/PopupLayout";
import DuplicateSubject from "../subject/DuplicateSubject";
import SubjectCard from "../subject/SubjectCard";
import SubjectCreate from "../subject/SubjectCreate";

type SubjectItem = ResponseGetSubjectBySchoolsService[number];

// Stored filters from older versions use "show-all" for every teacher.
const ALL_TEACHERS = "show-all";

const panelClass =
  "rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]";

type Props = {
  schoolId: string;
};
function Subjects({ schoolId }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const toast = useRef<Toast>(null);
  const reorder = useReorderSubjects();
  const user = useGetUser();
  const memberOnSchools = useGetMemberOnSchoolBySchool({ schoolId });
  const [educationYear, setEducationYear] = useState<EducationYear>();
  const [teacherId, setTeacherId] = useState<string>();
  const [sortBy, setSortBy] = useState<SortByOption>("Default");
  const [search, setSearch] = useState("");
  const [triggerCreateSubject, setTriggerCreateSubject] = useState(false);
  const [selectDuplicate, setSelectDuplicate] = useState<Subject | null>(null);
  const [subjectData, setSubjectData] = useState<SubjectItem[]>([]);
  const subjects = useGetSubjectFromSchool({
    schoolId,
    educationYear: educationYear as EducationYear,
  });
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Restore the teacher's last education year and teacher filter.
  useEffect(() => {
    const saved = getDefaultSubjectFilter({ schoolId });
    if (saved) {
      setEducationYear(saved.educationYear);
      setTeacherId(saved.userId);
    } else {
      setEducationYear(`1/${new Date().getFullYear()}` as EducationYear);
    }
  }, [schoolId]);

  // Default to "my subjects" once we know who is signed in.
  useEffect(() => {
    if (teacherId === undefined && user.data) setTeacherId(user.data.id);
  }, [teacherId, user.data]);

  useEffect(() => {
    if (subjects.data) setSubjectData(sortSubjects(subjects.data, "Default"));
  }, [subjects.data]);

  const saveFilter = (next: { educationYear?: EducationYear; userId?: string }) => {
    const year = next.educationYear ?? educationYear;
    if (!year) return;
    setDefaultSubjectFilter({
      schoolId,
      educationYear: year,
      userId: next.userId ?? teacherId ?? ALL_TEACHERS,
    });
  };

  const activeTeacher = teacherId ?? ALL_TEACHERS;
  const visible = useMemo(
    () =>
      sortSubjects(
        filterSubjects(subjectData, {
          query: search,
          teacherId: activeTeacher === ALL_TEACHERS ? "all" : activeTeacher,
        }),
        sortBy,
      ),
    [subjectData, search, activeTeacher, sortBy],
  );
  const draggable = canReorderSubjects(sortBy);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !educationYear) return;
    const from = visible.findIndex((item) => item.id === active.id);
    const to = visible.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;
    const visibleIds = arrayMove(visible, from, to).map((item) => item.id);
    // Subjects hidden by search or the teacher filter keep their slots.
    const fullIds = mergeVisibleOrder(
      subjectData.map((item) => item.id),
      visibleIds,
    );
    const byId = new Map(subjectData.map((item) => [item.id, item]));
    setSubjectData(
      fullIds.flatMap((id, order) => {
        const item = byId.get(id);
        return item ? [{ ...item, order }] : [];
      }),
    );
    try {
      await reorder.mutateAsync({
        subjectIds: fullIds,
        schoolId,
        educationYear,
      });
    } catch (error) {
      console.log(error);
      if (subjects.data) setSubjectData(sortSubjects(subjects.data, "Default"));
      toast.current?.show({
        severity: "error",
        summary: classroomUiLanguage.reorderFailed(lang),
        life: 4000,
      });
    }
  };

  const closeCreate = () => {
    document.body.style.overflow = "auto";
    setTriggerCreateSubject(false);
  };

  const createButton = (
    <button
      type="button"
      onClick={() => setTriggerCreateSubject(true)}
      disabled={!educationYear}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30 active:bg-primary-color-focus disabled:opacity-60 sm:w-auto"
    >
      <FiPlus aria-hidden />
      {subjectsDataLanguage.create(lang)}
    </button>
  );

  const yearLabel = educationYear ?? "";
  let content: React.ReactNode;
  if (subjects.isLoading || !educationYear) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className={`${panelClass} animate-pulse overflow-hidden`}>
            <div className="h-28 bg-background-color" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 rounded bg-background-color" />
              <div className="h-3 w-1/3 rounded bg-background-color" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (subjectData.length === 0) {
    content = (
      <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
        <p className="text-lg font-semibold text-icon-color">
          {subjectUiLanguage.emptyYear(lang, yearLabel)}
        </p>
        <p className="max-w-sm text-sm text-icon-color/70">
          {subjectUiLanguage.emptyYearBody(lang)}
        </p>
        {createButton}
      </div>
    );
  } else if (visible.length === 0) {
    const filteredByTeacher = activeTeacher !== ALL_TEACHERS;
    content = (
      <div className={`${panelClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
        <p className="font-semibold text-icon-color">
          {search.trim()
            ? subjectUiLanguage.noMatch(lang, search.trim())
            : subjectUiLanguage.emptyTeacher(lang, yearLabel)}
        </p>
        {filteredByTeacher && (
          <button
            type="button"
            onClick={() => {
              setTeacherId(ALL_TEACHERS);
              saveFilter({ userId: ALL_TEACHERS });
            }}
            className="h-10 rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
          >
            {classroomUiLanguage.showAllTeachers(lang)}
          </button>
        )}
      </div>
    );
  } else {
    content = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visible.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                teachers={subject.teachers}
                classroom={subject.class}
                draggable={draggable}
                onDuplicate={() => setSelectDuplicate(subject)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      {triggerCreateSubject && educationYear && (
        <PopupLayout onClose={closeCreate}>
          <SubjectCreate
            toast={toast}
            educationYear={educationYear}
            schoolId={schoolId}
            onClose={closeCreate}
          />
        </PopupLayout>
      )}
      {selectDuplicate !== null && (
        <PopupLayout onClose={() => setSelectDuplicate(null)}>
          <DuplicateSubject
            subject={selectDuplicate}
            toast={toast}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectDuplicate(null);
            }}
          />
        </PopupLayout>
      )}
      <div className="w-full bg-background-color">
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-icon-color sm:text-3xl">
                {subjectsDataLanguage.title(lang)}
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-icon-color/70 sm:text-base">
                {subjectsDataLanguage.descriptiom(lang)}
              </p>
            </div>
            {createButton}
          </header>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_14rem_11rem] lg:items-end">
            <label className="relative col-span-2 flex min-w-0 flex-col gap-1.5 text-sm font-medium text-icon-color lg:col-span-1">
              {subjectsDataLanguage.search(lang)}
              <span className="relative">
                <FiSearch
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-color/40"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={subjectsDataLanguage.searchPlaceholder(lang)}
                  className={`${fieldInputClass()} pl-11`}
                />
              </span>
            </label>
            {educationYear && (
              <div className="flex flex-col gap-1.5 text-sm font-medium text-icon-color">
                {subjectsDataLanguage.educationYear(lang)}
                <InputEducationYear
                  value={educationYear}
                  onChange={(value) => {
                    const year = value as EducationYear;
                    setEducationYear(year);
                    saveFilter({ educationYear: year });
                  }}
                  required
                />
              </div>
            )}
            <label className="order-last col-span-2 flex flex-col gap-1.5 text-sm font-medium text-icon-color lg:order-none lg:col-span-1">
              {subjectUiLanguage.teacherFilter(lang)}
              <select
                value={activeTeacher}
                disabled={memberOnSchools.isLoading}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  saveFilter({ userId: e.target.value });
                }}
                className={`${fieldInputClass()} cursor-pointer`}
              >
                <option value={ALL_TEACHERS}>
                  {classroomUiLanguage.allTeachers(lang)}
                </option>
                {(memberOnSchools.data ?? []).map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-icon-color">
              {subjectsDataLanguage.sortBy(lang)}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortByOption)}
                className={`${fieldInputClass()} cursor-pointer`}
              >
                {sortByOptions.map((option) => (
                  <option key={option.title} value={option.title}>
                    {sortByOptionsDataLanguage[
                      option.title.toLowerCase() as keyof typeof sortByOptionsDataLanguage
                    ](lang)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!draggable && visible.length > 1 && (
            <p className="mt-3 text-sm text-icon-color/60">
              {subjectUiLanguage.reorderOff(lang)}
            </p>
          )}

          <div className="mt-6">{content}</div>
        </div>
      </div>
    </>
  );
}

export default Subjects;
