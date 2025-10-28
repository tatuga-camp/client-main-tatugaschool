import { FC, useEffect, useState } from "react";
import { ErrorMessages, MemberOnSchool, MemberRole, User } from "@/interfaces";
import { FaPlus } from "react-icons/fa6";
import {
  useDeleteMemberOnSchool,
  useGetLanguage,
  useGetMemberOnSchoolBySchool,
  useGetUser,
  useUpdateMemberOnSchool,
} from "../../react-query";
import { FaSearch } from "react-icons/fa";
import ListMembers from "../member/ListMembers";
import Swal from "sweetalert2";

import { ListSchoolRoles } from "../../data";
import { schoolDataLanguage } from "../../data/languages";

export interface MemberSectionProps {
  onInvite: () => void;
  user: User;
  schoolId: string;
}

const MemberSection: FC<MemberSectionProps> = ({
  onInvite,
  user,
  schoolId,
}) => {
  const language = useGetLanguage();
  const members = useGetMemberOnSchoolBySchool({ schoolId: schoolId });
  const deleteMember = useDeleteMemberOnSchool();
  const [searchTerm, setSearchTerm] = useState("");
  const updateMember = useUpdateMemberOnSchool();
  const [memberData, setMemberData] = useState<MemberOnSchool[]>(
    members.data ?? [],
  );
  // Filter members based on search term

  useEffect(() => {
    if (members.data) {
      setMemberData(members.data);
    }
  }, [members.data]);

  const handleFilter = (query: string) => {
    if (query === "") {
      return setSearchTerm("");
    }
    setSearchTerm(query);
    const filteredMembers = memberData.filter((member) =>
      `${member.email} ${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
    setMemberData(filteredMembers);
  };

  const handleDeleteMemberOnSchool = async ({
    memberId,
  }: {
    memberId: string;
  }) => {
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>To confirm, type <strong>" +
      replacedText +
      "</strong> in the box below </div>";
    const { value } = await Swal.fire({
      title: "Are you sure?",
      input: "text",
      icon: "warning",
      footer: "This action is irreversible and destructive. Please be careful.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Deleting...",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteMember.mutateAsync({
          memberOnSchoolId: memberId,
        });
        Swal.fire({
          title: "Success",
          text: "Member Deleted",
          icon: "success",
        });
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something Went Wrong",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Code Error: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="h-max max-w-4xl rounded-2xl border bg-white md:px-5">
      <div className="mb-0 rounded-t-2xl bg-white p-6 pb-0">
        {/* Header Section */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Members ({members.data?.length})
            </h2>
            <p className="text-gray-500">Current</p>
          </div>
          <button
            onClick={onInvite}
            className="flex items-center space-x-1 rounded-2xl bg-primary-color px-6 py-2 text-white hover:bg-opacity-90"
          >
            <FaPlus />
            <span>
              {schoolDataLanguage.inviteButton(language.data ?? "en")}
            </span>
          </button>
        </div>
      </div>{" "}
      <div className="relative bg-white px-6">
        <FaSearch className="absolute left-9 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleFilter(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
        />
      </div>
      <div className="h-max overflow-auto rounded-b-lg bg-white pt-6">
        <ListMembers
          listRoles={ListSchoolRoles}
          members={memberData.map((member) => {
            return { ...member, isInvite: true, isLoading: false };
          })}
          user={user}
          onRoleChange={(data) => {
            setMemberData((oldData) =>
              oldData.map((member) => {
                if (member.id === data.memberId) {
                  return { ...member, role: data.role };
                }
                return member;
              }),
            );
            updateMember.mutateAsync({
              query: {
                memberOnSchoolId: data.memberId,
              },
              body: {
                role: data.role,
              },
            });
          }}
          onDelete={(data) => {
            handleDeleteMemberOnSchool(data);
          }}
          handleSummit={(data) => {}}
          currentListMembers={memberData}
        />
      </div>
    </div>
  );
};

export default MemberSection;
