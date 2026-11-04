import Image from "next/image";
import React, { useEffect } from "react";
import { MemberRole, Status, User } from "../../interfaces";
import { ProgressSpinner } from "primereact/progressspinner";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import DropdownRole from "../common/DropdownRole";
import { MdDelete } from "react-icons/md";

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
    isExternal?: boolean;
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

// The avatar box is fixed at 40px; `sizes` must match so next/image serves a
// 40px (1x) / 80px (2x) source instead of a full-screen one.
const AVATAR_PX = 40;

const BADGE =
  "inline-flex h-7 min-w-[5rem] items-center justify-center rounded-full px-3 text-xs font-semibold";

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
      isExternal?: boolean;
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
    <ul className="flex w-full flex-col">
      {memberData.map((member, index) => {
        const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
        const initial = (member.firstName || member.email || "?").charAt(0);
        const status = currentListMembers?.find((m) => m.id === member.id)?.status;
        return (
          <li
            key={member.id ?? `${member.email}-${index}`}
            className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-100 px-2 py-3 last:border-b-0"
          >
            {/* min width keeps the name readable; the actions wrap below it on phones. */}
            <div className="flex min-w-[13rem] flex-1 items-center gap-3">
              <div
                className="relative shrink-0 overflow-hidden rounded-full bg-primary-color/10 ring-1 ring-gray-200"
                style={{ width: AVATAR_PX, height: AVATAR_PX }}
              >
                {member.photo ? (
                  <Image
                    src={member.photo}
                    fill
                    sizes={`${AVATAR_PX}px`}
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      member.blurHash || defaultBlurHash,
                    )}
                    alt={fullName || member.email}
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-primary-color"
                  >
                    {initial}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {fullName || member.email}
                </p>
                {fullName && (
                  <p className="truncate text-xs text-gray-500">{member.email}</p>
                )}
                {member.isExternal && (
                  <span className="mt-1 inline-block w-fit rounded-full bg-info-color/10 px-2 py-0.5 text-[10px] font-medium text-info-color">
                    Not yet on Tatuga School — they'll get a signup invite
                  </span>
                )}
              </div>
            </div>
            {member.isInvite && (member.id || member.isExternal) ? (
              <div className="relative ml-auto flex shrink-0 items-center gap-2">
                {user?.id === member.userId ? (
                  <>
                    <span className={`${BADGE} bg-primary-color/10 text-primary-color`}>
                      YOU
                    </span>
                    <span className={`${BADGE} bg-gray-100 text-gray-700`}>
                      {member.role}
                    </span>
                  </>
                ) : status === "ACCEPT" ? (
                  <span className={`${BADGE} bg-success-color/10 text-success-color`}>
                    Accepted
                  </span>
                ) : (
                  <span className={`${BADGE} bg-warning-color/25 text-icon-color`}>
                    Pending
                  </span>
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
                      type="button"
                      onClick={() =>
                        member.id && onDelete({ memberId: member.id })
                      }
                      aria-label={`Remove ${fullName || member.email}`}
                      title="Remove"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-400 transition hover:bg-error-color/10 hover:text-error-color"
                    >
                      <MdDelete />
                    </button>
                  )}
              </div>
            ) : (
              <div className="ml-auto flex w-20 shrink-0 items-center justify-end">
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
        );
      })}
    </ul>
  );
}

export default ListMembers;
