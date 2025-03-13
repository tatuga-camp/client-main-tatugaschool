import Link from "next/link";
import React from "react";
import { Classroom, ErrorMessages } from "../../interfaces";
import InputNumber from "../common/InputNumber";
import InputWithIcon from "../common/InputWithIcon";
import { SiGoogleclassroom } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";
import InputClassLevel from "../common/InputClassLevel";
import {
  useDeleteClassroom,
  useGetLanguage,
  useUpdateClassroom,
} from "../../react-query";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import Swal from "sweetalert2";
import LoadingSpinner from "../common/LoadingSpinner";
import { useRouter } from "next/router";
import Switch from "../common/Switch";
import { settingOnClassroomDataLangugae } from "../../data/languages";

type Props = {
  classroom: Classroom;
  toast: React.RefObject<Toast>;
};
function ClassroomSetting({ classroom, toast }: Props) {
  const lanague = useGetLanguage();
  const update = useUpdateClassroom();
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
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>To confirm, type <strong>" +
      replacedText +
      "</strong> in the box below </div>";
    const { value } = await Swal.fire({
      title: "Are you sure?",
      input: "text",
      icon: "warning",
      footer: "This action is irreversible and destructive. Please be careful.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
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
    }
  };
  return (
    <main className="flex flex-col items-center w-full gap-5 px-4 sm:px-6 lg:px-8">
      <section className="w-full sm:w-10/12 lg:w-8/12">
        <h1 className="text-lg sm:text-xl font-medium">
          {settingOnClassroomDataLangugae.general(lanague.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {settingOnClassroomDataLangugae.geernalDescription(
            lanague.data ?? "en"
          )}
        </h4>

        <form
          onSubmit={handleUpdate}
          className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5"
        >
          <h2 className="border-b text-lg font-medium py-3">
            {settingOnClassroomDataLangugae.classroomInfo(lanague.data ?? "en")}
          </h2>
          <div className="grid grid-cols-1 w-full">
            <div className="grid grid-cols-1  bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full grid md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.classroomId(
                    lanague.data ?? "en"
                  )}
                  :
                </span>
                <Link
                  target="_blank"
                  href={`/classroom/${classroomData.id}`}
                  className="text-base font-semibold underline  text-blue-600"
                >
                  {classroomData.id}
                </Link>
              </label>
            </div>
            <div className="grid grid-cols-1  gap-5  p-2 py-4">
              <label className="w-full items-center grid md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.title(lanague.data ?? "en")}
                </span>
                <InputWithIcon
                  required
                  placeholder={settingOnClassroomDataLangugae.title(
                    lanague.data ?? "en"
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
            <div className="grid grid-cols-1  gap-5 bg-gray-200/20  p-2 py-4">
              <label className="w-full grid items-center md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.description(
                    lanague.data ?? "en"
                  )}
                  :
                </span>
                <InputWithIcon
                  required
                  placeholder={settingOnClassroomDataLangugae.description(
                    lanague.data ?? "en"
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
            <div className="grid grid-cols-1   gap-5  p-2 py-4">
              <label className="w-full items-center grid md:grid-cols-2 md:gap-10">
                <span className="text-base text-black">
                  {settingOnClassroomDataLangugae.classLevel(
                    lanague.data ?? "en"
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

          <div className="grid grid-cols-1  gap-5 bg-gray-200/20  p-2 py-4">
            <label className="w-full grid items-center md:grid-cols-2 md:gap-10">
              <span className="text-base text-black">
                {settingOnClassroomDataLangugae.achieved(lanague.data ?? "en")}
              </span>
              <div className="w-full flex justify-start">
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
            <h4 className="text-xs sm:text-sm text-blue-600">
              {settingOnClassroomDataLangugae.acheveidDescription(
                lanague.data ?? "en"
              )}
            </h4>
          </div>
          <button
            disabled={update.isPending}
            className="main-button flex items-center justify-center mt-5 w-60"
          >
            {update.isPending ? (
              <LoadingSpinner />
            ) : (
              settingOnClassroomDataLangugae.saveButton(lanague.data ?? "en")
            )}
          </button>
        </form>

        <h1 className="text-lg sm:text-xl font-medium mt-10">
          {settingOnClassroomDataLangugae.danger(lanague.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {settingOnClassroomDataLangugae.dangerDescription(
            lanague.data ?? "en"
          )}
        </h4>
        <div className="flex flex-col items-start p-4 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            {settingOnClassroomDataLangugae.deleteTitle(lanague.data ?? "en")}
          </h2>
          <h4 className="text-xs sm:text-sm text-red-700">
            {settingOnClassroomDataLangugae.deleteDescription(
              lanague.data ?? "en"
            )}
          </h4>
          <button
            onClick={() => handleDeleteClassroom({ classId: classroomData.id })}
            className="reject-button w-60 mt-5"
          >
            {settingOnClassroomDataLangugae.deleteButton(lanague.data ?? "en")}
          </button>
        </div>
      </section>
    </main>
  );
}

export default ClassroomSetting;
