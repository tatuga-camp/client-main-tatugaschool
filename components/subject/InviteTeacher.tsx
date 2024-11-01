import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useGetTeacherOnSubject, useGetUser } from "../../react-query";
import ListMemberCircle from "../member/ListMemberCircle";
import ListMembers from "../member/ListMembers";
import { GoChevronDown } from "react-icons/go";
import useClickOutside from "../../hook/useClickOutside";
import { ErrorMessages, MemberRole, TeacherOnSubject } from "../../interfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTeacherOnSubjectService,
  RequestCreateTeacherOnSubjectService,
  RequestUpdateTeacherOnSubjectService,
  UpdateTeacherOnSubjectService,
} from "../../services";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import DropdownRole from "../common/DropdownRole";
import { ListRoles } from "../../data/list";

type Props = {
  subjectId: string;
  setTrigger?: React.Dispatch<React.SetStateAction<boolean>>;
};

function InviteTeacher({ subjectId, setTrigger }: Props) {
  const user = useGetUser();
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId,
  });
  const queryClient = useQueryClient();
  const [triggerChangeRole, setTriggerChangeRole] = React.useState(false);
  const [selectRole, setSelectRole] = React.useState<MemberRole>("ADMIN");
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
        }
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
        }
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
        })
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
    <div className="w-max h-[30rem] flex flex-col items-center rounded-md justify-start bg-white">
      <header className="w-full p-5 flex justify-between border-b pb-3">
        <div className="flex  items-center gap-1">
          <h1 className="text-lg  font-semibold">Invite Co-Teacher</h1>
          {teacherOnSubjects.isLoading ? (
            <div className="w-10 h-3 rounded-md bg-gray-300/50 animate-pulse"></div>
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
            onClick={() => setTrigger(false)}
            className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
         flex items-center justify-center font-semibold"
          >
            <IoMdClose />
          </button>
        )}
      </header>
      <main className="w-full  flex flex-col items-center justify-center gap-5 p-5">
        <form
          onSubmit={handleSummit}
          className="w-full flex flex-col items-center justify-center gap-1"
        >
          <label className="w-full flex flex-col items-start justify-start gap-1">
            <span className="text-sm font-semibold">Invite With Email</span>
            <div className="w-full flex gap-2">
              <div className="relative w-96">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="main-input w-96 pr-28"
                />
                <div className="absolute top-2 right-1 m-auto">
                  <DropdownRole
                    setSelectRole={setSelectRole}
                    selectRole={selectRole}
                    setTrigger={setTriggerChangeRole}
                    trigger={triggerChangeRole}
                    listRoles={ListRoles}
                  />
                </div>
              </div>
              <button
                disabled={createTeacherOnSubject.isPending}
                className="main-button items-center flex justify-center  w-20 text-sm"
              >
                {createTeacherOnSubject.isPending ? (
                  <ProgressSpinner
                    animationDuration="1s"
                    style={{ width: "20px" }}
                    className="w-5 h-5"
                    strokeWidth="8"
                  />
                ) : (
                  "Invite"
                )}
              </button>
            </div>
          </label>
          <div className="w-full flex">
            <div className=" text-xs break-words max-w-96 max-h-10  text-red-600">
              {createTeacherOnSubject.error &&
                createTeacherOnSubject.error.message}
            </div>
          </div>
        </form>

        <div className="w-full mt-5">
          <h2 className="font-semibold text-sm">Current Co-Teachers</h2>
          {user.data && teacherOnSubjects.data && members && (
            <ListMembers
              onRoleChange={(data) =>
                handleUpdateRole({
                  id: data.memberId,
                  role: data.role,
                })
              }
              user={user.data}
              members={members}
              listMembers={teacherOnSubjects.data}
              handleSummit={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default InviteTeacher;
