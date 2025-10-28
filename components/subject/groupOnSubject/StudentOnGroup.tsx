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
      className="flex h-10 w-full items-center justify-start gap-2 border-b bg-white px-2"
    >
      <div
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="flex h-6 w-6 items-center justify-center rounded-2xl text-black hover:bg-gray-300/50"
      >
        <MdDragIndicator />
      </div>
      <div className="flex h-14 w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(isDragOver === undefined || isDragOver === false) && (
            <div className="relative h-5 w-5 overflow-hidden rounded-2xl ring-1 md:h-6 md:w-6">
              <img
                src={student.photo}
                alt={student.firstName}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex grow flex-col gap-0">
            <h1
              className={`text-xs font-semibold ${type === "ungroupStudent" ? "text-red-700" : "text-primary-color"} md:text-base`}
            >
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-xs text-gray-500">Number {student.number}</p>
          </div>
        </div>
        <div className="gradient-bg flex rounded-sm px-2 text-white">
          {student.score}
        </div>
      </div>
    </li>
  );
}
const StudentOnGroupMemo = memo(StudentOnGroup);
export default StudentOnGroupMemo;
