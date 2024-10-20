import { GetServerSideProps } from "next";
import React from "react";
import { setAccessToken, getRefetchtoken } from "../../utils";
import { RefreshTokenService } from "../../services";

function Index() {
  return <div>Index</div>;
}

export default Index;

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
