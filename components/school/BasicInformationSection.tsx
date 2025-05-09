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

const BasicInformationSection = ({ school }: { school: School }) => {
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
      <div className="col-span-4 w-full p-6 bg-white rounded-xl space-y-4">
        <ProfileForm school={school} updateSchool={updateSchool} />
        <h1 className="text-lg sm:text-xl font-medium mt-10">
          {schoolDataLanguage.dangerZoneTitle(language.data ?? "en")}
        </h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          {schoolDataLanguage.dangerZoneDescription(language.data ?? "en")}
        </h4>
        <div className="flex flex-col items-start p-4 bg-white rounded-md border gap-5 mt-5">
          {removeSchool.isPending && <LoadingBar />}
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            {schoolDataLanguage.deleteSchool(language.data ?? "en")}
          </h2>
          <h4 className="text-xs sm:text-sm text-red-700">
            {schoolDataLanguage.deleteSchoolDescription(language.data ?? "en")}
          </h4>
          <button
            disabled={removeSchool.isPending}
            onClick={async () => {
              await ConfirmDeleteMessage({
                language: language.data ?? "en",
                callback: async () => {
                  await handleDeleteSchool();
                },
              });
            }}
            className="reject-button mt-5 w-40 flex items-center justify-center"
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
