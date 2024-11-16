import React, { memo } from "react";
import { ScoreOnStudent, StudentOnSubject } from "../../interfaces";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "styled-components";
import { MdDragIndicator } from "react-icons/md";

type Props = {
  student: StudentOnSubject & { select?: boolean };
  showSelect: boolean;
  setSelectStudent: (data: StudentOnSubject & { select?: boolean }) => void;
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
      className={`w-48 p-3 group flex flex-col items-center justify-center
     gap-2 h-52 rounded-xl relative hover:drop-shadow-md active:scale-105 ${
       student.select && showSelect ? "gradient-bg " : "bg-white"
     }
      overflow-hidden hover:bg-primary-color  bg-white`}
    >
      {!isDragable && (
        <div
          {...listeners}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          className="w-6 h-10 rounded-md hover:bg-gray-300/50 flex items-center justify-center absolute top-2 right-2 "
        >
          <MdDragIndicator />
        </div>
      )}
      {showSelect && (
        <input
          checked={student.select}
          type="checkbox"
          className="w-5 h-5 rounded-full bg-primary-color absolute top-2 right-2"
        />
      )}

      <div
        className={`min-w-10 w-max  max-w-20 h-12  absolute left-0 right-0 -top-3 ${
          student.select && showSelect ? "bg-white" : "bg-primary-color"
        }
      m-auto bg-primary-color group-hover:bg-white  rounded-2xl flex items-center justify-center text-white`}
      >
        <span
          className={`max-w-14 truncate
            ${
              student.select && showSelect ? "text-primary-color" : "text-white"
            }
            w-max group-hover:text-primary-color `}
        >
          {student.totalSpeicalScore}
        </span>
      </div>
      <div className="w-20 h-20 relative rounded-full overflow-hidden">
        <Image
          fill
          src={student.photo}
          alt="Student"
          className="object-cover w-full h-full"
        />
      </div>
      <h2
        className={`text-sm group-hover:text-white 
          ${student.select && showSelect ? "text-white" : "text-gray-800"}
          w-11/12 truncate text-center font-semibold text-gray-800`}
      >
        {student.firstName} {student.lastName}
      </h2>
      <span
        className={`text-xs
        ${student.select && showSelect ? "text-white" : "text-gray-500"}
        group-hover:text-white text-gray-500`}
      >
        Number {student.number}
      </span>
    </button>
  );
}

export default memo(StudentCard);
