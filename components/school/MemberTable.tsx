import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Image from "next/image";
import { MemberOnSchool } from "@/interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

interface MemberTableProps {
  members: MemberOnSchool[];
}

const MemberTable: React.FC<MemberTableProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter members based on search term
  const filteredMembers = members.filter((member) =>
    `${member.email} ${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Input */}
      <div className="bg-white relative px-6">
        <FaSearch className="absolute left-9 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
        />
      </div>

      <div className="pt-6 bg-white rounded-b-lg">
        <div className={`overflow-x-auto`}>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 bg-gray-50">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Member At</th>
                <th className="px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-gray-50">
                  <td className="px-4 py-4 flex items-center space-x-3">
                    <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                      <Image
                        src={member.photo}
                        fill
                        placeholder="blur"
                        blurDataURL={decodeBlurhashToCanvas(
                          member.blurHash ?? defaultBlurHash
                        )}
                        alt="logo tatuga school"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {member.email}
                      </p>
                      <p className="text-gray-500">
                        {member.firstName} {member.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{member.status}</td>
                  <td className="px-4 py-4">
                    {new Date(member.createAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg text-sm font-semibold">
                      #{member.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MemberTable;
