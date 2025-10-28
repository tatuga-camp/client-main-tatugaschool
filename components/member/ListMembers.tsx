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
    })),
  );

  useEffect(() => {
    if (members) {
      setMemberData(() =>
        members.map((member) => ({
          ...member,
          trigger: false,
          userId: member.userId,
        })),
      );
    }
  }, [members]);

  return (
    <ul className="mt-5 flex w-full flex-col gap-2 p-2">
      {memberData.map((member, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-2 border-b py-2"
        >
          <div className="flex gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1">
              <Image
                src={member.photo}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL={decodeBlurhashToCanvas(
                  member.blurHash ?? defaultBlurHash,
                )}
                alt="logo tatuga school"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold">{member.email}</h1>
              <span className="text-xs">
                {member.firstName} {member.lastName} (
                {currentListMembers.find((m) => m.userId === member.id)?.role})
              </span>
            </div>
          </div>
          {member.isInvite && member.id ? (
            <div className="relative flex gap-1">
              {user?.id === member.userId ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="flex w-20 items-center justify-center gap-1 rounded-2xl border py-1 text-sm transition">
                    YOU
                  </div>
                  <div className="flex w-24 items-center justify-center gap-1 rounded-2xl border bg-gray-200/50 py-1 text-sm transition">
                    {member.role}
                  </div>
                </div>
              ) : currentListMembers?.find((m) => m.id === member.id)
                  ?.status === "ACCEPT" ? (
                <div className="flex w-20 items-center justify-center rounded-2xl bg-green-600 text-center text-xs text-white">
                  Accepted
                </div>
              ) : (
                <div className="flex w-20 items-center justify-center rounded-2xl bg-yellow-300 text-center text-xs text-black">
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
                      prev.map((m) =>
                        m.id === member.id ? { ...m, role } : m,
                      ),
                    );
                    if (member.id) onRoleChange({ memberId: member.id, role });
                  }}
                  setTrigger={() => {
                    setMemberData((prev) =>
                      prev.map((m) =>
                        m.id === member.id ? { ...m, trigger: !m.trigger } : m,
                      ),
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
                    className="reject-button px-2 text-lg"
                  >
                    <MdDelete />
                  </button>
                )}
            </div>
          ) : (
            <div className="flex w-20 items-center">
              {member.isLoading ? (
                <ProgressSpinner
                  animationDuration="0.5s"
                  style={{ width: "20px" }}
                  className="h-5 w-5"
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
