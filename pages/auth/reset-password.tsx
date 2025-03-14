import React from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthFooter } from "../../components/auth/AuthFooter";
import ResetPassword from "../../components/auth/ResetPassword";
import { GetServerSideProps } from "next";
import Head from "next/head";

function Index({ token }: { token: string }) {
  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <AuthLayout>
        <AuthHeader />
        <ResetPassword token={token} />
        <AuthFooter />
      </AuthLayout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token } = ctx.query;

  if (!token) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
  return {
    props: {
      token,
    },
  };
};
