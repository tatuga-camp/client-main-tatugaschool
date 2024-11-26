import React, { CSSProperties } from "react";
import { Assignment, FileOnAssignment } from "../../interfaces";
import Link from "next/link";
import parse from "html-react-parser";
import { MdAssignment, MdDragIndicator } from "react-icons/md";
import { classworkLists } from "./ClassworkCreate";
import { BiBook } from "react-icons/bi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { useSortable, UseSortableArguments } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PropsClassworkCard = {
  classwork: Assignment & { files: FileOnAssignment[] };
  selectClasswork: Assignment | null;
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
};
function ClassworkCard(props: PropsClassworkCard) {
  return (
    <>
      {props.classwork.type === "Assignment" && (
        <AssignmentCard
          {...props}
          assignemnt={props.classwork}
          selectAssignment={props.selectClasswork}
        />
      )}

      {props.classwork.type === "Material" && (
        <MaterialCard
          {...props}
          material={props.classwork}
          selectMaterial={props.selectClasswork}
        />
      )}
    </>
  );
}

export default ClassworkCard;

type PropsAssignmentCard = {
  assignemnt: Assignment & { files: FileOnAssignment[] };
  subjectId: string;
  selectAssignment: Assignment | null;
  onSelect: (assignment: Assignment) => void;
};
function AssignmentCard({
  assignemnt,
  selectAssignment,
  onSelect,
  subjectId,
}: PropsAssignmentCard) {
  const sortable = useSortable({ id: assignemnt.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition || undefined,
  };

  const inlineStyles: CSSProperties = {
    opacity: sortable.isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    boxShadow: sortable.isDragging
      ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
      : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
    ...style,
  };
  return (
    <button
      ref={sortable.setNodeRef}
      style={inlineStyles}
      {...sortable.attributes}
      className="w-8/12 h-full flex flex-col transition-height"
      key={assignemnt.id}
    >
      <div
        onClick={() => onSelect(assignemnt)}
        className={`flex items-stretch w-full h-40  relative justify-start gap-2
       overflow-hidden hover:ring   bg-white  rounded-md border
       ${
         selectAssignment?.id === assignemnt.id &&
         !sortable.isDragging &&
         "rounded-b-none"
       }
       `}
      >
        <div
          className={`p-2 w-24 flex flex-col gap-2 items-center justify-center 
    h-full   text-2xl text-white
    ${assignemnt.status === "Draft" ? "bg-gray-400" : "gradient-bg"}
    `}
        >
          <MdAssignment />
          <span className="text-xs">{assignemnt.status}</span>
        </div>
        <div className="flex h-max p-2  flex-col gap-2 w-9/12">
          <div className="font-semibold text-start text-lg border-b max-w-[80%] truncate">
            {assignemnt.title}
          </div>
          <div className="text-gray-500 text-xs flex gap-1">
            {new Date(assignemnt.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <ul className="flex flex-wrap items-end gap-2 w-full">
            <li className="w-max h-max bg-gray-50  border p-1 rounded-md flex flex-col items-center justify-start ga-2 ">
              <span className="font-medium max-w-40 truncate text-primary-color text-base">
                {assignemnt.maxScore.toLocaleString()}
              </span>
              <span className="text-xs">Score</span>
            </li>
            {assignemnt.weight !== null && (
              <li className="w-max h-max bg-gray-50  border p-1 rounded-md flex flex-col items-center justify-start ga-2 ">
                <span className="font-medium max-w-40 truncate text-primary-color text-base">
                  {assignemnt.weight}%
                </span>
                <span className="text-xs">Weight</span>
              </li>
            )}
            {assignemnt.dueDate && (
              <li
                className="w-max h-max bg-gray-50 gap-1  border p-1
           rounded-md flex  items-center justify-start"
              >
                <span className="font-medium  truncate text-red-700 text-sm">
                  {new Date(assignemnt.dueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
                <span className="text-xs">Deadline</span>
              </li>
            )}
          </ul>
        </div>

        <div
          {...sortable.listeners}
          style={{ cursor: sortable.isDragging ? "grabbing" : "grab" }}
          className="w-6 h-10 rounded-md hover:bg-gray-300/50 flex items-center justify-center absolute top-2 right-2 "
        >
          <MdDragIndicator />
        </div>
      </div>
      <div
        className={`${
          selectAssignment?.id === assignemnt.id && !sortable.isDragging
            ? "h-80  border border-t-0"
            : "h-0"
        } bg-white rounded-md text-start rounded-t-none overflow-hidden w-full transition-height   `}
      >
        <p
          className={`  overflow-auto
        ${selectAssignment?.id === assignemnt.id ? "h-60 p-5" : "h-0"}
        `}
        >
          {parse(assignemnt.description)}
        </p>
        <Link
          href={`/subject/${subjectId}/assignment/${assignemnt.id}`}
          className="flex gap-2 border-t  items-center p-2 h-20"
        >
          <button className="main-button w-40">View</button>
        </Link>
      </div>
    </button>
  );
}

type PropsMaterialCard = {
  material: Assignment & { files: FileOnAssignment[] };
  subjectId: string;
  selectMaterial: Assignment | null;
  onSelect: (material: Assignment) => void;
};
function MaterialCard({
  material,
  subjectId,
  selectMaterial,
  onSelect,
}: PropsMaterialCard) {
  const sortable = useSortable({ id: material.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition || undefined,
  };

  const inlineStyles: CSSProperties = {
    opacity: sortable.isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    boxShadow: sortable.isDragging
      ? "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px"
      : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
    ...style,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={inlineStyles}
      {...sortable.attributes}
      className="w-8/12 h-full flex flex-col transition-height"
      key={material.id}
    >
      <button
        onClick={() => onSelect(material)}
        className={`flex items-stretch w-full h-40  relative justify-start gap-2
      overflow-hidden hover:ring   bg-white  rounded-md border
      ${
        selectMaterial?.id === material.id &&
        !sortable.isDragging &&
        "rounded-b-none"
      }
      `}
      >
        <div
          className={`p-2 w-24 flex flex-col gap-2 items-center justify-center 
      h-full   text-2xl text-white
      ${
        material.status === "Draft"
          ? "bg-gray-400"
          : "bg-gradient-to-r from-emerald-400 to-cyan-400"
      }
      `}
        >
          <BiBook />

          <span className="text-xs">{material.status}</span>
        </div>
        <div className="flex h-max p-2  flex-col gap-2 w-9/12">
          <div className="font-semibold text-start text-lg border-b max-w-[80%] truncate">
            {material.title}
          </div>
          <div className="text-gray-500 text-xs flex gap-1">
            {new Date(material.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <ul className="flex max-h-20 p-3 overflow-auto flex-wrap items-end gap-2 w-full">
            {material.files?.map((file, index) => {
              const isImage = file.type.includes("image");
              const fileName = file.url.split("/").pop();
              return (
                <li
                  onClick={() => window.open(file.url, "_blank")}
                  key={index}
                  className="w-full hover:cursor-pointer h-14 hover:bg-gray-100 transition
                   flex overflow-hidden rounded-md items-center justify-between  bg-white border"
                >
                  <div className="w-full h-full flex items-center justify-start gap-2">
                    <div
                      className="w-16 gradient-bg text-white text-lg flex items-center justify-center
             border-r h-full"
                    >
                      {isImage ? <FaRegFileImage /> : <FaRegFile />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{fileName}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div
          {...sortable.listeners}
          style={{ cursor: sortable.isDragging ? "grabbing" : "grab" }}
          className="w-6 h-10 rounded-md hover:bg-gray-300/50 
      flex items-center justify-center absolute top-2 right-2 "
        >
          <MdDragIndicator />
        </div>
      </button>
      <div
        className={`${
          selectMaterial?.id === material.id && !sortable.isDragging
            ? "h-80  border border-t-0"
            : "h-0"
        } bg-white rounded-md text-start rounded-t-none overflow-hidden w-full transition-height   `}
      >
        <p
          className={`  overflow-auto
        ${selectMaterial?.id === material.id ? "h-60 p-5" : "h-0"}
        `}
        >
          {parse(material.description)}
        </p>
        <Link
          href={`/subject/${subjectId}/assignment/${material.id}`}
          className="flex gap-2 border-t  items-center p-2 h-20"
        >
          <button className="main-button w-40">View</button>
        </Link>
      </div>
    </div>
  );
}