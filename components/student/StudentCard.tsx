import React, { memo } from "react";
import { Student, StudentOnSubject } from "../../interfaces";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { studentPointsLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

type Props = {
  student: (StudentOnSubject | Student) & { select?: boolean };
  showSelect: boolean;
  setSelectStudent: (
    data: (StudentOnSubject | Student) & { select?: boolean },
  ) => void;
  isDragable?: boolean;
};

// Points bubble colour: green for a positive total, red for negative, neutral
// at zero so an untouched class doesn't read as a wall of green.
function pointsTone(points: number) {
  if (points > 0) return "bg-success-color text-white";
  if (points < 0) return "bg-error-color text-white";
  return "bg-white text-gray-500 ring-1 ring-gray-200";
}

function StudentCard({
  student,
  setSelectStudent,
  isDragable = false,
  showSelect = false,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: student.id, disabled: !isDragable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const isSelected = showSelect && !!student.select;
  const points =
    "totalSpeicalScore" in student ? student.totalSpeicalScore : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative h-full w-full ${isDragging ? "z-20 opacity-60" : ""}`}
    >
      <button
        type="button"
        aria-pressed={showSelect ? isSelected : undefined}
        onClick={() => setSelectStudent(student)}
        className={`flex h-full w-full select-none flex-col items-center gap-3 rounded-2xl border px-3 pb-4 pt-5 text-center font-Anuphan transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color active:scale-[0.98] ${
          isSelected
            ? "border-primary-color bg-primary-color/5 ring-1 ring-primary-color"
            : "border-gray-200 bg-white hover:border-primary-color/40 hover:shadow-sm"
        } ${isDragging ? "shadow-lg" : ""}`}
      >
        <div className="relative">
          <div
            className={`relative h-16 w-16 overflow-hidden rounded-full bg-background-color ring-4 sm:h-20 sm:w-20 ${
              isSelected ? "ring-primary-color/20" : "ring-background-color"
            }`}
          >
            <Image
              fill
              sizes="80px"
              src={student.photo}
              alt={student.firstName}
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              placeholder="blur"
              className="object-cover"
            />
          </div>
          {points !== undefined && (
            <span
              title={`${points} ${studentPointsLanguage.points(lang)}`}
              className={`absolute -bottom-1 -right-3 flex h-7 min-w-7 max-w-16 items-center justify-center truncate rounded-full px-1.5 text-xs font-semibold tabular-nums shadow-sm ring-2 ring-white ${pointsTone(
                points,
              )}`}
            >
              {points}
            </span>
          )}
        </div>
        <div className="flex w-full min-w-0 flex-col items-center">
          {student.title && (
            <span className="max-w-full truncate text-xs text-gray-400">
              {student.title}
            </span>
          )}
          <span className="line-clamp-2 w-full break-words text-sm font-semibold leading-snug text-icon-color">
            {student.firstName} {student.lastName}
          </span>
          <span className="mt-0.5 text-xs text-gray-500">
            {studentPointsLanguage.number(lang)} {student.number}
          </span>
        </div>
      </button>

      {showSelect && (
        <span
          aria-hidden
          className={`pointer-events-none absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition ${
            isSelected
              ? "border-primary-color bg-primary-color text-white"
              : "border-gray-300 bg-white text-transparent"
          }`}
        >
          <FaCheck />
        </span>
      )}

      {isDragable && !showSelect && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={studentPointsLanguage.dragToReorder(lang)}
          title={studentPointsLanguage.dragToReorder(lang)}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          className="absolute left-1.5 top-1.5 flex h-8 w-6 touch-none items-center justify-center rounded-lg text-gray-400 transition hover:bg-background-color hover:text-icon-color focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <MdDragIndicator />
        </button>
      )}
    </div>
  );
}

export default memo(StudentCard);
