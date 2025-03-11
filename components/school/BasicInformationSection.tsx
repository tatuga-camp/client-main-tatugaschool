import { ErrorMessages, School } from "@/interfaces";
import {
  useDeleteSchool,
  useGetLanguage,
  useUpdateSchool,
} from "../../react-query";
import ProfileForm from "./ProfileForm";
import ProfileUpload from "./ProfileUpload";
import Swal from "sweetalert2";
import LoadingSpinner from "../common/LoadingSpinner";
import { useRouter } from "next/router";
import LoadingBar from "../common/LoadingBar";
import { requestData, schoolDataLanguage } from "../../data/languages";

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
              const replacedText = "DELETE";
              let content = document.createElement("div");
              content.innerHTML =
                `<div>${requestData.deleteInstruction1(
                  language.data ?? "en"
                )}<strong>` +
                replacedText +
                `  </strong>${requestData.deleteInstruction2(
                  language.data ?? "en"
                )}</div>`;
              const { value } = await Swal.fire({
                title: requestData.deleteTitle(language.data ?? "en"),
                input: "text",
                icon: "warning",
                footer: requestData.deleteFooter(language.data ?? "en"),
                html: content,
                showCancelButton: true,
                inputValidator: (value) => {
                  if (value !== replacedText) {
                    return requestData.deleteError(language.data ?? "en");
                  }
                },
              });
              if (value) {
                await handleDeleteSchool();
              }
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
