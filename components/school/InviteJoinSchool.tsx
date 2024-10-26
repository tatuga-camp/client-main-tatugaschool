import React, { memo, useEffect, useState } from "react";
import { useGetMemberBySchool, useGetUser, useGetUserByEmail } from "../../react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateMemberOnSchoolService,
  RequestCreateMemberOnSchoolService,
} from "../../services";
import {
  ErrorMessages,
  MemberOnSchool,
  User,
} from "../../interfaces";
import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import Swal from "sweetalert2";
import Link from "next/link";

type Props = {
  schoolId: string;
  hideFinishButton?: boolean;
};
function InviteJoinSchool({ schoolId, hideFinishButton }: Props) {
  const queryClient = useQueryClient();
  const user = useGetUser();
  const memberOnSchools = useGetMemberBySchool({ schoolId: schoolId });
  const [query, setQuery] = useState<string>("");
  const getUsers = useGetUserByEmail(query.length > 5 ? query : "");

  const [users, setUsers] = useState<
    (User & { isInvite: boolean; isLoading: boolean })[]
  >([]);

  const createMemberOnSchool = useMutation({
    mutationKey: ["create-member-on-school"],
    mutationFn: (input: RequestCreateMemberOnSchoolService) =>
      CreateMemberOnSchoolService(input),
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(
        ["member-on-school", { schoolId }],
        (oldData: MemberOnSchool[]) => {
          return [...oldData, data];
        }
      );
    },
  });

  useEffect(() => {
    if (getUsers.data && memberOnSchools.data) {
      setUsers(
        getUsers.data.map((user) => {
          return {
            ...user,
            isInvite: memberOnSchools.data.some(
              (member) => member.userId === user.id
            ),
            isLoading: false,
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
          Invite your friends to join your school
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
        <ul className="w-full flex mt-5 flex-col gap-2">
          {users.map((member) => (
            <li
              key={member.id}
              className="flex justify-between py-2 border-b items-center gap-2"
            >
              <div className="flex gap-2">
                <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                  <Image
                    src={member.photo || "/favicon.ico"}
                    fill
                    alt="logo tatuga school"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="font-semibold text-sm">{member.email}</h1>
                  <span className="text-xs">
                    {member.firstName} {member.lastName} (
                    {
                      memberOnSchools.data?.find((m) => m.userId === member.id)
                        ?.role
                    }
                    )
                  </span>
                </div>
              </div>
              {member.isInvite ? (
                <div className="success-button w-20 text-center text-xs">
                  {user.data?.id === member.id
                    ? "You"
                    : memberOnSchools.data?.find((m) => m.userId === member.id)
                        ?.status === "ACCEPT"
                    ? "Accepted"
                    : "Pending"}
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
      </section>
      <div className="w-full mt-5 flex justify-center">
        {!hideFinishButton && <Link href="/" className="main-button text-center w-40">
          Finish
        </Link>}
      </div>
    </div>
  );
}

export default memo(InviteJoinSchool);
