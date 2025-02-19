import ListsSchoolComponent from "@/components/school/ListsSchoolComponent";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { GetServerSideProps } from "next";
import { RefreshTokenService } from "../services";
import Head from "next/head";
import { getRefetchtoken } from "../utils";

export default function Home() {
  return (
    <>
      <Head>
        <title>Tatuga School</title>
        <meta
          name="description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tatuga School" />
        <meta
          property="og:description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />

        <meta property="twitter:title" content="Tatuga School" />
        <meta
          property="twitter:description"
          content="Welcome to tatuga school dashboard where teachers are able to manage thier school!"
        />

        <meta property="twitter:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary" />
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
