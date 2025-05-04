import Image from "next/image";
import { Toast } from "primereact/toast";
import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { MdCreate, MdDelete, MdDragIndicator, MdGroup } from "react-icons/md";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import {
  ErrorMessages,
  GroupOnSubject,
  StudentOnGroup,
  StudentOnSubject,
  UnitOnGroup,
} from "../../interfaces";
import {
  useCreateGroupOnSubject,
  useCreateUnitOnGroup,
  useDeleteGroupOnSubject,
  useDeleteUnitOnGroup,
  useGetGroupOnSubject,
  useGetGroupOnSubjects,
  useGetLanguage,
  useGetStudentOnSubject,
  useReorderStudentOnGroup,
  useReorderUnitGroup,
  useUpdateGroupOnSubject,
  useUpdateUnitOnGroup,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import LoadingBar from "../common/LoadingBar";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import ListMemberCircle from "../member/ListMemberCircle";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  subjectId: string;
};
function ShowGroups({ subjectId }: Props) {
  const toast = useRef<Toast>(null);
  const [selectGroup, setSelectGroup] = useState<GroupOnSubject | undefined>();
  const groups = useGetGroupOnSubjects({
    subjectId,
  });
  const [triggerCreateGroup, setTriggerCreateGroup] = useState<boolean>(false);

  return (
    <>
      {triggerCreateGroup && (
        <PopupLayout onClose={() => setTriggerCreateGroup(() => false)}>
          <GroupSetting
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateGroup(() => false);
            }}
            subjectId={subjectId}
            toast={toast}
          />
        </PopupLayout>
      )}
      <Toast ref={toast} />
      <div className="w-full md:w-10/12 font-Anuphan lg:w-9/12  flex flex-col">
        <header className="w-full flex items-center gap-2 justify-start border-b py-2">
          <button
            onClick={() => {
              setSelectGroup(undefined);
              setTriggerCreateGroup(() => true);
            }}
            className="main-button w-40 text-xs h-full flex-col flex items-center justify-center gap-1"
          >
            <CiCirclePlus className="text-4xl" />
            Create Group
          </button>
          <div className="h-full w-[1px] bg-gray-500"></div>
          <div className="grow overflow-auto">
            <span className="text-sm">Select Group</span>
            <ul className="min-w-max flex items-center justify-start gap-2 ">
              {groups.data?.map((group, index) => {
                return (
                  <li
                    onClick={() => setSelectGroup(() => group)}
                    key={index}
                    className={`p-1
                    ${
                      group.id === selectGroup?.id
                        ? "bg-gray-100 border text-primary-color"
                        : "text-black"
                    }
                    hover:bg-gray-100 rounded-md 
                    cursor-pointer transition-colors duration-150 ease-in-out`}
                  >
                    <h3 className="text-base font-semibold max-w-40 truncate">
                      {group.title}
                    </h3>
                    <p className="text-gray-600 max-w-40 truncate text-sm">
                      {group.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </header>
        <main>
          {selectGroup && (
            <ShowSelectGroup
              onClose={() => setSelectGroup(undefined)}
              toast={toast}
              subjectId={selectGroup.subjectId}
              groupOnSubjectId={selectGroup.id}
            />
          )}
        </main>
      </div>
    </>
  );
}

type ShowSelectGroupProps = {
  subjectId: string;
  groupOnSubjectId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function ShowSelectGroup({
  subjectId,
  toast,
  groupOnSubjectId,
  onClose,
}: ShowSelectGroupProps) {
  const groupOnSubject = useGetGroupOnSubject({
    id: groupOnSubjectId,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const [units, setUnits] = useState<
    (UnitOnGroup & { students: StudentOnGroup[] })[]
  >([]);
  const reorder = useReorderUnitGroup();
  const createColum = useCreateUnitOnGroup();
  const language = useGetLanguage();
  const deleteGroup = useDeleteGroupOnSubject();
  const [triggerUpdate, setTriggerUpdate] = useState<boolean>(false);
  const unGroupStudents = studentOnSubjects.data
    ?.filter((s) => s.isActive === true)
    .filter(
      (studentOnSubject) =>
        !groupOnSubject.data?.units
          .map((u) => u.students)
          .flat()
          .some(
            (studentOnGroup) =>
              studentOnGroup.studentOnSubjectId === studentOnSubject.id
          )
    );

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync({
        groupOnSubjectId: groupOnSubjectId,
      });
      toast.current?.show({
        severity: "success",
        summary: "Delete",
        detail: "Group has been deleted",
      });
      onClose();
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

  const handleCreate = async () => {
    try {
      if (!groupOnSubject.data) return;
      await createColum.mutateAsync({
        title: `Group ${(groupOnSubject.data?.units.length ?? 0) + 1}`,
        description: `this is group number ${(groupOnSubject.data?.units.length ?? 0) + 1}`,
        groupOnSubjectId: groupOnSubject.data?.id,
        icon: "",
        order: (groupOnSubject.data?.units.length ?? 0) + 1,
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

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    let newSort: (UnitOnGroup & { students: StudentOnGroup[] })[] = [];
    if (over !== null && active.id !== over?.id) {
      setUnits((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort.map((s, index) => {
          return {
            ...s,
            order: index,
          };
        });
      });
      await reorder.mutateAsync({
        unitOnGroupIds: newSort.map((unit) => unit.id),
      });
    }
  }, []);

  useEffect(() => {
    if (groupOnSubject.data) {
      setUnits(() => groupOnSubject.data.units);
    }
  }, [groupOnSubject.isSuccess]);

  return (
    <>
      {triggerUpdate && (
        <PopupLayout onClose={() => setTriggerUpdate(() => false)}>
          <GroupSetting
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerUpdate(() => false);
            }}
            data={groupOnSubject.data}
            subjectId={subjectId}
            toast={toast}
          />
        </PopupLayout>
      )}
      <header className="mt-2">
        {deleteGroup.isPending && <LoadingBar />}
        <section className="w-full">
          {unGroupStudents && unGroupStudents.length > 0 && (
            <>
              <span className="text-gray-600 text-lg">Ungroup students</span>
              <ul className="bg-gray-100 p-2  h-max grid grid-cols-4 gap-3">
                {unGroupStudents?.map((studentOnSubject) => {
                  return <StudentCard {...studentOnSubject} />;
                })}
              </ul>
            </>
          )}
        </section>
        <section className="w-full flex  gap-3 justify-between">
          <div>
            <h3 className="text-base font-semibold max-w-40 truncate">
              {groupOnSubject.data?.title}
            </h3>
            <p className="text-gray-600 max-w-40 truncate text-sm">
              {groupOnSubject.data?.description}
            </p>
          </div>
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => {
                setTriggerUpdate(true);
              }}
              className="main-button w-max
                      flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              <>
                <IoMdSettings />
                Group Setting
              </>
            </button>
            <button
              disabled={deleteGroup.isPending}
              onClick={() => {
                ConfirmDeleteMessage({
                  language: language.data ?? "en",
                  callback: async () => {
                    await handleDeleteGroup();
                  },
                });
              }}
              className="reject-button w-max flex items-center justify-center gap-1 py-1 ring-1 ring-red-600"
            >
              <>
                <MdDelete />
                Group Delete
              </>
            </button>
          </div>
        </section>
      </header>
      <ul className="grid mt-5 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={units} strategy={rectSortingStrategy}>
            {units
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((unit) => {
                return <ColumMemo unit={unit} key={unit.id} />;
              })}
          </SortableContext>
        </DndContext>
        <button
          onClick={handleCreate}
          className="w-full active:scale-105 min-h-40 hover:bg-primary-color hover:text-white
           transition text-gray-500 h-full flex-col text-xl
         bg-white border border-dashed  rounded-md flex items-center justify-center"
        >
          {createColum.isPending ? (
            <LoadingSpinner />
          ) : (
            <>
              Create New Colum
              <MdCreate />
            </>
          )}
        </button>
      </ul>
    </>
  );
}

export default ShowGroups;

type ColumProps = {
  unit: UnitOnGroup & {
    students: StudentOnGroup[];
  };
};

function Colum({ unit }: ColumProps) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: unit.id });
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
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<{
    title: string;
    description: string;
    students: StudentOnGroup[];
  }>({
    title: unit.title,
    description: unit.description ?? "",
    students: unit.students,
  });
  const language = useGetLanguage();
  const deleteColum = useDeleteUnitOnGroup();
  const update = useUpdateUnitOnGroup();
  const reorder = useReorderStudentOnGroup();
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

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    let newSort: StudentOnGroup[] = [];
    if (over !== null && active.id !== over?.id) {
      setData((prevs) => {
        const oldIndex = prevs.students.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = prevs.students.findIndex(
          (item) => item.id === over!.id
        );
        newSort = arrayMove(prevs.students, oldIndex, newIndex);

        return {
          ...prevs,
          students: newSort.map((s, index) => {
            return {
              ...s,
              order: index,
            };
          }),
        };
      });
      await reorder.mutateAsync({
        studentOnGroupIds: newSort.map((unit) => unit.id),
      });
    }
  }, []);
  return (
    <li
      ref={setNodeRef}
      style={inlineStyles}
      {...attributes}
      className="w-full h-max min-h-full flex flex-col  overflow-hidden rounded-md  "
    >
      {(update.isPending || deleteColum.isPending) && <LoadingBar />}
      <header className="w-full flex relative  gap-2 items-center justify-between px-2 h-max py-2 gradient-bg">
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
      {data.students.length > 0 ? (
        <ul className="grid grid-cols-1 max-h-96 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={data.students}
              strategy={verticalListSortingStrategy}
            >
              {data.students
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((studentOnGroup) => {
                  return (
                    <StudentCardMemo
                      key={studentOnGroup.id}
                      {...studentOnGroup}
                    />
                  );
                })}
            </SortableContext>
          </DndContext>
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

type StudentCardProps = {
  id: string;
  photo: string;
  firstName: string;
  lastName: string;
  blurHash?: string | null;
  number: string;
};
function StudentCard({
  id,
  firstName,
  lastName,
  photo,
  blurHash,
  number,
}: StudentCardProps) {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
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
      className="w-full h-10  bg-white border 
flex items-center justify-start gap-2 px-2"
    >
      <div
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="w-6 h-6  rounded-md text-black hover:bg-gray-300/50 flex 
items-center justify-center "
      >
        <MdDragIndicator />
      </div>
      <div className="flex items-center h-14 gap-2">
        <div className="w-5 h-5 md:w-6 md:h-6 relative rounded-md ring-1 overflow-hidden">
          <Image
            src={photo}
            alt={firstName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(blurHash ?? defaultBlurHash)}
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-xs md:text-sm font-semibold">
            {firstName} {lastName}
          </h1>
          <p className="text-xs text-gray-500">Number {number}</p>
        </div>
      </div>
    </li>
  );
}
const StudentCardMemo = memo(StudentCard);

type GroupSettingProps = {
  subjectId: string;
  data?: GroupOnSubject | undefined;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function GroupSetting({ subjectId, data, onClose, toast }: GroupSettingProps) {
  const create = useCreateGroupOnSubject();
  const update = useUpdateGroupOnSubject();
  const [groupOnSubjectData, setGroupOnSubjectData] = useState<{
    title?: string | undefined;
    description?: string | undefined;
  }>({
    title: data?.title,
    description: data?.description,
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!groupOnSubjectData.title || !groupOnSubjectData.description) {
        throw new Error("Fill out all data");
      }
      await create.mutateAsync({
        title: groupOnSubjectData.title,
        description: groupOnSubjectData.description,
        subjectId: subjectId,
      });

      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Group has been created",
      });

      onClose();
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

  const handleUpdateGroup = async (
    e: React.FormEvent,
    data: GroupOnSubject
  ) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        query: {
          groupOnSubjectId: data.id,
        },
        body: {
          title: groupOnSubjectData.title,
          description: groupOnSubjectData.description,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Group has been updated",
      });

      onClose();
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
    <form
      onSubmit={(e) => {
        if (data) {
          handleUpdateGroup(e, data);
        } else {
          handleCreateGroup(e);
        }
      }}
      className="w-96 h-96 p-5 flex flex-col pb-2 rounded-md border bg-white"
    >
      <header className="w-full  flex items-center justify-start text-lg text-black gap-1 border-b">
        <MdGroup /> {data ? "Update Group" : "Create Group"}
      </header>
      {(create.isPending || update.isPending) && <LoadingBar />}
      <main className="grow  flex pb-2 flex-col gap-2">
        <label className="flex mt-2 flex-col w-full">
          <span className="text-sm">title</span>
          <input
            required
            value={groupOnSubjectData.title}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
            type="text"
            className="main-input"
          />
        </label>
        <label className="flex  flex-col w-full grow">
          <span className="text-sm">description</span>
          <textarea
            required
            value={groupOnSubjectData.description}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            className="main-input resize-none grow"
          />
        </label>
      </main>
      <footer className="flex items-center border-t pt-3 justify-end gap-2">
        <button
          onClick={() => onClose()}
          disabled={create.isPending || update.isPending}
          type="button"
          className="second-button border flex items-center justify-center gap-1"
        >
          Cancel
        </button>
        <button
          disabled={create.isPending || update.isPending}
          type="submit"
          className="main-button flex items-center justify-center gap-1"
        >
          <FiPlus /> {data ? "Update Group" : "Create Group"}
        </button>
      </footer>
    </form>
  );
}
