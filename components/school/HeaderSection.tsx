import React from "react";
import { FaUserPlus } from "react-icons/fa";
import Image from "next/image";
import { MemberOnSchool, School } from "@/interfaces";
import { useGetUser } from "@/react-query";

import ListMemberCircle from "../member/ListMemberCircle";

const HeaderSection: React.FC<{
  school: School;
  members: MemberOnSchool[];
  onInvite: () => void;
}> = ({ school, members, onInvite }) => {
  const { data: user } = useGetUser();
  return (
    <div className=" p-12 pb-24 text-white gradient-bg">
      {/* Top Section */}
      <div
        className="flex w-max text-xs  
             items-center mb-5  text-white  border-white gap-1 border rounded-full px-2 py-1 justify-center"
      >
        SCHOOL
      </div>
      <div className="w-max border-b border-b-white pb-2">
        <h1 className="text-4xl font-bold max-w-[60rem] break-words">
          ชั้นเรียน - {school.title}{" "}
        </h1>
        <p className="text-xl">{school.description}</p>
        <p className="text-gray-300  max-w-[60rem] break-words ">
          {school.address} {school.city} {school.country} {school.zipCode}
        </p>
        <p className="text-gray-300  max-w-[60rem] break-words ">
          {school.phoneNumber}
        </p>
      </div>
      <div className="flex justify-end items-center space-x-2">
        <div>
          <ListMemberCircle members={members} />
        </div>
        <button
          onClick={onInvite}
          className="flex items-center space-x-1 bg-white text-primary-color 
          font-semibold px-6 py-2 rounded-md hover:bg-opacity-90"
        >
          <FaUserPlus />
          <span>Invite</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderSection;
