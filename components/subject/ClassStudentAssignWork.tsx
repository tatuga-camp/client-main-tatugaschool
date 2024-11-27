import React from "react";
import {
  useGetStudentOnAssignments,
  useGetStudentOnSubject,
  useUpdateStudentOnAssignments,
} from "../../react-query";
import {
  FileOnStudentOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import { HiUsers } from "react-icons/hi";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

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
                (s) => s.id === studentOnAssignment.studentOnSubjectId
              )?.isActive
          );

        const isAllAssigned = data.every((student) => student.isAssigned);
        setAssignAll(isAllAssigned);

        return data;
      });
    }
  }, [studentOnAssignments.status, studentOnSubjects.status]);

  const handleAssignAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      })
    );
    setLoading(false);
  };
  return (
    <main className="w-full h-max mb-40 flex justify-center ">
      <section
        className={` w-8/12 transition-width p-5 
   flex flex-col gap-2 bg-white  h-full border`}
      >
        <div className="text-xl w-full justify-between flex gap-2 items-center "></div>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>
                <div className="text-start font-normal ">Name</div>
              </th>
              <th>
                <div className="text-base font-normal flex gap-2 items-center justify-center ">
                  <div className="w-8 h-8 flex items-center justify-center active:bg-primary-color/60 hover:bg-primary-color/50  focus-within:bg-primary-color/50 rounded-full">
                    <input
                      disabled={loading}
                      type="checkbox"
                      checked={assignAll}
                      onChange={handleAssignAll}
                      className="w-5 h-5 accent-primary-color  "
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
                        <div className="flex gap-2 h-14 items-center">
                          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                          </div>
                          <div className="flex flex-col  items-start">
                            <div className="w-20 h-4 bg-gray-200 animate-pulse"></div>
                            <div className="w-10 h-3 bg-gray-200 animate-pulse"></div>
                          </div>
                        </div>
                      </th>
                      <th>
                        <div className="flex  justify-center">
                          <div className="w-5 h-5 bg-gray-400 animate-pulse"></div>
                        </div>
                      </th>
                    </tr>
                  );
                })
              : studentOnAssignments.data
                  ?.filter(
                    (studentOnAssignment) =>
                      studentOnSubjects.data?.find(
                        (s) => s.id === studentOnAssignment.studentOnSubjectId
                      )?.isActive
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
    >
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
    },
    []
  );

  return (
    <tr className={` ${odd && "bg-gray-200/20"} hover:bg-sky-100  gap-2`}>
      <th className="">
        <div className="flex gap-2 pl-2 h-14 items-center">
          <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
            <Image
              src={student.photo}
              alt={student.firstName}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash
              )}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col  items-start">
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
            className="w-5 h-5 accent-primary-color"
          />
        </div>
      </th>
    </tr>
  );
});
