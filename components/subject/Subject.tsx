import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { Toast } from "primereact/toast";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { BsPeople } from "react-icons/bs";
import { IoClose, IoStar, IoTrophy } from "react-icons/io5";
import { MdChecklist } from "react-icons/md";
import { TbUsers } from "react-icons/tb";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import {
  ErrorMessages,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import { studentPointsLanguage } from "../../data/languages";
import {
  useCreateScoreOnStudent,
  useGetLanguage,
  useDeleteSortConfigOnSubject,
  useGetScoreOnStudent,
  useGetSortConfigOnSubject,
  useGetStudentOnSubject,
  useReorderStudentOnSubject,
  useUpdateSortConfigOnSubject,
} from "../../react-query";
import Filter, { FilterTitle } from "../common/Filter";
import PopupLayout from "../layout/PopupLayout";
import StudentCard from "../student/StudentCard";
import GradeSegmentedControl from "./grade/GradeSegmentedControl";
import PointsDateFilter, {
  DatePreset,
  DateRange,
  formatRange,
  presetLabel,
} from "./PointsDateFilter";
import ShowGroups from "./groupOnSubject/ShowGroups";
import ScorePanel from "./ScorePanel";
import SubjectNoStudentsNotification from "./SubjectNoStudentsNotification";

type Props = {
  subjectId: string;
  setSelectStudent: React.Dispatch<
    React.SetStateAction<StudentOnSubject | null>
  >;
  toast: React.RefObject<Toast>;
};
function Subject({ subjectId, setSelectStudent, toast }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const successSound = useSound("/sounds/ding.mp3");
  const failSound = useSound("/sounds/fail.mp3");
  const [triggerShowGroup, setTriggerShowGroup] = useState<boolean>(false);
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const sortConfig = useGetSortConfigOnSubject({
    subjectId: subjectId,
  });
  const updateSortConfig = useUpdateSortConfigOnSubject();
  const removeSortConfig = useDeleteSortConfigOnSubject();
  const createStudentScore = useCreateScoreOnStudent();
  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });
  const studentReorder = useReorderStudentOnSubject(subjectId);
  const [triggerChooseScore, setTriggerChooseScore] = useState<boolean>(false);

  const [selectFilter, setSelectFilter] = useState<{
    title: FilterTitle;
    orderBy: "asc" | "desc";
  }>();

  const [students, setStudents] = useState<
    (StudentOnSubject & { select?: boolean })[]
  >([]);

  const [triggerSelectMultipleStudent, setTriggerSelectMultipleStudent] =
    useState<boolean>(false);

  const [triggerNoStudents, setTriggerNoStudents] = useState<boolean>(false);
  const hasShownNoStudentsRef = useRef(false);

  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const scoreOnStudents = useGetScoreOnStudent({
    subjectId: subjectId,
  });
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // The saved sort only drives `selectFilter`; the visible order is derived
  // below, so nothing sorts the `students` state in place any more.
  useEffect(() => {
    if (!sortConfig.data) return;
    setSelectFilter(
      sortConfig.data.title === "default"
        ? undefined
        : (sortConfig.data as {
            title: FilterTitle;
            orderBy: "asc" | "desc";
          }),
    );
  }, [sortConfig.data]);

  // Dragging is only enabled without a sort, where the grid shows `order`.
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = [...students].sort((a, b) => a.order - b.order);
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newSort = arrayMove(ordered, oldIndex, newIndex).map((s, index) => ({
      ...s,
      order: index,
    }));
    setStudents(newSort);
    try {
      await studentReorder.mutateAsync({
        studentOnSubjectIds: newSort.map((item) => item.id),
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (studentOnSubjects.data) {
      const active = studentOnSubjects.data.filter((item) => item.isActive);
      setStudents(active);
      if (!hasShownNoStudentsRef.current && active.length === 0) {
        setTriggerNoStudents(true);
        hasShownNoStudentsRef.current = true;
      }
    }
  }, [studentOnSubjects.data]);

  // Points per student for the chosen period. Derived (not written into
  // `students`) so a background refetch can't silently swap them back to
  // all-time totals.
  const periodTotals = useMemo(() => {
    if (!scoreOnStudents.data) return null;
    const start = dateRange?.start.getTime() ?? -Infinity;
    const end = dateRange?.end.getTime() ?? Infinity;
    const totals = new Map<string, number>();
    scoreOnStudents.data.forEach((score) => {
      const at = new Date(score.createAt).getTime();
      if (at < start || at > end) return;
      totals.set(
        score.studentOnSubjectId,
        (totals.get(score.studentOnSubjectId) ?? 0) + score.score,
      );
    });
    return totals;
  }, [scoreOnStudents.data, dateRange]);

  const displayStudents = useMemo(() => {
    const withTotals = students.map((student) => ({
      ...student,
      totalSpeicalScore: periodTotals
        ? (periodTotals.get(student.id) ?? 0)
        : student.totalSpeicalScore,
    }));
    const dir = selectFilter?.orderBy === "desc" ? -1 : 1;
    return withTotals.sort((a, b) => {
      switch (selectFilter?.title) {
        case "Sort by Score":
          return dir * (a.totalSpeicalScore - b.totalSpeicalScore);
        case "Sort by Name":
          return dir * a.firstName.localeCompare(b.firstName);
        case "Sort By Number":
          return dir * (Number(a.number) - Number(b.number));
        default:
          return a.order - b.order;
      }
    });
  }, [students, periodTotals, selectFilter]);

  // "Who's on top" for the period banner.
  const periodLeaders = useMemo(() => {
    if (datePreset === "all" || displayStudents.length === 0) return null;
    const best = Math.max(...displayStudents.map((s) => s.totalSpeicalScore));
    if (best <= 0) return { best, leaders: [] };
    return {
      best,
      leaders: displayStudents.filter((s) => s.totalSpeicalScore === best),
    };
  }, [datePreset, displayStudents]);

  const changeSort = (
    value: { title: FilterTitle; orderBy: "asc" | "desc" } | undefined,
  ) => {
    setSelectFilter(value);
    if (value) {
      updateSortConfig.mutate({
        subjectId: subjectId,
        sort: {
          title: value.title,
          orderBy: value.orderBy,
        },
      });
    } else {
      removeSortConfig.mutate({ subjectId });
    }
  };

  const handleCreateMultipleScore = async (data: {
    score: ScoreOnSubject;
    inputScore: number;
  }) => {
    try {
      const filterSelectStudent = students.filter((item) => item.select);
      if (filterSelectStudent.length > 0) {
        await Promise.allSettled(
          filterSelectStudent.map((student) => {
            return createStudentScore.mutateAsync({
              studentOnSubjectId: student.id,
              scoreOnSubjectId: data.score.id,
              score: data.inputScore,
            });
          }),
        );
        if (data.inputScore >= 0) {
          successSound?.play();
        } else {
          failSound?.play();
        }
        showSuccess(data, filterSelectStudent.length);
        setTriggerSelectMultipleStudent(false);
        setTriggerChooseScore(false);
        setSelectScore(() => {
          return { inputScore: 0 };
        });
        setStudents((prev) => {
          return prev.map((item) => {
            return { ...item, select: false };
          });
        });
      }
    } catch (error) {
      console.log(error);
      setTriggerSelectMultipleStudent(false);
      setTriggerChooseScore(false);
      setSelectScore(() => {
        return { inputScore: 0, score: undefined };
      });
      setStudents((prev) => {
        return prev.map((item) => {
          return { ...item, select: false };
        });
      });
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

  const showSuccess = (
    data: { score: ScoreOnSubject; inputScore: number },
    count: number,
  ) => {
    toast.current?.show({
      severity: data.inputScore >= 0 ? "success" : "error",
      summary: data.score.title,
      detail: studentPointsLanguage.givenToast(data.inputScore, count)(lang),
      life: 3000,
    });
  };

  const selectedCount = students.filter((item) => item.select).length;
  const allSelected =
    students.length > 0 && students.every((item) => item.select);
  const isReorderable =
    !selectFilter && !triggerSelectMultipleStudent && !studentReorder.isPending;

  const setAllSelected = (select: boolean) => {
    setStudents((prev) => prev.map((item) => ({ ...item, select })));
  };

  const exitSelectMode = () => {
    setTriggerSelectMultipleStudent(false);
    setAllSelected(false);
  };

  return (
    <div className="flex w-full flex-col items-center font-Anuphan">
      {triggerNoStudents && (
        <PopupLayout
          onClose={() => {
            setTriggerNoStudents(false);
            document.body.style.overflow = "auto";
          }}
        >
          <SubjectNoStudentsNotification
            subjectId={subjectId}
            onClose={() => {
              setTriggerNoStudents(false);
              document.body.style.overflow = "auto";
            }}
          />
        </PopupLayout>
      )}
      {triggerChooseScore && (
        <PopupLayout
          onClose={() => {
            setTriggerChooseScore(false);
          }}
        >
          <div className="m-4 w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-xl">
            <ScorePanel
              subjectId={subjectId}
              subtitle={studentPointsLanguage.selected(selectedCount)(lang)}
              onSelectScore={({ score, inputScore }) => {
                setSelectScore({ score, inputScore });
              }}
              selectScore={{
                score: selectScore.score,
                inputScore: selectScore.inputScore,
              }}
              isLoading={createStudentScore.isPending}
              onCreateScore={(data) => {
                document.body.style.overflow = "auto";
                handleCreateMultipleScore(data);
              }}
            />
          </div>
        </PopupLayout>
      )}
      <footer className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-white/50 backdrop-blur"></footer>

      <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:px-5 lg:max-w-screen-lg lg:flex-row lg:items-end 2xl:max-w-screen-2xl">
        <section className="min-w-0 text-center lg:text-left">
          <h1 className="text-2xl font-semibold text-icon-color md:text-3xl">
            {triggerShowGroup
              ? studentPointsLanguage.groupsView(lang)
              : studentPointsLanguage.title(lang)}
          </h1>
          {!triggerShowGroup && (
            <span className="text-sm text-gray-400 md:text-base">
              {selectFilter
                ? studentPointsLanguage.descriptionSorted(lang)
                : studentPointsLanguage.description(lang)}
            </span>
          )}
        </section>
        <section className="flex flex-wrap items-center justify-center gap-2 lg:shrink-0 lg:flex-nowrap lg:justify-end">
          <GradeSegmentedControl
            value={triggerShowGroup ? "groups" : "students"}
            onChange={(value) => {
              exitSelectMode();
              setTriggerShowGroup(value === "groups");
            }}
            options={[
              {
                value: "students",
                label: studentPointsLanguage.studentsView(lang),
                icon: <BsPeople />,
              },
              {
                value: "groups",
                label: studentPointsLanguage.groupsView(lang),
                icon: <TbUsers />,
              },
            ]}
          />
          {!triggerShowGroup && (
            <>
              <PointsDateFilter
                lang={lang}
                preset={datePreset}
                range={dateRange}
                onChange={(preset, range) => {
                  setDatePreset(preset);
                  setDateRange(range);
                }}
              />
              <Filter lang={lang} value={selectFilter} onClick={changeSort} />
            </>
          )}
        </section>
      </header>

      <main className="mx-auto mt-2 flex w-full flex-col px-3 md:max-w-screen-md md:px-5 lg:max-w-screen-lg 2xl:max-w-screen-2xl">
        {triggerShowGroup ? (
          <ShowGroups subjectId={subjectId} />
        ) : !studentOnSubjects.isLoading && students.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
              <BsPeople />
            </span>
            <h2 className="text-base font-semibold text-icon-color">
              {studentPointsLanguage.noStudents(lang)}
            </h2>
            <p className="max-w-sm text-sm text-gray-500">
              {studentPointsLanguage.noStudentsHint(lang)}
            </p>
          </div>
        ) : (
          <>
            {datePreset !== "all" && dateRange && (
              <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-primary-color/20 bg-primary-color/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base text-warning-color ring-1 ring-primary-color/15">
                    <IoTrophy />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-icon-color">
                      {datePreset === "custom"
                        ? studentPointsLanguage.showingCustom(
                            formatRange(dateRange, lang),
                          )(lang)
                        : studentPointsLanguage.showingPeriod(
                            presetLabel(datePreset, lang),
                            formatRange(dateRange, lang),
                          )(lang)}
                    </p>
                    <p className="truncate text-xs text-gray-600">
                      {periodLeaders && periodLeaders.leaders.length > 0 ? (
                        <>
                          {studentPointsLanguage.topEarner(lang)}:{" "}
                          <span className="font-semibold text-icon-color">
                            {periodLeaders.leaders[0].firstName}{" "}
                            {periodLeaders.leaders[0].lastName}
                          </span>{" "}
                          <span className="font-semibold text-success-color">
                            +{periodLeaders.best}
                          </span>
                          {periodLeaders.leaders.length > 1 &&
                            ` ${studentPointsLanguage.tiedWith(
                              periodLeaders.leaders.length - 1,
                            )(lang)}`}
                        </>
                      ) : (
                        studentPointsLanguage.noPointsInPeriod(lang)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!(
                    selectFilter?.title === "Sort by Score" &&
                    selectFilter.orderBy === "desc"
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        changeSort({ title: "Sort by Score", orderBy: "desc" })
                      }
                      className="flex h-8 items-center rounded-xl bg-primary-color px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-color-hover"
                    >
                      {studentPointsLanguage.rankByPoints(lang)}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset("all");
                      setDateRange(null);
                    }}
                    className="flex h-8 items-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-icon-color transition-colors hover:bg-background-color"
                  >
                    {studentPointsLanguage.showAllTime(lang)}
                  </button>
                </div>
              </div>
            )}
            <section className="grid grid-cols-2 gap-3 pb-28 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7">
              <button
                type="button"
                aria-pressed={triggerSelectMultipleStudent}
                onClick={() =>
                  triggerSelectMultipleStudent
                    ? exitSelectMode()
                    : setTriggerSelectMultipleStudent(true)
                }
                className={`flex min-h-44 w-full select-none flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-3 py-4 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color active:scale-[0.98] ${
                  triggerSelectMultipleStudent
                    ? "border-primary-color bg-primary-color text-white"
                    : "border-primary-color/40 bg-primary-color/5 text-primary-color hover:bg-primary-color/10"
                }`}
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl sm:h-20 sm:w-20 ${
                    triggerSelectMultipleStudent
                      ? "bg-white/15"
                      : "bg-white ring-4 ring-primary-color/10"
                  }`}
                >
                  <MdChecklist />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {triggerSelectMultipleStudent
                      ? studentPointsLanguage.selecting(lang)
                      : studentPointsLanguage.selectSeveral(lang)}
                  </span>
                  {!triggerSelectMultipleStudent && (
                    <span className="mt-0.5 text-xs text-primary-color/70">
                      {studentPointsLanguage.selectSeveralHint(lang)}
                    </span>
                  )}
                </span>
              </button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayStudents}
                  strategy={rectSortingStrategy}
                >
                  {studentOnSubjects.isLoading
                    ? [...Array(11)].map((_, index) => {
                        return (
                          <div
                            key={index}
                            className="flex min-h-44 animate-pulse flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 pb-4 pt-5"
                          >
                            <div className="h-16 w-16 rounded-full bg-background-color sm:h-20 sm:w-20" />
                            <div className="h-3 w-3/4 rounded-full bg-background-color" />
                            <div className="h-3 w-1/3 rounded-full bg-background-color" />
                          </div>
                        );
                      })
                    : displayStudents.map((student) => (
                        <StudentCard
                          showSelect={triggerSelectMultipleStudent}
                          isDragable={isReorderable}
                          setSelectStudent={(data) => {
                            if (triggerSelectMultipleStudent) {
                              setStudents((prev) => {
                                return prev.map((item) => {
                                  if (item.id === data.id) {
                                    return { ...item, select: !item.select };
                                  }
                                  return item;
                                });
                              });
                            } else {
                              setSelectStudent(data as StudentOnSubject);
                            }
                          }}
                          key={student.id}
                          student={student}
                        />
                      ))}
                </SortableContext>
              </DndContext>
            </section>
          </>
        )}
      </main>

      <div
        aria-hidden={!triggerSelectMultipleStudent}
        className={`fixed bottom-24 left-0 right-0 z-30 mx-auto flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-0.5 whitespace-nowrap rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg transition-[transform,opacity] duration-200 ease-out sm:gap-1 ${
          triggerSelectMultipleStudent
            ? "translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-6 opacity-0"
        }`}
      >
        <span className="px-2 text-sm font-semibold tabular-nums text-icon-color sm:px-3">
          {studentPointsLanguage.selected(selectedCount)(lang)}
        </span>
        <button
          type="button"
          onClick={() => setAllSelected(!allSelected)}
          className="h-9 rounded-xl px-2 text-sm font-semibold text-primary-color transition-colors hover:bg-primary-color/10 sm:px-3"
        >
          {allSelected
            ? studentPointsLanguage.unselectAll(lang)
            : studentPointsLanguage.selectAll(lang)}
        </button>
        <button
          type="button"
          onClick={exitSelectMode}
          aria-label={studentPointsLanguage.cancel(lang)}
          className="flex h-9 items-center rounded-xl px-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-background-color sm:px-3"
        >
          <IoClose className="text-lg sm:hidden" />
          <span className="hidden sm:inline">
            {studentPointsLanguage.cancel(lang)}
          </span>
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={() => setTriggerChooseScore(true)}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-primary-color px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 sm:px-4"
        >
          <IoStar />
          {studentPointsLanguage.givePoints(lang)}
        </button>
      </div>
    </div>
  );
}

export default memo(Subject);
