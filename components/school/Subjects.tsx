import React, { useCallback, useEffect, useState } from "react";
import { SortByOption, sortByOptions } from "../../data";
import {
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSubjectFromSchool,
  useGetUser,
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
import LoadingSpinner from "../common/LoadingSpinner";
import DuplicateSubject from "../subject/DuplicateSubject";

type Props = {
  schoolId: string;
};
function Subjects({ schoolId }: Props) {
  const toast = React.useRef<Toast>(null);
  const reorder = useReorderSubjects();
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId,
  });
  const [educationYear, setEducationYear] = React.useState<
    EducationYear | undefined
  >();
  const user = useGetUser();
  const [selectFilterUserId, setSelectFilterUserId] = React.useState<
    string | "show-all"
  >(user.data?.id ?? "show-all");
  const language = useGetLanguage();
  const [selectDuplicate, setSelectDuplicate] = useState<Subject | null>(null);
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
      if (!over) {
        return;
      }
      let newSort: ResponseGetSubjectBySchoolsService = [];
      if (active.id !== over?.id) {
        setSubjectData((prevs) => {
          const oldIndex = prevs.findIndex((item) => item.id === active.id);
          const newIndex = prevs.findIndex((item) => item.id === over!.id);
          newSort = arrayMove(prevs, oldIndex, newIndex);
          return newSort;
        });
      }
      if (newSort.length > 0) {
        await reorder.mutateAsync({
          subjectIds: newSort.map((item) => item.id),
          schoolId: schoolId,
          educationYear: educationYear,
        });
      }
    },
    [educationYear],
  );

  React.useEffect(() => {
    if (subjects.data && user.data) {
      setSelectFilterUserId(user.data.id);
      handleFilterByUser(user.data.id);
    }
  }, [subjects.data, user.data]);

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
              teacher.email.toLowerCase().includes(search.toLowerCase()),
          ) ||
          classroom.class.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.level.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.description
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      ),
    );
  };

  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setSubjectData((prev) =>
          prev?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        );
        break;
      case "Newest":
        setSubjectData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
          ),
        );
        break;
      case "Oldest":
        setSubjectData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
          ),
        );
        break;
      case "AZ":
        setSubjectData((prev) =>
          prev?.sort((a, b) => a.title.localeCompare(b.title)),
        );
        break;
      case "ZA":
        setSubjectData((prev) =>
          prev?.sort((a, b) => b.title.localeCompare(a.title)),
        );
        break;
      default:
        break;
    }
  };

  const handleFilterByUser = (userId: string | "show-all") => {
    if (!subjects.data) {
      return;
    }

    setSelectFilterUserId(userId);
    setSubjectData((prev) => {
      if (!prev) {
        return [];
      }
      if (userId !== "show-all") {
        return subjects.data
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .filter((subject) =>
            subject.teachers.some((t) => t.userId === userId),
          );
      } else {
        return subjects.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    });
  };
  console.log(selectDuplicate);
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

      {selectDuplicate !== null && (
        <PopupLayout
          onClose={() => {
            setSelectDuplicate(null);
          }}
        >
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
      <div className="flex w-full flex-col justify-center bg-white">
        <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
          <section className="text-center md:text-left">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {subjectsDataLanguage.title(language.data ?? "en")}
            </h1>
            <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
              {subjectsDataLanguage.descriptiom(language.data ?? "en")}
            </p>
          </section>
          <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
            <button
              onClick={() => setTriggerCreateSubject(true)}
              className="main-button flex w-full items-center justify-center gap-1 py-1 ring-1 ring-blue-600 xl:w-auto"
            >
              {subjectsDataLanguage.create(language.data ?? "en")}
            </button>
          </section>
        </header>
        <main className="mx-auto flex min-h-screen w-full flex-col gap-4 p-3 md:max-w-screen-md md:gap-0 md:px-5 xl:max-w-screen-lg">
          <div className="flex flex-wrap items-center justify-start gap-2">
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">
                {subjectsDataLanguage.search(language.data ?? "en")}
              </span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
                className="w-96 rounded-lg border border-gray-300 p-2"
                placeholder={subjectsDataLanguage.searchPlaceholder(
                  language.data ?? "en",
                )}
              />
            </label>
            {educationYear && (
              <label className="flex flex-col">
                <span className="text-sm text-gray-400">
                  {subjectsDataLanguage.educationYear(language.data ?? "en")}
                </span>
                <InputEducationYear
                  value={educationYear}
                  onChange={(value) => setEducationYear(value as EducationYear)}
                  required={true}
                />
              </label>
            )}
            <label className="flex w-80 flex-col">
              <span className="text-sm text-gray-400">
                ค้นหาตามรายชื่อคุณครูในโรงเรียน
              </span>
              {memberOnSchools.isLoading ? (
                <LoadingSpinner />
              ) : (
                <select
                  value={selectFilterUserId}
                  onChange={(e) => {
                    handleFilterByUser(e.target.value);
                  }}
                  className="second-button w-80 border"
                >
                  {[
                    ...(memberOnSchools.data ?? []),
                    {
                      firstName: "Show All",
                      lastName: "",
                      email: "subjects",
                      userId: "show-all",
                    },
                  ].map((option) => (
                    <option key={option.userId} value={option.userId}>
                      {option.firstName} {option.lastName} : {option.email}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">
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
              <ul className="mt-5 grid w-full gap-3 pb-40 md:grid-cols-2 xl:grid-cols-3">
                {subjectData.map((subject) => {
                  return (
                    <SubjectCard
                      onDuplicate={() => setSelectDuplicate(subject)}
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
