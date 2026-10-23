import React, { memo, useState } from "react";
import { Student, StudentOnSubject } from "../../interfaces";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator, MdStar } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { studentPointsLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { mascotForPhoto } from "../../utils/mascot";
import MascotAvatar from "./MascotAvatar";

type Props = {
  student: (StudentOnSubject | Student) & { select?: boolean };
  showSelect: boolean;
  setSelectStudent: (
    data: (StudentOnSubject | Student) & { select?: boolean },
  ) => void;
  isDragable?: boolean;
};

// Points chip colour: green for a positive total, red for negative, neutral
// at zero so an untouched class doesn't read as a wall of green.
function pointsTone(points: number) {
  if (points > 0) return "bg-success-color text-white";
  if (points < 0) return "bg-error-color text-white";
  return "bg-white/80 text-gray-500 backdrop-blur-sm";
}

// Grid is 2 columns on phones up to 7 on wide screens.
const AVATAR_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px";

// Built-in cartoon avatars are square full-body art, so they sit whole in a
// square at the top of the tile; uploaded photos fill the tile instead.
const isCartoonAvatar = (photo: string) =>
  photo.startsWith("https://storage.tatugaschool.com/AVATAR/");

/**
 * Student tile: the avatar (animated mascot or photo) fills the card and the
 * name sits on a frosted label over its feet, like a character picker.
 */
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
  const mascot = mascotForPhoto(student.photo);
  const [hovered, setHovered] = useState(false);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative h-full w-full ${isDragging ? "z-20 opacity-60" : ""}`}
      onPointerEnter={(e) => {
        if (mascot && e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-pressed={showSelect ? isSelected : undefined}
        aria-label={fullName}
        title={fullName}
        onClick={() => setSelectStudent(student)}
        className={`relative block aspect-[4/5] w-full select-none overflow-hidden rounded-2xl bg-background-color text-left font-Anuphan transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color focus-visible:ring-offset-2 active:scale-[0.98] ${
          isSelected
            ? "ring-2 ring-primary-color ring-offset-2"
            : "ring-1 ring-gray-200/80 hover:shadow-md hover:ring-primary-color/40"
        } ${isDragging ? "shadow-lg" : ""}`}
      >
        <span
          className={`absolute inset-x-0 top-0 ${
            mascot || isCartoonAvatar(student.photo)
              ? "aspect-square"
              : "bottom-0"
          }`}
        >
          {mascot ? (
            <MascotAvatar
              id={student.id}
              clips={mascot}
              alt={student.firstName}
              active={hovered}
              sizes={AVATAR_SIZES}
            />
          ) : (
            <Image
              fill
              sizes={AVATAR_SIZES}
              src={student.photo}
              alt={student.firstName}
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              placeholder="blur"
              className="object-cover"
            />
          )}
        </span>
        {isSelected && (
          <span aria-hidden className="absolute inset-0 bg-primary-color/10" />
        )}
        <span className="absolute inset-x-2 bottom-2 flex flex-col rounded-xl bg-white/70 px-2.5 py-1.5 shadow-sm ring-1 ring-white/60 backdrop-blur-md">
          <span className="truncate text-sm font-semibold leading-snug text-icon-color">
            {fullName}
          </span>
          <span className="truncate text-[11px] leading-tight text-gray-500">
            {studentPointsLanguage.number(lang)} {student.number}
            {student.title && ` · ${student.title}`}
          </span>
        </span>
      </button>

      {points !== undefined && (
        <span
          title={`${points} ${studentPointsLanguage.points(lang)}`}
          className={`pointer-events-none absolute right-2 top-2 flex h-7 min-w-7 max-w-16 items-center justify-center truncate rounded-full px-2 text-xs font-semibold tabular-nums shadow-sm ${pointsTone(
            points,
          )}`}
        >
          <MdStar /> {points}
        </span>
      )}

      {showSelect && (
        <span
          aria-hidden
          className={`pointer-events-none absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] shadow-sm transition ${
            isSelected
              ? "border-primary-color bg-primary-color text-white"
              : "border-gray-300 bg-white/80 text-transparent backdrop-blur-sm"
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
          className="absolute left-2 top-2 flex h-8 w-7 touch-none items-center justify-center rounded-lg bg-white/70 text-gray-500 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-icon-color focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <MdDragIndicator />
        </button>
      )}
    </div>
  );
}

export default memo(StudentCard);
