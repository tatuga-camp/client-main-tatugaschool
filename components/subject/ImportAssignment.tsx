import React, { useEffect, useState } from "react";
import {
  useCreateAssignment,
  useCreateFileOnAssignment,
  useGetAssignments,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSubjectFromSchool,
  useGetUser,
} from "../../react-query";
import { subjectsDataLanguage } from "../../data/languages";
import InputEducationYear from "../common/InputEducationYear";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  Assignment,
  Classroom,
  EducationYear,
  ErrorMessages,
  FileOnAssignment,
  Subject,
  TeacherOnSubject,
} from "../../interfaces";
import { MdImportContacts, MdNoCell } from "react-icons/md";
import SubjectCard from "./SubjectCard";
import { IoMdClose } from "react-icons/io";
import ClassworkCard from "./ClassworkCard";
import { FiPlus } from "react-icons/fi";
import LoadingBar from "../common/LoadingBar";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import { useRouter } from "next/router";
import { MenuAssignmentQuery } from "../../pages/subject/[subjectId]/assignment/[assignmentId]";

type Props = {
  schoolId: string;
  onClose: () => void;
  toast: React.RefObject<Toast>;
  targetSubjectId: string;
};
function ImportAssignment({
  schoolId,
  onClose,
  toast,
  targetSubjectId,
}: Props) {
  const language = useGetLanguage();
  const user = useGetUser();
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId,
  });
  const [selectSubject, setSelectSubject] = useState<Subject | null>(null);
  const [selectFilterUserId, setSelectFilterUserId] = React.useState<
    string | "show-all"
  >(user.data?.id ?? "show-all");
  const [educationYear, setEducationYear] = React.useState<
    EducationYear | undefined
  >();
  const [search, setSearch] = React.useState("");
  const [subjectData, setSubjectData] = React.useState<
    (Subject & {
      teachers: TeacherOnSubject[];
      class: Classroom;
    })[]
  >([]);

  const subjects = useGetSubjectFromSchool({
    schoolId,
    educationYear: educationYear as EducationYear,
  });

  useEffect(() => {
    const year = new Date().getFullYear();
    setEducationYear(() => `1/${year}`);
  }, []);

  React.useEffect(() => {
    if (subjects.data && user.data) {
      setSelectFilterUserId(user.data.id);
      handleFilterByUser(user.data.id);
    }
  }, [subjects.data, user.data]);

  const handleSearch = (search: string) => {
    if (!subjects.data) {
      return;
    }
    setSearch(search);
    if (search === "") return setSubjectData(subjects.data);
    setSubjectData(() =>
      subjects.data?.filter(
        (classroom) =>
          classroom.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.description?.toLowerCase().includes(search.toLowerCase()) ||
          classroom.educationYear
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          classroom.teachers.some(
            (teacher) =>
              teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
              teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
              teacher.email.toLowerCase().includes(search.toLowerCase()),
          ) ||
          classroom.class.title.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.level.toLowerCase().includes(search.toLowerCase()) ||
          classroom.class.description
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      ),
    );
  };
  const handleFilterByUser = (userId: string | "show-all") => {
    if (!subjects.data) {
      return;
    }

    setSelectFilterUserId(userId);
    setSubjectData((prev) => {
      if (!prev) {
        return [];
      }
      if (userId !== "show-all") {
        return subjects.data.filter((subject) =>
          subject.teachers.some((t) => t.userId === userId),
        );
      } else {
        return subjects.data;
      }
    });
  };
  return (
    <div className="flex h-5/6 w-10/12 flex-col gap-3 rounded-2xl bg-white p-5 pb-0 font-Anuphan">
      <div className="flex w-full justify-end">
        <button
          onClick={() => {
            onClose();
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <section className="border-b pb-3">
        <h1 className="flex items-center justify-start gap-2 text-xl font-semibold text-primary-color">
          <MdImportContacts /> Import Assignment
        </h1>
        <h2 className="text-base font-normal text-gray-500">
          You can import assignment from another subject with this panel
        </h2>
      </section>
      {selectSubject ? (
        <header></header>
      ) : (
        <header className="items-cente r flex flex-wrap justify-start gap-2">
          <label className="flex flex-col">
            <span className="text-sm text-gray-400">
              {subjectsDataLanguage.search(language.data ?? "en")}
            </span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              type="text"
              className="main-input w-96"
              placeholder={subjectsDataLanguage.searchPlaceholder(
                language.data ?? "en",
              )}
            />
          </label>
          {educationYear && (
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">
                {subjectsDataLanguage.educationYear(language.data ?? "en")}
              </span>
              <InputEducationYear
                value={educationYear}
                onChange={(value) => setEducationYear(value as EducationYear)}
                required={true}
              />
            </label>
          )}
          <label className="flex w-80 flex-col">
            <span className="text-sm text-gray-400">
              ค้นหาตามรายชื่อคุณครูในโรงเรียน
            </span>
            {memberOnSchools.isLoading ? (
              <LoadingSpinner />
            ) : (
              <select
                value={selectFilterUserId}
                onChange={(e) => {
                  handleFilterByUser(e.target.value);
                }}
                className="second-button w-80 border"
              >
                {[
                  ...(memberOnSchools.data ?? []),
                  {
                    firstName: "Show All",
                    lastName: "",
                    email: "subjects",
                    userId: "show-all",
                  },
                ].map((option) => (
                  <option key={option.userId} value={option.userId}>
                    {option.firstName} {option.lastName} : {option.email}
                  </option>
                ))}
              </select>
            )}
          </label>
        </header>
      )}
      {selectSubject ? (
        <AssignmentLists
          targetSubjectId={targetSubjectId}
          toast={toast}
          onCancel={() => setSelectSubject(null)}
          subjectId={selectSubject.id}
        />
      ) : (
        <ul className="grid w-full grow gap-3 overflow-auto p-5 lg:grid-cols-2 xl:grid-cols-3">
          {subjectData.map((subject) => {
            return (
              <SubjectCard
                onClick={() => {
                  setSelectSubject(subject);
                }}
                key={subject.id}
                subject={subject}
                teachers={subject.teachers}
                classroom={subject.class}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ImportAssignment;

type AssignmentListsProps = {
  subjectId: string;
  onCancel: () => void;
  toast: React.RefObject<Toast>;
  targetSubjectId: string;
};
function AssignmentLists({
  subjectId,
  onCancel,
  toast,
  targetSubjectId,
}: AssignmentListsProps) {
  const router = useRouter();
  const create = useCreateAssignment();
  const createFiles = useCreateFileOnAssignment();
  const classworks = useGetAssignments({
    subjectId: subjectId,
  });
  const [selectClasswork, setSelectClasswork] = useState<
    (Assignment & { files?: FileOnAssignment[] }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleDupicateAssignment = async () => {
    try {
      if (!selectClasswork) {
        throw new Error("Please Select One Classwork");
      }

      setLoading(true);
      const classwork = await create.mutateAsync({
        subjectId: targetSubjectId,
        title: selectClasswork.title,
        description: selectClasswork.description,
        dueDate: selectClasswork.dueDate,
        type: selectClasswork.type,
        status: selectClasswork.status,
        maxScore: selectClasswork.maxScore,
        beginDate: selectClasswork.beginDate,
        videoURL: selectClasswork.videoURL,
        preventFastForward: selectClasswork.preventFastForward,
      });

      if (selectClasswork.files && selectClasswork.files?.length > 0) {
        await Promise.allSettled(
          selectClasswork.files.map((f) =>
            createFiles.mutateAsync({
              assignmentId: classwork.id,
              type: f.type,
              url: f.url,
              size: f.size,
              ...(f.blurHash && { blurHash: f.blurHash }),
            }),
          ),
        );
      }
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Classwork has been created",
      });
      setLoading(false);
      router.push({
        pathname: `/subject/${targetSubjectId}/assignment/${classwork.id}`,
        query: { menu: "manageassigning" as MenuAssignmentQuery },
      });
    } catch (error) {
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
    <>
      {(classworks.isLoading || loading) && <LoadingBar />}
      <ul className="flex w-full grow flex-col items-center gap-2 overflow-auto p-5">
        {classworks.error && (
          <h1 className="flex items-center justify-center text-xl font-semibold text-red-600">
            {classworks.error.message}
          </h1>
        )}
        {classworks.data?.length === 0 && (
          <h1 className="flex items-center justify-center text-xl font-semibold text-red-600">
            This Subject has no classwork <MdNoCell />
          </h1>
        )}
        {classworks.data
          ?.sort((a, b) => a.order - b.order)
          .map((classwork) => {
            return (
              <div
                key={classwork.id}
                className={`w-full rounded-2xl ${selectClasswork && selectClasswork.id === classwork.id && "ring-2 ring-black"} md:w-9/12 xl:w-8/12`}
              >
                <ClassworkCard
                  key={classwork.id}
                  classwork={classwork}
                  selectClasswork={null}
                  subjectId={subjectId}
                  onSelect={(data) => {
                    setSelectClasswork(classwork);
                  }}
                />
              </div>
            );
          })}
      </ul>
      <footer className="flex w-full items-center justify-end gap-3 border-t p-5">
        <button
          type="button"
          onClick={() => {
            onCancel();
          }}
          className="second-button flex w-40 items-center justify-center gap-1 border"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={() => handleDupicateAssignment()}
          className="main-button flex w-40 items-center justify-center gap-1"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FiPlus /> Copy
            </>
          )}
        </button>
      </footer>
    </>
  );
}
