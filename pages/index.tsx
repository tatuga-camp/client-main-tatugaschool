import ListsSchoolComponent from "@/components/school/ListsSchoolComponent";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { GetServerSideProps } from "next";
import { GetUserService, RefreshTokenService } from "../services";
import { User } from "../interfaces";
import Head from "next/head";
import { setAccessToken, getRefetchtoken } from "../utils";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Tatuga School</title>
        <meta name="description" content="Tatuga School" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DefaultLayout>
        <ListsSchoolComponent />
      </DefaultLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { refresh_token } = getRefetchtoken(ctx);
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
