import CreateSchoolComponent from "@/components/school/CreateSchoolComponent";
import { GetUserService, RefreshTokenService } from "../../services";
import { GetServerSideProps } from "next";
import DefaultLayout from "../../components/layout/DefaultLayout";
import { setAccessToken, useRefetchtoken } from "../../hooks";

const CreateSchoolPage = () => {
  return (
    <DefaultLayout>
      <div className=" flex items-center mt-20">
        <CreateSchoolComponent />
      </div>
    </DefaultLayout>
  );
};

export default CreateSchoolPage;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { refresh_token } = useRefetchtoken(ctx);
    if (!refresh_token) {
      throw new Error("Token not found");
    }
    const accessToken = await RefreshTokenService({
      refreshToken: refresh_token,
    });

    setAccessToken({ access_token: accessToken.accessToken });

    return {
      props: {},
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
};
