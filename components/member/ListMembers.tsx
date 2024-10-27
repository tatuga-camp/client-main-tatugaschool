import Image from "next/image";
import React, { useEffect } from "react";
import { MemberRole, Status, User } from "../../interfaces";
import { ProgressSpinner } from "primereact/progressspinner";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import DropdownRole from "../common/DropdownRole";
import { ListRoles } from "../../data/list";
import { on } from "events";

type Props = {
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
  listMembers: {
    userId: string;
    role: MemberRole;
    status: Status;
  }[];
  user: User;
  onRoleChange: (data: { memberId: string; role: MemberRole }) => void;
  handleSummit: (data: { email: string }) => void;
};
function ListMembers({
  members,
  user,
  listMembers,
  handleSummit,
  onRoleChange,
}: Props) {
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
    <ul className="w-full  p-2 flex mt-5 flex-col gap-2">
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
                {listMembers.find((m) => m.userId === member.id)?.role})
              </span>
            </div>
          </div>
          {member.isInvite && member.id ? (
            <div className="flex gap-1 relative">
              <div className="success-button w-20 text-center text-xs">
                {user?.id === member.userId
                  ? "You"
                  : listMembers?.find((m) => m.userId === member.id)?.status ===
                    "ACCEPT"
                  ? "Accepted"
                  : "Pending"}
              </div>
              {user.id !== member.userId && member.id && (
                <DropdownRole
                  listRoles={ListRoles}
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
                  onClick={() => handleSummit({ email: member.email })}
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
