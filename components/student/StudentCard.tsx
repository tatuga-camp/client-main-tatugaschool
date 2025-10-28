import React, { memo } from "react";
import { ScoreOnStudent, Student, StudentOnSubject } from "../../interfaces";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "styled-components";
import { MdDragIndicator } from "react-icons/md";

type Props = {
  student: (StudentOnSubject | Student) & { select?: boolean };
  showSelect: boolean;
  setSelectStudent: (
    data: (StudentOnSubject | Student) & { select?: boolean },
  ) => void;
  isDragable?: boolean;
};
function StudentCard({
  student,
  setSelectStudent,
  isDragable = false,
  showSelect = false,
}: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: student.id });
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
    <button
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      onClick={() => {
        setSelectStudent(student);
      }}
      className={`group relative flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-black p-3 hover:drop-shadow-md active:scale-105 ${
        student.select && showSelect ? "gradient-bg" : "bg-white"
      } h-60 overflow-hidden bg-white hover:bg-orange-500 sm:h-60 md:h-60 lg:h-60 xl:h-60`}
    >
      {isDragable && (
        <div
          {...listeners}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          className="absolute right-2 top-2 flex h-10 w-6 items-center justify-center rounded-2xl hover:bg-gray-300/50"
        >
          <MdDragIndicator />
        </div>
      )}
      {showSelect && (
        <input
          checked={student.select}
          type="checkbox"
          className="absolute right-2 top-2 h-5 w-5 rounded-full bg-primary-color"
        />
      )}

      {"totalSpeicalScore" in student && (
        <div
          className={`absolute -top-3 left-0 right-0 h-12 w-max min-w-10 max-w-20 ${
            student.select && showSelect ? "bg-white" : "bg-primary-color"
          } m-auto flex items-center justify-center rounded-2xl bg-primary-color text-white group-hover:bg-white`}
        >
          <span
            className={`max-w-14 truncate ${
              student.select && showSelect ? "text-primary-color" : "text-white"
            } w-max group-hover:text-primary-color`}
          >
            {student.totalSpeicalScore}
          </span>
        </div>
      )}
      <div className="relative h-20 w-20 overflow-hidden rounded-full">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={student.photo}
          alt="Student"
          className="h-full w-full object-cover transition group-hover:scale-150"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-0 text-center">
        <span className="text-xs text-gray-500">{student.title}</span>
        <h2
          className={`text-center text-sm group-hover:text-white ${student.select && showSelect ? "text-white" : "text-primary-color"} w-11/12 truncate text-center font-semibold text-gray-800 sm:text-base md:text-lg lg:text-base`}
        >
          {student.firstName} {student.lastName}
        </h2>
        <span
          className={`text-xs font-medium ${student.select && showSelect ? "text-white" : "text-gray-500"} text-gray-500 group-hover:text-white sm:text-sm md:text-sm`}
        >
          Number {student.number}
        </span>
      </div>
    </button>
  );
}

export default memo(StudentCard);
