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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoMdClose } from "react-icons/io";
import { ClassLevelList, SortByOption, sortByOptions } from "../../data";
import {
  classesDataLanguage,
  sortByOptionsDataLanguage,
} from "../../data/languages";
import { Classroom, Language, User } from "../../interfaces";
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
import ClassroomCreatedNotification from "../classroom/ClassroomCreatedNotification";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layout/PopupLayout";
import LoadingSpinner from "../common/LoadingSpinner";
import Link from "next/link";
import InputClassLevel from "../common/InputClassLevel";

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
  >("show-all");
  const [selectFilterLevel, setSelectFilterLevel] = useState<
    string | "show-all"
  >("show-all");
  const [triggerCreateClass, setTriggerCreateClass] = React.useState(false);
  const [notifiedClassroom, setNotifiedClassroom] =
    React.useState<Classroom | null>(null);
  const [triggerActiveClasses, setTriggerActiveClasses] = React.useState(true);
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

  const getGrade = (level: string | null | undefined) =>
    (level ?? "").split("/")[0].trim();

  const uniqueLevels = useMemo(() => {
    if (!classrooms.data) return [];
    const grades = new Set<string>();
    for (const c of classrooms.data) {
      const g = getGrade(c.level);
      if (g) grades.add(g);
    }
    const predefinedOrder: readonly string[] = ClassLevelList.map(
      (l) => l.title,
    );
    const predefined: string[] = [];
    const custom: string[] = [];
    for (const g of grades) {
      if (predefinedOrder.includes(g)) {
        predefined.push(g);
      } else {
        custom.push(g);
      }
    }
    predefined.sort(
      (a, b) => predefinedOrder.indexOf(a) - predefinedOrder.indexOf(b),
    );
    custom.sort((a, b) => a.localeCompare(b));
    return [...predefined, ...custom];
  }, [classrooms.data]);

  const displayLevelLabel = (level: string, lang: Language) => {
    if (lang !== "en") return level;
    const match = ClassLevelList.find((l) => l.title === level);
    return match ? match.titleEn : level;
  };

  const applyFilters = (
    userId: string | "show-all",
    level: string | "show-all",
  ) => {
    if (!classrooms.data) return;
    setSelectFilterUserId(userId);
    setSelectFilterLevel(level);
    const sorted = [...classrooms.data].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const filtered = sorted.filter((classroom) => {
      const userMatch =
        userId === "show-all" || classroom.userId === userId;
      const levelMatch =
        level === "show-all" || getGrade(classroom.level) === level;
      return userMatch && levelMatch;
    });
    setClassroomData(filtered);
  };

  useEffect(() => {
    if (classrooms.data && user.data) {
      applyFilters("show-all", "show-all");
    }
  }, [classrooms.data, user.data]);

  useEffect(() => {
    if (
      selectFilterLevel !== "show-all" &&
      uniqueLevels.length > 0 &&
      !uniqueLevels.includes(selectFilterLevel)
    ) {
      applyFilters(selectFilterUserId, "show-all");
    }
  }, [uniqueLevels]);

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
            <ClassesCreate
              schoolId={schoolId}
              toast={toast}
              onClose={() => {
                setTriggerCreateClass(false);
                document.body.style.overflow = "auto";
              }}
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
                    applyFilters(e.target.value, selectFilterLevel);
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
          </div>
          {uniqueLevels.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              <span className="text-sm text-gray-400">
                {classesDataLanguage.filterByLevel(language.data ?? "en")}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    applyFilters(selectFilterUserId, "show-all")
                  }
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    selectFilterLevel === "show-all"
                      ? "bg-primary-color text-white"
                      : "border bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {classesDataLanguage.showAll(language.data ?? "en")}
                </button>
                {uniqueLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => applyFilters(selectFilterUserId, lvl)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      selectFilterLevel === lvl
                        ? "bg-primary-color text-white"
                        : "border bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {displayLevelLabel(lvl, language.data ?? "en")}
                  </button>
                ))}
              </div>
            </div>
          )}
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
