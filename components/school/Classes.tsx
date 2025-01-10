import React, { useCallback, useEffect } from "react";
import { useGetClassrooms, useReorderClassrooms } from "../../react-query";
import { Class } from "../../interfaces";
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
import ClassesCard from "./ClassesCard";

const sortByOptions = [
  {
    title: "Default",
  },
  {
    title: "Newest",
  },
  {
    title: "Oldest",
  },
  {
    title: "A-Z",
  },
  {
    title: "Z-A",
  },
] as const;
type SortByOption = (typeof sortByOptions)[number]["title"];

type Props = {
  schoolId: string;
};
function Classes({ schoolId }: Props) {
  const reorder = useReorderClassrooms();
  const [classroomData, setClassroomData] = React.useState<
    (Class & {
      studentNumbers: number;
    })[]
  >([]);
  const [triggerActiveClasses, setTriggerActiveClasses] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

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
      setClassroomData(classrooms.data.sort((a, b) => a.order - b.order));
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
          classroom.level.toLowerCase().includes(search.toLowerCase()) ||
          classroom.educationYear.toString().includes(search)
      )
    );
  };

  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setClassroomData((prev) => prev?.sort((a, b) => a.order - b.order));
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
    <div className="w-full bg-white flex  flex-col justify-center">
      <header
        className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
      >
        <section className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold">Classes</h1>
          <p className="text-gray-400 max-w-96 break-words text-sm md:text-base">
            This section is for managing classes. You can create, edit, and
            delete classes here.
          </p>
        </section>
        <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
          <button className="main-button w-full xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600">
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
              }  border w-40`}
            >
              {triggerActiveClasses ? "Active Classes" : "Inactive Classes"}
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
          <SortableContext items={classroomData} strategy={rectSortingStrategy}>
            <ul className="w-full pb-40 mt-5 grid grid-cols-3 gap-3">
              {classroomData?.map((classroom) => {
                return <ClassesCard classroom={classroom} key={classroom.id} />;
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  );
}

export default Classes;
