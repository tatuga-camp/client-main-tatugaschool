import { School } from "@/interfaces";
import ProfileUpload from "./ProfileUpload";
import ProfileForm from "./ProfileForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestUpdateSchoolService, UpdateSchoolService } from "@/services";
import { UseMutationResult } from "@tanstack/react-query";

const BasicInformationSection = ({ school }: { school: School }) => {
  const queryClient = useQueryClient();

  const updateSchool: UseMutationResult<
    School,
    Error,
    RequestUpdateSchoolService,
    unknown
  > = useMutation({
    mutationKey: ["update-school"],
    mutationFn: (input: RequestUpdateSchoolService) =>
      UpdateSchoolService(input),
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(
        ["school", { id: school.id }],
        (oldData: School) => {
          return { ...oldData, ...data };
        }
      );
    },
  });

  return (
    <div className="grid grid-cols-6 gap-4">
      <div className="col-span-2">
        <ProfileUpload school={school} updateSchool={updateSchool} />
      </div>
      <div className="col-span-4">
        <ProfileForm school={school} updateSchool={updateSchool} />
      </div>
    </div>
  );
};

export default BasicInformationSection;
