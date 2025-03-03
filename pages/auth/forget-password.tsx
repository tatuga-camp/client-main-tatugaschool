import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgetPasswordForm } from "@/components/auth/ForgetPassword";
import Head from "next/head";

const ForgetPasswordPage = () => {
  return (
    <>
      <Head>
        <title>Forget Password</title>
      </Head>
      <AuthLayout>
        <AuthHeader />
        <ForgetPasswordForm />
        <AuthFooter />
      </AuthLayout>
    </>
  );
};

export default ForgetPasswordPage;
