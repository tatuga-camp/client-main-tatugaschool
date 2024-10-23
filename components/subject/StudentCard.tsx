import React, { memo } from "react";
import { ScoreOnStudent, StudentOnSubject } from "../../interfaces";
import Image from "next/image";

type Props = {
  student: StudentOnSubject & {
    scores: ScoreOnStudent[];
    totalScore: number;
  };
};
function StudentCard({ student }: Props) {
  return (
    <button
      className="w-48 p-3 group flex flex-col items-center justify-center
     gap-2 h-52 rounded-xl relative hover:drop-shadow-md active:scale-105  overflow-hidden hover:bg-primary-color transition bg-white"
    >
      <div
        className="min-w-10 w-max  max-w-20 h-12  absolute left-0 right-0 -top-3 
      m-auto bg-primary-color group-hover:bg-white  rounded-2xl flex items-center justify-center text-white"
      >
        <span className="max-w-14 truncate w-max group-hover:text-primary-color ">
          {student.totalScore}
        </span>
      </div>
      <div className="w-20 h-20 relative rounded-full overflow-hidden">
        <Image
          fill
          src="/favicon.ico"
          alt="Student"
          className="object-cover w-full h-full"
        />
      </div>
      <h2 className="text-sm group-hover:text-white w-11/12 truncate text-center font-semibold text-gray-800">
        {student.firstName} {student.lastName}
      </h2>
      <span className="text-xs group-hover:text-white text-gray-500">
        Number {student.number}
      </span>
    </button>
  );
}

export default memo(StudentCard);
