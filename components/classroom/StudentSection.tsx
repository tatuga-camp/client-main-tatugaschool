import React from "react";
import { Student } from "../../interfaces";
import StudentCard from "../subject/StudentCard";
import { SortByOption, sortByOptions } from "../../data";

type Props = {
  students: Student[];
};
function StudentSection({ students }: Props) {
  const [studentData, setStudentData] = React.useState<Student[]>(students);
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setStudentData((prev) =>
          prev.sort((a, b) => Number(a.number) - Number(b.number))
        );
        break;
      case "Newest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          )
        );
        break;
      case "Oldest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
          )
        );
        break;
      case "A-Z":
        setStudentData((prev) =>
          prev.sort((a, b) => a.firstName.localeCompare(b.firstName))
        );
        break;
      case "Z-A":
        setStudentData((prev) =>
          prev.sort((a, b) => b.firstName.localeCompare(a.firstName))
        );
        break;
      default:
        break;
    }
  };

  const handleSearch = (search: string) => {
    setSearch(search);
    if (search === "") return setStudentData(students);
    setStudentData(() =>
      students?.filter(
        (student) =>
          student.firstName.toLowerCase().includes(search.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          student.number.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="flex items-center justify-start gap-2">
        <label className="flex flex-col">
          <span className="text-gray-400 text-sm">Search</span>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            type="text"
            className="w-96 border border-gray-300 rounded-lg p-2"
            placeholder="Search for student"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-gray-400 text-sm">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => {
              handleSortBy(e.target.value as SortByOption);
              setSortBy(e.target.value as SortByOption);
            }}
            className="main-selection w-40 border"
          >
            {sortByOptions.map((option) => (
              <option key={option.title} value={option.title}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section
        className="w-80 md:w-10/12 lg:w-9/12 place-items-center 
grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
      >
        {studentData.map((student) => {
          return (
            <StudentCard
              key={student.id}
              student={student as Student}
              isDragable={false}
              showSelect={false}
              setSelectStudent={() => {}}
            />
          );
        })}
      </section>
    </div>
  );
}

export default StudentSection;
