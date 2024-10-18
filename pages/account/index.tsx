import React from "react";
import Image from "next/image";
import DefaultLayout from "@/components/layout/DefaultLayout";
import AccountComponent from "@/components/account/AccountComponent";

const AccountPage = () => {
  return (
    <DefaultLayout>
      <AccountComponent />
    </DefaultLayout>
  );
};

export default AccountPage;
