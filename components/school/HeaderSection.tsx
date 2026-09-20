import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MemberOnSchool, School } from "@/interfaces";
import { useGetLanguage } from "@/react-query";

import ListMemberCircle from "../member/ListMemberCircle";
import { schoolDataLanguage } from "../../data/languages";

const HeaderSection: React.FC<{
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}> = ({ school, members, onInvite }) => {
  const language = useGetLanguage();
  return (
    <div className="gradient-bg px-4 pb-20 pt-8 text-white sm:px-6 sm:pb-24 sm:pt-10 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="mb-5 inline-flex items-center justify-center rounded-full border border-white px-2 py-1 text-xs text-white">
        SCHOOL
      </div>
      <div className="w-full min-w-0 border-b border-b-white pb-2">
        <h1 className="break-words text-2xl font-bold sm:text-3xl md:text-4xl 2xl:text-5xl">
          โรงเรียน - {school.title}{" "}
        </h1>
        <p className="line-clamp-2 break-words text-base sm:text-xl">
          {school.description}
        </p>
        <p className="line-clamp-2 break-words text-gray-300">
          {school.address} {school.city} {school.country} {school.zipCode}
        </p>
        <p className="break-words text-gray-300">{school.phoneNumber}</p>
        <h2 className="font-semibold text-white">
          {schoolDataLanguage.memberPlan(language.data ?? "en")}: {school?.plan}
        </h2>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <div className="min-w-0">
          <ListMemberCircle members={members} />
        </div>
        <button
          onClick={onInvite}
          className="flex shrink-0 items-center space-x-1 rounded-2xl bg-white px-4 py-2 font-semibold text-primary-color hover:bg-opacity-90 sm:px-6"
        >
          <FaUserPlus />
          <span>{schoolDataLanguage.inviteButton(language.data ?? "en")}</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
