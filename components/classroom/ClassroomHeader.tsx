import { FiSettings } from "react-icons/fi";
import { MenuClassroom } from "../../data";
import { classroomUiLanguage } from "../../data/languages";
import { Classroom, Language, Student } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import ClassLevelBadge from "./ClassLevelBadge";

const formatDate = (date: Date | string, language: Language) =>
  new Date(date).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

type Props = {
  classroom: Classroom & { students: Student[] };
  selectMenu: MenuClassroom;
  onSelectMenu: (menu: MenuClassroom) => void;
};

function ClassroomHeader({ classroom, selectMenu, onSelectMenu }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const tabs: { menu: MenuClassroom; label: string }[] = [
    { menu: "Classroom", label: classroomUiLanguage.tabStudents(lang) },
    { menu: "SubjectsClassroom", label: classroomUiLanguage.tabSubjects(lang) },
    { menu: "GradesSummary", label: classroomUiLanguage.tabGrades(lang) },
    { menu: "SettingClassroom", label: classroomUiLanguage.tabSettings(lang) },
  ];

  return (
    <header className="border-b border-icon-color/10 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex items-start gap-4">
          <ClassLevelBadge
            level={classroom.level}
            archived={classroom.isAchieved}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-words text-2xl font-bold leading-tight text-icon-color sm:text-3xl">
                {classroom.title}
              </h1>
              {classroom.isAchieved && (
                <span className="rounded-full bg-icon-color/10 px-2.5 py-0.5 text-xs font-semibold text-icon-color/70">
                  {classroomUiLanguage.archived(lang)}
                </span>
              )}
            </div>
            {classroom.description && (
              <p className="mt-1 max-w-2xl break-words text-icon-color/70">
                {classroom.description}
              </p>
            )}
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-icon-color/60">
              <span>
                {classroomUiLanguage.studentCount(lang, classroom.students.length)}
              </span>
              <span>
                {classroomUiLanguage.createdOn(lang, formatDate(classroom.createAt, lang))}
              </span>
              <span>
                {classroomUiLanguage.updatedOn(lang, formatDate(classroom.updateAt, lang))}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectMenu("SettingClassroom")}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20 sm:flex"
          >
            <FiSettings aria-hidden />
            {classroomUiLanguage.tabSettings(lang)}
          </button>
        </div>
        <nav
          aria-label={classroomUiLanguage.classroomSections(lang)}
          className="-mb-px mt-6 flex gap-1 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const selected = tab.menu === selectMenu;
            return (
              <button
                key={tab.menu}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => onSelectMenu(tab.menu)}
                className={`whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition-colors sm:px-4 ${
                  selected
                    ? "border-primary-color text-primary-color"
                    : "border-transparent text-icon-color/60 hover:text-icon-color"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default ClassroomHeader;
