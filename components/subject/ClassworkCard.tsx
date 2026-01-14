import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import parse from "html-react-parser";
import Link from "next/link";
import { CSSProperties } from "react";
import { BiBook } from "react-icons/bi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { MdAssignment, MdDragIndicator, MdLink } from "react-icons/md";
import { Assignment, FileOnAssignment } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { classworkCardDataLanguage } from "../../data/languages";
import TextEditor from "../common/TextEditor";

type PropsClassworkCard = {
  classwork: Assignment & {
    files: FileOnAssignment[];
    studentAssign: number;
    reviewNumber: number;
    summitNumber: number;
    penddingNumber: number;
  };
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
  assignemnt: Assignment & {
    files: FileOnAssignment[];
    studentAssign: number;
    reviewNumber: number;
    summitNumber: number;
    penddingNumber: number;
  };
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
  const language = useGetLanguage();
  const inlineStyles: CSSProperties = {
    opacity: sortable.isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",

    ...style,
  };
  return (
    <button
      ref={sortable.setNodeRef}
      style={inlineStyles}
      {...sortable.attributes}
      className="flex h-max w-full flex-col transition-height"
      key={assignemnt.id}
    >
      <div
        onClick={() => onSelect(assignemnt)}
        className={`relative flex h-40 w-full items-stretch justify-start gap-2 overflow-hidden rounded-2xl border-2 border-black bg-white hover:ring ${
          selectAssignment?.id === assignemnt.id &&
          !sortable.isDragging &&
          "rounded-b-none"
        } `}
      >
        <div
          className={`flex h-full w-24 flex-col items-center justify-center gap-2 p-2 text-2xl text-white ${assignemnt.status === "Draft" ? "bg-gray-400" : "gradient-bg"} `}
        >
          <MdAssignment />
          <span className="text-xs">
            {classworkCardDataLanguage[
              assignemnt.status as keyof typeof classworkCardDataLanguage
            ](language.data ?? "en")}
          </span>
        </div>
        <div className="flex w-9/12 grow flex-col gap-2 p-2">
          <div className="max-w-[80%] truncate border-b text-start text-lg font-semibold">
            {assignemnt.title}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {new Date(assignemnt.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <div className="flex w-full items-center justify-between">
            <ul className="flex w-full flex-wrap items-end gap-2">
              <li className="ga-2 flex h-max w-max flex-col items-center justify-start rounded-2xl border bg-gray-50 p-1">
                <span className="max-w-40 truncate text-base font-medium text-primary-color">
                  {assignemnt.maxScore.toLocaleString()}
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.score(language.data ?? "en")}
                </span>
              </li>
              {assignemnt.weight !== null && (
                <li className="ga-2 flex h-max w-max flex-col items-center justify-start rounded-2xl border bg-gray-50 p-1">
                  <span className="max-w-40 truncate text-base font-medium text-primary-color">
                    {assignemnt.weight}%
                  </span>
                  <span className="text-xs">
                    {classworkCardDataLanguage.weight(language.data ?? "en")}
                  </span>
                </li>
              )}
              {assignemnt.dueDate && (
                <li className="flex h-max w-max items-center justify-start gap-1 rounded-2xl border bg-gray-50 p-1">
                  <span className="truncate text-sm font-medium text-red-700">
                    {new Date(assignemnt.dueDate).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        minute: "numeric",
                        hour: "numeric",
                      },
                    )}
                  </span>
                  <span className="text-xs">
                    {classworkCardDataLanguage.Deadline(language.data ?? "en")}
                  </span>
                </li>
              )}
            </ul>
            <ul className="flex gap-2">
              <li className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-black md:h-16 md:w-16 lg:h-20 lg:w-20">
                <span className="text-2xl font-semibold">
                  {assignemnt.penddingNumber}
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.NoWork(language.data ?? "en")}
                </span>
              </li>
              <li className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-yellow-400 md:h-16 md:w-16 lg:h-20 lg:w-20">
                <span className="text-2xl font-semibold">
                  {assignemnt.summitNumber}
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.WaitReview(language.data ?? "en")}
                </span>
              </li>
              <li className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-white md:h-16 md:w-16 lg:h-20 lg:w-20">
                <span className="text-2xl font-semibold">
                  {assignemnt.reviewNumber}
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.Reviewed(language.data ?? "en")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          {...sortable.listeners}
          style={{ cursor: sortable.isDragging ? "grabbing" : "grab" }}
          className="absolute right-2 top-2 flex h-10 w-6 items-center justify-center rounded-2xl hover:bg-gray-300/50"
        >
          <MdDragIndicator />
        </div>
      </div>
      <div
        className={`${
          selectAssignment?.id === assignemnt.id && !sortable.isDragging
            ? "h-80 border border-t-0"
            : "h-0"
        } flex w-full flex-col overflow-hidden rounded-2xl rounded-t-none bg-white text-start transition-height`}
      >
        <div className="h-64 overflow-auto p-2">
          <div className="h-max w-full">
            <ul className="flex w-full flex-wrap gap-2 p-3">
              {assignemnt.files?.map((file, index) => {
                const isImage = file.type.includes("image");
                const fileName = file.url.split("/").pop();
                const isLink = file.type === "LINK";
                return (
                  <li
                    onClick={() => window.open(file.url, "_blank")}
                    key={index}
                    className="flex h-14 w-max items-center justify-between overflow-hidden rounded-2xl border bg-white pr-2 text-xs transition hover:cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex h-full w-full items-center justify-start gap-2">
                      <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
                        {isLink ? (
                          <MdLink />
                        ) : isImage ? (
                          <FaRegFileImage />
                        ) : (
                          <FaRegFile />
                        )}
                      </div>
                      <div className="flex max-w-40 items-center gap-2 truncate">
                        <span>{isLink ? file.url : fileName}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="h-96 w-full">
              <TextEditor
                schoolId={assignemnt.schoolId}
                disabled={true}
                toolbar={false}
                onChange={() => {}}
                value={assignemnt.description}
                menubar={false}
              />
            </p>
          </div>
        </div>
        <Link
          href={`/subject/${subjectId}/assignment/${assignemnt.id}`}
          className="flex h-14 items-center gap-2 border-t p-2"
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
  const language = useGetLanguage();

  const inlineStyles: CSSProperties = {
    opacity: sortable.isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",

    ...style,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={inlineStyles}
      {...sortable.attributes}
      className="flex h-full w-full flex-col transition-height"
      key={material.id}
    >
      <button
        onClick={() => onSelect(material)}
        className={`relative flex h-40 w-full items-stretch justify-start gap-2 overflow-hidden rounded-2xl border-2 border-black hover:ring ${
          selectMaterial?.id === material.id &&
          !sortable.isDragging &&
          "rounded-b-none"
        } `}
      >
        <div
          className={`flex h-full w-24 flex-col items-center justify-center gap-2 p-2 text-2xl text-white ${
            material.status === "Draft"
              ? "bg-gray-400"
              : "bg-gradient-to-r from-emerald-400 to-cyan-400"
          } `}
        >
          <BiBook />

          <span className="text-xs">
            {" "}
            {classworkCardDataLanguage[
              material.status as keyof typeof classworkCardDataLanguage
            ](language.data ?? "en")}
          </span>
        </div>
        <div className="flex h-max w-9/12 flex-col gap-2 p-2">
          <div className="max-w-[80%] truncate border-b text-start text-lg font-semibold">
            {material.title}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {new Date(material.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <ul className="flex max-h-20 w-full flex-wrap gap-2 overflow-auto p-3">
            {material.files?.map((file, index) => {
              const isImage = file.type.includes("image");
              const fileName = file.url.split("/").pop();
              return (
                <li
                  onClick={() => window.open(file.url, "_blank")}
                  key={index}
                  className="flex h-14 w-max items-center justify-between overflow-hidden rounded-2xl border bg-white pr-2 text-xs transition hover:cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex h-full w-full items-center justify-start gap-2">
                    <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
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
          className="absolute right-2 top-2 flex h-10 w-6 items-center justify-center rounded-2xl hover:bg-gray-300/50"
        >
          <MdDragIndicator />
        </div>
      </button>
      <div
        className={`${
          selectMaterial?.id === material.id && !sortable.isDragging
            ? "h-80 border border-t-0"
            : "h-0"
        } w-full overflow-hidden rounded-2xl rounded-t-none bg-white text-start transition-height`}
      >
        <div className="h-64 overflow-auto p-2">
          <p className="h-96">
            <TextEditor
              schoolId={material.schoolId}
              disabled={true}
              toolbar={false}
              onChange={() => {}}
              value={material.description}
              menubar={false}
            />
          </p>
        </div>
        <Link
          href={`/subject/${subjectId}/assignment/${material.id}`}
          className="flex h-20 items-center gap-2 border-t p-2"
        >
          <button className="main-button w-40">View</button>
        </Link>
      </div>
    </div>
  );
}
