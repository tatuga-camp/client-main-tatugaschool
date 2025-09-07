import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BiBookOpen, BiComment } from "react-icons/bi";
import {
  BsEyeFill,
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
} from "react-icons/bs";
import { FaRegSadTear } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoChevronDownSharp } from "react-icons/io5";
import {
  MdAssignment,
  MdDelete,
  MdEditDocument,
  MdReviews,
} from "react-icons/md";
import { RiEmotionHappyFill } from "react-icons/ri";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import {
  classworkViewDataLanguage,
  dropdownStatusStudentOnAssignmentLanguage,
  studentWorkDataLanguage,
} from "../../data/languages";
import { useEnterKey } from "../../hook";
import useClickOutside from "../../hook/useClickOutside";
import {
  Assignment,
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../interfaces";
import {
  useDeleteFileStudentOnAssignment,
  useGetAssignment,
  useGetLanguage,
  useGetStudentOnAssignments,
  useUpdateFileStudentOnAssignment,
  useUpdateStudentOnAssignments,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { decodeBlurhashToCanvas, timeAgo, timeLeft } from "../../utils";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import DrawCanva from "../common/DrawCanva";
import InputNumber from "../common/InputNumber";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layout/PopupLayout";
import AssignmentText from "./AssignmentText";
import CommentSection from "./CommentSection";
import FileStudentAssignmentCard from "./FileStudentAssignmentCard";
import StatusAssignmentButton from "./StatusAssignmentButton";

type Props = {
  assignmentId: string;
  onScroll?: () => void;
};

function ClassStudentWork({ assignmentId, onScroll }: Props) {
  const language = useGetLanguage();
  const studentOnAssignments = useGetStudentOnAssignments({
    assignmentId,
    refetchInterval: 5000,
  });
  const [studentData, setStudentData] = useState<
    (StudentOnAssignment & {
      files: FileOnStudentOnAssignment[];
      select: boolean;
    })[]
  >();
  const [triggerHideStudentList, setTriggerHideStudentList] =
    React.useState(false);

  const assignment = useGetAssignment({
    id: assignmentId,
  });

  const [selectStudentWork, setSelectStudentWork] = React.useState<
    (StudentOnAssignment & { files: FileOnStudentOnAssignment[] }) | null
  >(null);

  // render for update
  useEffect(() => {
    if (selectStudentWork && studentOnAssignments.data) {
      setSelectStudentWork((prevSelectedStudent) => {
        if (!prevSelectedStudent) return null;
        const updateStudnet =
          studentOnAssignments.data.find(
            (studentOnAssignment) =>
              studentOnAssignment.id === prevSelectedStudent.id,
          ) ?? null;

        return updateStudnet;
      });
    }
    if (studentOnAssignments.data) {
      setStudentData(() =>
        studentOnAssignments.data.map((s) => {
          return {
            ...s,
            select: false,
          };
        }),
      );
    }
  }, [studentOnAssignments.data]);

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
    [],
  );
  return (
    <main className="flex h-max w-full">
      <section
        className={`${
          triggerHideStudentList ? "w-20" : "w-8/12"
        } sticky top-0 flex h-max max-h-screen min-h-screen flex-col gap-2 overflow-auto border-r bg-white p-5 pb-40 transition-width`}
      >
        <div className="flex w-full items-center justify-between gap-2 text-xl">
          {triggerHideStudentList
            ? ""
            : studentOnAssignments.isFetching
              ? "Student Loading.."
              : studentWorkDataLanguage.student(language.data ?? "en")}
          <button
            type="button"
            className={`${
              triggerHideStudentList && "absolute left-0 right-0 top-0 m-auto"
            } `}
            onClick={() => setTriggerHideStudentList((prev) => !prev)}
          >
            <div className="second-button flex items-center justify-center overflow-hidden rounded-full p-2">
              {triggerHideStudentList ? (
                <BsLayoutSidebarInset />
              ) : (
                <BsLayoutSidebarInsetReverse />
              )}
            </div>
          </button>
        </div>
        <div
          className={`${triggerHideStudentList ? "hidden" : "w-full"} overflow-auto`}
        >
          <table className="w-max min-w-full">
            <thead>
              <tr>
                <th>
                  <div className="flex w-6 justify-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      onChange={(e) => {
                        setStudentData((prev) => {
                          return prev?.map((s) => {
                            return {
                              ...s,
                              select: e.target.checked,
                            };
                          });
                        });
                      }}
                    />
                  </div>
                </th>
                <th>
                  <div className="text-start font-normal">
                    {studentWorkDataLanguage.name(language.data ?? "en")}
                  </div>
                </th>
                <th>
                  <div className="text-center font-normal">
                    {studentWorkDataLanguage.status(language.data ?? "en")}
                  </div>
                </th>
                <th>
                  <div className="text-center font-normal">
                    {studentWorkDataLanguage.score(language.data ?? "en")}
                  </div>
                </th>
                <th>
                  <div className="flex items-center justify-center gap-2 text-base font-normal">
                    <BiBookOpen />
                    {studentWorkDataLanguage.viewWork(language.data ?? "en")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {studentOnAssignments.isLoading
                ? [...Array(20)].map((_, index) => {
                    const odd = index % 2 === 0;
                    return (
                      <tr
                        key={index}
                        className={` ${odd && "bg-gray-200/20"} gap-2`}
                      >
                        <th>
                          <div className="flex h-14 items-center gap-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1">
                              <div className="h-full w-full animate-pulse bg-gray-200"></div>
                            </div>
                            <div className="flex flex-col items-start">
                              <div className="h-4 w-20 animate-pulse bg-gray-200"></div>
                              <div className="h-3 w-10 animate-pulse bg-gray-200"></div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div className="flex justify-center">
                            <div className="h-5 w-5 animate-pulse bg-gray-400"></div>
                          </div>
                        </th>
                        <th>
                          <div className="flex justify-center">
                            <div className="h-5 w-5 animate-pulse bg-gray-400"></div>
                          </div>
                        </th>
                        <th>
                          <div className="flex justify-center">
                            <div className="h-5 w-10 animate-pulse bg-gray-200"></div>
                          </div>
                        </th>
                      </tr>
                    );
                  })
                : studentData
                    ?.filter((d) => d.isAssigned === true)
                    .sort((a, b) => Number(a.number) - Number(b.number))
                    .map((student, index) => {
                      const odd = index % 2 === 0;
                      return (
                        <StudentList
                          onClick={handleSelectStudentWork}
                          setStudentData={setStudentData}
                          key={student.id}
                          student={student}
                          odd={odd}
                        />
                      );
                    })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="flex h-max min-h-screen w-full flex-col items-start justify-start">
        {selectStudentWork &&
        assignment.data &&
        !studentData?.some((s) => s.select === true) ? (
          <StudentWork
            studentOnAssignment={selectStudentWork}
            assignment={assignment.data}
          />
        ) : (
          <MultipleReview
            selectStudents={studentData?.filter((s) => s.select === true) ?? []}
            maxScore={assignment.data?.maxScore ?? 0}
          />
        )}
      </section>
    </main>
  );
}

export default ClassStudentWork;

type StudentListProps = {
  student: StudentOnAssignment & {
    files: FileOnStudentOnAssignment[];
    select: boolean;
  };
  setStudentData: React.Dispatch<
    React.SetStateAction<
      | (StudentOnAssignment & {
          files: FileOnStudentOnAssignment[];
          select: boolean;
        })[]
      | undefined
    >
  >;
  odd: boolean;
  onClick: (
    student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] },
  ) => void;
};

const StudentList = React.memo(function StudentList({
  student,
  odd,
  onClick,
  setStudentData,
}: StudentListProps) {
  const language = useGetLanguage();
  return (
    <tr className={` ${odd && "bg-gray-200/20"} gap-2 hover:bg-sky-100`}>
      <th>
        <div className="flex w-6 items-center justify-center">
          <input
            checked={student.select}
            onChange={(e) =>
              setStudentData((prev) => {
                return prev?.map((s) => {
                  if (s.id === student.id) {
                    return { ...s, select: e.target.checked };
                  }
                  return s;
                });
              })
            }
            type="checkbox"
            className="h-5 w-5"
          />
        </div>
      </th>
      <th>
        <div className="flex h-14 items-center gap-2 pl-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-sm font-semibold">
              {student.firstName} {student.lastName}{" "}
            </h1>
            <p className="text-xs text-gray-500">
              Number {student.number} {!student.isAssigned && "(NOT Assigned)"}
            </p>
          </div>
        </div>
      </th>
      <th>
        <StatusAssignmentButton studentOnAssignment={student} />
      </th>
      <th>
        <div
          className={`flex justify-center text-sm font-normal ${
            student.score !== null
              ? "font-medium text-primary-color"
              : "text-gray-400"
          }`}
        >
          {student.score !== null
            ? student.score?.toLocaleString()
            : studentWorkDataLanguage.notGrade(language.data ?? "en")}
        </div>
      </th>
      <th>
        <div className="flex h-full w-full justify-center p-2">
          <button
            type="button"
            onClick={() => {
              setStudentData((prev) => {
                return prev?.map((s) => {
                  return { ...s, select: false };
                });
              });
              onClick(student);
            }}
            className={`flex items-center justify-center gap-1 font-normal transition ${student.id === student.id ? "main-button" : "second-button border"} `}
          >
            <BsEyeFill />
            {studentWorkDataLanguage.viewWork(language.data ?? "en")}
          </button>
        </div>
      </th>
    </tr>
  );
});

type MultipleReviewProps = {
  selectStudents: StudentOnAssignment[];
  maxScore: number;
};
function MultipleReview({ selectStudents, maxScore }: MultipleReviewProps) {
  const update = useUpdateStudentOnAssignments();
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const language = useGetLanguage();

  const handleSaveChange = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      for (const studentWork of selectStudents) {
        await update.mutateAsync({
          query: {
            studentOnAssignmentId: studentWork.id,
          },
          body: {
            score: score,
            status: "REVIEWD",
          },
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
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
    <div className="flex h-full w-full grow flex-col items-center justify-center gap-5 font-Anuphan">
      {loading && (
        <div className="w-96">
          <LoadingBar />
        </div>
      )}
      {selectStudents.length > 0 ? (
        <form
          onSubmit={handleSaveChange}
          className="flex h-full items-center justify-center gap-2"
        >
          <div className="w-40">
            <InputNumber
              onValueChange={(value) => setScore(() => value)}
              maxFractionDigits={3}
              value={score}
              min={0}
              placeholder={score ? "Enter score" : "Not graded"}
              suffix={`/${maxScore}`}
              max={maxScore}
            />
          </div>
          <button
            disabled={loading}
            className="second-button flex w-60 items-center justify-center border text-sm"
          >
            {loading ? (
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="h-5 w-5"
                strokeWidth="8"
              />
            ) : (
              "Save Change"
            )}
          </button>
        </form>
      ) : (
        <h1 className="text-3xl">
          {studentWorkDataLanguage.pleaseSelectStudent(language.data ?? "en")}
        </h1>
      )}
    </div>
  );
}

const menuViewStudentWorks = [
  {
    title: "Works",
    icon: <MdAssignment />,
  },
  {
    title: "Comments",
    icon: <BiComment />,
  },
] as const;
const menuDropdowns = [
  {
    title: "review",
    icon: <MdReviews />,
  },
  {
    title: "improve",
    icon: <MdEditDocument />,
  },
  {
    title: "delete",
    icon: <MdDelete />,
  },
] as const;
type MenuViewStudentWorks = (typeof menuViewStudentWorks)[number]["title"];

type PropsStudentWork = {
  studentOnAssignment: StudentOnAssignment & {
    files: FileOnStudentOnAssignment[];
  };
  assignment: Assignment;
};
function StudentWork({ studentOnAssignment, assignment }: PropsStudentWork) {
  const language = useGetLanguage();
  const update = useUpdateStudentOnAssignments();
  const updateFile = useUpdateFileStudentOnAssignment();
  const [triggerDropdown, setTriggerDropdown] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = React.useState(false);
  const scoreInputRef = useRef<HTMLInputElement>(null);
  const toast = React.useRef<Toast>(null);
  const [selectMenu, setSelectMenu] =
    React.useState<MenuViewStudentWorks>("Works");
  const [selectAssignmentText, setSelectAssignmentText] =
    React.useState<FileOnStudentOnAssignment | null>(null);
  const [studentWork, setStudentWork] = React.useState<{
    score?: number;
    body?: string;
    files?: FileOnStudentOnAssignment[];
  }>();
  const deleteFile = useDeleteFileStudentOnAssignment();

  const [selectFileImage, setSelectFileImage] =
    React.useState<FileOnStudentOnAssignment | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scoreInputRef.current?.focus();
    }, 200);
    setStudentWork({
      score: studentOnAssignment.score,
      body: studentOnAssignment.body,
      files: studentOnAssignment.files,
    });
    return () => {
      clearTimeout(timeoutId); // cleanup
    };
  }, [studentOnAssignment]);

  const handleSaveChange = async (status: StudentAssignmentStatus) => {
    try {
      await update.mutateAsync({
        query: {
          studentOnAssignmentId: studentOnAssignment.id,
        },
        body: {
          score: status === "REVIEWD" ? (studentWork?.score ?? 0) : 0,
          status: status,
          body: studentWork?.body,
        },
      });

      if (
        status === "PENDDING" &&
        studentWork?.files &&
        studentWork.files.length > 0
      ) {
        await Promise.allSettled(
          studentWork.files.map((f) =>
            deleteFile.mutateAsync({
              fileOnStudentAssignmentId: f.id,
            }),
          ),
        );
      }
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

  useEnterKey(() => {
    if (!selectFileImage) {
      handleSaveChange("REVIEWD");
    }
  });

  const handleSaveImageEdit = async (data: { id: string; file: File }) => {
    try {
      setLoadingFile(true);
      const signURL = await getSignedURLTeacherService({
        fileName: data.file.name,
        fileType: data.file.type,
        schoolId: studentOnAssignment.schoolId,
        fileSize: data.file.size,
      });

      const upload = await UploadSignURLService({
        file: data.file,
        contentType: data.file.type,
        signURL: signURL.signURL,
      });

      await updateFile.mutateAsync({
        query: {
          id: data.id,
        },
        body: {
          body: signURL.originalURL,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File has been updated",
        life: 2000,
      });
      setLoadingFile(false);
    } catch (error) {
      setLoadingFile(false);
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
  useClickOutside(dropdownRef, () => {
    setTriggerDropdown(false);
  });

  return (
    <>
      <Toast ref={toast} />

      {selectFileImage && (
        <PopupLayout
          onClose={() => {
            setSelectFileImage(null);
          }}
        >
          <div className="relative flex h-full w-full flex-col items-center justify-start">
            {loadingFile && (
              <div className="absolute top-0 z-50 flex h-full w-full items-center justify-center bg-white/80 backdrop-blur-sm">
                Save....
              </div>
            )}
            <DrawCanva
              onSave={(data) => {
                if (!loadingFile) {
                  handleSaveImageEdit({
                    id: selectFileImage.id,
                    file: data.file,
                  });
                }
              }}
              id={selectFileImage.id}
              name={selectFileImage.name ?? ""}
              imageURL={selectFileImage.body}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectFileImage(null);
              }}
            />
          </div>
        </PopupLayout>
      )}
      {selectAssignmentText && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
          <div className="relative h-max w-full rounded-md bg-white p-3 md:h-5/6 md:w-10/12 lg:w-10/12">
            <div className="flex w-full justify-end">
              <button
                onClick={() => setSelectAssignmentText(null)}
                className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
              >
                <IoMdClose />
              </button>
            </div>

            <AssignmentText
              onClose={() => setSelectAssignmentText(null)}
              text={selectAssignmentText}
              studentOnAssignmentId={studentOnAssignment.id}
              toast={toast}
            />
          </div>
          <footer className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/50"></footer>
        </div>
      )}
      <div className="flex w-full flex-col">
        <header className="flex h-max w-full items-center justify-between gap-5 bg-white p-2 px-4">
          <div className="flex h-14 w-max items-center gap-2 pl-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1">
              <Image
                src={studentOnAssignment.photo}
                alt={studentOnAssignment.firstName}
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 33vw"
                blurDataURL={decodeBlurhashToCanvas(
                  studentOnAssignment.blurHash ?? defaultBlurHash,
                )}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="w-32 truncate text-sm font-semibold">
                {studentOnAssignment.firstName}{" "}
                {studentOnAssignment.lastName}{" "}
              </h1>
              <p className="text-xs text-gray-500">
                Number {studentOnAssignment.number}{" "}
                {!studentOnAssignment.isAssigned && "(NOT Assigned)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusAssignmentButton studentOnAssignment={studentOnAssignment} />
            <div className="w-40">
              <InputNumber
                inputRef={scoreInputRef}
                onValueChange={(value) => {
                  console.log(value);
                  setStudentWork((prev) => ({
                    ...prev,
                    score: value,
                  }));
                }}
                maxFractionDigits={3}
                value={studentWork?.score ?? 0}
                min={0}
                placeholder={studentWork?.score ? "Enter score" : "Not graded"}
                suffix={`/${assignment.maxScore}`}
                max={assignment.maxScore}
              />
            </div>
            <div className="relative flex grow items-center">
              <button
                disabled={update.isPending}
                onClick={() => handleSaveChange("REVIEWD")}
                className="second-button h-10 w-40 grow rounded-md rounded-r-none border border-r-0 p-2 text-base font-medium text-black opacity-85 hover:opacity-100"
              >
                {update.isPending ? (
                  <ProgressSpinner
                    animationDuration="1s"
                    style={{ width: "20px" }}
                    className="h-5 w-5"
                    strokeWidth="8"
                  />
                ) : (
                  dropdownStatusStudentOnAssignmentLanguage.review(
                    language.data ?? "en",
                  )
                )}
              </button>
              <button
                onClick={() => setTriggerDropdown((prev) => !prev)}
                type="button"
                className="second-button h-10 w-max rounded-md rounded-l-none border p-2 text-base font-medium text-black"
              >
                <IoChevronDownSharp />
              </button>
              {triggerDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute left-6 top-12 z-40 h-max w-60 rounded-md border bg-white p-1 drop-shadow"
                >
                  {menuDropdowns.map((menu) => {
                    let textColor = "text-gray-400";
                    let hoverBg = "hover:bg-primary-color";
                    let status: StudentAssignmentStatus = "REVIEWD";
                    if (menu.title === "improve") {
                      status = "IMPROVED";
                      hoverBg = "hover:bg-info-color";
                    } else if (menu.title === "delete") {
                      status = "PENDDING";
                      textColor = "text-red-400";
                      hoverBg = "hover:bg-error-color";
                    }

                    return (
                      <button
                        key={menu.title}
                        type="button"
                        onClick={() => {
                          if (menu.title === "delete") {
                            ConfirmDeleteMessage({
                              language: language.data ?? "en",
                              async callback() {
                                handleSaveChange(status);
                              },
                            });
                          } else {
                            handleSaveChange(status);
                          }
                        }}
                        className={`flex h-10 w-full items-center justify-start gap-10 px-4 ${textColor} hover:scale-105 ${hoverBg} hover:text-white`}
                      >
                        {menu.icon}
                        {dropdownStatusStudentOnAssignmentLanguage[
                          menu.title as keyof typeof dropdownStatusStudentOnAssignmentLanguage
                        ](language.data ?? "en")}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </header>
        <ul className="grid lg:grid-cols-1 xl:grid-cols-3">
          {studentOnAssignment.completedAt && (
            <li className="flex h-full items-center justify-start gap-1 border bg-slate-100 p-2">
              <div className="w-40 font-semibold">
                {studentWorkDataLanguage.summit_at(language.data ?? "en")}:
              </div>
              <div className="flex flex-col items-start gap-1 text-sm">
                {assignment.dueDate &&
                new Date(studentOnAssignment.completedAt).getTime() >
                  new Date(assignment.dueDate).getTime() ? (
                  <span className="font-semibold text-red-600">
                    {studentWorkDataLanguage.summit_at_status_late(
                      language.data ?? "en",
                    )}
                  </span>
                ) : assignment.dueDate &&
                  new Date(studentOnAssignment.completedAt).getTime() <
                    new Date(assignment.dueDate).getTime() ? (
                  <span className="font-semibold text-blue-600">
                    {studentWorkDataLanguage.summit_at_status_on_time(
                      language.data ?? "en",
                    )}
                  </span>
                ) : (
                  <span className="font-semibold text-blue-600">-</span>
                )}
                <span className="text-xs">
                  {new Date(studentOnAssignment.completedAt).toLocaleTimeString(
                    undefined,
                    {
                      hour: "numeric",
                      minute: "numeric",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </span>
              </div>
            </li>
          )}
          {assignment.dueDate && (
            <li className="flex h-full items-center justify-start gap-1 border bg-slate-100 p-2">
              <div className="w-40 font-semibold">
                {classworkViewDataLanguage.deadLine(language.data ?? "en")}:
              </div>
              <div className="w-max">
                {new Date(assignment.dueDate).getTime() <=
                new Date().getTime() ? (
                  <div className="flex w-max items-center gap-1 font-semibold text-red-600">
                    {timeAgo({
                      pastTime: new Date(assignment.dueDate).toISOString(),
                    })}{" "}
                    ago <FaRegSadTear />
                  </div>
                ) : (
                  <div className="flex w-max items-center gap-1 font-semibold text-green-600">
                    {timeLeft({
                      targetTime: new Date(assignment.dueDate).toISOString(),
                    })}{" "}
                    left <RiEmotionHappyFill />
                  </div>
                )}{" "}
                <span className="text-xs">
                  {new Date(assignment.dueDate).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </li>
          )}
          {studentOnAssignment.reviewdAt && (
            <li className="flex h-full items-center justify-start gap-1 border bg-slate-100 p-2">
              <div className="w-40 font-semibold">
                {studentWorkDataLanguage.review_work_at(language.data ?? "en")}:
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-green-600">
                  {new Date(studentOnAssignment.reviewdAt).toLocaleDateString(
                    undefined,
                    {
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </span>
                <span className="text-xs">
                  {new Date(studentOnAssignment.reviewdAt).toLocaleTimeString(
                    undefined,
                    {
                      hour: "numeric",
                      minute: "numeric",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </span>
              </div>
            </li>
          )}
        </ul>
      </div>
      <main className="flex w-full flex-col gap-2 bg-white p-5 pb-40">
        <div className="flex w-full gap-3 border-b pb-2 text-lg font-semibold">
          {menuViewStudentWorks.map((menu, index) => {
            return (
              <button
                onClick={() => setSelectMenu(menu.title)}
                key={index}
                type="button"
                className={`${
                  menu.title === selectMenu ? "text-black" : "text-gray-500"
                } flex items-center gap-2`}
              >
                {menu.icon}
                {studentWorkDataLanguage[
                  menu.title.toLowerCase() as keyof typeof studentWorkDataLanguage
                ](language.data ?? "en")}
              </button>
            );
          })}
        </div>
        {selectMenu === "Works" && (
          <ul className="grid h-max min-h-96 w-full min-w-96 grid-cols-1 gap-2 rounded-lg bg-gray-100 p-5 xl:grid-cols-2">
            {studentWork?.files?.map((file, index) => {
              return (
                <FileStudentAssignmentCard
                  onShowText={() => setSelectAssignmentText(file)}
                  onEditImage={() => setSelectFileImage(file)}
                  file={file}
                  key={index}
                />
              );
            })}
            {studentOnAssignment.files.length === 0 && (
              <p>
                {studentWorkDataLanguage.noFileAdded(language.data ?? "en")}
              </p>
            )}
          </ul>
        )}
        {selectMenu === "Comments" && (
          <CommentSection
            schoolId={assignment.schoolId}
            studentOnAssignmentId={studentOnAssignment.id}
          />
        )}
      </main>
    </>
  );
}
