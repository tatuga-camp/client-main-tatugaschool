import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, memo, useRef, useState } from "react";
import { MdDelete, MdDragIndicator } from "react-icons/md";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  StudentOnGroup,
  StudentOnSubject,
  UnitOnGroup,
} from "../../../interfaces";
import {
  useDeleteUnitOnGroup,
  useGetLanguage,
  useUpdateUnitOnGroup,
} from "../../../react-query";
import ConfirmDeleteMessage from "../../common/ConfirmDeleteMessage";
import LoadingBar from "../../common/LoadingBar";
import ListMemberCircle from "../../member/ListMemberCircle";
import { SortableIdType } from "./SelectGroup";
import StudentOnGroupMemo from "./StudentOnGroup";

type ColumProps = {
  unit?: UnitOnGroup & {
    students: StudentOnGroup[];
  };
  type: "unitOnGroup" | "ungroupStudent";
  students?: StudentOnSubject[];
};

function Colum({ unit, type, students }: ColumProps) {
  const sortableId = {
    type: type,
    studentOnGroupId: null,
    unitOnGroupId: unit ? unit.id : null,
    studentOnSubjectId: null,
  } as SortableIdType;

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: JSON.stringify(sortableId) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };
  const inlineStyles: CSSProperties = {
    opacity: isDragging ? "0.5" : "1",
    transformOrigin: "50% 50%",
    ...style,
  };

  if (!unit) {
    return (
      <li
        ref={setNodeRef}
        className="w-full h-max min-h-full flex flex-col   rounded-md  "
      >
        <header
          className="w-full flex relative rounded-md bg-gradient-to-r
           from-rose-400 to-red-500 text-white font-semibold  gap-2 items-center
     justify-between px-2 h-max py-2 "
        >
          Ungroup Students
        </header>

        <ul className="grid grid-cols-1 place-content-start min-h-40 bg-white">
          {students?.map((studentOnSubject) => {
            return (
              <StudentOnGroupMemo
                student={{ ...studentOnSubject }}
                unitOnGroupId={null}
                studentOnGroupId={null}
                studentOnSubjectId={studentOnSubject.id}
                type="ungroupStudent"
              />
            );
          })}
        </ul>
      </li>
    );
  }

  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<{
    title: string;
    description: string;
  }>({
    title: unit.title,
    description: unit.description ?? "",
  });
  const language = useGetLanguage();
  const deleteColum = useDeleteUnitOnGroup();
  const update = useUpdateUnitOnGroup();
  const handleOnSave = async (
    e: React.FocusEvent<HTMLInputElement, Element>
  ) => {
    if (formRef.current?.reportValidity()) {
      try {
        await update.mutateAsync({
          query: {
            unitOnGroupId: unit.id,
          },
          body: {
            title: data.title,
            description: data.description,
          },
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteColum.mutateAsync({
        unitOnGroupId: unit.id,
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      className="w-full h-max min-h-full flex flex-col   rounded-md  "
    >
      {(update.isPending || deleteColum.isPending) && <LoadingBar />}
      <header
        className="w-full flex relative rounded-md  gap-2 items-center
       justify-between px-2 h-max py-2 gradient-bg"
      >
        <form ref={formRef} className="flex flex-col">
          <input
            disabled={update.isPending}
            onBlur={handleOnSave}
            value={data.title}
            onChange={(e) => {
              setData((prev) => {
                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
            required
            className="font-semibold  focus:outline-none focus:border-b  text-white bg-transparent w-40 "
          />
          <input
            disabled={update.isPending}
            required
            onBlur={handleOnSave}
            value={data.description}
            onChange={(e) => {
              setData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            className="font-normal text-xs  focus:outline-none focus:border-b  text-white bg-transparent w-52 "
          />
        </form>
        <section>
          <section className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                ConfirmDeleteMessage({
                  language: language.data ?? "en",
                  callback: async () => {
                    await handleDelete();
                  },
                });
              }}
              disabled={deleteColum.isPending}
              className="w-6 h-6 z-20 rounded-md text-red-700 hover:bg-white flex items-center justify-center "
            >
              <MdDelete />
            </button>
            <button
              {...listeners}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
              className="w-6 h-6 z-20 rounded-md text-gray-700 hover:bg-gray-300/50 flex items-center justify-center "
            >
              <MdDragIndicator />
            </button>
          </section>
          <section className="flex flex-col gap-1">
            <h1 className="font-semibold border-b text-center text-xl text-white ">
              {unit.totalScore}{" "}
              <span className="text-sm font-normal">score</span>
            </h1>
            <ListMemberCircle maxShow={4} members={unit.students} />
          </section>
        </section>
      </header>
      {unit.students.length > 0 ? (
        <ul className="grid grid-cols-1">
          {unit.students
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((studentOnGroup) => {
              return (
                <StudentOnGroupMemo
                  key={studentOnGroup.id + studentOnGroup.unitOnGroupId}
                  studentOnGroupId={studentOnGroup.id}
                  type="studentOnGroup"
                  studentOnSubjectId={null}
                  unitOnGroupId={studentOnGroup.unitOnGroupId}
                  student={studentOnGroup}
                />
              );
            })}
        </ul>
      ) : (
        <div className="w-full grow bg-white flex items-center justify-center">
          No Students
        </div>
      )}
    </li>
  );
}
const ColumMemo = memo(Colum);
export default ColumMemo;
