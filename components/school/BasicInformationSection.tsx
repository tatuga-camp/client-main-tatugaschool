import { ErrorMessages, School } from "@/interfaces";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { schoolDataLanguage } from "../../data/languages";
import {
  useDeleteSchool,
  useGetLanguage,
  useUpdateSchool,
} from "../../react-query";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import LoadingBar from "../common/LoadingBar";
import LoadingSpinner from "../common/LoadingSpinner";
import ProfileForm from "./ProfileForm";
import ProfileUpload from "./ProfileUpload";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";

const BasicInformationSection = ({ school }: { school: School }) => {
  const role = useGetRoleOnSchool({
    schoolId: school.id,
  });

  const language = useGetLanguage();
  const updateSchool = useUpdateSchool();
  const removeSchool = useDeleteSchool();
  const router = useRouter();

  const handleDeleteSchool = async () => {
    try {
      await removeSchool.mutateAsync({ schoolId: school.id });
      Swal.fire({
        title: "success",
        text: "You have been delete this school",
        icon: "success",
      });
      router.push("/");
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
    <div className="grid grid-cols-6 gap-4">
      <div className="col-span-2">
        <ProfileUpload school={school} updateSchool={updateSchool} />
      </div>
      <div className="col-span-4 w-full space-y-4 rounded-xl bg-white p-6">
        <ProfileForm school={school} updateSchool={updateSchool} />
        <h1 className="mt-10 text-lg font-medium sm:text-xl">
          {schoolDataLanguage.dangerZoneTitle(language.data ?? "en")}
        </h1>
        <h4 className="text-xs text-gray-500 sm:text-sm">
          {schoolDataLanguage.dangerZoneDescription(language.data ?? "en")}
        </h4>
        <div className="mt-5 flex flex-col items-start gap-5 rounded-2xl border bg-white p-4">
          {removeSchool.isPending && <LoadingBar />}
          <h2 className="border-b py-3 text-base font-medium sm:text-lg">
            {schoolDataLanguage.deleteSchool(language.data ?? "en")}
          </h2>
          <h4 className="text-xs text-red-700 sm:text-sm">
            {schoolDataLanguage.deleteSchoolDescription(language.data ?? "en")}
          </h4>
          <button
            disabled={removeSchool.isPending || role === "TEACHER"}
            onClick={async () => {
              await ConfirmDeleteMessage({
                language: language.data ?? "en",
                callback: async () => {
                  await handleDeleteSchool();
                },
              });
            }}
            className="reject-button mt-5 flex w-40 items-center justify-center"
          >
            {removeSchool.isPending ? (
              <LoadingSpinner />
            ) : (
              schoolDataLanguage.deleteButton(language.data ?? "en")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;
