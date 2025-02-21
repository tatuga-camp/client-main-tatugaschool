import { School } from "@/interfaces";
import { useUpdateSchool } from "../../react-query";
import ProfileForm from "./ProfileForm";
import ProfileUpload from "./ProfileUpload";

const BasicInformationSection = ({ school }: { school: School }) => {
  const updateSchool = useUpdateSchool();

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
