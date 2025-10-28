import React from "react";
import { FaUserPlus } from "react-icons/fa";
import Image from "next/image";
import { MemberOnSchool, School } from "@/interfaces";
import { useGetLanguage, useGetUser } from "@/react-query";

import ListMemberCircle from "../member/ListMemberCircle";
import { schoolDataLanguage } from "../../data/languages";

const HeaderSection: React.FC<{
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}> = ({ school, members, onInvite }) => {
  const language = useGetLanguage();
  return (
    <div className="gradient-bg p-12 pb-24 text-white">
      {/* Top Section */}
      <div className="mb-5 flex w-max items-center justify-center gap-1 rounded-full border border-white px-2 py-1 text-xs text-white">
        SCHOOL
      </div>
      <div className="w-max border-b border-b-white pb-2">
        <h1 className="max-w-80 break-words text-4xl font-bold md:max-w-[60rem]">
          โรงเรียน - {school.title}{" "}
        </h1>
        <p className="text-xl">{school.description}</p>
        <p className="line-clamp-2 max-w-60 break-words text-gray-300 md:max-w-[60rem]">
          {school.address} {school.city} {school.country} {school.zipCode}
        </p>
        <p className="break-words text-gray-300 md:max-w-[60rem]">
          {school.phoneNumber}
        </p>
        <h2 className="font-semibold text-white">
          {schoolDataLanguage.memberPlan(language.data ?? "en")}: {school?.plan}
        </h2>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div>
          <ListMemberCircle members={members} />
        </div>
        <button
          onClick={onInvite}
          className="flex items-center space-x-1 rounded-2xl bg-white px-6 py-2 font-semibold text-primary-color hover:bg-opacity-90"
        >
          <FaUserPlus />
          <span>{schoolDataLanguage.inviteButton(language.data ?? "en")}</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
