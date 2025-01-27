import Image from "next/image";
import React, { useEffect } from "react";
import { MemberRole, Status, User } from "../../interfaces";
import { ProgressSpinner } from "primereact/progressspinner";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import DropdownRole from "../common/DropdownRole";
import { MdDelete } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  listRoles: { title: string; describe: string }[];
  members: {
    id: string | null;
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
    isInvite: boolean;
    isLoading: boolean;
    role: MemberRole;
    userId: string;
    blurHash?: string;
  }[];
  currentListMembers: {
    id: string;
    userId: string;
    role: MemberRole;
    status: Status;
  }[];
  user: User;
  onRoleChange: (data: { memberId: string; role: MemberRole }) => void;
  handleSummit?: (data: { email: string }) => void;
  onDelete?: (data: { memberId: string }) => void;
};
function ListMembers({
  members,
  user,
  currentListMembers,
  handleSummit,
  onRoleChange,
  onDelete,
  listRoles,
}: Props) {
  const checkMember = currentListMembers.find((m) => m.userId === user.id);
  const [memberData, setMemberData] = React.useState<
    {
      id: string | null;
      email: string;
      userId: string;
      firstName: string;
      lastName: string;
      photo: string;
      isInvite: boolean;
      isLoading: boolean;
      blurHash?: string;
      role: MemberRole;
      trigger: boolean;
    }[]
  >(
    members.map((member) => ({
      ...member,
      trigger: false,
      userId: member.userId,
    }))
  );

  useEffect(() => {
    if (members) {
      setMemberData(() =>
        members.map((member) => ({
          ...member,
          trigger: false,
          userId: member.userId,
        }))
      );
    }
  }, [members]);

  return (
    <ul className="w-full    p-2 flex mt-5 flex-col gap-2">
      {memberData.map((member, index) => (
        <li
          key={index}
          className="flex justify-between py-2 border-b items-center gap-2"
        >
          <div className="flex gap-2">
            <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
              <Image
                src={member.photo}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  member.blurHash ?? defaultBlurHash
                )}
                alt="logo tatuga school"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-semibold text-sm">{member.email}</h1>
              <span className="text-xs">
                {member.firstName} {member.lastName} (
                {currentListMembers.find((m) => m.userId === member.id)?.role})
              </span>
            </div>
          </div>
          {member.isInvite && member.id ? (
            <div className="flex gap-1 relative">
              {user?.id === member.userId ? (
                <div className="flex items-center gap-1 justify-center">
                  <div
                    className=" flex w-20 justify-center items-center 
gap-1 transition text-sm  py-1 rounded-md  border"
                  >
                    YOU
                  </div>
                  <div
                    className=" flex w-24 justify-center items-center 
gap-1 transition text-sm  py-1 rounded-md bg-gray-200/50 border"
                  >
                    {member.role}
                  </div>
                </div>
              ) : currentListMembers?.find((m) => m.id === member.id)
                  ?.status === "ACCEPT" ? (
                <div
                  className="bg-green-600 text-white rounded-md 
                flex items-center justify-center w-20 text-center text-xs"
                >
                  Accepted
                </div>
              ) : (
                <div
                  className="bg-yellow-300 text-black rounded-md 
                flex items-center justify-center w-20 text-center text-xs"
                >
                  Pending
                </div>
              )}

              {user.id !== member.userId && member.id && (
                <DropdownRole
                  disabled={checkMember?.role !== "ADMIN"}
                  listRoles={listRoles}
                  selectRole={member.role}
                  setSelectRole={(role: MemberRole) => {
                    setMemberData((prev) =>
                      prev.map((m) => (m.id === member.id ? { ...m, role } : m))
                    );
                    if (member.id) onRoleChange({ memberId: member.id, role });
                  }}
                  setTrigger={() => {
                    setMemberData((prev) =>
                      prev.map((m) =>
                        m.id === member.id ? { ...m, trigger: !m.trigger } : m
                      )
                    );
                  }}
                  trigger={member.trigger}
                />
              )}
              {onDelete &&
                member.id &&
                (checkMember?.role === "ADMIN" ||
                  checkMember?.userId === member.userId) && (
                  <button
                    onClick={() =>
                      member.id && onDelete({ memberId: member.id })
                    }
                    className="reject-button text-lg px-2"
                  >
                    <MdDelete />
                  </button>
                )}
            </div>
          ) : (
            <div className="w-20  flex items-center">
              {member.isLoading ? (
                <ProgressSpinner
                  animationDuration="0.5s"
                  style={{ width: "20px" }}
                  className="w-5 h-5  "
                  strokeWidth="8"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleSummit?.({ email: member.email })}
                  className="main-button w-20 text-xs"
                >
                  Invite
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default ListMembers;
