import React, { useEffect } from "react";
import {
  useGetLanguage,
  useGetMemberOnSchoolByUser,
  useUpdateInviteMemberOnSchool,
} from "../../react-query";
import Image from "next/image";
import { defaultBlurHash } from "../../data";
import { MdHome } from "react-icons/md";
import { PiPhone } from "react-icons/pi";
import { timeAgo } from "../../utils";
import { BiCheck, BiX } from "react-icons/bi";
import { ErrorMessages, MemberRole, Status } from "../../interfaces";
import Swal from "sweetalert2";
import { accountDataLanguage, requestData } from "../../data/languages";
import LoadingBar from "../common/LoadingBar";

function ManageInvite() {
  const memberOnSchools = useGetMemberOnSchoolByUser();
  const language = useGetLanguage();
  const updateMemberOnSchool = useUpdateInviteMemberOnSchool();
  useEffect(() => {
    memberOnSchools.refetch();
  }, []);

  const handleUpdateInvite = async (request: {
    memberOnSchoolId: string;
    schoolId: string;
    status: Status;
  }) => {
    try {
      Swal.fire({
        title: requestData.loadingTitle(language.data ?? "en"),
        text: requestData.loadingDescription(language.data ?? "en"),
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await updateMemberOnSchool.mutateAsync({
        query: {
          memberOnSchoolId: request.memberOnSchoolId,
        },
        body: {
          status: request.status,
        },
        schoolId: request.schoolId,
      });

      await memberOnSchools.refetch();
      Swal.fire({
        title:
          request.status === "ACCEPT" ? "Success Accept" : "Success Reject",
        text:
          request.status === "ACCEPT"
            ? "You have joined"
            : "You have reject the invitation",
        icon: "success",
      });
    } catch (error) {
      console.error(error);
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
  };
  return (
    <div className="">
      {memberOnSchools.isLoading && <LoadingBar />}
      <ul className="grid">
        {memberOnSchools.data
          ?.sort(
            (a, b) =>
              new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
          )
          .map((member) => {
            return (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-2xl border-b bg-white px-5 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-20 overflow-hidden">
                    <Image
                      src={member.school.logo}
                      alt="logo of school"
                      fill
                      blurDataURL={member.school.blurHash ?? defaultBlurHash}
                      placeholder="blur"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">School:</span>{" "}
                      {member.school.title}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-gray-400">
                      <MdHome />
                      {member.school.address} {member.school.city}{" "}
                      {member.school.country}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-gray-400">
                      <PiPhone />
                      {member.school.phoneNumber}
                    </p>
                    <div className="mt-2 flex w-max items-center gap-1 rounded-2xl bg-sky-100 px-2 text-sm text-black">
                      Invited{" "}
                      {timeAgo({
                        pastTime: new Date(member.createAt).toISOString(),
                      })}{" "}
                      ago
                    </div>
                  </div>
                </div>
                {member.status === "PENDDING" ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={updateMemberOnSchool.isPending}
                      onClick={() =>
                        handleUpdateInvite({
                          memberOnSchoolId: member.id,
                          status: "REJECT",
                          schoolId: member.school.id,
                        })
                      }
                      className="reject-button flex h-8 w-32 items-center justify-between gap-1"
                    >
                      <BiX />
                      {accountDataLanguage.reject(language.data ?? "en")}
                    </button>
                    <button
                      disabled={updateMemberOnSchool.isPending}
                      onClick={() =>
                        handleUpdateInvite({
                          memberOnSchoolId: member.id,
                          status: "ACCEPT",
                          schoolId: member.school.id,
                        })
                      }
                      className="success-button flex h-8 w-32 items-center justify-between gap-1 hover:bg-green-700"
                    >
                      <BiCheck />
                      {accountDataLanguage.accpet(language.data ?? "en")}
                    </button>
                  </div>
                ) : (
                  <div>
                    {accountDataLanguage.alreadyJoin(language.data ?? "en")}
                  </div>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default ManageInvite;
