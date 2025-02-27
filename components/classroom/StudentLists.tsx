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

type Props = {
  students: Student[];
  classroom: Classroom;
};
function StudentLists({ students, classroom }: Props) {
  const resetPasword = useResetStudentPassword();
  const deleteStudent = useDeleteStudent();
  const [triggerCreateStudent, setTriggerCreateStudent] = React.useState(false);
  const updateStudent = useUpdateStudent();
  const [triggerShowSuggestCareer, setTriggerShowSuggestCareer] =
    useState(false);
  const [loadingStudent, setLoadingStudent] = React.useState(false);
  const toast = React.useRef<Toast>(null);
  const [studentData, setStudentData] = React.useState<Student[]>(
    students.sort((a, b) => Number(a.number) - Number(b.number))
  );

  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const [sortBy, setSortBy] = React.useState<SortByOption>("Default");
  const [search, setSearch] = React.useState("");
  const [selectStudent, setSelectStudent] = React.useState<Student | null>(
    null
  );
  const handleSortBy = (sortBy: SortByOption) => {
    switch (sortBy) {
      case "Default":
        setStudentData((prev) =>
          prev.sort((a, b) => Number(a.number) - Number(b.number))
        );
        break;
      case "Newest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          )
        );
        break;
      case "Oldest":
        setStudentData((prev) =>
          prev.sort(
            (a, b) =>
              new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
          )
        );
        break;
      case "A-Z":
        setStudentData((prev) =>
          prev.sort((a, b) => a.firstName.localeCompare(b.firstName))
        );
        break;
      case "Z-A":
        setStudentData((prev) =>
          prev.sort((a, b) => b.firstName.localeCompare(a.firstName))
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
        students.sort((a, b) => Number(a.number) - Number(b.number))
      );
    setStudentData(() =>
      students?.filter(
        (student) =>
          student.firstName.toLowerCase().includes(search.toLowerCase()) ||
          student.title.toLowerCase().includes(search.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          student.number.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setStudentData(
      students.sort((a, b) => Number(a.number) - Number(b.number))
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
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>To confirm, type <strong>" +
      replacedText +
      "</strong> in the box below </div>";
    const { value } = await Swal.fire({
      title: "Are you sure?",
      input: "text",
      icon: "warning",
      footer: "This action is irreversible and destructive. Please be careful.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
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
              <header className="w-full px-3  pb-2 border-b justify-between flex">
                <div className="flex items-center justify-start gap-2">
                  <button
                    onClick={() => setTriggerShowSuggestCareer(() => true)}
                    className="flex items-center justify-center gap-1 second-button border"
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
                <div className="flex flex-col mt-5 gap-1">
                  <span className=" text-sm">student&lsquo;s password</span>
                  <button
                    type="button"
                    disabled={loadingStudent}
                    onClick={handleResetPassword}
                    className="second-button border w-max flex items-center justify-center gap-1"
                  >
                    <MdOutlinePassword />
                    Reset Password
                  </button>
                  <span className="text-sm text-red-500">
                    ** Password is hashed that mean you can&lsquo;t see the
                    password only reset them. Even the admin doesn&lsquo;t know
                    the password. **
                  </span>
                </div>
              </main>

              <footer className="w-full px-3  py-5  border-t justify-between gap-3 flex">
                <button
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    handleDeleteStudent({ studentId: selectStudent.id });
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
                    className="second-button border flex items-center justify-center gap-1"
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
      <div className="w-full flex flex-col items-center gap-5">
        <header
          className="w-full flex flex-col md:flex-row justify-between p-3 md:px-5 
      md:max-w-screen-md xl:max-w-screen-lg gap-4 md:gap-0 mx-auto"
        >
          <section className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold">Students</h1>
            <p className="text-gray-400 max-w-96 break-words text-sm md:text-base">
              Manage your students in a classroom here. You can create, edit,
              and delete students.
            </p>
          </section>
          <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-1">
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateStudent(true);
              }}
              className="main-button drop-shadow-md w-full xl:w-auto flex items-center justify-center gap-1 py-1 ring-1 ring-blue-600"
            >
              <FiPlus />
              Create Student
            </button>
          </section>
        </header>
        <div className="flex items-center justify-start gap-2">
          <label className="flex flex-col">
            <span className="text-gray-400 text-sm">Search</span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              type="text"
              className="w-96 border border-gray-300 rounded-lg p-2"
              placeholder="Search for student"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-400 text-sm">Sort By</span>
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
                  {option.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section
          className="w-80 min-h-screen  md:w-10/12 lg:w-9/12 
grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        >
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
