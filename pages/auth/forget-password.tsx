import { AuthFooter } from "@/components/auth/AuthFooter";
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
        <div className="flex w-full grow flex-col items-center justify-center gap-5">
          <ForgetPasswordForm />
        </div>
        <AuthFooter />
      </AuthLayout>
    </>
  );
};

export default ForgetPasswordPage;
