import React from "react";
import { useGetCareerSuggestion } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { MdError } from "react-icons/md";
import { careerSectors } from "../../data/career";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { SiGooglegemini } from "react-icons/si";
import { defaultBlurHash } from "../../data";

type Props = {
  studentId: string;
  onClose: () => void;
};
function StudentCareerSuggest({ studentId, onClose }: Props) {
  const careers = useGetCareerSuggestion({ studentId });

  const career = careerSectors.find(
    (c) => c.title === careers.data?.careers.title,
  );

  if (careers.isLoading) {
    return (
      <div className="flex w-full grow items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (careers.error?.message === "Data is not enough to give a suggestion") {
    return (
      <div className="flex h-full w-full grow flex-col items-center justify-center bg-gradient-to-r from-rose-400 to-red-500 p-2">
        <MdError className="text-xl text-white" />
        <h1 className="font-semibold text-white">
          Data is NOT enough to give a suggestion
        </h1>
        <span className="font-normal text-white">please try again later</span>
        <button
          onClick={() => onClose()}
          className="second-button mt-5 w-40 border"
        >
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="h-full w-full grow overflow-auto p-2 px-4">
      <header className="border-b">
        <h1 className="text-lg font-medium sm:text-xl">
          Career Suggestion By AI
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          We collect students&apos; skills from classwork and provide
          suggestions based on that data.
        </h4>
      </header>
      <main className="mt-5 flex w-full flex-col items-center justify-center gap-2">
        {career && (
          <div className="relative h-60 w-60 overflow-hidden rounded-lg bg-white drop-shadow-md">
            <Image
              src={career.picture}
              blurDataURL={decodeBlurhashToCanvas(career.blurhash)}
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 33vw"
              fill
              className="object-fill"
              alt="career picture"
            />
          </div>
        )}
        <div className="gradient-bg rounded-lg px-5 py-1 text-xl text-white">
          {career?.title}
        </div>
        <ul className="flex w-full flex-wrap items-center justify-center gap-1">
          {career?.careers.map((c, index) => {
            return (
              <li
                key={index}
                className="rounded-md bg-blue-100 px-3 text-blue-600"
              >
                #{c.title}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
          ( <SiGooglegemini />
          Suggest Carrer Path AI)
        </div>

        <p className="text-center">{career?.description}</p>
        <h2 className="mt-5 w-full border-b pb-2">Overall Skill Record</h2>
        <section className="grid w-full grid-cols-1 gap-2">
          {careers.data?.skills.map((skill) => {
            return (
              <div
                className="flex w-full justify-between font-semibold text-black"
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
