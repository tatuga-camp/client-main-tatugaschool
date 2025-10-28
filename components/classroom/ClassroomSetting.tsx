import Link from "next/link";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React from "react";
import { SiGoogleclassroom } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";
import Swal from "sweetalert2";
import { settingOnClassroomDataLangugae } from "../../data/languages";
import { useSound } from "../../hook";
import { Classroom, ErrorMessages } from "../../interfaces";
import {
  useDeleteClassroom,
  useGetLanguage,
  useGetUser,
  useUpdateClassroom,
} from "../../react-query";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import InputClassLevel from "../common/InputClassLevel";
import InputWithIcon from "../common/InputWithIcon";
import LoadingSpinner from "../common/LoadingSpinner";
import Switch from "../common/Switch";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";

type Props = {
  classroom: Classroom;
  toast: React.RefObject<Toast>;
};
function ClassroomSetting({ classroom, toast }: Props) {
  const lanague = useGetLanguage();
  const update = useUpdateClassroom();
  const role = useGetRoleOnSchool({
    schoolId: classroom.schoolId,
  });
  const user = useGetUser();
  const router = useRouter();
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const deleteClass = useDeleteClassroom();
  const [classroomData, setClassroomData] =
    React.useState<Classroom>(classroom);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        query: {
          classId: classroomData.id,
        },
        body: {
          title: classroomData.title,
          description: classroomData.description,
          level: classroomData.level,
          isAchieved: classroomData.isAchieved,
        },
      });
      sound.play();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Classroom updated",
        life: 3000,
      });
    } catch (error) {
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

  const handleDeleteClassroom = async ({ classId }: { classId: string }) => {
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

      await deleteClass.mutateAsync({
        classId: classId,
      });
      sound.play();
      Swal.fire({
        title: "Success",
        text: "Classroom Deleted",
        icon: "success",
      });
      router.push({
        pathname: `/school/${classroomData.schoolId}`,
        query: { selectMenu: "Classes" },
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
  return (
    <main className="flex w-full flex-col items-center gap-5 px-4 sm:px-6 lg:px-8">
      <section className="w-full sm:w-10/12 lg:w-8/12">
        <h1 className="text-lg font-medium sm:text-xl">
          {settingOnClassroomDataLangugae.general(lanague.data ?? "en")}
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          {settingOnClassroomDataLangugae.geernalDescription(
            lanague.data ?? "en",
          )}
        </h4>

        <form
          onSubmit={handleUpdate}
          className="mt-5 flex min-h-80 flex-col gap-5 rounded-2xl border bg-white p-4"
        >
          <h2 className="border-b py-3 text-lg font-medium">
            {settingOnClassroomDataLangugae.classroomInfo(lanague.data ?? "en")}
          </h2>
          <div className="grid w-full grid-cols-1">
            <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
              <label className="grid w-full md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.classroomId(
                    lanague.data ?? "en",
                  )}
                  :
                </span>
                <Link
                  target="_blank"
                  href={`/classroom/${classroomData.id}`}
                  className="text-base font-semibold text-blue-600 underline"
                >
                  {classroomData.id}
                </Link>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-5 p-2 py-4">
              <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.title(lanague.data ?? "en")}
                </span>
                <InputWithIcon
                  required
                  placeholder={settingOnClassroomDataLangugae.title(
                    lanague.data ?? "en",
                  )}
                  value={classroomData.title}
                  onChange={(value) => {
                    setClassroomData({
                      ...classroomData,
                      title: value,
                    });
                  }}
                  icon={<SiGoogleclassroom />}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
              <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.description(
                    lanague.data ?? "en",
                  )}
                  :
                </span>
                <InputWithIcon
                  required
                  placeholder={settingOnClassroomDataLangugae.description(
                    lanague.data ?? "en",
                  )}
                  value={classroomData.description ?? ""}
                  onChange={(value) => {
                    setClassroomData({
                      ...classroomData,
                      description: value,
                    });
                  }}
                  icon={<TbFileDescription />}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-5 p-2 py-4">
              <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.classLevel(
                    lanague.data ?? "en",
                  )}
                  :
                </span>
                <InputClassLevel
                  value={classroomData.level}
                  onChange={(value) => {
                    setClassroomData({
                      ...classroomData,
                      level: value,
                    });
                  }}
                  required
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
            <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
              <span className="text-base text-black">
                {settingOnClassroomDataLangugae.achieved(lanague.data ?? "en")}
              </span>
              <div className="flex w-full justify-start">
                <Switch
                  checked={classroomData.isAchieved}
                  setChecked={(data) =>
                    setClassroomData((prev) => {
                      return {
                        ...prev,
                        isAchieved: data,
                      };
                    })
                  }
                />
              </div>
            </label>
            <h4 className="text-xs text-blue-600 sm:text-sm">
              {settingOnClassroomDataLangugae.acheveidDescription(
                lanague.data ?? "en",
              )}
            </h4>
          </div>
          <button
            disabled={update.isPending}
            className="main-button mt-5 flex w-60 items-center justify-center"
          >
            {update.isPending ? (
              <LoadingSpinner />
            ) : (
              settingOnClassroomDataLangugae.saveButton(lanague.data ?? "en")
            )}
          </button>
        </form>

        <h1 className="mt-10 text-lg font-medium sm:text-xl">
          {settingOnClassroomDataLangugae.danger(lanague.data ?? "en")}
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          {settingOnClassroomDataLangugae.dangerDescription(
            lanague.data ?? "en",
          )}
        </h4>
        <div className="mt-5 flex flex-col items-start gap-5 rounded-2xl border bg-white p-4">
          <h2 className="border-b py-3 text-base font-medium sm:text-lg">
            {settingOnClassroomDataLangugae.deleteTitle(lanague.data ?? "en")}
          </h2>
          <h4 className="text-xs text-red-700 sm:text-sm">
            {settingOnClassroomDataLangugae.deleteDescription(
              lanague.data ?? "en",
            )}
          </h4>
          <button
            disabled={
              role === "TEACHER" &&
              user.data &&
              user.data.id !== classroom.userId
            }
            onClick={() => {
              ConfirmDeleteMessage({
                language: lanague.data ?? "en",
                callback: async () => {
                  await handleDeleteClassroom({ classId: classroomData.id });
                },
              });
            }}
            className="reject-button mt-5 w-60"
          >
            {settingOnClassroomDataLangugae.deleteButton(lanague.data ?? "en")}
          </button>
          {role === "TEACHER" &&
            user.data &&
            user.data.id !== classroom.userId && (
              <div className="text-red-700">
                Only the school admin and the creator of this classroom can
                delete them
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

export default ClassroomSetting;
