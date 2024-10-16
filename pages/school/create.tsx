import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import CreateSchoolComponent from "@/components/school/CreateSchoolComponent";

const CreateSchoolPage = () => {

  return (
    <AuthLayout>
      <AuthHeader />
      <CreateSchoolComponent />
      <AuthFooter />
    </AuthLayout>
  );
};

export default CreateSchoolPage;