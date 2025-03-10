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
        <div className="w-full grow  flex-col  flex justify-center items-center gap-5">
          <AuthHeader />
          <ForgetPasswordForm />
        </div>
        <AuthFooter />
      </AuthLayout>
    </>
  );
};

export default ForgetPasswordPage;
