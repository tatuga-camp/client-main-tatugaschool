import { ErrorMessages, School } from "@/interfaces";
import { useDeleteSchool, useUpdateSchool } from "../../react-query";
import ProfileForm from "./ProfileForm";
import ProfileUpload from "./ProfileUpload";
import Swal from "sweetalert2";
import LoadingSpinner from "../common/LoadingSpinner";
import { useRouter } from "next/router";
import LoadingBar from "../common/LoadingBar";

const BasicInformationSection = ({ school }: { school: School }) => {
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
        <h1 className="text-lg sm:text-xl font-medium mt-10">Danger zone</h1>
        <h4 className="text-xs sm:text-sm text-gray-500">
          Irreversible and destructive actions
        </h4>
        <div className="flex flex-col items-start p-4 bg-white rounded-md border gap-5 mt-5">
          {removeSchool.isPending && <LoadingBar />}
          <h2 className="border-b text-base sm:text-lg font-medium py-3">
            Delete This School
          </h2>
          <h4 className="text-xs sm:text-sm text-red-700">
            Once you delete this school, all data will be lost and cannot be
            recovered. Please be careful.
          </h4>
          <button
            disabled={removeSchool.isPending}
            onClick={async () => {
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
                footer:
                  "This action is irreversible and destructive. Please be careful.",
                html: content,
                showCancelButton: true,
                inputValidator: (value) => {
                  if (value !== replacedText) {
                    return "Please Type Correctly";
                  }
                },
              });
              if (value) {
                await handleDeleteSchool();
              }
            }}
            className="reject-button mt-5 w-40 flex items-center justify-center"
          >
            {removeSchool.isPending ? <LoadingSpinner /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;
