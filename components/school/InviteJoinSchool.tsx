import { InputText } from "primereact/inputtext";
import React, { memo, useEffect, useState } from "react";
import { getMemberBySchool, getUser, getUserByEmail } from "../../react-query";
import { IoIosSearch } from "react-icons/io";
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
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";
import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import Swal from "sweetalert2";
import Link from "next/link";
import ListMembers from "../member/ListMembers";

type Props = {
  schoolId: string;
};
function InviteJoinSchool({ schoolId }: Props) {
  const queryClient = useQueryClient();
  const user = getUser();
  const memberOnSchools = getMemberBySchool({ id: schoolId });
  const [email, setEmail] = React.useState<string>("");
  const [query, setQuery] = useState<string>("");
  const getUsers = getUserByEmail({ email: query.length > 5 ? query : "" });

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
    }[]
  >([]);

  const createMemberOnSchool = useMutation({
    mutationKey: ["create-member-on-school"],
    mutationFn: (input: RequestCreateMemberOnSchoolService) =>
      CreateMemberOnSchoolService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["member-on-school", { schoolId }],
        (oldData: MemberOnSchool[]) => {
          return [...oldData, data];
        }
      );
    },
  });

  const updateMemberOnSchool = useMutation({
    mutationKey: ["update-member-on-school"],
    mutationFn: (input: RequestUpdateMemberOnSchoolService) =>
      UpdateMemberOnSchoolService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["member-on-school", { schoolId }],
        (oldData: MemberOnSchool[]) => {
          return oldData.map((member) => {
            if (member.id === data.id) {
              return data;
            }
            return member;
          });
        }
      );
    },
  });

  useEffect(() => {
    if (getUsers.data && memberOnSchools.data) {
      setUsers(() =>
        getUsers.data.map((user) => {
          return {
            id:
              memberOnSchools.data.find((member) => member.userId === user.id)
                ?.id ?? null,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.photo,
            isInvite: memberOnSchools.data.some(
              (member) => member.userId === user.id
            ),
            userId: user.id,
            isLoading: false,
            role:
              memberOnSchools.data.find((member) => member.userId === user.id)
                ?.role ?? "ADMIN",
            trigger: false,
          };
        })
      );
    }
  }, [getUsers.data, memberOnSchools.data]);

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
      <section className="flex flex-col  w-full gap-2">
        <label className="pb-2 w-full border-b border-b-gray-300">
          Invite your freinds to join your school
        </label>
        <div className="flex w-full relative bg-slate-200 flex-col">
          <input
            type="email"
            value={query}
            className="border rounded-md px-6 py-4"
            placeholder="Enter Email"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          {getUsers.isLoading && (
            <ProgressSpinner
              animationDuration="0.5s"
              style={{ width: "20px", position: "absolute" }}
              className="w-5 h-5  right-5 top-0 bottom-0 m-auto"
              strokeWidth="8"
            />
          )}
        </div>
        {memberOnSchools.data && user.data && (
          <ListMembers
            members={users}
            listMembers={memberOnSchools.data}
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
      <div className="w-full mt-5 flex justify-center">
        <Link href="/" className="main-button text-center w-40">
          Finish
        </Link>
      </div>
    </div>
  );
}

export default memo(InviteJoinSchool);
