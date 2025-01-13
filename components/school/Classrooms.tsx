import React, { useCallback, useEffect, useRef } from "react";
import { useGetClassrooms, useReorderClassrooms } from "../../react-query";
import { Classroom } from "../../interfaces";
import { MdDragIndicator } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ResponseGetClassesBySchoolIdService } from "../../services";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import ClassesCard from "../classroom/ClassroomCard";
import PopupLayout from "../layout/PopupLayout";
import ClassesCreate from "../classroom/ClassroomCreate";
import { IoMdClose } from "react-icons/io";
import { Toast } from "primereact/toast";
import { SortByOption, sortByOptions } from "../../data";

type Props = {
  schoolId: string;
};
function Classrooms({ schoolId }: Props) {
  const reorder = useReorderClassrooms();
  const [classroomData, setClassroomData] = React.useState<
    (Classroom & {
      studentNumbers: number;
    })[]
  >([]);
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
    if (active.id !== over?.id) {
      setClassroomData((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort;
      });
    }

    await reorder.mutateAsync({
      classIds: newSort.map((item) => item.id),
      schoolId: schoolId,
      isAchieved: !triggerActiveClasses,
    });
  }, []);

  useEffect(() => {
    if (classrooms.data) {
      setClassroomData(
        classrooms.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    }
  }, [classrooms.data]);

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
          classroom.level.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setClassroomData((prev) =>
          prev?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
        break;
      case "Newest":
        setClassroomData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          )
        );
        break;
      case "Oldest":
        setClassroomData((prev) =>
          prev?.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
          )
        );
        break;
      case "A-Z":
        setClassroomData((prev) =>
          prev?.sort((a, b) => a.title.localeCompare(b.title))
        );
        break;
      case "Z-A":
        setClassroomData((prev) =>
          prev?.sort((a, b) => b.title.localeCompare(a.title))
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      {triggerCreateClass && (
        <PopupLayout
          onClose={() => {
            if (confirm("Are you sure you want to close?")) {
              setTriggerCreateClass(false);
            }
          }}
        >
          <Toast ref={toast} />
          <div className="w-96 h-max p-3 rounded-md bg-white border">
            <div className="w-full flex justify-between border-b pb-1">
              <h1 className="text-lg font-semibold">Create Class</h1>
              <button
                onClick={() => setTriggerCreateClass(false)}
                className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
              >
                <IoMdClose />
              </button>
            </div>
            <ClassesCreate schoolId={schoolId} toast={toast} />
          </div>
        </PopupLayout>
      )}
      <div className="w-full bg-white flex  flex-col justify-center">
        <header
          className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
        >
          <section className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold">Classroom</h1>
            <p className="text-gray-400 max-w-96 break-words text-sm md:text-base">
              This section is for managing classes. You can create, edit, and
              delete classes here.
            </p>
          </section>
          <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
            <button
              onClick={() => setTriggerCreateClass(true)}
              className="main-button w-full xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              Create Class
            </button>
          </section>
        </header>
        <main
          className="w-full flex flex-col  p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
        >
          <div className="flex items-center justify-start gap-2">
            <label className="flex flex-col">
              <span className="text-gray-400 text-sm">Search</span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
                className="w-96 border border-gray-300 rounded-lg p-2"
                placeholder="Search for class"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-gray-400 text-sm">Select</span>
              <button
                onClick={() => setTriggerActiveClasses(!triggerActiveClasses)}
                className={`${
                  triggerActiveClasses ? "main-button" : "second-button"
                }  border w-60`}
              >
                {triggerActiveClasses
                  ? "Active Classroom"
                  : "Inactive Classroom"}
              </button>
            </label>
            <label className="flex flex-col">
              <span className="text-gray-400 text-sm">Sort By</span>
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
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={classroomData}
              strategy={rectSortingStrategy}
            >
              <ul className="w-full pb-40 mt-5 grid grid-cols-3 gap-3">
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
