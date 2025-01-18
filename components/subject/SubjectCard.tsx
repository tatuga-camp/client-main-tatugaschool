import React, { CSSProperties } from "react";
import { Classroom, Subject, TeacherOnSubject } from "../../interfaces";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { MdDragIndicator } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import ListMemberCircle from "../member/ListMemberCircle";

type Props = {
  subject: Subject;
  teachers: TeacherOnSubject[];
  classroom: Classroom;
};
function SubjectCard({ subject, teachers, classroom }: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subject.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    boxShadow: isDragging
      ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
      : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
    ...style,
  };

  return (
    <li
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      className="w-full h-64 cursor-pointer active:scale-105 flex flex-col rounded-lg overflow-hidden border"
    >
      <Link
        style={{
          pointerEvents: isDragging ? "none" : undefined,
        }}
        href={`/subject/${subject.id}`}
      >
        <div className="w-full h-24 relative gradient-bg flex items-end p-5">
          <div
            className="flex w-max text-xs  
         items-center absolute top-2 left-2 m-auto bg-white text-black  border-white gap-1 border rounded-full px-2 py-1 justify-center"
          >
            SUBJECT
          </div>
          <h1 className="text-white truncate w-48  text-lg font-semibold">
            {subject.title}
          </h1>
          <div
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            className="w-6 h-10 rounded-md text-white hover:bg-gray-300/50 flex 
items-center justify-center absolute top-2 right-2 "
          >
            <MdDragIndicator />
          </div>
        </div>
        <div className="p-5 pb-2 flex grow flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span
                title="Class's Level"
                className="font-semibold text-xl border-b"
              >
                ปีการศึกษา {subject.educationYear}
              </span>
              <p
                title="Class Begin Year"
                className="text-sm h-10  line-clamp-2"
              >
                {subject.description}
              </p>
            </div>

            <ListMemberCircle members={teachers} />
          </div>
        </div>
      </Link>
      <div className="bg-white text-gray-400 text-xs px-5">
        Classroom:{" "}
        <Link
          target="_blank"
          className="text-blue-600 underline"
          href={`/classroom/${classroom.id}`}
        >
          {classroom.level}
        </Link>
      </div>
    </li>
  );
}

export default SubjectCard;
