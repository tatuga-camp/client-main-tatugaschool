import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { defaultBlurHash, ListSubjectRoles } from "../../data";
import { ErrorMessages, MemberRole } from "../../interfaces";
import {
  useDeleteSubject,
  useDeleteTeacherOnSubject,
  useGetLanguage,
  useGetStudentOnSubject,
  useGetSubject,
  useGetTeacherOnSubject,
  useGetUser,
  useUpdateStudentOnSubject,
  useUpdateSubject,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import Switch from "../common/Switch";
import ListMembers from "../member/ListMembers";
import SubjectInfomation from "./SubjectInfomation";
import SubjectPermission from "./SubjectPermission";
import {
  settingOnClassroomDataLangugae,
  settingOnSubjectDataLanguage,
} from "../../data/languages";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import useGetRoleOnSubject from "../../hook/useGetRoleOnSubject";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";

type Props = {
  subjectId: string;
  schoolId: string;
  setSelectMenu: (menu: string) => void;
};
function Setting({ subjectId, setSelectMenu, schoolId }: Props) {
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const roleSubject = useGetRoleOnSubject({
    subjectId: subjectId,
  });
  const roleSchool = useGetRoleOnSchool({
    schoolId: schoolId,
  });
  const language = useGetLanguage();
  const toast = React.useRef<Toast>(null);
  const updateStudentOnSubject = useUpdateStudentOnSubject();
  const deleteTeacherOnSubject = useDeleteTeacherOnSubject();
  const deleteSubject = useDeleteSubject();
  const queryClient = useQueryClient();
  const updateSubject = useUpdateSubject();
  const user = useGetUser();
  const studentOnSubjects = useGetStudentOnSubject({
    subjectId: subjectId,
  });
  const router = useRouter();
  const subject = useGetSubject({
    subjectId: subjectId,
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

  const handleSaveChanges = async (e: React.FormEvent, data: any) => {
    try {
      e.preventDefault();
      await updateSubject.mutateAsync({
        request: {
          query: {
            subjectId: subjectId,
          },
          body: data,
        },
        queryClient: queryClient,
      });
      showSuccess();
    } catch (error) {
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

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Changes has been saved",
      life: 3000,
    });
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteTeacherOnSubject.mutateAsync({
        request: {
          teacherOnSubjectId: id,
        },
        queryClient: queryClient,
        subjectId: subjectId,
      });
    } catch (error) {
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

  const handleDeleteSubject = async ({
    subjectId,
    schoolId,
  }: {
    subjectId: string;
    schoolId: string;
  }) => {
    try {
      Swal.fire({
        title: "Deleting...",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await deleteSubject.mutateAsync({
        request: {
          subjectId: subjectId,
        },
        queryClient: queryClient,
      });
      Swal.fire({
        title: "Success",
        text: "Subject has been deleted",
        icon: "success",
      });
      router.push(`/school/${schoolId}?menu=Subjects`);
    } catch (error) {
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
    <main className="flex flex-col items-center w-full gap-5 px-4 sm:px-6 lg:px-8">
      <Toast ref={toast} />
      <section className="w-full sm:w-10/12 lg:w-8/12">
        <h1 className="text-lg sm:text-xl font-medium">
          {settingOnSubjectDataLanguage.general(language.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {settingOnSubjectDataLanguage.generalDescription(
            language.data ?? "en"
          )}
        </h4>
        <SubjectInfomation
          subjectId={subjectId}
          onSummit={handleSaveChanges}
          isPending={updateSubject.isPending}
        />

        <SubjectPermission
          subjectId={subjectId}
          onSummit={handleSaveChanges}
          isPending={updateSubject.isPending}
        />

        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            {settingOnSubjectDataLanguage.coTeacher(language.data ?? "en")}
          </h2>
          {members && teacherOnSubjects.data && user.data && (
            <ListMembers
              listRoles={ListSubjectRoles}
              members={members}
              onDelete={(data) => handleDeleteTeacher(data.memberId)}
              currentListMembers={teacherOnSubjects.data}
              user={user.data}
              onRoleChange={(data) => console.log(data)}
              handleSummit={(data) => console.log(data)}
            />
          )}
        </div>
        <h1 className="text-lg sm:text-xl font-medium mt-10">
          {settingOnSubjectDataLanguage.studentSetting(language.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {settingOnSubjectDataLanguage.studentSettingDescription(
            language.data ?? "en"
          )}
        </h4>
        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            {settingOnSubjectDataLanguage.listOnStudent(language.data ?? "en")}
          </h2>
          <h4 className="text-xs sm:text-sm text-gray-500">
            {settingOnSubjectDataLanguage.listOnStudentDescription(
              language.data ?? "en"
            )}
          </h4>
          <ul className="grid max-h-96 overflow-auto grid-cols-1">
            {studentOnSubjects.data
              ?.sort((a, b) => Number(a.number) - Number(b.number))
              .map((student, index) => {
                const odd = index % 2 === 0;
                return (
                  <li
                    key={student.id}
                    className={`flex justify-between py-2 items-center ${
                      odd && "bg-gray-200/20"
                    } gap-2`}
                  >
                    <div className="flex gap-2">
                      <div className="w-10 h-10 relative rounded-md ring-1 overflow-hidden">
                        <Image
                          src={student.photo}
                          alt={student.firstName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          placeholder="blur"
                          blurDataURL={decodeBlurhashToCanvas(
                            student.blurHash ?? defaultBlurHash
                          )}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold">
                          {student.firstName} {student.lastName}{" "}
                        </h1>
                        <p className="text-xs text-gray-500">
                          Number {student.number}{" "}
                          {!student.isActive && "(Disabled)"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Switch
                        checked={student.isActive}
                        setChecked={async (e) => {
                          if (updateStudentOnSubject.isPending) return;
                          await updateStudentOnSubject.mutateAsync({
                            request: {
                              query: {
                                id: student.id,
                              },
                              data: {
                                isActive: e,
                              },
                            },
                            queryClient: queryClient,
                          });
                        }}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
        <h1 className="text-lg sm:text-xl font-medium mt-10">
          {settingOnClassroomDataLangugae.danger(language.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {settingOnClassroomDataLangugae.dangerDescription(
            language.data ?? "en"
          )}
        </h4>
        <div className="flex flex-col items-start p-4 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            {settingOnSubjectDataLanguage.deleteSubject(language.data ?? "en")}
          </h2>
          <h4 className="text-xs sm:text-sm text-red-700">
            {settingOnSubjectDataLanguage.deleteSubjectDescription(
              language.data ?? "en"
            )}
          </h4>

          <button
            disabled={
              deleteSubject.isPending ||
              (roleSchool !== "ADMIN" && roleSubject !== "ADMIN")
            }
            onClick={() => {
              if (!subject.data) return;

              ConfirmDeleteMessage({
                language: language.data ?? "en",
                callback: async () => {
                  await handleDeleteSubject({
                    subjectId: subjectId,
                    schoolId: subject.data?.schoolId,
                  });
                },
              });
            }}
            className="reject-button mt-5"
          >
            {settingOnSubjectDataLanguage.deleteSubject(language.data ?? "en")}
          </button>
          {roleSchool !== "ADMIN" && roleSubject !== "ADMIN" && (
            <h4 className="text-xs sm:text-sm text-red-700">
              Only the school admin and the admin of this subject can delete
              them
            </h4>
          )}
        </div>
      </section>
    </main>
  );
}

export default Setting;
