import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { FaUsers } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { classroomUiLanguage } from "../../data/languages";
import { Classroom, User } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import ClassLevelBadge from "./ClassLevelBadge";

export type ClassroomItem = Classroom & {
  studentNumbers: number;
  creator: User | null;
};

function ClassroomRow({ classroom }: { classroom: ClassroomItem }) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: classroom.id });
  const creatorName = classroom.creator
    ? `${classroom.creator.firstName} ${classroom.creator.lastName}`.trim()
    : null;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex items-center gap-1 bg-white pr-2 first:rounded-t-2xl last:rounded-b-2xl sm:pr-3 ${
        isDragging ? "z-10 rounded-2xl shadow-lg ring-2 ring-primary-color/30" : ""
      }`}
    >
      {/* The handle sits outside the link so the row stays one clean link. */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={classroomUiLanguage.dragToReorder(lang)}
        title={classroomUiLanguage.dragToReorder(lang)}
        className="ml-1 flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-icon-color/40 transition-colors hover:bg-background-color hover:text-icon-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/30 active:cursor-grabbing"
      >
        <MdDragIndicator aria-hidden className="text-xl" />
      </button>
      <Link
        href={`/classroom/${classroom.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl py-3 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/30 sm:gap-4"
      >
        <ClassLevelBadge
          level={classroom.level}
          archived={classroom.isAchieved}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate font-semibold text-icon-color transition-colors group-hover:text-primary-color">
                {classroom.title}
              </span>
              {classroom.isAchieved && (
                <span className="shrink-0 rounded-full bg-icon-color/10 px-2 py-0.5 text-xs font-medium text-icon-color/70">
                  {classroomUiLanguage.archived(lang)}
                </span>
              )}
            </p>
            {classroom.description && (
              <p className="truncate text-sm text-icon-color/60">
                {classroom.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-sm text-icon-color/70">
            <span className="flex items-center gap-1.5 tabular-nums">
              <FaUsers aria-hidden className="text-icon-color/40" />
              {classroomUiLanguage.studentCount(lang, classroom.studentNumbers)}
            </span>
            {classroom.creator && creatorName && (
              <span
                className="flex min-w-0 items-center gap-2"
                title={classroomUiLanguage.createdBy(lang, creatorName)}
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-color text-xs font-semibold text-icon-color/70 ring-1 ring-icon-color/10">
                  {classroom.creator.photo ? (
                    <Image
                      src={classroom.creator.photo}
                      alt=""
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  ) : (
                    classroom.creator.firstName.slice(0, 1)
                  )}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">
                  {creatorName}
                </span>
              </span>
            )}
          </div>
        </div>
        <FiChevronRight
          aria-hidden
          className="shrink-0 text-lg text-icon-color/30 transition-colors group-hover:text-primary-color"
        />
      </Link>
    </li>
  );
}

export default memo(ClassroomRow);
