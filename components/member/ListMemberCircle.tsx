import Image from "next/image";
import React from "react";
import { IoIosSend } from "react-icons/io";
import { defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = {
  members: {
    id: string;
    createAt: Date;
    updateAt: Date;
    firstName: string;
    lastName: string;
    email?: string | undefined;
    blurHash?: string | null;
    photo: string;
    schoolId: string;
  }[];
  maxShow?: number;
  setTrigger?: React.Dispatch<React.SetStateAction<boolean>>;
};
function ListMemberCircle({ members, setTrigger, maxShow }: Props) {
  const membersToShow = maxShow ? members.slice(0, maxShow) : members;
  const remainingMembersCount = maxShow ? members.length - maxShow : 0;
  return (
    <div className="flex w-max items-end justify-center">
      {membersToShow.map((teacher, index) => {
        return (
          <div
            title={`${teacher.firstName} ${teacher.lastName} : ${teacher.email}`}
            style={{ left: `-${index * 5}px` }}
            className={`relative h-6 w-6 overflow-hidden rounded-full bg-white ring-1 ring-white`}
            key={teacher.id}
          >
            <Image
              src={teacher.photo}
              alt="User Avatar"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                teacher.blurHash ?? defaultBlurHash,
              )}
              className="cursor-pointer object-cover"
            />
          </div>
        );
      })}

      {/* Display count of remaining members if maxShow is used */}
      {remainingMembersCount > 0 && (
        <div
          className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700 ring-1 ring-white"
          style={{ left: `-${membersToShow.length * 5}px` }}
          title={`${remainingMembersCount} more members`}
        >
          +{remainingMembersCount}
        </div>
      )}
      {setTrigger && (
        <button
          onClick={() => setTrigger(true)}
          aria-label="invite teacher to subject"
          className={`flex items-center text-xs ${
            members.length === 0
              ? "text-red-700"
              : "text-primary-color hover:bg-primary-color hover:text-white"
          } w-max justify-center gap-1 rounded-2xl bg-white px-2 py-1 active:scale-110`}
        >
          {members.length === 0 ? "No Member Please Invite" : "Invite"}
          <IoIosSend />
        </button>
      )}
    </div>
  );
}

export default ListMemberCircle;
