import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { MdLock } from "react-icons/md";
import { defaultBlurHash } from "../../data";
import {
  classroomUiLanguage,
  classworkTransferLanguage as t,
  subjectsDataLanguage,
  subjectUiLanguage,
} from "../../data/languages";
import { EducationYear, Language } from "../../interfaces";
import {
  useGetMemberOnSchoolBySchool,
  useGetSubjectFromSchool,
  useGetUser,
} from "../../react-query";
import { ResponseGetSubjectBySchoolsService } from "../../services";
import { decodeBlurhashToCanvas, getDefaultSubjectFilter } from "../../utils";
import { shortGradeLabel, splitLevel } from "../../utils/classLevel";
import {
  filterSubjects,
  subjectEmoji,
  subjectTint,
} from "../../utils/subjectList";
import { fieldInputClass } from "../common/FormField";
import InputEducationYear from "../common/InputEducationYear";
import ListMemberCircle from "../member/ListMemberCircle";

export type PickerSubject = ResponseGetSubjectBySchoolsService[number];

// Stored filters from older versions use "show-all" for every teacher.
const ALL_TEACHERS = "show-all";

/** Year + teacher + search state for choosing subjects in a school. */
export function useSubjectPicker({
  schoolId,
  excludeSubjectId,
}: {
  schoolId: string;
  excludeSubjectId?: string;
}) {
  const user = useGetUser();
  const members = useGetMemberOnSchoolBySchool({ schoolId });
  const [educationYear, setEducationYear] = useState<EducationYear>();
  const [teacherId, setTeacherId] = useState<string>();
  const [search, setSearch] = useState("");
  const subjects = useGetSubjectFromSchool({
    schoolId,
    educationYear: educationYear as EducationYear,
  });

  // Start from the same year/teacher the Subjects page last used.
  useEffect(() => {
    const saved = getDefaultSubjectFilter({ schoolId });
    if (saved) {
      setEducationYear(saved.educationYear);
      setTeacherId(saved.userId);
    } else {
      setEducationYear(`1/${new Date().getFullYear()}` as EducationYear);
    }
  }, [schoolId]);

  // Default to "my subjects" once we know who is signed in.
  useEffect(() => {
    if (teacherId === undefined && user.data) setTeacherId(user.data.id);
  }, [teacherId, user.data]);

  const activeTeacher = teacherId ?? ALL_TEACHERS;
  const visible = useMemo(
    () =>
      filterSubjects(
        (subjects.data ?? []).filter((s) => s.id !== excludeSubjectId),
        {
          query: search,
          teacherId: activeTeacher === ALL_TEACHERS ? "all" : activeTeacher,
        },
      ),
    [subjects.data, excludeSubjectId, search, activeTeacher],
  );

  return {
    educationYear,
    setEducationYear,
    teacherId: activeTeacher,
    setTeacherId,
    showAllTeachers: () => setTeacherId(ALL_TEACHERS),
    isFilteredByTeacher: activeTeacher !== ALL_TEACHERS,
    search,
    setSearch,
    members: members.data ?? [],
    membersLoading: members.isLoading,
    visible,
    isLoading: subjects.isLoading || educationYear === undefined,
  };
}

type PickerState = ReturnType<typeof useSubjectPicker>;

export function SubjectPickerFilters({
  picker,
  lang,
}: {
  picker: PickerState;
  lang: Language;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_13rem] lg:items-end">
      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-icon-color sm:col-span-2 lg:col-span-1">
        {subjectsDataLanguage.search(lang)}
        <span className="relative">
          <FiSearch
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-color/40"
          />
          <input
            type="search"
            value={picker.search}
            onChange={(e) => picker.setSearch(e.target.value)}
            placeholder={subjectsDataLanguage.searchPlaceholder(lang)}
            className={`${fieldInputClass()} pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden`}
          />
          {picker.search && (
            <button
              type="button"
              onClick={() => picker.setSearch("")}
              aria-label={t.clearSearch(lang)}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-icon-color/40 hover:bg-background-color hover:text-icon-color"
            >
              <FiX aria-hidden />
            </button>
          )}
        </span>
      </label>
      {picker.educationYear && (
        <div className="flex flex-col gap-1.5 text-sm font-medium text-icon-color">
          {subjectsDataLanguage.educationYear(lang)}
          <InputEducationYear
            value={picker.educationYear}
            onChange={(value) => picker.setEducationYear(value as EducationYear)}
            required
          />
        </div>
      )}
      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-icon-color">
        {subjectUiLanguage.teacherFilter(lang)}
        <select
          value={picker.teacherId}
          disabled={picker.membersLoading}
          onChange={(e) => picker.setTeacherId(e.target.value)}
          className={`${fieldInputClass()} cursor-pointer`}
        >
          <option value={ALL_TEACHERS}>
            {classroomUiLanguage.allTeachers(lang)}
          </option>
          {picker.members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.firstName} {member.lastName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/** One subject as a compact, selectable row. */
export function SubjectPickRow({
  subject,
  lang,
  mode,
  selected = false,
  onClick,
}: {
  subject: PickerSubject;
  lang: Language;
  /** "check" toggles in a multi-select list; "open" drills into the subject. */
  mode: "check" | "open";
  selected?: boolean;
  onClick: () => void;
}) {
  const { grade, room } = splitLevel(subject.class.level);
  const levelLabel = `${shortGradeLabel(grade, lang)}${room ? `/${room}` : ""}`;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        {...(mode === "check" ? { "aria-pressed": selected } : {})}
        className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition sm:gap-4 ${
          selected
            ? "border-primary-color bg-primary-color/5 ring-2 ring-primary-color/15"
            : "border-gray-100 bg-white hover:border-primary-color/30 hover:bg-background-color"
        }`}
      >
        <span
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-14 sm:w-14 ${
            subject.backgroundImage
              ? "bg-background-color"
              : subjectTint(subject.id)
          }`}
        >
          {subject.backgroundImage ? (
            <Image
              src={subject.backgroundImage}
              fill
              sizes="56px"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                subject.blurHash ?? defaultBlurHash,
              )}
              alt=""
              className="object-cover"
            />
          ) : (
            <span aria-hidden className="text-2xl">
              {subjectEmoji(subject.title)}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-semibold text-icon-color group-hover:text-primary-color">
              {subject.title}
            </span>
            {subject.isLocked && (
              <MdLock
                aria-label={subjectUiLanguage.locked(lang)}
                className="shrink-0 text-icon-color/40"
              />
            )}
          </span>
          <span className="flex min-w-0 items-center gap-2 text-sm text-icon-color/60">
            <span className="shrink-0 rounded-lg bg-primary-color/10 px-1.5 py-0.5 text-xs font-bold text-primary-color">
              {levelLabel}
            </span>
            <span className="truncate">{subject.class.title}</span>
          </span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <ListMemberCircle members={subject.teachers} maxShow={3} />
        </span>
        {mode === "check" ? (
          <span
            aria-hidden
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-sm transition ${
              selected
                ? "border-primary-color bg-primary-color text-white"
                : "border-icon-color/20 bg-white text-transparent group-hover:border-primary-color/50"
            }`}
          >
            <FiCheck />
          </span>
        ) : (
          <FiChevronRight
            aria-hidden
            className="shrink-0 text-xl text-icon-color/30 transition group-hover:translate-x-0.5 group-hover:text-primary-color"
          />
        )}
      </button>
    </li>
  );
}

export function SubjectRowsSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-gray-100 p-2.5"
        >
          <span className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-gray-100" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            <span className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SubjectPickerEmpty({
  picker,
  lang,
}: {
  picker: PickerState;
  lang: Language;
}) {
  const query = picker.search.trim();
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-icon-color/15 px-6 py-10 text-center">
      <span aria-hidden className="text-3xl">
        📚
      </span>
      <p className="font-semibold text-icon-color">
        {query
          ? subjectUiLanguage.noMatch(lang, query)
          : t.noSubjects(lang, picker.educationYear ?? "")}
      </p>
      {!query && (
        <p className="max-w-sm text-sm text-icon-color/60">
          {t.noSubjectsBody(lang)}
        </p>
      )}
      {picker.isFilteredByTeacher && (
        <button
          type="button"
          onClick={picker.showAllTeachers}
          className="mt-1 rounded-full px-3 py-1.5 text-sm font-medium text-primary-color hover:bg-primary-color/10"
        >
          {t.showAllTeachers(lang)}
        </button>
      )}
    </div>
  );
}
