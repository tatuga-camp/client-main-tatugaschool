import React, { useEffect, useState } from "react";
import { Classroom, ErrorMessages, Student } from "../../interfaces";
import StudentCard from "../student/StudentCard";
import { SortByOption, sortByOptions } from "../../data";
import { FiPlus } from "react-icons/fi";
import PopupLayout from "../layout/PopupLayout";
import StudentCreate from "./StudentCreate";
import { Toast } from "primereact/toast";
import SlideLayout from "../layout/SlideLayout";
import StudentSection from "./StudentSection";
import {
  useDeleteStudent,
  useGetLanguage,
  useResetStudentPassword,
  useUpdateStudent,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { generateBlurHash } from "../../utils";
import Swal from "sweetalert2";
import LoadingBar from "../common/LoadingBar";
import { useSound } from "../../hook";
import { MdDelete, MdOutlinePassword } from "react-icons/md";
import StudentCareerSuggest from "../student/StudentCareerSuggest";
import { SiGooglegemini } from "react-icons/si";
import { TbReportSearch } from "react-icons/tb";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import {
  classesDataLanguage,
  sortByOptionsDataLanguage,
  studentOnClassDataLanguage,
} from "../../data/languages";

type Props = {
  students: Student[];
  classroom: Classroom;
};
function StudentLists({ students, classroom }: Props) {
  const resetPasword = useResetStudentPassword();
  const language = useGetLanguage();
  const deleteStudent = useDeleteStudent();
  const [triggerCreateStudent, setTriggerCreateStudent] = React.useState(false);
  const updateStudent = useUpdateStudent();
  const [triggerShowSuggestCareer, setTriggerShowSuggestCareer] =
    useState(false);
  const [loadingStudent, setLoadingStudent] = React.useState(false);
  const toast = React.useRef<Toast>(null);
  const [studentData, setStudentData] = React.useState<Student[]>(
    students.sort((a, b) => Number(a.number) - Number(b.number)),
  );

  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const [selectStudent, setSelectStudent] = React.useState<Student | null>(
    null,
  );
  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setStudentData((prev) =>
          prev.sort((a, b) => Number(a.number) - Number(b.number)),
        );
        break;
      case "Newest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
          ),
        );
        break;
      case "Oldest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
          ),
        );
        break;
      case "AZ":
        setStudentData((prev) =>
          prev.sort((a, b) => a.firstName.localeCompare(b.firstName)),
        );
        break;
      case "ZA":
        setStudentData((prev) =>
          prev.sort((a, b) => b.firstName.localeCompare(a.firstName)),
        );
        break;
      default:
        break;
    }
  };

  const handleSearch = (search: string) => {
    setSearch(search);
    if (search === "")
      return setStudentData(
        students.sort((a, b) => Number(a.number) - Number(b.number)),
      );
    setStudentData(() =>
      students?.filter(
        (student) =>
          student.firstName.toLowerCase().includes(search.toLowerCase()) ||
          student.title.toLowerCase().includes(search.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          student.number.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  };

  useEffect(() => {
    setStudentData(
      students.sort((a, b) => Number(a.number) - Number(b.number)),
    );
  }, [students]);

  const handleUpdateStudent = async () => {
    try {
      if (!selectStudent) return;
      let photo: string | undefined = selectStudent.photo;
      if (selectStudent.photo && !selectStudent.blurHash) {
        photo = undefined;
      }
      await updateStudent.mutateAsync({
        query: {
          studentId: selectStudent?.id,
        },
        body: {
          ...(selectStudent?.title && { title: selectStudent?.title }),
          ...(selectStudent?.firstName && {
            firstName: selectStudent?.firstName,
          }),
          ...(selectStudent?.lastName && { lastName: selectStudent?.lastName }),
          ...(selectStudent?.photo && { photo: photo }),
          ...(selectStudent?.blurHash && { blurHash: selectStudent?.blurHash }),
          ...(selectStudent?.number && { number: selectStudent?.number }),
        },
      });
      sound.play();
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoadingStudent(true);
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("File not found");
      }

      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
        schoolId: classroom.schoolId,
        fileSize: file.size,
      });

      await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });

      const hash = await generateBlurHash(file);

      setSelectStudent((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photo: signURL.originalURL,
          blurHash: hash,
        };
      });

      setLoadingStudent(false);
    } catch (error) {
      setLoadingStudent(false);
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

  const handleDeleteStudent = async ({ studentId }: { studentId: string }) => {
    try {
      Swal.fire({
        title: "Deleting...",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await deleteStudent.mutateAsync({
        studentId: studentId,
      });
      sound.play();
      Swal.fire({
        title: "Success",
        text: "Student Deleted",
        icon: "success",
      });
      setSelectStudent(null);
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

  const handleResetPassword = async () => {
    try {
      if (!selectStudent) return;
      setLoadingStudent(true);
      await resetPasword.mutateAsync({
        studentId: selectStudent.id,
      });
      sound.play();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Password Reset",
        life: 3000,
      });
      setLoadingStudent(false);
    } catch (error) {
      setLoadingStudent(false);
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
      {selectStudent && (
        <SlideLayout
          loading={loadingStudent || updateStudent.isPending}
          onClose={() => {
            setTriggerShowSuggestCareer(() => false);
            setSelectStudent(null);
          }}
        >
          {triggerShowSuggestCareer ? (
            <StudentCareerSuggest
              onClose={() => {
                setTriggerShowSuggestCareer(() => false);
              }}
              studentId={selectStudent.id}
            />
          ) : (
            <>
              <header className="flex w-full justify-between border-b px-3 pb-2">
                <div className="flex items-center justify-start gap-2">
                  <button
                    onClick={() => setTriggerShowSuggestCareer(() => true)}
                    className="second-button flex items-center justify-center gap-1 border"
                  >
                    <SiGooglegemini />
                    Suggest Carrer Path (AI)
                  </button>
                  {/* <button className="flex items-center justify-center gap-1 second-button border">
                    <TbReportSearch />
                    Report
                  </button> */}
                </div>
              </header>
              <main className="grow overflow-auto p-4">
                <StudentSection
                  data={selectStudent}
                  setData={(data) => {
                    setSelectStudent((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        ...data,
                      };
                    });
                  }}
                  handleUpload={handleUpload}
                />
                <div className="mt-5 flex flex-col gap-1">
                  <span className="text-sm">
                    {studentOnClassDataLanguage.studentData.password(
                      language.data ?? "en",
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={loadingStudent}
                    onClick={handleResetPassword}
                    className="second-button flex w-max items-center justify-center gap-1 border"
                  >
                    <MdOutlinePassword />
                    {studentOnClassDataLanguage.studentData.resetPassword(
                      language.data ?? "en",
                    )}
                  </button>
                  <span className="text-sm text-red-500">
                    {studentOnClassDataLanguage.studentData.passwordDescription(
                      language.data ?? "en",
                    )}
                  </span>
                </div>
              </main>

              <footer className="flex w-full justify-between gap-3 border-t px-3 py-5">
                <button
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    ConfirmDeleteMessage({
                      language: language.data ?? "en",
                      callback: async () => {
                        await handleDeleteStudent({
                          studentId: selectStudent.id,
                        });
                      },
                    });
                  }}
                  className="reject-button flex items-center justify-center gap-1"
                >
                  <MdDelete />
                  Delete student
                </button>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setTriggerShowSuggestCareer(() => false);
                      setSelectStudent(null);
                    }}
                    type="button"
                    className="second-button flex items-center justify-center gap-1 border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStudent();
                    }}
                    type="submit"
                    className="main-button flex items-center justify-center gap-1"
                  >
                    <FiPlus /> Update Student
                  </button>
                </div>
              </footer>
            </>
          )}
        </SlideLayout>
      )}
      {triggerCreateStudent && (
        <PopupLayout
          onClose={() => {
            document.body.style.overflow = "auto";
            setTriggerCreateStudent(false);
          }}
        >
          <StudentCreate
            schoolId={classroom.schoolId}
            toast={toast}
            classId={classroom.id}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateStudent(false);
            }}
          />
        </PopupLayout>
      )}

      <Toast ref={toast} />
      <div className="flex w-full flex-col items-center gap-5">
        <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:gap-0 md:px-5 xl:max-w-screen-lg">
          <section className="text-center md:text-left">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {studentOnClassDataLanguage.title(language.data ?? "en")}
            </h1>
            <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
              {studentOnClassDataLanguage.description(language.data ?? "en")}
            </p>
          </section>
          <section className="flex flex-col items-center gap-2 md:gap-1 xl:flex-row">
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateStudent(true);
              }}
              className="main-button flex w-full items-center justify-center gap-1 py-1 ring-1 ring-blue-600 drop-shadow-md xl:w-auto"
            >
              <FiPlus />
              {studentOnClassDataLanguage.create(language.data ?? "en")}
            </button>
          </section>
        </header>
        <div className="flex items-center justify-start gap-2">
          <label className="flex flex-col">
            <span className="text-sm text-gray-400">
              {studentOnClassDataLanguage.search(language.data ?? "en")}
            </span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              type="text"
              className="w-96 rounded-2xl border border-gray-300 p-2"
              placeholder={studentOnClassDataLanguage.searchPlaceholder(
                language.data ?? "en",
              )}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-400">
              {classesDataLanguage.sort(language.data ?? "en")}
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                handleSortBy(e.target.value as SortByOption);
                setSortBy(e.target.value as SortByOption);
              }}
              className="main-select w-40 border"
            >
              {sortByOptions.map((option) => (
                <option key={option.title} value={option.title}>
                  {sortByOptionsDataLanguage[
                    option.title.toLowerCase() as keyof typeof sortByOptionsDataLanguage
                  ](language.data ?? "en")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="grid w-80 grid-cols-2 gap-5 sm:grid-cols-3 md:w-10/12 md:grid-cols-4 lg:w-9/12 lg:grid-cols-4 xl:grid-cols-5">
          {studentData.map((student) => {
            return (
              <StudentCard
                key={student.id}
                student={student as Student}
                isDragable={false}
                showSelect={false}
                setSelectStudent={(data) => {
                  setTriggerShowSuggestCareer(() => false);
                  setSelectStudent(data);
                }}
              />
            );
          })}
        </section>
      </div>
    </>
  );
}

export default StudentLists;
