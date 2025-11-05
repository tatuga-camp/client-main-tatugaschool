import React from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import AccountComponent from "@/components/account/AccountComponent";
import { GetUserService, RefreshTokenService } from "../../services";
import { GetServerSideProps } from "next";
import { getRefetchtoken } from "../../utils";
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
