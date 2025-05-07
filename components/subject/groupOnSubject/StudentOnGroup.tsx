import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { memo } from "react";
import { MdDragIndicator } from "react-icons/md";
import { CSSProperties } from "styled-components";
import { decodeBlurhashToCanvas } from "../../../utils";
import { defaultBlurHash } from "../../../data";
import { SortableIdType } from "./SelectGroup";

type StudentOnGroupProps = {
  student: {
    id: string;
    photo: string;
    firstName: string;
    lastName: string;
    blurHash?: string | null;
    number: string;
    score?: number;
  };
  type: "studentOnGroup" | "ungroupStudent";
  studentOnSubjectId: string | null;
  studentOnGroupId: string | null;
  unitOnGroupId: string | null;
  isDragOver?: boolean;
};
function StudentOnGroup({
  student,
  type,
  studentOnSubjectId,
  studentOnGroupId,
  unitOnGroupId,
  isDragOver = false,
}: StudentOnGroupProps) {
  const sortableId = {
    type: type,
    studentOnGroupId: studentOnGroupId,
    unitOnGroupId: unitOnGroupId,
    studentOnSubjectId: studentOnSubjectId,
  } as SortableIdType;

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: JSON.stringify(sortableId),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };
  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    ...style,
  };

  return (
    <li
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      className="w-full h-10  bg-white border-b 
  flex items-center justify-start gap-2 px-2"
    >
      <div
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="w-6 h-6  rounded-md text-black hover:bg-gray-300/50 flex 
  items-center justify-center "
      >
        <MdDragIndicator />
      </div>
      <div className="flex items-center w-full justify-between h-14 gap-2">
        <div className="flex items-center gap-2">
          {(isDragOver === undefined || isDragOver === false) && (
            <div className="w-5 h-5 md:w-6 md:h-6 relative rounded-md ring-1 overflow-hidden">
              <img
                src={student.photo}
                alt={student.firstName}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-xs md:text-sm font-semibold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-xs text-gray-500">Number {student.number}</p>
          </div>
        </div>
        <div className="flex  gradient-bg px-2 rounded-sm text-white">
          {student.score}
        </div>
      </div>
    </li>
  );
}
const StudentOnGroupMemo = memo(StudentOnGroup);
export default StudentOnGroupMemo;
