import React, { useCallback, useEffect } from "react";
import { SortByOption, sortByOptions } from "../../data";
import {
  useGetLanguage,
  useGetSubjectFromSchool,
  useReorderSubjects,
} from "../../react-query";
import {
  Classroom,
  EducationYear,
  Subject,
  TeacherOnSubject,
} from "../../interfaces";
import SubjectCard from "../subject/SubjectCard";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ResponseGetSubjectBySchoolsService } from "../../services";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import InputEducationYear from "../common/InputEducationYear";
import PopupLayout from "../layout/PopupLayout";
import SubjectCreate from "../subject/SubjectCreate";
import { Toast } from "primereact/toast";
import LoadingBar from "../common/LoadingBar";
import {
  sortByOptionsDataLanguage,
  subjectsDataLanguage,
} from "../../data/languages";

type Props = {
  schoolId: string;
};
function Subjects({ schoolId }: Props) {
  const toast = React.useRef<Toast>(null);
  const reorder = useReorderSubjects();
  const [educationYear, setEducationYear] = React.useState<
    EducationYear | undefined
  >();
  const language = useGetLanguage();
  const [triggerCreateSubject, setTriggerCreateSubject] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const subjects = useGetSubjectFromSchool({
    schoolId: schoolId,
    educationYear: educationYear as EducationYear,
  });
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    const year = new Date().getFullYear();
    setEducationYear(() => `1/${year}`);
  }, []);

  const [subjectData, setSubjectData] = React.useState<
    (Subject & {
      teachers: TeacherOnSubject[];
      class: Classroom;
    })[]
  >([]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!educationYear) {
        console.error("Education year is not set");
        return;
      }
      const { active, over } = event;
      let newSort: ResponseGetSubjectBySchoolsService = [];
      if (active.id !== over?.id) {
        setSubjectData((prevs) => {
          const oldIndex = prevs.findIndex((item) => item.id === active.id);
          const newIndex = prevs.findIndex((item) => item.id === over!.id);
          newSort = arrayMove(prevs, oldIndex, newIndex);

          return newSort;
        });
      }
      await reorder.mutateAsync({
        subjectIds: newSort.map((item) => item.id),
        schoolId: schoolId,
        educationYear: educationYear,
      });
    },
    [educationYear]
  );

  React.useEffect(() => {
    if (subjects.data) {
      setSubjectData(
        subjects.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    }
  }, [subjects.data]);

  const handleSearch = (search: string) => {
    if (!subjects.data) {
      return;
    }
    setSearch(search);
    if (search === "") return setSubjectData(subjects.data);
    setSubjectData(() =>
      subjects.data?.filter(
        (classroom) =>
          classroom.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.description?.toLowerCase().includes(search.toLowerCase()) ||
          classroom.educationYear
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          classroom.teachers.some(
            (teacher) =>
              teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
              teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
              teacher.email.toLowerCase().includes(search.toLowerCase())
          ) ||
          classroom.class.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.level.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.description
            ?.toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  };

  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setSubjectData((prev) =>
          prev?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
        break;
      case "Newest":
        setSubjectData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          )
        );
        break;
      case "Oldest":
        setSubjectData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
          )
        );
        break;
      case "AZ":
        setSubjectData((prev) =>
          prev?.sort((a, b) => a.title.localeCompare(b.title))
        );
        break;
      case "ZA":
        setSubjectData((prev) =>
          prev?.sort((a, b) => b.title.localeCompare(a.title))
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Toast ref={toast} />
      {triggerCreateSubject && (
        <PopupLayout
          onClose={() => {
            setTriggerCreateSubject(false);
          }}
        >
          {educationYear && (
            <SubjectCreate
              toast={toast}
              educationYear={educationYear}
              schoolId={schoolId}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreateSubject(false);
              }}
            />
          )}
        </PopupLayout>
      )}
      <div className="w-full bg-white flex  flex-col justify-center">
        <header
          className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
        >
          <section className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold">
              {subjectsDataLanguage.title(language.data ?? "en")}
            </h1>
            <p className="text-gray-400 max-w-96 break-words text-sm md:text-base">
              {subjectsDataLanguage.descriptiom(language.data ?? "en")}
            </p>
          </section>
          <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
            <button
              onClick={() => setTriggerCreateSubject(true)}
              className="main-button w-full xl:w-auto flex items-center 
            justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              {subjectsDataLanguage.create(language.data ?? "en")}
            </button>
          </section>
        </header>
        <main
          className="w-full min-h-screen flex flex-col  p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
        >
          <div className="flex items-center justify-start gap-2">
            <label className="flex flex-col">
              <span className="text-gray-400 text-sm">
                {subjectsDataLanguage.search(language.data ?? "en")}
              </span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
                className="w-96 border border-gray-300 rounded-lg p-2"
                placeholder={subjectsDataLanguage.searchPlaceholder(
                  language.data ?? "en"
                )}
              />
            </label>
            {educationYear && (
              <label className="flex flex-col">
                <span className="text-gray-400 text-sm">
                  {subjectsDataLanguage.educationYear(language.data ?? "en")}
                </span>
                <InputEducationYear
                  value={educationYear}
                  onChange={(value) => setEducationYear(value as EducationYear)}
                  required={true}
                />
              </label>
            )}

            <label className="flex flex-col">
              <span className="text-gray-400 text-sm">
                {subjectsDataLanguage.sortBy(language.data ?? "en")}
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  handleSortBy(e.target.value as SortByOption);
                  setSortBy(e.target.value as SortByOption);
                }}
                className="second-button w-40 border"
              >
                {sortByOptions.map((option) => (
                  <option key={option.title} value={option.title}>
                    {sortByOptionsDataLanguage[
                      option.title.toLowerCase() as keyof typeof sortByOptionsDataLanguage
                    ](language.data ?? "en")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {subjects.isLoading && <LoadingBar />}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={subjectData} strategy={rectSortingStrategy}>
              <ul className="w-full pb-40 mt-5 grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {subjectData.map((subject) => {
                  return (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      teachers={subject.teachers}
                      classroom={subject.class}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </>
  );
}

export default Subjects;
