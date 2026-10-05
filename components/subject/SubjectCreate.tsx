import Link from "next/link";
import { Toast } from "primereact/toast";
import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { MdCheck } from "react-icons/md";
import Swal from "sweetalert2";
import {
  classroomUiLanguage,
  subjectsDataLanguage,
  subjectUiLanguage,
} from "../../data/languages";
import { EducationYear, ErrorMessages } from "../../interfaces";
import {
  useCreateSubject,
  useGetClassrooms,
  useGetLanguage,
} from "../../react-query";
import { useSound } from "../../hook";
import { fullGradeLabel, shortGradeLabel, splitLevel } from "../../utils/classLevel";
import {
  filterClassrooms,
  groupClassroomsByGrade,
  NO_LEVEL_KEY,
} from "../../utils/classroomGroups";
import { subjectEmoji } from "../../utils/subjectList";
import { describedBy, fieldInputClass, FormField } from "../common/FormField";
import InputEducationYear from "../common/InputEducationYear";

type Props = {
  onClose: () => void;
  schoolId: string;
  educationYear: EducationYear;
  toast: React.RefObject<Toast>;
  // Pre-selects this classroom, e.g. when creating from a classroom page.
  defaultClassId?: string;
};

function SubjectCreate({
  onClose,
  schoolId,
  educationYear,
  toast,
  defaultClassId,
}: Props) {
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const create = useCreateSubject();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const classrooms = useGetClassrooms({ schoolId, isAchieved: false });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<EducationYear>(educationYear);
  const [classId, setClassId] = useState<string | undefined>(defaultClassId);
  const [classSearch, setClassSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // With a single classroom there's nothing to choose.
  useEffect(() => {
    if (!classId && classrooms.data?.length === 1) {
      setClassId(classrooms.data[0].id);
    }
  }, [classrooms.data, classId]);

  const groups = useMemo(
    () => groupClassroomsByGrade(filterClassrooms(classrooms.data ?? [], classSearch)),
    [classrooms.data, classSearch],
  );

  const errors = {
    title: title.trim() ? null : subjectUiLanguage.required(lang),
    description: description.trim() ? null : subjectUiLanguage.required(lang),
    classId: classId ? null : subjectUiLanguage.classroomRequired(lang),
  };
  const shown = (field: keyof typeof errors) => (submitted ? errors[field] : null);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.title || errors.description || !classId) {
      const first = errors.title
        ? "subject-create-title"
        : errors.description
          ? "subject-create-description"
          : "subject-create-classroom-search";
      document.getElementById(first)?.focus();
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        educationYear: year,
        classId,
        schoolId,
      });
      // Browsers may block the sound; that must not look like a failure.
      sound?.play()?.catch(() => {});
      toast.current?.show({
        severity: "success",
        summary: subjectUiLanguage.created(lang),
        life: 3000,
      });
      onClose();
    } catch (error) {
      console.error(error);
      const result = error as ErrorMessages | undefined;
      Swal.fire({
        title: result?.error ? result.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode.toString()
          : "",
        icon: "error",
      });
    }
  };

  const noClassrooms = classrooms.data?.length === 0;

  return (
    <form
      noValidate
      onSubmit={handleCreateSubject}
      className="flex max-h-[min(90dvh,48rem)] w-[min(36rem,calc(100vw-2rem))] flex-col rounded-3xl bg-white font-Anuphan shadow-xl"
    >
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-5 sm:px-6">
        <h2 className="text-lg font-bold text-icon-color">
          {subjectsDataLanguage.create(lang)}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={classroomUiLanguage.close(lang)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color/70 transition-colors hover:bg-background-color"
        >
          <IoMdClose aria-hidden />
        </button>
      </header>

      <div className="flex min-h-0 flex-col gap-5 overflow-auto px-5 py-3 sm:px-6">
        <FormField
          id="subject-create-title"
          label={subjectUiLanguage.nameLabel(lang)}
          error={shown("title")}
        >
          <div className="flex items-center gap-3">
            {/* Live preview of the icon the subject card will show. */}
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-color/10 text-2xl"
            >
              {subjectEmoji(title)}
            </span>
            <input
              id="subject-create-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={subjectUiLanguage.namePlaceholder(lang)}
              aria-invalid={!!shown("title")}
              aria-describedby={describedBy("subject-create-title", shown("title"))}
              className={fieldInputClass(!!shown("title"))}
            />
          </div>
        </FormField>

        <FormField
          id="subject-create-description"
          label={subjectUiLanguage.descriptionLabel(lang)}
          error={shown("description")}
        >
          <textarea
            id="subject-create-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={subjectUiLanguage.descriptionPlaceholder(lang)}
            aria-invalid={!!shown("description")}
            aria-describedby={describedBy(
              "subject-create-description",
              shown("description"),
            )}
            className={`${fieldInputClass(!!shown("description"))} h-auto resize-y py-3 leading-relaxed`}
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-icon-color">
            {subjectsDataLanguage.educationYear(lang)}
          </span>
          <InputEducationYear
            required
            value={year}
            onChange={(value) => setYear(value as EducationYear)}
          />
        </div>

        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="text-sm font-medium text-icon-color">
            {subjectUiLanguage.pickClassroom(lang)}
          </legend>
          <p className="text-sm text-icon-color/60">
            {subjectUiLanguage.pickClassroomHint(lang)}
          </p>
          {noClassrooms ? (
            <div className="mt-1 flex flex-col items-start gap-2 rounded-2xl bg-warning-color/15 p-4 text-sm text-icon-color">
              {subjectsDataLanguage.create_class_first(lang)}
              <Link
                href={`/school/${schoolId}?menu=Classes`}
                className="font-semibold text-primary-color hover:underline"
              >
                {subjectUiLanguage.goToClasses(lang)}
              </Link>
            </div>
          ) : (
            <>
              <label className="relative mt-1">
                <span className="sr-only">{subjectUiLanguage.searchClassrooms(lang)}</span>
                <FiSearch
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-color/40"
                />
                <input
                  id="subject-create-classroom-search"
                  type="search"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder={subjectUiLanguage.searchClassrooms(lang)}
                  className={`${fieldInputClass(!!shown("classId"))} pl-11`}
                />
              </label>
              <div
                role="radiogroup"
                aria-label={subjectUiLanguage.pickClassroom(lang)}
                className="max-h-60 overflow-auto rounded-2xl bg-background-color p-2"
              >
                {classrooms.isLoading && (
                  <div className="h-12 animate-pulse rounded-xl bg-white" />
                )}
                {!classrooms.isLoading && groups.length === 0 && (
                  <p className="px-2 py-4 text-center text-sm text-icon-color/60">
                    {subjectUiLanguage.noClassroomMatch(lang, classSearch.trim())}
                  </p>
                )}
                {groups.map((group) => (
                  <div key={group.key} className="mb-2 last:mb-0">
                    <p className="px-2 pb-1 pt-1 text-xs font-semibold text-icon-color/50">
                      {group.key === NO_LEVEL_KEY
                        ? classroomUiLanguage.noLevel(lang)
                        : fullGradeLabel(group.key, lang)}
                    </p>
                    {group.items.map((classroom) => {
                      const selected = classroom.id === classId;
                      const { grade, room } = splitLevel(classroom.level);
                      return (
                        <button
                          key={classroom.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setClassId(classroom.id)}
                          className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/40 ${
                            selected
                              ? "bg-white ring-2 ring-primary-color"
                              : "bg-white/60 hover:bg-white"
                          }`}
                        >
                          <span className="shrink-0 rounded-lg bg-primary-color/10 px-1.5 py-0.5 text-xs font-bold text-primary-color">
                            {shortGradeLabel(grade, lang)}
                            {room ? `/${room}` : ""}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-icon-color">
                              {classroom.title}
                            </span>
                            {classroom.creator && (
                              <span className="block truncate text-xs text-icon-color/60">
                                {classroomUiLanguage.createdBy(
                                  lang,
                                  `${classroom.creator.firstName} ${classroom.creator.lastName}`,
                                )}
                              </span>
                            )}
                          </span>
                          {selected && (
                            <MdCheck aria-hidden className="shrink-0 text-lg text-primary-color" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              {shown("classId") && (
                <p role="alert" className="text-sm text-error-color">
                  {shown("classId")}
                </p>
              )}
            </>
          )}
        </fieldset>
      </div>

      <footer className="grid grid-cols-2 gap-2 border-t border-icon-color/10 px-5 py-4 sm:flex sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl border border-icon-color/15 px-5 font-semibold text-icon-color transition-colors hover:bg-background-color"
        >
          {classroomUiLanguage.cancel(lang)}
        </button>
        <button
          type="submit"
          disabled={create.isPending || noClassrooms}
          aria-busy={create.isPending}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {create.isPending ? (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          ) : (
            <FiPlus aria-hidden />
          )}
          {create.isPending
            ? subjectUiLanguage.creating(lang)
            : subjectsDataLanguage.create(lang)}
        </button>
      </footer>
    </form>
  );
}

export default SubjectCreate;
