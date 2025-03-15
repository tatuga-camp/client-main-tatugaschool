import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React, { useCallback, useEffect, useState } from "react";
import { BiBookOpen, BiComment } from "react-icons/bi";
import {
  BsEyeFill,
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
} from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdAssignment } from "react-icons/md";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import {
  Assignment,
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import {
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
import { decodeBlurhashToCanvas } from "../../utils";
import DrawCanva from "../common/DrawCanva";
import InputNumber from "../common/InputNumber";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layout/PopupLayout";
import AssignmentText from "./AssignmentText";
import CommentSection from "./CommentSection";
import FileStudentAssignmentCard from "./FileStudentAssignmentCard";
import { studentWorkDataLanguage } from "../../data/languages";

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
              studentOnAssignment.id === prevSelectedStudent.id
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
        })
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
    []
  );
  return (
    <main className="w-full h-max  flex ">
      <section
        className={`${
          triggerHideStudentList ? "w-20  " : " w-8/12  "
        } overflow-auto transition-width p-5 min-h-screen max-h-screen pb-40  
       flex flex-col gap-2 bg-white  h-max border-r sticky top-0`}
      >
        <div className="text-xl w-full justify-between flex gap-2 items-center ">
          {triggerHideStudentList
            ? ""
            : studentOnAssignments.isFetching
            ? "Student Loading.."
            : studentWorkDataLanguage.student(language.data ?? "en")}
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
                <div className="flex justify-center w-6">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
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
                <div className="text-start font-normal ">
                  {studentWorkDataLanguage.name(language.data ?? "en")}
                </div>
              </th>
              <th>
                <div className="text-center font-normal ">
                  {studentWorkDataLanguage.status(language.data ?? "en")}
                </div>
              </th>
              <th>
                <div className="text-center font-normal ">
                  {studentWorkDataLanguage.score(language.data ?? "en")}
                </div>
              </th>
              <th>
                <div className="text-base font-normal flex gap-2 items-center justify-center ">
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
      </section>
      <section className="w-full  flex-col min-h-screen h-max flex  items-start justify-start">
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
    student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] }
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
    <tr className={` ${odd && "bg-gray-200/20"} hover:bg-sky-100  gap-2`}>
      <th>
        <div className="w-6 flex items-center justify-center">
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
            className="w-5 h-5"
          />
        </div>
      </th>
      <th>
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
      <th>
        <div
          className={`flex w-full items-center h-full 
            text-white py-2 rounded-md px-2 

            ${
              student.status === "SUBMITTED" &&
              "bg-gradient-to-r from-amber-200 to-yellow-400"
            }

            ${
              student.status === "REVIEWD" &&
              "bg-gradient-to-r from-emerald-400 to-cyan-400"
            }

            ${
              student.status === "PENDDING" &&
              "bg-gradient-to-r from-stone-500 to-stone-700"
            }
            justify-center text-sm font-normal `}
        >
          {student.status === "SUBMITTED" &&
            studentWorkDataLanguage.waitForReview(language.data ?? "en")}
          {student.status === "REVIEWD" &&
            studentWorkDataLanguage.reviewed(language.data ?? "en")}
          {student.status === "PENDDING" &&
            studentWorkDataLanguage.noWork(language.data ?? "en")}
        </div>
      </th>
      <th>
        <div
          className={`flex justify-center text-sm font-normal ${
            student.score !== null
              ? "text-primary-color font-medium"
              : "text-gray-400"
          }`}
        >
          {student.score !== null
            ? student.score?.toLocaleString()
            : studentWorkDataLanguage.notGrade(language.data ?? "en")}
        </div>
      </th>
      <th>
        <div className="flex w-full h-full p-2 justify-center">
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
            className={`flex items-center font-normal 
           justify-center gap-1 transition
           ${student.id === student.id ? "main-button" : "second-button border"}
           `}
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
    <div className="w-full flex font-Anuphan items-center justify-center grow h-full">
      {loading && <LoadingBar />}
      {selectStudents.length > 0 ? (
        <form
          onSubmit={handleSaveChange}
          className="flex items-center justify-center h-full gap-2"
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
            className="second-button flex items-center justify-center border w-60 text-sm"
          >
            {loading ? (
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
  const [loadingFile, setLoadingFile] = React.useState(false);
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
  const [selectFileImage, setSelectFileImage] =
    React.useState<FileOnStudentOnAssignment | null>(null);

  useEffect(() => {
    setStudentWork({
      score: studentOnAssignment.score,
      body: studentOnAssignment.body,
      files: studentOnAssignment.files,
    });
  }, [studentOnAssignment]);

  const handleSaveChange = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        query: {
          studentOnAssignmentId: studentOnAssignment.id,
        },
        body: {
          score: studentWork?.score,
          status: "REVIEWD",
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

  return (
    <>
      <Toast ref={toast} />

      {selectFileImage && (
        <PopupLayout
          onClose={() => {
            setSelectFileImage(null);
          }}
        >
          <div className="w-full flex justify-start items-center flex-col h-full ">
            {loadingFile && <LoadingBar />}
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
        <div className="w-screen h-screen flex items-center justify-center fixed z-50 top-0 right-0 bottom-0 left-0 m-auto">
          <div
            className="w-full md:w-10/12 lg:w-[35rem] relative 
          h-max p-3 bg-white rounded-md"
          >
            <div className="w-full flex justify-end">
              <button
                onClick={() => setSelectAssignmentText(null)}
                className="text-lg  hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
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
          <footer
            className="w-screen h-screen bg-black/50 fixed
          -z-10 top-0 right-0 bottom-0 left-0 m-auto"
          ></footer>
        </div>
      )}
      <form
        onSubmit={handleSaveChange}
        className="w-full bg-white  h-16 flex items-center justify-between p-2 px-4"
      >
        <div className="flex gap-2 pl-2 h-14 items-center">
          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
            <Image
              src={studentOnAssignment.photo}
              alt={studentOnAssignment.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                studentOnAssignment.blurHash ?? defaultBlurHash
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col  items-start">
            <h1 className="text-sm font-semibold">
              {studentOnAssignment.firstName} {studentOnAssignment.lastName}{" "}
            </h1>
            <p className="text-xs text-gray-500">
              Number {studentOnAssignment.number}{" "}
              {!studentOnAssignment.isAssigned && "(NOT Assigned)"}
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
              studentWorkDataLanguage.saveChange(language.data ?? "en")
            )}
          </button>
        </div>
      </form>
      <main className="w-full bg-white p-5 flex pb-40  flex-col gap-2">
        <div className="w-full font-semibold text-lg gap-3 flex border-b pb-2">
          {menuViewStudentWorks.map((menu, index) => {
            return (
              <button
                onClick={() => setSelectMenu(menu.title)}
                key={index}
                type="button"
                className={`${
                  menu.title === selectMenu ? "text-black" : "text-gray-500"
                } flex items-center gap-2
                
                `}
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
          <ul className="w-96 min-h-96 h-max flex flex-col gap-2">
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
