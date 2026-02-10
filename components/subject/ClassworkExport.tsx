import React, { useEffect, useState } from "react";
import {
  useCreateAssignment,
  useCreateFileOnAssignment,
  useCreateQuestionOnVideo,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetSubjectFromSchool,
  useGetUser,
  useGetQuestionOnVideoByAssignmentId,
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
import { FiShare } from "react-icons/fi";
import Swal from "sweetalert2";
import SubjectCard from "./SubjectCard";
import LoadingBar from "../common/LoadingBar";
import { getDefaultSubjectFilter } from "../../utils";

type Props = {
  assignment: Assignment;
  files: FileOnAssignment[];
  schoolId: string;
  currentSubjectId: string;
};

function ClassworkExport({
  assignment,
  files,
  schoolId,
  currentSubjectId,
}: Props) {
  const language = useGetLanguage();
  const user = useGetUser();
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId,
  });
  const defaultFilter = getDefaultSubjectFilter({ schoolId: schoolId });

  const [selectSubjects, setSelectSubjects] = useState<Subject[]>([]);
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

  const questions = useGetQuestionOnVideoByAssignmentId({
    assignmentId: assignment.id,
  });

  const create = useCreateAssignment();
  const createFiles = useCreateFileOnAssignment();
  const createQuestions = useCreateQuestionOnVideo();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (subjects.data && user.data) {
      setSelectFilterUserId(user.data.id);
      handleFilterByUser(user.data.id);
    }
  }, [subjects.data, user.data]);

  useEffect(() => {
    if (defaultFilter) {
      setEducationYear(defaultFilter.educationYear);
      setSelectFilterUserId(defaultFilter.userId);
    } else {
      const year = new Date().getFullYear();
      setEducationYear(() => `1/${year}`);
    }
  }, []);

  const handleSearch = (search: string) => {
    if (!subjects.data) {
      return;
    }
    setSearch(search);
    if (search === "")
      return setSubjectData(
        subjects.data.filter((s) => s.id !== currentSubjectId),
      );
    setSubjectData(() =>
      subjects.data?.filter(
        (classroom) =>
          classroom.id !== currentSubjectId &&
          (classroom.title.toLowerCase().includes(search.toLowerCase()) ||
            classroom.description
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            classroom.educationYear
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            classroom.teachers.some(
              (teacher) =>
                teacher.firstName
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.email.toLowerCase().includes(search.toLowerCase()),
            ) ||
            classroom.class.title
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            classroom.class.level
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            classroom.class.description
              ?.toLowerCase()
              .includes(search.toLowerCase())),
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
      let filtered =
        subjects.data?.filter((s) => s.id !== currentSubjectId) || [];
      if (userId !== "show-all") {
        return filtered.filter((subject) =>
          subject.teachers.some((t) => t.userId === userId),
        );
      } else {
        return filtered;
      }
    });
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectSubjects((prev) => {
      if (prev.find((s) => s.id === subject.id)) {
        return prev.filter((s) => s.id !== subject.id);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleExport = async () => {
    try {
      if (selectSubjects.length === 0) {
        throw new Error("Please select at least one subject");
      }
      setLoading(true);

      await Promise.allSettled(
        selectSubjects.map(async (targetSubject) => {
          const classwork = await create.mutateAsync({
            subjectId: targetSubject.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            type: assignment.type,
            status: assignment.status,
            maxScore: assignment.maxScore,
            beginDate: assignment.beginDate,
            videoURL: assignment.videoURL,
            preventFastForward: assignment.preventFastForward,
            assignAll: true,
          });

          if (files && files.length > 0) {
            await Promise.allSettled(
              files.map((f) =>
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

          if (questions.data && questions.data.length > 0) {
            await Promise.allSettled(
              questions.data.map((f) =>
                createQuestions.mutateAsync({
                  assignmentId: classwork.id,
                  question: f.question,
                  correctOptions: f.correctOptions,
                  timestamp: f.timestamp,
                  options: f.options,
                }),
              ),
            );
          }
        }),
      );

      setLoading(false);
      setSelectSubjects([]);
      Swal.fire({
        title: "Success",
        text: `Classwork exported to ${selectSubjects.length} subjects`,
        icon: "success",
      });
    } catch (error) {
      setLoading(false);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString() || (error as Error).message,
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 p-5 font-Anuphan">
      <header className="flex flex-wrap items-center justify-start gap-5 pb-5">
        <label className="flex flex-col">
          <span className="text-sm text-gray-400">
            {subjectsDataLanguage.search(language.data ?? "en")}
          </span>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            type="text"
            className="main-input w-60"
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
        <label className="flex w-60 flex-col">
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
              className="second-button w-60 border"
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
        <div className="ml-auto flex items-center gap-2">
          <span className="font-semibold text-primary-color">
            Selected: {selectSubjects.length}
          </span>
          <button
            disabled={loading || selectSubjects.length === 0}
            onClick={handleExport}
            className="main-button flex items-center gap-2 disabled:bg-gray-400"
          >
            <FiShare /> Export
          </button>
        </div>
      </header>

      {loading && <LoadingBar />}

      <main className="grid w-full grid-cols-1 gap-5 overflow-auto pb-20 md:grid-cols-3 xl:grid-cols-5">
        {subjectData.map((subject) => {
          const isSelected = selectSubjects.some((s) => s.id === subject.id);
          return (
            <div
              key={subject.id}
              className={`relative transition-all duration-200`}
            >
              <div
                className={` ${isSelected ? "absolute bottom-0 left-0 right-0 top-0 z-40 h-full w-full rounded-xl bg-blue-600/50" : ""}`}
              ></div>
              <div
                onClick={() => handleSelectSubject(subject)}
                className="absolute inset-0 z-50 cursor-pointer"
              ></div>
              <SubjectCard
                subject={subject}
                teachers={subject.teachers}
                classroom={subject.class}
                onClick={() => handleSelectSubject(subject)}
              />
              {isSelected && (
                <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary-color text-white shadow-md">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default ClassworkExport;
