import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";
import { IoDuplicate } from "react-icons/io5";
import { MdDragIndicator, MdLock } from "react-icons/md";
import { defaultBlurHash } from "../../data";
import { classroomUiLanguage, subjectUiLanguage } from "../../data/languages";
import { Classroom, Subject, TeacherOnSubject } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import { shortGradeLabel, splitLevel } from "../../utils/classLevel";
import RowActionsMenu from "../common/RowActionsMenu";
import ListMemberCircle from "../member/ListMemberCircle";

type Props = {
  subject: Subject;
  teachers: TeacherOnSubject[];
  classroom: Classroom;
  // Picker mode: clicking selects the subject instead of opening it.
  onClick?: () => void;
  onDuplicate?: () => void;
  // Shows a drag handle; the parent must provide a SortableContext.
  draggable?: boolean;
};

function SubjectCard({
  subject,
  teachers,
  classroom,
  onClick,
  onDuplicate,
  draggable = false,
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
  } = useSortable({ id: subject.id, disabled: !draggable });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };
  const { grade, room } = splitLevel(classroom.level);
  const levelLabel = `${shortGradeLabel(grade, lang)}${room ? `/${room}` : ""}`;

  const body: ReactNode = (
    <>
      <div className="relative h-28 w-full overflow-hidden rounded-t-2xl bg-gradient-to-r from-primary-color to-secondary-color">
        {subject.backgroundImage && (
          <Image
            src={subject.backgroundImage}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              subject.blurHash ?? defaultBlurHash,
            )}
            alt=""
            className="object-cover"
          />
        )}
        {subject.isLocked && (
          <div aria-hidden className="absolute inset-0 bg-icon-color/50" />
        )}
        {subject.isLocked && (
          <span className="absolute bottom-2 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-icon-color">
            <MdLock aria-hidden />
            {subjectUiLanguage.locked(lang)}
          </span>
        )}
      </div>
      <div className="flex grow flex-col gap-1 p-4 pb-3">
        <h3 className="line-clamp-2 break-words font-bold leading-snug text-icon-color group-hover:text-primary-color">
          {subject.title}
        </h3>
        <p className="text-xs font-medium text-icon-color/60">
          {subjectUiLanguage.educationYear(lang, subject.educationYear)}
        </p>
        {subject.description && (
          <p className="mt-1 line-clamp-2 break-words text-sm text-icon-color/70">
            {subject.description}
          </p>
        )}
      </div>
    </>
  );

  const classroomLabel = (
    <>
      <span className="shrink-0 rounded-md bg-primary-color/10 px-1.5 py-0.5 text-xs font-bold text-primary-color">
        {levelLabel}
      </span>
      <span className="truncate">{classroom.title}</span>
    </>
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.()}
      className={`group relative flex h-full min-w-0 flex-col rounded-2xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)] ring-1 ring-icon-color/5 transition-shadow hover:shadow-[0_16px_32px_rgba(145,158,171,0.22)] ${
        onClick ? "cursor-pointer" : ""
      } ${isDragging ? "z-20 opacity-70 ring-2 ring-primary-color/40" : ""}`}
    >
      {onClick ? (
        <div className="flex grow flex-col">{body}</div>
      ) : (
        <Link
          href={`/subject/${subject.id}`}
          style={{ pointerEvents: isDragging ? "none" : "auto" }}
          className="flex grow flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30"
        >
          {body}
        </Link>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-icon-color/10 px-4 py-2.5">
        {onClick ? (
          <span className="flex min-w-0 items-center gap-2 text-sm text-icon-color/70">
            {classroomLabel}
          </span>
        ) : (
          <Link
            href={`/classroom/${classroom.id}`}
            className="flex min-w-0 items-center gap-2 text-sm text-icon-color/70 hover:text-primary-color"
          >
            {classroomLabel}
          </Link>
        )}
        <ListMemberCircle members={teachers} />
      </div>

      {(draggable || onDuplicate) && (
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {draggable && (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={classroomUiLanguage.dragToReorder(lang)}
              title={classroomUiLanguage.dragToReorder(lang)}
              className="flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full bg-white/90 text-lg text-icon-color/70 shadow-sm transition-colors hover:text-icon-color active:cursor-grabbing"
            >
              <MdDragIndicator aria-hidden />
            </button>
          )}
          {onDuplicate && (
            <span className="rounded-full bg-white/90 shadow-sm">
              <RowActionsMenu
                label={classroomUiLanguage.moreActions(lang, subject.title)}
                actions={[
                  {
                    key: "duplicate",
                    label: subjectUiLanguage.duplicate(lang),
                    icon: <IoDuplicate />,
                    onSelect: onDuplicate,
                  },
                ]}
              />
            </span>
          )}
        </div>
      )}
    </li>
  );
}

export default SubjectCard;
