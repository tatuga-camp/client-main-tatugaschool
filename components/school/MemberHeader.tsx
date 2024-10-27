import { MemberOnSchool } from "@/interfaces";
import { FC } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

const MemberHeader: FC<{ members: MemberOnSchool[]; onInvite: () => void }> = ({
  members,
  onInvite,
}) => {
  return (
    <div className="bg-white p-6 pb-0 mb-0 rounded-t-2xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Members ({members.length})
          </h2>
          <p className="text-gray-500">Current</p>
        </div>
        <button
          onClick={onInvite}
          className="flex items-center space-x-1 bg-primary-color text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          <FaPlus />
          <span>Invite</span>
        </button>
      </div>
    </div>
  );
};

export default MemberHeader;
