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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { SortByOption, sortByOptions } from "../../data";
import {
  classesDataLanguage,
  sortByOptionsDataLanguage,
} from "../../data/languages";
import { Classroom, User } from "../../interfaces";
import {
  useGetClassrooms,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetUser,
  useReorderClassrooms,
} from "../../react-query";
import { ResponseGetClassesBySchoolIdService } from "../../services";
import ClassesCard from "../classroom/ClassroomCard";
import ClassesCreate from "../classroom/ClassroomCreate";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layout/PopupLayout";
import LoadingSpinner from "../common/LoadingSpinner";
import Link from "next/link";

type Props = {
  schoolId: string;
};
function Classrooms({ schoolId }: Props) {
  const reorder = useReorderClassrooms();
  const language = useGetLanguage();
  const user = useGetUser();
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId: schoolId,
  });
  const [classroomData, setClassroomData] = React.useState<
    (Classroom & {
      studentNumbers: number;
      creator: User | null;
    })[]
  >([]);
  const [selectFilterUserId, setSelectFilterUserId] = useState<
    string | "show-all"
  >(user.data?.id ?? "show-all");
  const [triggerCreateClass, setTriggerCreateClass] = React.useState(false);
  const [triggerActiveClasses, setTriggerActiveClasses] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const toast = useRef<Toast>(null);
  const classrooms = useGetClassrooms({
    schoolId: schoolId,
    isAchieved: !triggerActiveClasses,
  });

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    let newSort: ResponseGetClassesBySchoolIdService = [];
    if (!over) {
      return;
    }
    if (active.id !== over?.id) {
      setClassroomData((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);
        return newSort;
      });
    }

    if (newSort.length > 0) {
      await reorder.mutateAsync({
        classIds: newSort.map((item) => item.id),
        schoolId: schoolId,
        isAchieved: !triggerActiveClasses,
      });
    }
  }, []);

  useEffect(() => {
    if (classrooms.data && user.data) {
      setSelectFilterUserId(user.data.id);
      handleFilterByUser(user.data.id);
    }
  }, [classrooms.data, user.data]);

  const handleSearch = (search: string) => {
    if (!classrooms.data) {
      return;
    }
    setSearch(search);
    if (search === "") return setClassroomData(classrooms.data);
    setClassroomData(() =>
      classrooms.data?.filter(
        (classroom) =>
          classroom.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.description?.toLowerCase().includes(search.toLowerCase()) ||
          classroom.level.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  };

  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setClassroomData((prev) =>
          prev?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        );
        break;
      case "Newest":
        setClassroomData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
          ),
        );
        break;
      case "Oldest":
        setClassroomData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
          ),
        );
        break;
      case "AZ":
        setClassroomData((prev) =>
          prev?.sort((a, b) => a.title.localeCompare(b.title)),
        );
        break;
      case "ZA":
        setClassroomData((prev) =>
          prev?.sort((a, b) => b.title.localeCompare(a.title)),
        );
        break;
      default:
        break;
    }
  };

  const handleFilterByUser = (userId: string | "show-all") => {
    if (!classrooms.data) {
      return;
    }

    setSelectFilterUserId(userId);
    setClassroomData((prev) => {
      if (!prev) {
        return [];
      }
      if (userId !== "show-all") {
        return classrooms.data
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .filter((classroom) => classroom.userId === userId);
      } else {
        return classrooms.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    });
  };

  return (
    <>
      {triggerCreateClass && (
        <PopupLayout
          onClose={() => {
            setTriggerCreateClass(false);
          }}
        >
          <Toast ref={toast} />
          <div className="h-max w-96 rounded-2xl border bg-white p-3">
            <div className="flex w-full justify-between border-b pb-1">
              <h1 className="text-lg font-semibold">
                {classesDataLanguage.create(language.data ?? "en")}
              </h1>
              <button
                onClick={() => {
                  setTriggerCreateClass(false);
                  document.body.style.overflow = "auto";
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
              >
                <IoMdClose />
              </button>
            </div>
            <ClassesCreate schoolId={schoolId} toast={toast} />
          </div>
        </PopupLayout>
      )}
      <div className="flex w-full flex-col justify-center bg-white">
        <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
          <section className="text-center md:text-left">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {classesDataLanguage.title(language.data ?? "en")}
            </h1>
            <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
              {classesDataLanguage.description(language.data ?? "en")}
            </p>
            <Link
              href={`/school/${schoolId}?menu=Subjects`}
              className="max-w group mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-white/80 p-3 shadow-sm backdrop-blur-sm hover:bg-primary-color hover:text-white md:items-center"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl">
                💡
              </div>
              <span className="text-sm font-medium text-indigo-900 group-hover:text-white">
                {classesDataLanguage.notify(language.data ?? "en")}
              </span>
            </Link>
          </section>
          <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
            <button
              onClick={() => setTriggerCreateClass(true)}
              className="main-button flex w-full items-center justify-center gap-1 py-1 ring-1 ring-blue-600 xl:w-auto"
            >
              {classesDataLanguage.create(language.data ?? "en")}{" "}
            </button>
          </section>
        </header>
        <main className="mx-auto flex min-h-screen w-full flex-col gap-4 p-3 md:max-w-screen-md md:gap-0 md:px-5 xl:max-w-screen-lg">
          <div className="flex flex-wrap items-center justify-start gap-2">
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">
                {classesDataLanguage.search(language.data ?? "en")}
              </span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
                className="w-72 rounded-2xl border border-gray-300 p-2"
                placeholder={classesDataLanguage.searchPlaceholder(
                  language.data ?? "en",
                )}
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">Select</span>
              <button
                onClick={() => setTriggerActiveClasses(!triggerActiveClasses)}
                className={`${
                  triggerActiveClasses ? "main-button" : "second-button"
                } w-60 border`}
              >
                {triggerActiveClasses
                  ? classesDataLanguage.activeClass(language.data ?? "en")
                  : classesDataLanguage.inactiveClass(language.data ?? "en")}
              </button>
            </label>
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
                      email: "Classrooms",
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
                {classesDataLanguage.sort(language.data ?? "en")}
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
          {classrooms.isLoading && <LoadingBar />}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={classroomData}
              strategy={rectSortingStrategy}
            >
              <ul className="mt-5 grid w-full gap-3 pb-40 md:grid-cols-2 xl:grid-cols-3">
                {classroomData?.map((classroom) => {
                  return (
                    <ClassesCard classroom={classroom} key={classroom.id} />
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

export default Classrooms;
