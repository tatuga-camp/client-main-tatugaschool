import React, { useEffect, useCallback } from "react";
import {
  useGetAssignment,
  useGetStudentOnAssignments,
  useGetStudentOnSubject,
  useUpdateStudentOnAssignments,
} from "../../react-query";
import { HiUsers } from "react-icons/hi";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import {
  Assignment,
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import {
  BsEyeFill,
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
} from "react-icons/bs";
import { BiBookOpen } from "react-icons/bi";
import TextEditor from "../common/TextEditor";
import InputNumber from "../common/InputNumber";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";

type Props = {
  assignmentId: string;
  onScroll?: () => void;
};
function ClassStudentWork({ assignmentId, onScroll }: Props) {
  const studentOnAssignment = useGetStudentOnAssignments({
    assignmentId,
  });
  const [triggerHideStudentList, setTriggerHideStudentList] =
    React.useState(false);
  const [assignAll, setAssignAll] = React.useState(false);
  const update = useUpdateStudentOnAssignments();
  const [loading, setLoading] = React.useState(false);
  const [studentData, setStudentData] = React.useState<
    (StudentOnAssignment & { files: FileOnStudentOnAssignment[] })[]
  >([]);
  const assignment = useGetAssignment({
    id: assignmentId,
  });

  const [selectStudentWork, setSelectStudentWork] = React.useState<
    (StudentOnAssignment & { files: FileOnStudentOnAssignment[] }) | null
  >(null);

  React.useEffect(() => {
    if (studentOnAssignment.data) {
      setStudentData(() => {
        const data = studentOnAssignment.data.map((student) => {
          return {
            ...student,
          };
        });

        const isAllAssigned = data.every((student) => student.isAssigned);
        setAssignAll(isAllAssigned);

        return data;
      });
    }
  }, [studentOnAssignment.status]);

  const handleAssignAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setStudentData((prev) => {
      return prev.map((student) => {
        return {
          ...student,
          isAssigned: e.target.checked,
        };
      });
    });
    setAssignAll(e.target.checked);

    await Promise.allSettled(
      studentData.map((student) => {
        return update.mutateAsync({
          query: {
            studentOnAssignmentId: student.id,
          },
          body: {
            isAssigned: e.target.checked,
          },
        });
      })
    );
    setLoading(false);
  };

  const handleSelectStudentWork = useCallback(
    (student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] }) => {
      onScroll?.();
      setSelectStudentWork((prevSelectedStudent) => {
        if (prevSelectedStudent?.id === student.id) {
          return prevSelectedStudent; // No state update if the same student is selected
        }
        return student;
      });
    },
    []
  );
  return (
    <main className="w-full h-max flex ">
      <section
        className={`${
          triggerHideStudentList ? "w-20  " : " w-8/12  "
        } overflow-auto transition-width p-5 min-h-screen max-h-screen  
       flex flex-col gap-2 bg-white  h-full border-r sticky top-0`}
      >
        <div className="text-xl w-full justify-between flex gap-2 items-center ">
          {!triggerHideStudentList && "Student"}
          <button
            type="button"
            className={`${
              triggerHideStudentList && "absolute right-0 top-0 left-0 m-auto"
            } `}
            onClick={() => setTriggerHideStudentList((prev) => !prev)}
          >
            <div className="second-button p-2 rounded-full  overflow-hidden flex items-center justify-center">
              {triggerHideStudentList ? (
                <BsLayoutSidebarInset />
              ) : (
                <BsLayoutSidebarInsetReverse />
              )}
            </div>
          </button>
        </div>
        <table
          className={`${
            triggerHideStudentList ? "hidden" : "w-full table-auto"
          } `}
        >
          <thead>
            <tr>
              <th>
                <div className="text-start font-normal ">Name</div>
              </th>
              <th>
                <div className="text-center font-normal ">Score</div>
              </th>
              <th>
                <div className="text-base font-normal flex gap-2 items-center justify-center ">
                  <div className="w-8 h-8 flex items-center justify-center active:bg-primary-color/60 hover:bg-primary-color/50  focus-within:bg-primary-color/50 rounded-full">
                    <input
                      disabled={loading}
                      type="checkbox"
                      checked={assignAll}
                      onChange={handleAssignAll}
                      className="w-5 h-5 accent-primary-color  "
                    />
                  </div>
                  <HiUsers />
                  Assign All
                </div>
              </th>
              <th>
                <div className="text-base font-normal flex gap-2 items-center justify-center ">
                  <BiBookOpen />
                  View Work
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {studentOnAssignment.isLoading || loading
              ? [...Array(20)].map((_, index) => {
                  const odd = index % 2 === 0;
                  return (
                    <tr
                      key={index}
                      className={` ${odd && "bg-gray-200/20"} gap-2`}
                    >
                      <th>
                        <div className="flex gap-2 h-14 items-center">
                          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                          </div>
                          <div className="flex flex-col  items-start">
                            <div className="w-20 h-4 bg-gray-200 animate-pulse"></div>
                            <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="flex  justify-center">
                          <div className="w-5 h-5 bg-gray-400 animate-pulse"></div>
                        </div>
                      </th>
                      <th>
                        <div className="flex  justify-center">
                          <div className="w-5 h-5 bg-gray-400 animate-pulse"></div>
                        </div>
                      </th>
                      <th>
                        <div className="flex  justify-center">
                          <div className="w-10 h-5 bg-gray-200 animate-pulse"></div>
                        </div>
                      </th>
                    </tr>
                  );
                })
              : studentOnAssignment.data?.map((student, index) => {
                  const odd = index % 2 === 0;
                  return (
                    <StudentList
                      onClick={handleSelectStudentWork}
                      key={student.id}
                      student={student}
                      selectStudentWork={selectStudentWork}
                      odd={odd}
                      setStudentData={setStudentData}
                    />
                  );
                })}
          </tbody>
        </table>
      </section>
      <section className="w-full  flex-col min-h-screen h-max flex  items-start justify-start">
        {selectStudentWork && assignment.data && (
          <StudentWork
            student={selectStudentWork}
            assignment={assignment.data}
          />
        )}
      </section>
    </main>
  );
}

export default ClassStudentWork;

type StudentListProps = {
  student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] };
  setStudentData: (
    value: React.SetStateAction<
      (StudentOnAssignment & { files: FileOnStudentOnAssignment[] })[]
    >
  ) => void;
  odd: boolean;
  selectStudentWork:
    | (StudentOnAssignment & { files: FileOnStudentOnAssignment[] })
    | null;
  onClick: (
    student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] }
  ) => void;
};

const StudentList = React.memo(function StudentList({
  student,
  odd,
  setStudentData,
  onClick,
  selectStudentWork,
}: StudentListProps) {
  const update = useUpdateStudentOnAssignments();

  const handleChangeCheck = React.useCallback(
    async ({ studentId, checked }: { studentId: string; checked: boolean }) => {
      setStudentData((prev) => {
        return prev.map((student) => {
          if (student.id === studentId) {
            return {
              ...student,
              isAssigned: checked,
            };
          }
          return student;
        });
      });
      await update.mutateAsync({
        query: {
          studentOnAssignmentId: studentId,
        },
        body: {
          isAssigned: checked,
        },
      });
    },
    []
  );

  return (
    <tr className={` ${odd && "bg-gray-200/20"} hover:bg-sky-100  gap-2`}>
      <th className="">
        <div className="flex gap-2 pl-2 h-14 items-center">
          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col  items-start">
            <h1 className="text-sm font-semibold">
              {student.firstName} {student.lastName}{" "}
            </h1>
            <p className="text-xs text-gray-500">
              Number {student.number} {!student.isAssigned && "(NOT Assigned)"}
            </p>
          </div>
        </div>
      </th>
      <th className="">
        <div
          className={`flex justify-center text-sm font-normal ${
            student.score !== null
              ? "text-primary-color font-medium"
              : "text-gray-400"
          }`}
        >
          {student.score !== null
            ? student.score?.toLocaleString()
            : "Not Graded"}
        </div>
      </th>
      <th className="">
        <div className="flex justify-center">
          <input
            disabled={update.isPending}
            checked={student.isAssigned}
            onChange={(e) =>
              handleChangeCheck({
                studentId: student.id,
                checked: e.target.checked,
              })
            }
            type="checkbox"
            className="w-5 h-5 accent-primary-color"
          />
        </div>
      </th>
      <th className="">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onClick(student)}
            className={`flex items-center font-normal text-xs
           justify-center gap-1 transition
           ${student.id === student.id ? "main-button" : "second-button border"}
           `}
          >
            <BsEyeFill /> View
          </button>
        </div>
      </th>
    </tr>
  );
});

type PropsStudentWork = {
  student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] };
  assignment: Assignment;
};
function StudentWork({ student, assignment }: PropsStudentWork) {
  const update = useUpdateStudentOnAssignments();
  const toast = React.useRef<Toast>(null);
  const [studentWork, setStudentWork] = React.useState<{
    score?: number;
    body?: string;
    files?: FileOnStudentOnAssignment[];
  }>();

  useEffect(() => {
    setStudentWork({
      score: student.score,
      body: student.body,
      files: student.files,
    });
  }, [student]);

  const handleSaveChange = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        query: {
          studentOnAssignmentId: student.id,
        },
        body: {
          score: studentWork?.score,
          isReviewed: true,
          body: studentWork?.body,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Student work has been updated",
        life: 2000,
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
    <>
      <Toast ref={toast} />

      <form
        onSubmit={handleSaveChange}
        className="w-full bg-white border-b h-16 flex items-center justify-between p-2 px-4"
      >
        <div className="flex gap-2 pl-2 h-14 items-center">
          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col  items-start">
            <h1 className="text-sm font-semibold">
              {student.firstName} {student.lastName}{" "}
            </h1>
            <p className="text-xs text-gray-500">
              Number {student.number} {!student.isAssigned && "(NOT Assigned)"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-40">
            <InputNumber
              onValueChange={(value) => {
                setStudentWork((prev) => ({
                  ...prev,
                  score: value,
                }));
              }}
              maxFractionDigits={3}
              value={studentWork?.score ?? undefined}
              min={0}
              placeholder={studentWork?.score ? "Enter score" : "Not graded"}
              suffix={`/${assignment.maxScore}`}
              max={assignment.maxScore}
            />
          </div>
          <button
            disabled={update.isPending}
            onClick={handleSaveChange}
            className="second-button flex items-center justify-center border w-60 text-sm"
          >
            {update.isPending ? (
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="w-5 h-5"
                strokeWidth="8"
              />
            ) : (
              "Save Change"
            )}
          </button>
        </div>
      </form>
      <main className="w-full flex  flex-col gap-2">
        <div className="h-96  w-full">
          <TextEditor
            value={studentWork?.body ?? ""}
            onChange={(c) => {
              setStudentWork((prev) => ({
                ...prev,
                body: c,
              }));
            }}
          />
        </div>
        <ul className="w-full h-max flex flex-col gap-2">
          {studentWork?.files?.map((file, index) => {
            const isImage = file.type.includes("image");
            const name = file.url.split("/").pop();
            return (
              <li
                key={index}
                className="w-full h-20 flex overflow-hidden rounded-md items-center justify-between  bg-white border"
              >
                <div className="w-full h-full flex items-center justify-start gap-2">
                  <div
                    className="w-16 gradient-bg text-white text-lg flex items-center justify-center
               border-r h-full"
                  >
                    {isImage ? <FaRegFileImage /> : <FaRegFile />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xl mr-5 hover:bg-red-300/50 p-2 rounded-full active:scale-105 text-red-500"
                >
                  <MdDelete />
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
