import CreateSchoolComponent from "@/components/school/CreateSchoolComponent";
import { GetUserService, RefreshTokenService } from "../../services";
import { GetServerSideProps } from "next";
import DefaultLayout from "../../components/layout/DefaultLayout";
import { getRefetchtoken } from "../../utils";

const CreateSchoolPage = () => {
  return (
    <DefaultLayout>
      <div className="mt-20 flex items-center">
        <CreateSchoolComponent />
      </div>
    </DefaultLayout>
  );
};

export default CreateSchoolPage;
