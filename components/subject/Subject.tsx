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
  useGetScoreOnSubject,
  useGetStudentOnSubject,
} from "../../react-query";
import { SortStudentOnSubjectService } from "../../services";
import Calendar from "../common/Calendar";
import Filter, { FilterTitle } from "../common/Filter";
import StudentCard from "../student/StudentCard";
import ScorePanel from "./ScorePanel";
import { BsPeople } from "react-icons/bs";
import ShowGroups from "./groupOnSubject/ShowGroups";

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
      await SortStudentOnSubjectService({
        studentOnSubjectIds: newSort.map((item) => item.id),
      });
      queryClient.setQueryData<StudentOnSubject[]>(
        ["studentOnSubjects", { subjectId }],
        newSort
      );
    }
  }, []);

  useEffect(() => {
    if (studentOnSubjects.data) {
      setStudents(studentOnSubjects.data.filter((item) => item.isActive));
    }
  }, [studentOnSubjects.isSuccess]);

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
            (score) => score.studentOnSubjectId === student.id
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
          })
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
    <div className="flex flex-col items-center w-full gap-5">
      <div
        className={`fixed ${
          triggerChooseScore ? "flex" : "hidden"
        } top-0 bottom-0 right-0 left-0 flex items-center justify-center m-auto z-40`}
      >
        <div ref={chooseScoreRef} className="bg-white p-2 rounded-md border">
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
        <footer
          className="top-0 bottom-0 w-screen h-screen right-0 left-0 
          bg-white/50 backdrop-blur fixed  m-auto -z-10"
        ></footer>
      </div>
      <header className="w-full md:w-10/12 lg:w-9/12 h-16 hidden md:flex justify-end items-end gap-5 border-b pb-5">
        <button
          onClick={() => setTriggerShowGroup((prev) => !prev)}
          className="border-primary-color border hover:bg-primary-color hover:text-white active:scale-105  transition duration-200 text-primary-color
         w-40 flex items-center justify-center gap-2 rounded-md h-12 "
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
        <section
          className="w-80 md:w-10/12 lg:w-9/12 place-items-center 
      grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        >
          <div
            onClick={() => setTriggerSelectMultipleStudent((prev) => !prev)}
            onDragStart={(e) => e.preventDefault()}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 ring-4 ring-white gradient-bg select-none drop-shadow-md 
         hover:scale-105 flex items-center justify-center p-3
           rounded-full transition cursor-pointer active:scale-110"
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
                        className="w-24 h-32 sm:w-32 sm:h-40 md:w-36 md:h-48 lg:w-48 
                      lg:h-52 bg-gray-200 rounded-2xl animate-pulse"
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
        className={`flex justify-center  items-center ease-in-out gap-3 fixed bottom-20 
       right-0 left-0 m-auto z-30 w-max transition-transform ${
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
              : "border-gray-200 bg-white text-primary-color "
          }
         border-primary-color rounded-md px-2 w-28 md:w-36 drop-shadow-md h-8 gap-2 flex items-center justify-between`}
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
          className="main-button w-28 md:w-36 px-2 h-8 flex items-center justify-center "
        >
          Choose Score
        </button>
      </footer>
    </div>
  );
}

export default memo(Subject);
