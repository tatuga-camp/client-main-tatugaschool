import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import React, { memo } from "react";
import { MdDragIndicator } from "react-icons/md";
import { decodeBlurhashToCanvas } from "../../../utils";
import { defaultBlurHash } from "../../../data";
import { studentPointsLanguage } from "../../../data/languages";
import { Language } from "../../../interfaces";
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
  score?: number;
  lang?: Language;
};
function StudentOnGroup({
  student,
  type,
  studentOnSubjectId,
  studentOnGroupId,
  unitOnGroupId,
  isDragOver = false,
  score,
  lang = "en",
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
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: JSON.stringify(sortableId),
  });
  const inlineStyles: React.CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };
  const points = score ?? student.score ?? 0;

  return (
    <li
      ref={setNodeRef}
      style={inlineStyles}
      className={`flex h-12 w-full items-center gap-2 bg-white px-2 font-Anuphan ${
        isDragOver
          ? "w-72 rounded-xl shadow-lg ring-1 ring-primary-color/30"
          : "transition-colors hover:bg-background-color"
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        aria-label={`${student.firstName} ${student.lastName}`}
        style={{ cursor: isDragging || isDragOver ? "grabbing" : "grab" }}
        className="flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded-lg text-gray-300 transition-colors hover:text-icon-color"
      >
        <MdDragIndicator />
      </button>
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-background-color">
        <Image
          src={student.photo}
          alt=""
          quality={50}
          fill
          sizes="32px"
          placeholder="blur"
          blurDataURL={decodeBlurhashToCanvas(
            student.blurHash ?? defaultBlurHash,
          )}
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 grow flex-col">
        <span className="truncate text-sm font-medium leading-tight text-icon-color">
          {student.firstName} {student.lastName}
        </span>
        <span className="text-xs leading-tight text-gray-500">
          {studentPointsLanguage.number(lang)} {student.number}
        </span>
      </div>
      {type === "studentOnGroup" && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
            points > 0
              ? "bg-success-color/10 text-success-color"
              : points < 0
                ? "bg-error-color/10 text-error-color"
                : "bg-background-color text-gray-500"
          }`}
        >
          {points}
        </span>
      )}
    </li>
  );
}
const StudentOnGroupMemo = memo(StudentOnGroup);
export default StudentOnGroupMemo;
