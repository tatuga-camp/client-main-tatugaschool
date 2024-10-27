import React, {
  memo,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGetScoreOnStudent, getStudentOnSubject } from "../../react-query";
import StudentCard from "./StudentCard";
import { ScoreOnStudent, StudentOnSubject } from "../../interfaces";
import { Nullable } from "primereact/ts-helpers";
import { CgClose } from "react-icons/cg";
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
import { SortStudentOnSubjectService } from "../../services";
import { useQueryClient } from "@tanstack/react-query";
import Filter, { FilterTitle } from "../common/Filter";
import Calendar from "../common/Calendar";

type Props = {
  subjectId: string;
  setSelectStudent: React.Dispatch<
    React.SetStateAction<StudentOnSubject | undefined>
  >;
};
function Subject({ subjectId, setSelectStudent }: Props) {
  const queryClient = useQueryClient();
  const studentOnSubjects = getStudentOnSubject({
    subjectId: subjectId,
  });
  const [selectFilter, setSelectFilter] = useState<{
    title: FilterTitle;
    orderBy: "asc" | "desc";
  }>();

  const [activeFilter, setActiveFilter] = useState(false);
  const [students, setStudents] = useState<StudentOnSubject[]>([]);
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);
  const scoreOnStudents = useGetScoreOnStudent({
    subjectId: subjectId,
  });
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    let newSort: StudentOnSubject[] = [];
    if (active.id !== over?.id) {
      setStudents((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort;
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
      setStudents(studentOnSubjects.data);
    }
  }, [studentOnSubjects.data]);

  //reRender when filter change
  useEffect(() => {
    if (selectFilter?.title === "Sort by Score") {
      setStudents((prev) => {
        return prev.sort((a, b) => {
          if (selectFilter.orderBy === "desc") {
            return a.totalSpeicalScore - b.totalSpeicalScore;
          } else {
            return b.totalSpeicalScore - a.totalSpeicalScore;
          }
        });
      });
    } else if (selectFilter?.title === "Sort by Name") {
      setStudents((prev) => {
        return prev.sort((a, b) => {
          if (selectFilter.orderBy === "desc") {
            return a.firstName.localeCompare(b.firstName);
          } else {
            return b.firstName.localeCompare(a.firstName);
          }
        });
      });
    } else if (selectFilter?.title === "Sort By Number") {
      setStudents((prev) => {
        return prev.sort((a, b) => {
          if (selectFilter.orderBy === "desc") {
            return a.number.localeCompare(b.number);
          } else {
            return b.number.localeCompare(a.number);
          }
        });
      });
    } else {
      setStudents((prev) => {
        return prev.sort((a, b) => {
          return a.order - b.order;
        });
      });
    }
  }, [selectFilter]);

  useEffect(() => {
    if (dates?.[0] && dates?.[1] && scoreOnStudents.data) {
      const startDate = dates?.[0];
      const endDate = dates?.[1];
      endDate.setHours(24, 0, 0, 0);

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
  return (
    <div className="flex flex-col items-center w-full gap-5">
      <header className="w-9/12 h-16 flex justify-end items-end gap-1 border-b pb-5">
        <div className="w-60 h-16">
          <Calendar onValue={(value) => setDates(value)} value={dates} />
        </div>
        <Filter onValue={(event) => setSelectFilter(event)} />
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={students} strategy={rectSortingStrategy}>
          <section className="w-9/12  grid grid-cols-5 gap-5">
            {studentOnSubjects.isLoading
              ? [...Array(12)].map((_, index) => {
                  return (
                    <div
                      key={index}
                      className="w-48 h-52 bg-gray-200 rounded-2xl animate-pulse"
                    ></div>
                  );
                })
              : students.map((student, index) => (
                  <StudentCard
                    isDragable={!!selectFilter}
                    setSelectStudent={setSelectStudent}
                    key={student.id}
                    student={student}
                  />
                ))}
          </section>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default memo(Subject);
