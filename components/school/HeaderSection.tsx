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
    <div className="bg-primary-color p-12 pb-24 text-white">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">ชั้นเรียน - {school.title}</h1>
          <p className="text-gray-300">{school.description}</p>
          <p className="text-gray-300">{school.phoneNumber}</p>
        </div>
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
