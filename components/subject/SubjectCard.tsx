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
import { subjectEmoji, subjectTint } from "../../utils/subjectList";
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
    <div className="flex grow flex-col p-3 pb-0">
      {/* Soft inset header: the subject's photo, or a friendly emoji. */}
      <div
        className={`relative flex h-28 items-center justify-center overflow-hidden rounded-2xl ${
          subject.backgroundImage ? "bg-background-color" : subjectTint(subject.id)
        }`}
      >
        {subject.backgroundImage ? (
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
        ) : (
          <span
            aria-hidden
            className="text-5xl transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
          >
            {subjectEmoji(subject.title)}
          </span>
        )}
        {subject.isLocked && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-icon-color shadow-sm">
            <MdLock aria-hidden />
            {subjectUiLanguage.locked(lang)}
          </span>
        )}
      </div>
      <div className="flex grow flex-col gap-1 px-1 pb-3 pt-3">
        <h3 className="line-clamp-2 break-words text-base font-bold leading-snug text-icon-color transition-colors group-hover:text-primary-color">
          {subject.title}
        </h3>
        {subject.description && (
          <p className="line-clamp-2 break-words text-sm text-icon-color/60">
            {subject.description}
          </p>
        )}
        <p className="mt-auto pt-1 text-xs text-icon-color/50">
          {subjectUiLanguage.educationYear(lang, subject.educationYear)}
        </p>
      </div>
    </div>
  );

  const classroomChip = (
    <>
      <span className="shrink-0 rounded-lg bg-primary-color/10 px-1.5 py-0.5 text-xs font-bold text-primary-color">
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
      // focus-within lifts the card so its open menu sits above neighbours.
      className={`group relative flex h-full min-w-0 flex-col rounded-3xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)] transition-shadow focus-within:z-10 hover:shadow-[0_16px_32px_rgba(145,158,171,0.24)] ${
        onClick ? "cursor-pointer" : ""
      } ${isDragging ? "z-20 opacity-80 ring-2 ring-primary-color/40" : ""}`}
    >
      {onClick ? (
        body
      ) : (
        <Link
          href={`/subject/${subject.id}`}
          style={{ pointerEvents: isDragging ? "none" : "auto" }}
          className="flex grow flex-col rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30"
        >
          {body}
        </Link>
      )}

      <div className="flex items-center gap-2 border-t border-icon-color/10 px-4 py-2.5">
        {onClick ? (
          <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-icon-color/70">
            {classroomChip}
          </span>
        ) : (
          <Link
            href={`/classroom/${classroom.id}`}
            className="flex min-w-0 flex-1 items-center gap-2 text-sm text-icon-color/70 transition-colors hover:text-primary-color"
          >
            {classroomChip}
          </Link>
        )}
        <ListMemberCircle members={teachers} />
        {draggable && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={classroomUiLanguage.dragToReorder(lang)}
            title={classroomUiLanguage.dragToReorder(lang)}
            className="flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-lg text-icon-color/40 transition-colors hover:bg-background-color hover:text-icon-color active:cursor-grabbing"
          >
            <MdDragIndicator aria-hidden />
          </button>
        )}
        {onDuplicate && (
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
        )}
      </div>
    </li>
  );
}

export default SubjectCard;
