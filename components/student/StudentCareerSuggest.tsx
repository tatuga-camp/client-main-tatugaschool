import React from "react";
import { useGetCareerSuggestion } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { MdError } from "react-icons/md";
import { careerSectors } from "../../data/career";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { SiGooglegemini } from "react-icons/si";

type Props = {
  studentId: string;
  onClose: () => void;
};
function StudentCareerSuggest({ studentId, onClose }: Props) {
  const careers = useGetCareerSuggestion({ studentId });

  const career = careerSectors.find(
    (c) => c.title === careers.data?.careers.title
  );

  console.log(career);
  if (careers.isLoading) {
    return (
      <div className="flex grow w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (careers.error?.message === "Data is not enough to give a suggestion") {
    return (
      <div
        className="w-full h-full grow p-2 bg-gradient-to-r from-rose-400 
      to-red-500 flex items-center justify-center flex-col "
      >
        <MdError className="text-xl text-white" />
        <h1 className="font-semibold  text-white">
          Data is NOT enough to give a suggestion
        </h1>
        <span className="text-white font-normal">please try again later</span>
        <button
          onClick={() => onClose()}
          className="second-button border w-40 mt-5"
        >
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="w-full h-full grow p-2 px-4 overflow-auto">
      <header className="border-b">
        <h1 className="text-lg sm:text-xl font-medium">
          Career Suggestion By AI
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          We collect students&apos; skills from classwork and provide
          suggestions based on that data.
        </h4>
      </header>
      <main className="w-full flex mt-5 items-center flex-col justify-center gap-2">
        <div className="w-60 h-60 bg-white rounded-lg overflow-hidden drop-shadow-md relative">
          <Image
            src={career?.picture as string}
            blurDataURL={decodeBlurhashToCanvas(career?.blurhash as string)}
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, 33vw"
            fill
            className="object-fill"
            alt="career picture"
          />
        </div>
        <div className="gradient-bg text-white text-xl px-5 py-1 rounded-lg">
          {career?.title}
        </div>
        <ul className="flex w-full items-center justify-center flex-wrap gap-1">
          {career?.careers.map((c, index) => {
            return (
              <li
                key={index}
                className="px-3 text-blue-600 bg-blue-100 rounded-md"
              >
                #{c.title}
              </li>
            );
          })}
        </ul>
        <div className="text-sm flex items-center justify-center gap-1 text-gray-400">
          ( <SiGooglegemini />
          Suggest Carrer Path AI)
        </div>

        <p className="text-center">{career?.description}</p>
        <h2 className="mt-5 w-full border-b pb-2">Overall Skill Record</h2>
        <section className="grid  grid-cols-1 gap-2 w-full">
          {careers.data?.skills.map((skill) => {
            return (
              <div
                className=" text-black w-full flex justify-between font-semibold "
                key={skill.skill.id}
              >
                {skill.skill.title}

                <span>{skill.average.toFixed(2)}%</span>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default StudentCareerSuggest;
