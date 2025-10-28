import React from "react";
import {
  useGetStudentOnAssignments,
  useGetStudentOnSubject,
  useUpdateStudentOnAssignments,
} from "../../react-query";
import {
  ErrorMessages,
  FileOnStudentOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import { HiUsers } from "react-icons/hi";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import Swal from "sweetalert2";

function ClassStudentAssignWork({
  assignmentId,
  subjectId,
}: {
  assignmentId: string;
  subjectId: string;
}) {
  const studentOnAssignments = useGetStudentOnAssignments({
    assignmentId,
  });
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId,
  });
  const [assignAll, setAssignAll] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const update = useUpdateStudentOnAssignments();
  const [studentData, setStudentData] = React.useState<
    (StudentOnAssignment & { files: FileOnStudentOnAssignment[] })[]
  >([]);
  React.useEffect(() => {
    if (studentOnAssignments.data && studentOnSubjects.data) {
      setStudentData(() => {
        const data = studentOnAssignments.data
          .map((student) => {
            return {
              ...student,
            };
          })
          ?.filter(
            (studentOnAssignment) =>
              studentOnSubjects.data?.find(
                (s) => s.id === studentOnAssignment.studentOnSubjectId,
              )?.isActive,
          );

        const isAllAssigned = data.every((student) => student.isAssigned);
        setAssignAll(isAllAssigned);

        return data;
      });
    }
  }, [studentOnAssignments.status, studentOnSubjects.status]);

  const handleAssignAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setStudentData((prev) => {
        return prev.map((student) => {
          return {
            ...student,
            isAssigned: e.target.checked,
          };
        });
      });
      setAssignAll(e.target.checked);

      await Promise.allSettled(
        studentData.map((student) => {
          return update.mutateAsync({
            query: {
              studentOnAssignmentId: student.id,
            },
            body: {
              isAssigned: e.target.checked,
            },
          });
        }),
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
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
  return (
    <main className="mb-40 flex h-max w-full justify-center">
      <section
        className={`flex h-full w-8/12 flex-col gap-2 border bg-white p-5 transition-width`}
      >
        <div className="flex w-full items-center justify-between gap-2 text-xl"></div>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>
                <div className="text-start font-normal">Name</div>
              </th>
              <th>
                <div className="flex items-center justify-center gap-2 text-base font-normal">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full focus-within:bg-primary-color/50 hover:bg-primary-color/50 active:bg-primary-color/60">
                    <input
                      disabled={loading}
                      type="checkbox"
                      checked={assignAll}
                      onChange={handleAssignAll}
                      className="h-5 w-5 accent-primary-color"
                    />
                  </div>
                  <HiUsers />
                  Assign All
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {studentOnAssignments.isLoading ||
            loading ||
            studentOnSubjects.isLoading
              ? [...Array(20)].map((_, index) => {
                  const odd = index % 2 === 0;
                  return (
                    <tr
                      key={index}
                      className={` ${odd && "bg-gray-200/20"} gap-2`}
                    >
                      <th>
                        <div className="flex h-14 items-center gap-2">
                          <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1">
                            <div className="h-full w-full animate-pulse bg-gray-200"></div>
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="h-4 w-20 animate-pulse bg-gray-200"></div>
                            <div className="h-3 w-10 animate-pulse bg-gray-200"></div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="flex justify-center">
                          <div className="h-5 w-5 animate-pulse bg-gray-400"></div>
                        </div>
                      </th>
                    </tr>
                  );
                })
              : studentOnAssignments.data
                  ?.filter(
                    (studentOnAssignment) =>
                      studentOnSubjects.data?.find(
                        (s) => s.id === studentOnAssignment.studentOnSubjectId,
                      )?.isActive,
                  )
                  .sort((a, b) => Number(a.number) - Number(b.number))
                  .map((student, index) => {
                    const odd = index % 2 === 0;
                    return (
                      <StudentList
                        key={student.id}
                        student={student}
                        odd={odd}
                        setStudentData={setStudentData}
                      />
                    );
                  })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default ClassStudentAssignWork;
type StudentListProps = {
  student: StudentOnAssignment & { files: FileOnStudentOnAssignment[] };
  setStudentData: (
    value: React.SetStateAction<
      (StudentOnAssignment & { files: FileOnStudentOnAssignment[] })[]
    >,
  ) => void;
  odd: boolean;
};

const StudentList = React.memo(function StudentList({
  student,
  odd,
  setStudentData,
}: StudentListProps) {
  const update = useUpdateStudentOnAssignments();
  const handleChangeCheck = React.useCallback(
    async ({ studentId, checked }: { studentId: string; checked: boolean }) => {
      try {
        setStudentData((prev) => {
          return prev.map((student) => {
            if (student.id === studentId) {
              return {
                ...student,
                isAssigned: checked,
              };
            }
            return student;
          });
        });
        await update.mutateAsync({
          query: {
            studentOnAssignmentId: studentId,
          },
          body: {
            isAssigned: checked,
          },
        });
      } catch (error) {
        console.log(error);
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
    },
    [],
  );

  return (
    <tr className={` ${odd && "bg-gray-200/20"} gap-2 hover:bg-sky-100`}>
      <th className="">
        <div className="flex h-14 items-center gap-2 pl-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-sm font-semibold">
              {student.firstName} {student.lastName}{" "}
            </h1>
            <p className="text-xs text-gray-500">
              Number {student.number} {!student.isAssigned && "(NOT Assigned)"}
            </p>
          </div>
        </div>
      </th>
      <th className="">
        <div className="flex justify-center">
          <input
            disabled={update.isPending}
            checked={student.isAssigned}
            onChange={(e) =>
              handleChangeCheck({
                studentId: student.id,
                checked: e.target.checked,
              })
            }
            type="checkbox"
            className="h-5 w-5 accent-primary-color"
          />
        </div>
      </th>
    </tr>
  );
});
