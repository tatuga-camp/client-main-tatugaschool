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
        (m) => m.userId === classroom.userId
      );

      if (member) {
        setCreator(member);
      }
    }
  }, [memberOnSchool.data]);

  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    boxShadow: isDragging
      ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
      : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
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
        className="w-full h-64 cursor-pointer active:scale-105 flex flex-col rounded-lg overflow-hidden border"
      >
        <div
          className={`w-full h-24 relative ${
            classroom.isAchieved ? "gradient-bg-success" : "gradient-bg"
          }  flex items-end p-5`}
        >
          <div
            className="flex w-max text-xs  
             items-center absolute top-2 left-2 m-auto bg-white text-black  border-white gap-1 border rounded-full px-2 py-1 justify-center"
          >
            CLASSROOM
          </div>
          <h1 className="text-white truncate w-48  text-lg font-semibold">
            {classroom.title}
          </h1>
          {classroom.isAchieved && (
            <div
              className="flex w-max text-xs  
             items-center   text-white  border-white gap-1 border rounded-full px-2 py-1 justify-center"
            >
              ACHIEVED
            </div>
          )}
          <div
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            className="w-6 h-10 rounded-md text-white hover:bg-gray-300/50 flex 
items-center justify-center absolute top-2 right-2 "
          >
            <MdDragIndicator />
          </div>
        </div>
        <div className="p-5 pb-2 flex grow flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span
                title="Class's Level"
                className="font-semibold text-xl border-b"
              >
                {classroom.level}
              </span>
              <p title="Class Begin Year" className="text-sm line-clamp-2">
                {classroom.description}
              </p>
            </div>

            <div className="flex w-max items-center gap-1 border rounded-full px-2 py-1 justify-center">
              <FaUsers />
              <span className=" text-xs">
                {classroom.studentNumbers} Students
              </span>
            </div>
          </div>
          {creator ? (
            <div className="text-gray-400 text-xs flex items-center justify-start gap-2">
              Created By: <ListMemberCircle members={[creator]} />{" "}
              {creator.firstName} {creator.lastName}
            </div>
          ) : (
            <div className="text-gray-400 text-xs">Created At: {dateMonth}</div>
          )}
        </div>
      </li>
    </Link>
  );
}

export default memo(ClassroomCard);
