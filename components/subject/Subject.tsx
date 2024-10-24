import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { getScoreOnStudent, getStudentOnSubject } from "../../react-query";
import StudentCard from "./StudentCard";
import { ScoreOnStudent, StudentOnSubject } from "../../interfaces";
import { Calendar } from "primereact/calendar";
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
  const [students, setStudents] = useState<StudentOnSubject[]>([]);
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);
  const scoreOnStudents = getScoreOnStudent({
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

  useEffect(() => {
    if (dates?.[0] && dates?.[1] && scoreOnStudents.data) {
      setStudents((prev) => {
        return prev.map((student) => {
          const startDate = new Date(dates[0] ?? "");
          const endDate = new Date(dates[1] ?? "");

          // Normalize to UTC to avoid timezone discrepancies
          const startDateUTC = Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate()
          );
          const endDateUTC = Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate()
          );

          const scores = scoreOnStudents.data.filter((score) => {
            const createdAt = new Date(score.createAt);
            const createdAtUTC = Date.UTC(
              createdAt.getUTCFullYear(),
              createdAt.getUTCMonth(),
              createdAt.getUTCDate()
            );

            return (
              score.studentOnSubjectId === student.id &&
              createdAtUTC >= startDateUTC &&
              createdAtUTC <= endDateUTC
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
      <header className="w-9/12 border-b pb-5">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Select Date</label>
          <div className="relative w-max">
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value)}
              selectionMode="range"
              readOnlyInput
              pt={{
                input: {
                  root: { className: "w-80" },
                },
              }}
              hideOnRangeSelection
              showIcon
            />
            <button
              onClick={() => setDates(null)}
              className="absolute right-16 z-20 top-0 bottom-0  flex 
            items-center justify-center  text-gray-600"
            >
              <CgClose />
            </button>
          </div>
        </div>
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
