import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { CSSProperties } from "react";
import { IoDuplicate } from "react-icons/io5";
import { MdDragIndicator } from "react-icons/md";
import { defaultBlurHash } from "../../data";
import { Classroom, Subject, TeacherOnSubject } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import ListMemberCircle from "../member/ListMemberCircle";

type Props = {
  subject: Subject;
  teachers: TeacherOnSubject[];
  classroom: Classroom;
  onClick?: () => void;
  onDuplicate?: () => void;
};
function SubjectCard({
  subject,
  teachers,
  classroom,
  onClick,
  onDuplicate,
}: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subject.id });
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
    <li
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      onClick={() => onClick?.()}
      className="flex h-64 w-full flex-col overflow-hidden rounded-lg border active:scale-105"
    >
      <div
        className={`relative h-24 w-full shadow-inner ${
          subject.backgroundImage ? "" : "gradient-bg"
        } flex items-end p-5`}
      >
        {subject.backgroundImage && (
          <div className="gradient-shadow absolute bottom-0 left-0 right-0 top-0 z-10 m-auto h-full w-full"></div>
        )}
        {subject.backgroundImage && (
          <Image
            src={subject.backgroundImage}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              subject.blurHash ?? defaultBlurHash,
            )}
            alt="background"
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2 z-20 m-auto flex w-max items-center justify-center gap-1 rounded-full border border-white bg-white px-2 py-1 text-xs text-black">
          SUBJECT
        </div>
        <h1 className="z-20 w-48 truncate text-lg font-semibold text-white">
          {subject.title}
        </h1>
        <button
          onClick={() => onDuplicate?.()}
          title="Duplicate Subject"
          className="absolute right-8 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-md text-white hover:bg-gray-300/50"
        >
          <IoDuplicate />
        </button>
        <div
          {...listeners}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-md text-white hover:bg-gray-300/50"
        >
          <MdDragIndicator />
        </div>
      </div>
      <Link
        style={{
          pointerEvents: isDragging || onClick ? "none" : "auto",
        }}
        href={`/subject/${subject.id}`}
      >
        <div className="flex grow flex-col justify-between p-5 pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span
                title="Class's Level"
                className="border-b text-xl font-semibold"
              >
                ปีการศึกษา {subject.educationYear}
              </span>
              <p title="Class Begin Year" className="line-clamp-2 h-10 text-sm">
                {subject.description}
              </p>
            </div>

            <ListMemberCircle members={teachers} />
          </div>
        </div>
      </Link>
      <div className="bg-white px-5 text-xs text-gray-400">
        Classroom:{" "}
        <Link
          target="_blank"
          className="text-blue-600 underline"
          href={`/classroom/${classroom.id}`}
        >
          {classroom.title} : {classroom.level}
        </Link>
      </div>
    </li>
  );
}

export default SubjectCard;
