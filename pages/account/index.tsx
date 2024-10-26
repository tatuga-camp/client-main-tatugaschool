import React from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import AccountComponent from "@/components/account/AccountComponent";
import { GetUserService, RefreshTokenService } from "../../services";
import { GetServerSideProps } from "next";
import { setAccessToken, getRefetchtoken } from "../../utils";
import Head from "next/head";

const AccountPage = () => {
  return (
    <>
      <Head>
        <title>Account</title>
        <meta name="description" content="Account" />
      </Head>
      <DefaultLayout>
        <div className="mt-20">
          <AccountComponent />
        </div>
      </DefaultLayout>
    </>
  );
};

export default AccountPage;

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
