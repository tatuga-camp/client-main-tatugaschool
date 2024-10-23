import React, { memo } from "react";
import { getStudentOnSubject } from "../../react-query";
import StudentCard from "./StudentCard";

type Props = {
  subjectId: string;
};
function Subject({ subjectId }: Props) {
  const studentOnSubjects = getStudentOnSubject({
    subjectId: subjectId,
  });

  return (
    <>
      <section className="w-9/12  grid grid-cols-5 gap-5">
        {studentOnSubjects.isLoading
          ? [...Array(12)].map((_, index) => {
              return (
                <div className="w-48 h-52 bg-gray-200 rounded-2xl animate-pulse"></div>
              );
            })
          : studentOnSubjects.data?.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
      </section>
    </>
  );
}

export default memo(Subject);
