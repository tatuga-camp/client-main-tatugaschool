import React from "react";
import Image from "next/image";
import DefaultLayout from "@/components/layout/DefaultLayout";
import AccountComponent from "@/components/account/AccountComponent";
import { GetUserService, RefreshTokenService } from "../../services";
import { GetServerSideProps } from "next";
import { User } from "../../interfaces";
import { setAccessToken, useRefetchtoken } from "../../hooks";

const AccountPage = () => {
  return (
    <DefaultLayout>
      <div></div>
      {/* <AccountComponent /> */}
    </DefaultLayout>
  );
};

export default AccountPage;

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
