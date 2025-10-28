import React from "react";
import { useGetCareerSuggestion } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { MdError, MdComputer } from "react-icons/md";
import { SiGooglegemini } from "react-icons/si";
import { FaUserTie, FaUsers } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { RiLightbulbLine, RiPaintBrushLine } from "react-icons/ri";
import { careerSectors } from "../../data/career";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

// --- Helper Functions ---

/**
 * Gets the appropriate badge text and styling based on the career's rank.
 */
const getCareerBadge = (index: number) => {
  switch (index) {
    case 0:
      return {
        text: "BEST MATCH",
        className: "bg-red-100 text-red-700",
      };
    case 1:
      return {
        text: "GOOD MATCH",
        className: "bg-green-100 text-green-700",
      };
    case 2:
      return {
        text: "SUGGESTED",
        className: "bg-yellow-100 text-yellow-700",
      };
    default:
      return {
        text: "CONSIDER",
        className: "bg-gray-100 text-gray-700",
      };
  }
};

/**
 * Gets the icon and color styling for a given skill title.
 */
const getSkillStyles = (skillTitle: string) => {
  const normalizedTitle = skillTitle.toLowerCase();

  if (normalizedTitle.includes("leadership")) {
    return {
      icon: <FaUserTie className="text-orange-500" />,
      barClass: "bg-orange-500",
      badgeClass: "bg-orange-100 text-orange-600",
    };
  }
  if (normalizedTitle.includes("communication")) {
    return {
      icon: <BsChatDots className="text-blue-500" />,
      barClass: "bg-blue-500",
      badgeClass: "bg-blue-100 text-blue-600",
    };
  }
  if (normalizedTitle.includes("critical thinking")) {
    return {
      icon: <RiLightbulbLine className="text-purple-500" />,
      barClass: "bg-purple-500",
      badgeClass: "bg-purple-100 text-purple-600",
    };
  }
  if (normalizedTitle.includes("digital literacy")) {
    return {
      icon: <MdComputer className="text-red-500" />,
      barClass: "bg-red-500",
      badgeClass: "bg-red-100 text-red-600",
    };
  }
  if (normalizedTitle.includes("creativity")) {
    return {
      icon: <RiPaintBrushLine className="text-yellow-500" />,
      barClass: "bg-yellow-500",
      badgeClass: "bg-yellow-100 text-yellow-600",
    };
  }
  if (normalizedTitle.includes("collaboration")) {
    return {
      icon: <FaUsers className="text-green-500" />,
      barClass: "bg-green-500",
      badgeClass: "bg-green-100 text-green-600",
    };
  }

  // Default case
  return {
    icon: <RiLightbulbLine className="text-gray-500" />,
    barClass: "bg-gray-500",
    badgeClass: "bg-gray-100 text-gray-600",
  };
};

// --- Component ---

type Props = {
  studentId: string;
  onClose: () => void;
};

function StudentCareerSuggest({ studentId, onClose }: Props) {
  const careers = useGetCareerSuggestion({ studentId });

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

  const allCareers = careers.data?.careers;
  if (!allCareers || allCareers.length === 0) {
    return (
      <div className="flex w-full grow items-center justify-center p-4">
        <p className="text-gray-600">
          No career suggestions available at this time.
        </p>
      </div>
    );
  }

  // Find the Sector info based on the top-matched career
  const topCareer = allCareers[0];
  const topSector = careerSectors.find(
    (sector) => sector.title === topCareer.title,
  );

  return (
    <div className="h-full w-full grow overflow-auto bg-gray-50 p-2 px-4 pb-10">
      <header className="border-b pb-2">
        <h1 className="text-lg font-medium sm:text-xl">Career Suggestion</h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          We collect students&apos; skills from classwork and provide
          suggestions based on that data.
        </h4>
      </header>

      <main className="mt-4 flex w-full flex-col items-center justify-center gap-4">
        {/* --- Top Sector Info --- */}
        {topSector && (
          <div className="flex w-full max-w-lg flex-col items-center gap-3">
            <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image
                src={topSector.picture}
                blurDataURL={decodeBlurhashToCanvas(
                  topSector.blurhash || defaultBlurHash,
                )}
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 33vw"
                fill
                className="object-cover"
                alt="Career sector visual"
              />
            </div>
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-base font-medium text-white shadow-md">
              {topSector.title}
            </div>
            <ul className="flex w-full flex-wrap items-center justify-center gap-2">
              {topSector.careers.map((c, index) => (
                <li
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  #{c.title}
                </li>
              ))}
            </ul>
            <div className="flex cursor-pointer items-center justify-center gap-1.5 text-sm text-purple-600 hover:underline">
              <SiGooglegemini />
              <span>Suggest Career Path AI</span>
            </div>
          </div>
        )}

        {/* --- Career List --- */}
        <div className="mt-4 flex w-full max-w-lg flex-col gap-4">
          {allCareers.map((career, index) => {
            const badge = getCareerBadge(index);
            const careerDetail = careerSectors.find(
              (c) => c.title === career.title,
            );
            return (
              <section
                key={career.id || index}
                className="w-full rounded-2xl border bg-white p-4 shadow-sm"
              >
                {/* Career Header */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {career.title}
                  </h3>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.text} {career.careerMatchPoint.toFixed(2)}
                  </span>
                </div>
                <ul className="flex w-full flex-wrap items-center justify-start gap-2">
                  {careerDetail?.careers.map((c, index) => (
                    <li
                      title={c.description}
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      #{c.title}
                    </li>
                  ))}
                </ul>

                {/* Description */}
                {/* We assume career.description exists, as shown in the image */}
                <p className="mt-1 text-sm text-gray-600">
                  {careerDetail?.description}
                </p>

                {/* Skills List */}
                <div className="mt-4 flex flex-col gap-4">
                  {career.skills.map((skill) => {
                    const styles = getSkillStyles(skill.title);
                    const totalPeople = skill.above + skill.below;
                    const percentBelow =
                      totalPeople > 0
                        ? Math.round((skill.below / totalPeople) * 100)
                        : 0;

                    return (
                      <div key={skill.id} className="flex flex-col gap-1.5">
                        {/* Skill Title + Top % Badge */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 font-medium text-gray-700">
                            {styles.icon}
                            <span>{skill.title}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badgeClass}`}
                          >
                            {skill.above} People Better Than You
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${styles.barClass}`}
                            style={{ width: `${percentBelow}%` }}
                          />
                        </div>

                        {/* Skill Percentile Text */}
                        <p className="text-xs text-gray-500">
                          Your skill is higher than <b>{percentBelow}%</b> /{" "}
                          {totalPeople} people in this career.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default StudentCareerSuggest;
