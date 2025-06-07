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
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Toast } from "primereact/toast";
import { Nullable } from "primereact/ts-helpers";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { BiSelectMultiple, BiSolidSelectMultiple } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import useClickOutside from "../../hook/useClickOutside";
import {
  ErrorMessages,
  ScoreOnSubject,
  StudentOnSubject,
} from "../../interfaces";
import {
  useCreateScoreOnStudent,
  useGetScoreOnStudent,
  useGetStudentOnSubject,
  useReorderStudentOnSubject,
} from "../../react-query";
import { SortStudentOnSubjectService } from "../../services";
import Calendar from "../common/Calendar";
import Filter, { FilterTitle } from "../common/Filter";
import StudentCard from "../student/StudentCard";
import ShowGroups from "./groupOnSubject/ShowGroups";
import ScorePanel from "./ScorePanel";

type Props = {
  subjectId: string;
  setSelectStudent: React.Dispatch<
    React.SetStateAction<StudentOnSubject | null>
  >;
  toast: React.RefObject<Toast>;
};
function Subject({ subjectId, setSelectStudent, toast }: Props) {
  const queryClient = useQueryClient();
  const successSound = useSound("/sounds/ding.mp3");
  const failSound = useSound("/sounds/fail.mp3");
  const [triggerShowGroup, setTriggerShowGroup] = useState<boolean>(false);
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const createStudentScore = useCreateScoreOnStudent();
  const [selectScore, setSelectScore] = React.useState<
    { score?: ScoreOnSubject } & { inputScore: number }
  >({
    inputScore: 0,
  });
  const studentReorder = useReorderStudentOnSubject(subjectId);
  const [triggerChooseScore, setTriggerChooseScore] = useState<boolean>(false);
  const chooseScoreRef = useRef<HTMLDivElement>(null);

  const [selectFilter, setSelectFilter] = useState<{
    title: FilterTitle;
    orderBy: "asc" | "desc";
  }>();

  const [students, setStudents] = useState<
    (StudentOnSubject & { select?: boolean })[]
  >([]);

  const [triggerSelectMultipleStudent, setTriggerSelectMultipleStudent] =
    useState<boolean>(false);

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);
  const scoreOnStudents = useGetScoreOnStudent({
    subjectId: subjectId,
  });
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    try {
      const { active, over } = event;
      let newSort: StudentOnSubject[] = [];
      if (!over) {
        return;
      }
      if (active.id !== over?.id) {
        setStudents((prevs) => {
          const oldIndex = prevs.findIndex((item) => item.id === active.id);
          const newIndex = prevs.findIndex((item) => item.id === over!.id);
          newSort = arrayMove(prevs, oldIndex, newIndex);

          return newSort.map((s, index) => {
            return {
              ...s,
              order: index,
            };
          });
        });
        if (newSort.length > 0) {
          await studentReorder.mutateAsync({
            studentOnSubjectIds: newSort.map((item) => item.id),
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (studentOnSubjects.data) {
      setStudents(studentOnSubjects.data.filter((item) => item.isActive));
    }
  }, [studentOnSubjects.data]);

  // sort by date
  useEffect(() => {
    if (dates?.[0] && dates?.[1] && scoreOnStudents.data) {
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[1]);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      setStudents((prev) => {
        return prev.map((student) => {
          const scores = scoreOnStudents.data.filter((score) => {
            const createdAt = new Date(score.createAt);
            return (
              score.studentOnSubjectId === student.id &&
              createdAt.getTime() >= startDate.getTime() &&
              createdAt.getTime() <= endDate.getTime()
            );
          });
          const totalScore = scores.reduce((acc, score) => {
            return acc + score.score;
          }, 0);
          return {
            ...student,
            totalSpeicalScore: totalScore,
          };
        });
      });
    } else if (!dates?.[0] && !dates?.[1] && scoreOnStudents.data) {
      setStudents((prev) => {
        return prev.map((student) => {
          const scores = scoreOnStudents.data.filter(
            (score) => score.studentOnSubjectId === student.id,
          );

          const totalScore = scores.reduce((acc, score) => {
            return acc + score.score;
          }, 0);
          return {
            ...student,
            totalSpeicalScore: totalScore,
          };
        });
      });
    }
  }, [dates, scoreOnStudents.data]);

  useClickOutside(chooseScoreRef, () => {
    setTriggerChooseScore(false);
  });

  const handleCreateMultipleScore = async () => {
    try {
      const filterSelectStudent = students.filter((item) => item.select);
      if (!selectScore.score?.id) {
        throw new Error("Please Choose Score");
      }
      if (filterSelectStudent.length > 0) {
        await Promise.allSettled(
          filterSelectStudent.map((student) => {
            return createStudentScore.mutateAsync({
              studentOnSubjectId: student.id,
              scoreOnSubjectId: selectScore.score?.id as string,
              score: selectScore.inputScore,
            });
          }),
        );
        if (selectScore.inputScore >= 0) {
          successSound?.play();
        } else {
          failSound?.play();
        }
        showSuccess();
        setTriggerSelectMultipleStudent(false);
        setTriggerChooseScore(false);
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

  const showSuccess = () => {
    toast.current?.show({
      severity: selectScore?.inputScore > 0 ? "success" : "error",
      summary: `${selectScore?.score?.title}`,
      detail: `Give a score ${(selectScore?.inputScore ?? 0) > 0 && "+"} ${
        selectScore?.inputScore
      }`,
      life: 3000,
    });
  };
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className={`fixed ${
          triggerChooseScore ? "flex" : "hidden"
        } bottom-0 left-0 right-0 top-0 z-40 m-auto flex items-center justify-center`}
      >
        <div ref={chooseScoreRef} className="rounded-md border bg-white p-2">
          <ScorePanel
            subjectId={subjectId}
            onSelectScore={({ score, inputScore }) => {
              setSelectScore({ score, inputScore });
            }}
            selectScore={{
              score: selectScore.score,
              inputScore: selectScore.inputScore,
            }}
            isLoading={createStudentScore.isPending}
            onCreateScore={() => handleCreateMultipleScore()}
          />
        </div>
        <footer className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-white/50 backdrop-blur"></footer>
      </div>
      <header className="hidden h-16 w-full items-end justify-end gap-5 border-b pb-5 md:flex md:w-10/12 lg:w-9/12">
        <button
          onClick={() => setTriggerShowGroup((prev) => !prev)}
          className="flex h-12 w-40 items-center justify-center gap-2 rounded-md border border-primary-color text-primary-color transition duration-200 hover:bg-primary-color hover:text-white active:scale-105"
        >
          <BsPeople className="" />
          <span className="">
            {triggerShowGroup ? "Close Groups" : "Show Groups"}
          </span>
        </button>
        <div className="h-16">
          <Calendar onValue={(value) => setDates(value)} value={dates} />
        </div>
        <Filter
          onValue={(event) => {
            if (event?.title === "Sort by Score") {
              setStudents((prev) => {
                return prev.sort((a, b) => {
                  if (event.orderBy === "desc") {
                    return b.totalSpeicalScore - a.totalSpeicalScore;
                  } else {
                    return a.totalSpeicalScore - b.totalSpeicalScore;
                  }
                });
              });
            } else if (event?.title === "Sort by Name") {
              setStudents((prev) => {
                return prev.sort((a, b) => {
                  if (event.orderBy === "desc") {
                    return b.firstName.localeCompare(a.firstName);
                  } else {
                    return a.firstName.localeCompare(b.firstName);
                  }
                });
              });
            } else if (event?.title === "Sort By Number") {
              setStudents((prev) => {
                return prev.sort((a, b) => {
                  if (event.orderBy === "desc") {
                    return Number(b.number) - Number(a.number);
                  } else {
                    return Number(a.number) - Number(b.number);
                  }
                });
              });
            } else if (!event) {
              setStudents((prev) => {
                return prev.sort((a, b) => {
                  return a.order - b.order;
                });
              });
            }
            setSelectFilter(event);
          }}
        />
      </header>
      {triggerShowGroup ? (
        <ShowGroups subjectId={subjectId} />
      ) : (
        <section className="grid w-80 grid-cols-2 place-items-center gap-5 sm:grid-cols-3 md:w-10/12 md:grid-cols-4 lg:w-9/12 xl:grid-cols-5">
          <div
            onClick={() => setTriggerSelectMultipleStudent((prev) => !prev)}
            onDragStart={(e) => e.preventDefault()}
            className="gradient-bg flex h-24 w-24 cursor-pointer select-none items-center justify-center rounded-full p-3 ring-4 ring-white drop-shadow-md transition hover:scale-105 active:scale-110 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40"
          >
            <Image
              src="/svg/trophy.svg"
              height={100}
              width={100}
              alt="trophy"
            />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={students} strategy={rectSortingStrategy}>
              {studentOnSubjects.isLoading
                ? [...Array(12)].map((_, index) => {
                    return (
                      <div
                        key={index}
                        className="h-32 w-24 animate-pulse rounded-2xl bg-gray-200 sm:h-40 sm:w-32 md:h-48 md:w-36 lg:h-52 lg:w-48"
                      ></div>
                    );
                  })
                : students.map((student, index) => (
                    <StudentCard
                      showSelect={triggerSelectMultipleStudent}
                      isDragable={
                        selectFilter
                          ? false
                          : triggerSelectMultipleStudent
                            ? false
                            : studentReorder.isPending
                              ? false
                              : true
                      }
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
      )}

      <footer
        className={`fixed bottom-20 left-0 right-0 z-30 m-auto flex w-max items-center justify-center gap-3 transition-transform ease-in-out ${
          triggerSelectMultipleStudent ? "translate-y-0" : "translate-y-40"
        } h-10`}
      >
        <button
          onClick={() => {
            setStudents((prev) => {
              if (prev.every((item) => item.select)) {
                return prev.map((item) => {
                  return { ...item, select: false };
                });
              } else {
                return prev.map((item) => {
                  return { ...item, select: true };
                });
              }
            });
          }}
          className={`border-2 ${
            students.every((item) => item.select)
              ? "border-primary-color bg-primary-color text-white"
              : "border-gray-200 bg-white text-primary-color"
          } flex h-8 w-28 items-center justify-between gap-2 rounded-md border-primary-color px-2 drop-shadow-md md:w-36`}
        >
          {students.every((item) => item.select) ? (
            <>
              <BiSolidSelectMultiple />
              Unselect All
            </>
          ) : (
            <>
              <BiSelectMultiple />
              Select All
            </>
          )}
        </button>
        <button
          onClick={() => {
            setTriggerChooseScore((prev) => !prev);
          }}
          className="main-button flex h-8 w-28 items-center justify-center px-2 md:w-36"
        >
          Choose Score
        </button>
      </footer>
    </div>
  );
}

export default memo(Subject);
