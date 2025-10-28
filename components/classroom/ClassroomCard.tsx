import React, { CSSProperties, memo, useEffect, useState } from "react";
import { Classroom, MemberOnSchool } from "../../interfaces";
import { MdDragIndicator } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useGetMemberOnSchoolBySchool } from "../../react-query";
import ListMemberCircle from "../member/ListMemberCircle";

type Props = {
  classroom: Classroom & { studentNumbers: number };
};
function ClassroomCard({ classroom }: Props) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: classroom.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };
  const [creator, setCreator] = useState<MemberOnSchool>();
  const memberOnSchool = useGetMemberOnSchoolBySchool({
    schoolId: classroom.schoolId,
  });

  useEffect(() => {
    if (
      memberOnSchool.data &&
      classroom.userId !== undefined &&
      classroom.userId !== undefined
    ) {
      const member = memberOnSchool.data.find(
        (m) => m.userId === classroom.userId,
      );

      if (member) {
        setCreator(member);
      }
    }
  }, [memberOnSchool.data]);

  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",

    ...style,
  };
  const dateMonth = new Date(classroom.createAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Link
      style={{
        pointerEvents: isDragging ? "none" : undefined,
      }}
      href={`/classroom/${classroom.id}`}
    >
      <li
        ref={setNodeRef}
        style={inlineStyles}
        {...attributes}
        className="flex h-64 w-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-black active:scale-105"
      >
        <div
          className={`relative h-24 w-full ${
            classroom.isAchieved ? "gradient-bg-success" : "gradient-bg"
          } flex items-end p-5`}
        >
          <div className="absolute left-2 top-2 m-auto flex w-max items-center justify-center gap-1 rounded-full border border-black bg-yellow-300 px-2 py-1 text-xs text-black">
            CLASSROOM
          </div>
          <h1 className="w-48 truncate text-lg font-semibold text-white">
            {classroom.title}
          </h1>
          {classroom.isAchieved && (
            <div className="flex w-max items-center justify-center gap-1 rounded-full border border-white px-2 py-1 text-xs text-white">
              ACHIEVED
            </div>
          )}
          <div
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            className="absolute right-2 top-2 flex h-10 w-6 items-center justify-center rounded-2xl text-white hover:bg-gray-300/50"
          >
            <MdDragIndicator />
          </div>
        </div>
        <div className="flex grow flex-col justify-between p-5 pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span
                title="Class's Level"
                className="border-b text-xl font-semibold"
              >
                {classroom.level}
              </span>
              <p title="Class Begin Year" className="line-clamp-2 text-sm">
                {classroom.description}
              </p>
            </div>

            <div className="flex w-max items-center justify-center gap-1 rounded-full border px-2 py-1">
              <FaUsers />
              <span className="text-xs">
                {classroom.studentNumbers} Students
              </span>
            </div>
          </div>
          {creator ? (
            <div className="flex items-center justify-start gap-2 text-xs text-gray-400">
              Created By: <ListMemberCircle members={[creator]} />{" "}
              {creator.firstName} {creator.lastName}
            </div>
          ) : (
            <div className="text-xs text-gray-400">Created At: {dateMonth}</div>
          )}
        </div>
      </li>
    </Link>
  );
}

export default memo(ClassroomCard);
