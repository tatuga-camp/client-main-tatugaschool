import { DropdownChangeEvent } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useState } from "react";
import { rubricLanguage, subjectsDataLanguage } from "../../../data/languages";
import {
  Classroom,
  EducationYear,
  ErrorMessages,
  Subject,
  TeacherOnSubject,
} from "../../../interfaces";
import {
  useCreateRubric,
  useGetLanguage,
  useGetRubricsBySubject,
  useGetSubjectFromSchool,
} from "../../../react-query";
import { GetRubricByIdService } from "../../../services";
import { getDefaultSubjectFilter } from "../../../utils";
import Dropdown from "../../common/Dropdown";
import InputEducationYear from "../../common/InputEducationYear";
import LoadingSpinner from "../../common/LoadingSpinner";
import PopupLayout from "../../layout/PopupLayout";
import SubjectCard from "../SubjectCard";
import { buildCopyRequest } from "./copyRubric";

type SubjectWithMeta = Subject & {
  teachers: TeacherOnSubject[];
  class: Classroom;
};

type RubricOption = { label: string; id: string };

type Props = {
  currentSubjectId: string;
  schoolId: string;
  educationYear: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};

function CopyRubricFromSubjectDialog({
  currentSubjectId,
  schoolId,
  educationYear,
  toast,
  onClose,
}: Props) {
  const language = useGetLanguage();
  const createRubric = useCreateRubric();
  const defaultFilter = getDefaultSubjectFilter({ schoolId });

  const [year, setYear] = useState<EducationYear | undefined>();
  const [search, setSearch] = useState("");
  const [sourceSubject, setSourceSubject] = useState<SubjectWithMeta | null>(
    null,
  );
  const [sourceRubricId, setSourceRubricId] = useState<string | null>(null);

  // Seed the year from the saved school filter, falling back to the current
  // subject's year. Read in an effect because getDefaultSubjectFilter touches
  // localStorage.
  useEffect(() => {
    setYear(defaultFilter?.educationYear ?? (educationYear as EducationYear));
  }, []);

  const subjects = useGetSubjectFromSchool({
    schoolId,
    educationYear: year as EducationYear,
  });

  const sourceRubrics = useGetRubricsBySubject({
    subjectId: sourceSubject?.id ?? "",
  });

  const filtered = useMemo<SubjectWithMeta[]>(() => {
    const term = search.trim().toLowerCase();
    return (
      subjects.data
        ?.filter((subject) => subject.id !== currentSubjectId)
        .filter((subject) => {
          if (!term) return true;
          return (
            subject.title.toLowerCase().includes(term) ||
            subject.description?.toLowerCase().includes(term) ||
            subject.educationYear.toLowerCase().includes(term) ||
            subject.class.title.toLowerCase().includes(term) ||
            subject.class.level.toLowerCase().includes(term) ||
            subject.teachers.some(
              (teacher) =>
                teacher.firstName.toLowerCase().includes(term) ||
                teacher.lastName.toLowerCase().includes(term) ||
                teacher.email.toLowerCase().includes(term),
            )
          );
        }) ?? []
    );
  }, [subjects.data, search, currentSubjectId]);

  const rubricOptions = useMemo<RubricOption[]>(() => {
    return (
      sourceRubrics.data?.map((rubric) => ({
        label: rubric.title,
        id: rubric.id,
      })) ?? []
    );
  }, [sourceRubrics.data]);

  const selectedRubric = useMemo<RubricOption | null>(
    () => rubricOptions.find((option) => option.id === sourceRubricId) ?? null,
    [rubricOptions, sourceRubricId],
  );

  const selectSubject = (subject: SubjectWithMeta) => {
    setSourceSubject((prev) => (prev?.id === subject.id ? null : subject));
    setSourceRubricId(null);
  };

  const handleCopy = async () => {
    if (!sourceRubricId) return;
    try {
      const tree = await GetRubricByIdService({ rubricId: sourceRubricId });
      await createRubric.mutateAsync(buildCopyRequest(tree, currentSubjectId));
      toast.current?.show({
        severity: "success",
        summary: rubricLanguage.success(language.data ?? "en"),
        detail: rubricLanguage.rubricCopied(language.data ?? "en"),
        life: 3000,
      });
      onClose();
    } catch (error) {
      console.log(error);
      const result =
        (error as { response?: { data?: ErrorMessages } })?.response?.data ??
        (error as ErrorMessages);
      toast.current?.show({
        severity: "error",
        summary: result?.error
          ? result.error
          : rubricLanguage.somethingWentWrong(language.data ?? "en"),
        detail: result?.message
          ? result.message.toString()
          : rubricLanguage.couldNotCopyRubric(language.data ?? "en"),
        life: 5000,
      });
    }
  };

  return (
    <PopupLayout onClose={onClose}>
      <div className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col gap-4 overflow-hidden rounded-2xl border bg-background-color p-5 font-Anuphan">
        <header className="border-b pb-3">
          <h2 className="text-lg font-semibold">
            {rubricLanguage.copyFromSubject(language.data ?? "en")}
          </h2>
        </header>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-400">
              {subjectsDataLanguage.search(language.data ?? "en")}
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="main-input w-60"
              placeholder={subjectsDataLanguage.searchPlaceholder(
                language.data ?? "en",
              )}
            />
          </label>
          {year && (
            <label className="flex flex-col">
              <span className="text-sm text-gray-400">
                {subjectsDataLanguage.educationYear(language.data ?? "en")}
              </span>
              <InputEducationYear
                value={year}
                onChange={(value) => {
                  setYear(value as EducationYear);
                  setSourceSubject(null);
                  setSourceRubricId(null);
                }}
                required={true}
              />
            </label>
          )}
        </div>

        <main className="min-h-40 grow overflow-auto">
          {subjects.isLoading ? (
            <div className="flex w-full items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              {rubricLanguage.noOtherSubjects(language.data ?? "en")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((subject) => {
                const isSelected = sourceSubject?.id === subject.id;
                return (
                  <div key={subject.id} className="relative">
                    {isSelected && (
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-40 rounded-2xl bg-primary-color/40"></div>
                    )}
                    <div
                      onClick={() => selectSubject(subject)}
                      className="absolute inset-0 z-50 cursor-pointer"
                    ></div>
                    <SubjectCard
                      subject={subject}
                      teachers={subject.teachers}
                      classroom={subject.class}
                      onClick={() => selectSubject(subject)}
                    />
                    {isSelected && (
                      <div className="absolute right-2 top-2 z-[60] flex h-8 w-8 items-center justify-center rounded-full bg-primary-color text-white shadow-md">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {sourceSubject &&
          (sourceRubrics.isLoading ? (
            <div className="flex w-full items-center justify-center py-2">
              <LoadingSpinner />
            </div>
          ) : sourceRubrics.isError ? (
            <p className="text-center text-sm text-error-color">
              {(sourceRubrics.error as unknown as ErrorMessages)?.message?.toString() ??
                rubricLanguage.somethingWentWrong(language.data ?? "en")}
            </p>
          ) : rubricOptions.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              {rubricLanguage.noRubricsInSubject(language.data ?? "en")}
            </p>
          ) : (
            <label className="flex w-full flex-col gap-1 border-t pt-3">
              <span className="text-base font-medium">
                {rubricLanguage.selectRubricToCopy(language.data ?? "en")}
              </span>
              <Dropdown<RubricOption>
                value={selectedRubric}
                options={rubricOptions}
                optionLabel="label"
                placeholder={rubricLanguage.selectRubricToCopy(
                  language.data ?? "en",
                )}
                onChange={(e: DropdownChangeEvent) =>
                  setSourceRubricId((e.value as RubricOption | null)?.id ?? null)
                }
              />
            </label>
          ))}

        <footer className="flex items-center justify-end gap-2 border-t pt-3">
          <button
            type="button"
            onClick={onClose}
            className="second-button flex items-center justify-center border py-1"
          >
            {rubricLanguage.cancel(language.data ?? "en")}
          </button>
          <button
            type="button"
            disabled={!sourceRubricId || createRubric.isPending}
            onClick={handleCopy}
            className="main-button flex items-center justify-center gap-1 py-1"
          >
            {createRubric.isPending && <LoadingSpinner />}
            {rubricLanguage.copyAction(language.data ?? "en")}
          </button>
        </footer>
      </div>
    </PopupLayout>
  );
}

export default CopyRubricFromSubjectDialog;
