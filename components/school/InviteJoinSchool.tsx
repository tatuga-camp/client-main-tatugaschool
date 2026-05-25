import React, { memo, useEffect, useState } from "react";
import {
  useGetLanguage,
  useGetUser,
  useGetUserByEmail,
} from "../../react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateMemberOnSchoolService,
  RequestCreateMemberOnSchoolService,
  RequestUpdateMemberOnSchoolService,
  UpdateMemberOnSchoolService,
} from "../../services";
import {
  ErrorMessages,
  MemberOnSchool,
  MemberRole,
  User,
} from "../../interfaces";
import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import Swal from "sweetalert2";
import Link from "next/link";
import ListMembers from "../member/ListMembers";
import {
  useCreateMemberOnSchool,
  useGetMemberOnSchoolBySchool,
  useUpdateMemberOnSchool,
} from "../../react-query/memberOnSchool";
import { ListSchoolRoles } from "../../data";
import { createSchoolDataLanguage } from "../../data/languages";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  schoolId: string;
  hideFinishButton?: boolean;
};
function InviteJoinSchool({ schoolId, hideFinishButton }: Props) {
  const user = useGetUser();
  const language = useGetLanguage();
  const updateMemberOnSchool = useUpdateMemberOnSchool();
  const createMemberOnSchool = useCreateMemberOnSchool();
  const memberOnSchools = useGetMemberOnSchoolBySchool({ schoolId: schoolId });
  const [query, setQuery] = useState<string>("");
  const getUsers = useGetUserByEmail(query.length > 5 ? query : "");

  const [users, setUsers] = useState<
    {
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
    }[]
  >([]);

  useEffect(() => {
    if (!memberOnSchools.data) return;

    const existingRows = (getUsers.data ?? []).map((user) => ({
      id:
        memberOnSchools.data.find((member) => member.userId === user.id)?.id ??
        null,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
      isInvite: memberOnSchools.data.some(
        (member) => member.userId === user.id,
      ),
      userId: user.id,
      isLoading: false,
      role:
        memberOnSchools.data.find((member) => member.userId === user.id)
          ?.role ?? ("ADMIN" as MemberRole),
      isExternal: false,
    }));

    const trimmed = query.trim().toLowerCase();
    const looksLikeEmail = EMAIL_REGEX.test(trimmed);
    const alreadyKnownByEmail = memberOnSchools.data.some(
      (m) => m.email?.toLowerCase() === trimmed,
    );
    const alreadyInExistingRows = existingRows.some(
      (r) => r.email.toLowerCase() === trimmed,
    );

    const syntheticRow =
      looksLikeEmail &&
      !alreadyKnownByEmail &&
      !alreadyInExistingRows &&
      (getUsers.data?.length ?? 0) === 0
        ? [
            {
              id: null,
              email: query.trim(),
              firstName: "",
              lastName: "",
              photo: "",
              isInvite: false,
              isLoading: false,
              role: "TEACHER" as MemberRole,
              userId: "",
              isExternal: true,
            },
          ]
        : [];

    setUsers([...existingRows, ...syntheticRow]);
  }, [getUsers.data, memberOnSchools.data, query]);

  const handleSummit = async ({ email }: { email: string }) => {
    try {
      setUsers((oldData) => {
        return oldData.map((user) => {
          if (user.email === email) {
            return { ...user, isLoading: true };
          }
          return user;
        });
      });
      await createMemberOnSchool.mutateAsync({
        role: "TEACHER",
        email: email,
        schoolId: schoolId,
      });
      setUsers((oldData) => {
        return oldData.map((user) => {
          if (user.email === email) {
            return { ...user, isInvite: true, isLoading: false };
          }
          return user;
        });
      });
    } catch (error) {
      setUsers((oldData) => {
        return oldData.map((user) => {
          if (user.email === email) {
            return { ...user, isLoading: false };
          }
          return user;
        });
      });
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
  };
  return (
    <div>
      <section className="flex w-full flex-col gap-2">
        <label className="w-full border-b border-b-gray-300 pb-2">
          {createSchoolDataLanguage.inviteTitle(language.data ?? "en")}{" "}
        </label>
        <div className="relative flex w-full flex-col bg-slate-200">
          <input
            type="email"
            value={query}
            className="rounded-2xl border px-6 py-4"
            placeholder="Enter Email"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          {getUsers.isLoading && (
            <ProgressSpinner
              animationDuration="0.5s"
              style={{ width: "20px", position: "absolute" }}
              className="bottom-0 right-5 top-0 m-auto h-5 w-5"
              strokeWidth="8"
            />
          )}
        </div>
        {memberOnSchools.data && user.data && (
          <ListMembers
            listRoles={ListSchoolRoles}
            members={users}
            currentListMembers={memberOnSchools.data}
            user={user.data}
            handleSummit={handleSummit}
            onRoleChange={async (data) =>
              await updateMemberOnSchool.mutateAsync({
                query: { memberOnSchoolId: data.memberId },
                body: { role: data.role },
              })
            }
          />
        )}
      </section>
      <div className="mt-5 flex w-full justify-center">
        {!hideFinishButton && (
          <Link href="/" className="main-button w-40 text-center">
            {createSchoolDataLanguage.inviteDone(language.data ?? "en")}
          </Link>
        )}
      </div>
    </div>
  );
}

export default memo(InviteJoinSchool);
