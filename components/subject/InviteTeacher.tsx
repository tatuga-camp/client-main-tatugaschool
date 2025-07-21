import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { defaultBlurHash, ListSubjectRoles } from "../../data";
import { MemberOnSchool, MemberRole, TeacherOnSubject } from "../../interfaces";
import {
  useGetMemberOnSchoolBySchool,
  useGetTeacherOnSubject,
  useGetUser,
} from "../../react-query";
import {
  CreateTeacherOnSubjectService,
  RequestCreateTeacherOnSubjectService,
  RequestUpdateTeacherOnSubjectService,
  UpdateTeacherOnSubjectService,
} from "../../services";
import DropdownRole from "../common/DropdownRole";
import ListMemberCircle from "../member/ListMemberCircle";
import ListMembers from "../member/ListMembers";
import { decodeBlurhashToCanvas, levenshteinDistance } from "../../utils";
import Image from "next/image";

type Props = {
  subjectId: string;
  schoolId: string;
  setTrigger?: React.Dispatch<React.SetStateAction<boolean>>;
};

function InviteTeacher({ subjectId, setTrigger, schoolId }: Props) {
  const user = useGetUser();
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId,
  });
  const queryClient = useQueryClient();
  const [triggerChangeRole, setTriggerChangeRole] = React.useState(false);
  const [selectRole, setSelectRole] = React.useState<MemberRole>("ADMIN");
  const [suggestMembers, setSuggestMembers] = React.useState<MemberOnSchool[]>(
    [],
  );
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId: schoolId,
  });
  const [email, setEmail] = React.useState<string>("");
  const createTeacherOnSubject = useMutation({
    mutationKey: ["create-teacher-on-subject"],
    mutationFn: (input: RequestCreateTeacherOnSubjectService) =>
      CreateTeacherOnSubjectService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["teacherOnSubject", { subjectId: subjectId }],
        (oldData: TeacherOnSubject[]) => {
          return [...oldData, data];
        },
      );
    },
  });

  const updateTeacherOnSubject = useMutation({
    mutationKey: ["update-teacher-on-subject"],
    mutationFn: (input: RequestUpdateTeacherOnSubjectService) =>
      UpdateTeacherOnSubjectService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["teacherOnSubject", { subjectId: subjectId }],
        (oldData: TeacherOnSubject[]) => {
          return oldData.map((teacher) => {
            if (teacher.id === data.id) {
              return data;
            }
            return teacher;
          });
        },
      );
    },
  });

  const [members, setMembers] = React.useState<
    {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      photo: string;
      isInvite: boolean;
      role: MemberRole;
      userId: string;
      isLoading: boolean;
    }[]
  >();

  useEffect(() => {
    if (teacherOnSubjects.data) {
      setMembers(
        teacherOnSubjects.data.map((teacher) => {
          return {
            id: teacher.id,
            email: teacher.email,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            photo: teacher.photo,
            isInvite: true,
            isLoading: false,
            role: teacher.role,
            userId: teacher.userId,
          };
        }),
      );
    }
  }, [teacherOnSubjects.data]);

  const handleSummit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await createTeacherOnSubject.mutateAsync({
        role: selectRole,
        email,
        subjectId,
      });
      setEmail("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateRole = async ({
    id,
    role,
  }: {
    id: string;
    role: MemberRole;
  }) => {
    try {
      await updateTeacherOnSubject.mutateAsync({
        query: {
          teacherOnSubjectId: id,
        },
        body: {
          role: role,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`flex h-[30rem] w-full flex-col items-center justify-start rounded-md ${suggestMembers.length > 0 ? "bg-gray-200" : "bg-white"} sm:w-max`}
    >
      <header className="flex w-full justify-between border-b p-3 pb-2 sm:p-5 sm:pb-3">
        <div className="flex items-center gap-1">
          <h1 className="text-base font-semibold sm:text-lg">
            Invite Co-Teacher
          </h1>
          {teacherOnSubjects.isLoading ? (
            <div className="h-2 w-8 animate-pulse rounded-md bg-gray-300/50 sm:h-3 sm:w-10"></div>
          ) : (
            teacherOnSubjects.data && (
              <div>
                <ListMemberCircle members={teacherOnSubjects.data} />
              </div>
            )
          )}
        </div>
        {setTrigger && (
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              setTrigger(false);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-base font-semibold hover:bg-gray-300/50 sm:h-6 sm:w-6 sm:text-lg"
          >
            <IoMdClose />
          </button>
        )}
      </header>
      <main className="flex w-full flex-col items-center justify-center gap-3 p-3 sm:gap-5 sm:p-5">
        <form
          onSubmit={handleSummit}
          className="flex w-full flex-col items-center justify-center gap-1"
        >
          <label className="flex w-full flex-col items-start justify-start gap-1">
            <span className="text-sm font-semibold">Invite With Email</span>
            <div className="flex w-full gap-2">
              <div className="relative w-full sm:w-96">
                <input
                  disabled={memberOnSchools.isLoading}
                  value={email}
                  onChange={(e) => {
                    if (!memberOnSchools.data) {
                      return;
                    }
                    setEmail(e.target.value);
                    if (e.target.value === "") {
                      setSuggestMembers([]);
                    } else {
                      setSuggestMembers(() =>
                        memberOnSchools.data
                          .map((member) => ({
                            ...member,
                            distance: levenshteinDistance(
                              e.target.value,
                              member.email,
                            ),
                          }))
                          .sort((a, b) => a.distance - b.distance)
                          .slice(0, 3),
                      );
                    }
                  }}
                  required
                  type="email"
                  placeholder={
                    memberOnSchools.isLoading ? "Loading.." : "Enter Email"
                  }
                  className="main-input w-full pr-28 sm:w-96"
                />
                <div className="absolute right-1 top-2 m-auto">
                  <DropdownRole
                    setSelectRole={setSelectRole}
                    selectRole={selectRole}
                    setTrigger={setTriggerChangeRole}
                    trigger={triggerChangeRole}
                    listRoles={ListSubjectRoles}
                  />
                </div>
                {suggestMembers.length > 0 && (
                  <ul className="absolute top-12 z-40 h-max w-96 overflow-hidden rounded-xl border bg-white hover:ring-1">
                    {suggestMembers.map((member, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setEmail(member.email);
                          setSuggestMembers([]);
                        }}
                        className="flex h-14 items-center justify-start gap-3 border-b p-3 hover:cursor-pointer hover:bg-gray-200"
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded-md ring-1 ring-black">
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
                          <h1 className="text-sm font-semibold">
                            {member.email}
                          </h1>
                          <span className="text-xs">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                disabled={createTeacherOnSubject.isPending}
                className="main-button flex w-16 items-center justify-center text-sm sm:w-20"
              >
                {createTeacherOnSubject.isPending ? (
                  <ProgressSpinner
                    animationDuration="1s"
                    style={{ width: "20px" }}
                    className="h-5 w-5"
                    strokeWidth="8"
                  />
                ) : (
                  "Invite"
                )}
              </button>
            </div>
          </label>
          <div className="flex w-full">
            <div className="max-h-10 max-w-full break-words text-xs text-red-600 sm:max-w-96">
              {createTeacherOnSubject.error &&
                createTeacherOnSubject.error.message}
            </div>
          </div>
        </form>

        <div className="mt-3 w-full sm:mt-5">
          <h2 className="text-sm font-semibold">Current Co-Teachers</h2>
          {user.data && teacherOnSubjects.data && members && (
            <ListMembers
              listRoles={ListSubjectRoles}
              onRoleChange={(data) =>
                handleUpdateRole({
                  id: data.memberId,
                  role: data.role,
                })
              }
              user={user.data}
              members={members}
              currentListMembers={teacherOnSubjects.data}
              handleSummit={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default InviteTeacher;
