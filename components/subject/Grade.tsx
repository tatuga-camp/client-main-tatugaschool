import { ExportAssignmentService } from "@/services";
import { Toast } from "primereact/toast";
import React, { useState } from "react";
import { FaTable } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdLeaderboard } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import { TbColumns3, TbLayoutColumns } from "react-icons/tb";
import { gradeData, gradeTableData } from "../../data/languages";
import {
  Assignment,
  ErrorMessages,
  ScoreOnSubject,
  StudentOnAssignment,
  StudentOnSubject,
} from "../../interfaces";
import {
  useGetAssignmentOverview,
  useGetLanguage,
  useGetStudentOnSubject,
} from "../../react-query";
import {
  assignmentMax,
  buildGradeColumns,
  calculateStudentTotals,
  downloadDataUri,
  getRandomSlateShade,
  getSlateColorStyle,
  GradeViewMode,
} from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import GradeLeaderboard from "./GradeLeaderboard";
import GradePopup from "./GradePopup";
import GradeSetting from "./GradeSetting";
import GradeSettingScoreOnSubject from "./GradeSettingScoreOnSubject";
import GradeSpecialScoreSetting from "./GradeSpecialScoreSetting";
import GradeSegmentedControl, {
  SECONDARY_BUTTON,
} from "./grade/GradeSegmentedControl";
import GradeTable from "./grade/GradeTable";

// Per-viewer UI preferences; storage can be unavailable (private mode) —
// fall back silently.
function readPref<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function Grade({
  subjectId,
  toast,
}: {
  subjectId: string;
  toast: React.RefObject<Toast>;
}) {
  const [loading, setLoading] = React.useState(false);
  const assignmentsOverview = useGetAssignmentOverview({
    subjectId,
  });
  const language = useGetLanguage();
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const [selectScoreOnSubject, setSelectScoreOnSubject] = useState<
    (ScoreOnSubject & { studentOnSubject?: StudentOnSubject }) | null
  >(null);

  const [triggerGradeSetting, setTriggerGradeSetting] = useState(false);
  const [view, setView] = useState<"table" | "leaderboard">("table");
  const lang = language.data ?? "en";
  const modeKey = `grade-view-mode:${subjectId}`;
  const collapsedKey = `grade-collapsed-tags:${subjectId}`;
  const [mode, setMode] = useState<GradeViewMode>("assignment");
  const [collapsedTags, setCollapsedTags] = useState<string[]>([]);

  // Read after mount so SSR and the first client render agree.
  React.useEffect(() => {
    setMode(readPref<GradeViewMode>(modeKey, "assignment"));
    setCollapsedTags(readPref<string[]>(collapsedKey, []));
  }, [modeKey, collapsedKey]);

  const changeMode = (next: GradeViewMode) => {
    setMode(next);
    writePref(modeKey, next);
  };

  const toggleGroup = (tag: string) => {
    setCollapsedTags((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      writePref(collapsedKey, next);
      return next;
    });
  };

  const { segments, columns } = React.useMemo(
    () =>
      assignmentsOverview.data
        ? buildGradeColumns(assignmentsOverview.data, mode, collapsedTags)
        : { segments: [], columns: [] },
    [assignmentsOverview.data, mode, collapsedTags],
  );

  const activeStudents = React.useMemo(
    () =>
      (studentOnSubjects.data ?? [])
        .filter((s) => s.isActive)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [studentOnSubjects.data],
  );
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await ExportAssignmentService({ subjectId });
      downloadDataUri(response, "assignment-scores.xlsx");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      let result = error as ErrorMessages;

      console.error("Failed to download the file", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: result.message,
        life: 3000,
      });
    }
  };
  const [selectStudentOnAssignment, setSelectStudentOnAssignment] =
    React.useState<{
      assignment: Assignment;
      studentOnAssignment?: StudentOnAssignment;
    } | null>(null);

  const total_score = React.useMemo(() => {
    if (!assignmentsOverview.data) return 0;

    // Calculate total from regular assignments
    const assignmentTotal = assignmentsOverview.data.assignments.reduce(
      (acc, item) => {
        // Prefer weight if it exists, otherwise use maxScore
        return acc + assignmentMax(item.assignment);
      },
      0,
    );

    // Calculate total from special scores
    const specialScoresTotal = assignmentsOverview.data.scoreOnSubjects.reduce(
      (acc, item) => {
        // Prefer weight if it exists, otherwise use maxScore
        return acc + (item.scoreOnSubject.weight ?? 0);
      },
      0,
    );

    return assignmentTotal + specialScoresTotal;
  }, [assignmentsOverview.data]); // Recalculate only when data changes

  const studentTotals = React.useMemo(() => {
    if (!assignmentsOverview.data || !studentOnSubjects.data) return [];
    return calculateStudentTotals(
      assignmentsOverview.data,
      studentOnSubjects.data,
    );
  }, [assignmentsOverview.data, studentOnSubjects.data]);

  const totalsByStudentId = React.useMemo(
    () => new Map(studentTotals.map((t) => [t.student.id, t])),
    [studentTotals],
  );
  return (
    <>
      {selectStudentOnAssignment && (
        <PopupLayout
          onClose={() => {
            setSelectStudentOnAssignment(null);
          }}
        >
          {selectStudentOnAssignment && (
            <GradePopup
              studentOnAssignment={
                selectStudentOnAssignment.studentOnAssignment
              }
              assignment={selectStudentOnAssignment.assignment}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectStudentOnAssignment(null);
              }}
            />
          )}
        </PopupLayout>
      )}

      {triggerGradeSetting && assignmentsOverview.data && (
        <PopupLayout onClose={() => setTriggerGradeSetting(false)}>
          <GradeSetting
            toast={toast}
            subjectId={subjectId}
            grade={assignmentsOverview.data?.grade}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerGradeSetting(false);
            }}
          />
        </PopupLayout>
      )}

      {selectScoreOnSubject && (
        <PopupLayout
          onClose={() => {
            setSelectScoreOnSubject(null);
          }}
        >
          {selectScoreOnSubject.studentOnSubject ? (
            <GradeSpecialScoreSetting
              scoreOnSubject={selectScoreOnSubject}
              studentSubject={selectScoreOnSubject.studentOnSubject}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectScoreOnSubject(null);
              }}
              toast={toast}
            />
          ) : (
            <GradeSettingScoreOnSubject
              scoreOnSubject={selectScoreOnSubject}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setSelectScoreOnSubject(null);
              }}
            />
          )}
        </PopupLayout>
      )}

      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:px-5 lg:max-w-screen-lg lg:flex-row lg:items-end 2xl:max-w-screen-2xl">
        <section className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold text-icon-color md:text-3xl">
            {gradeData.title(lang)}
          </h1>
          <span className="text-sm text-gray-400 md:text-base">
            {gradeData.description(lang)}
          </span>
        </section>
        <section className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <GradeSegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "table", label: gradeData.table(lang), icon: <FaTable /> },
              {
                value: "leaderboard",
                label: gradeData.leaderboard(lang),
                icon: <MdLeaderboard />,
              },
            ]}
          />
          {view === "table" && (
            <GradeSegmentedControl
              value={mode}
              onChange={changeMode}
              options={[
                {
                  value: "assignment",
                  label: gradeTableData.byAssignment(lang),
                  icon: <TbColumns3 />,
                },
                {
                  value: "tag",
                  label: gradeTableData.byTagGroup(lang),
                  icon: <TbLayoutColumns />,
                },
              ]}
            />
          )}
          <button
            type="button"
            onClick={() => setTriggerGradeSetting(true)}
            className={SECONDARY_BUTTON}
          >
            <IoMdSettings />
            {gradeData.setting(lang)}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleExportExcel}
            className={`${SECONDARY_BUTTON} min-w-28`}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SiMicrosoftexcel />
                Export
              </>
            )}
          </button>
        </section>
      </header>
      <main className="mx-auto mt-2 flex w-full flex-col items-center px-3 md:max-w-screen-md md:px-0 lg:max-w-screen-lg 2xl:max-w-screen-2xl">
        {view === "table" && (
          <GradeTable
            subjectId={subjectId}
            language={lang}
            segments={segments}
            columns={columns}
            students={activeStudents}
            totalsByStudentId={totalsByStudentId}
            totalMax={total_score}
            loading={assignmentsOverview.isLoading || studentOnSubjects.isLoading}
            onToggleGroup={toggleGroup}
            onOpenAssignment={(assignment, studentOnAssignment) =>
              setSelectStudentOnAssignment({ assignment, studentOnAssignment })
            }
            onOpenSpecial={(scoreOnSubject, student) =>
              setSelectScoreOnSubject(
                student
                  ? { ...scoreOnSubject, studentOnSubject: student }
                  : scoreOnSubject,
              )
            }
          />
        )}
        {view === "leaderboard" &&
          (assignmentsOverview.isLoading || studentOnSubjects.isLoading ? (
            <div className="mt-5 flex w-full flex-col gap-2">
              {[...Array(8)].map((_, index) => {
                const number = getRandomSlateShade();
                const color = getSlateColorStyle(number);
                return (
                  <div
                    key={index}
                    style={color}
                    className="h-12 w-full animate-pulse rounded-2xl"
                  />
                );
              })}
            </div>
          ) : (
            <GradeLeaderboard studentTotals={studentTotals} />
          ))}
      </main>
    </>
  );
}

export default Grade;
