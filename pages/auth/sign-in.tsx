import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import Head from "next/head";

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Sign In - Teachers</title>
        <meta
          name="description"
          content="Sign In To Tatuga School For Only Teacher!"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tatuga School" />
        <meta
          property="og:description"
          content="Sign In To Tatuga School For Only Teacher!"
        />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />

        <meta property="twitter:title" content="Tatuga School" />
        <meta
          property="twitter:description"
          content="Sign In To Tatuga School For Only Teacher!"
        />

        <meta property="twitter:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <AuthLayout>
        <div className="w-full  flex-col  flex justify-center items-center gap-5">
          <AuthHeader />
          <LoginForm />
        </div>
        <AuthFooter />
      </AuthLayout>
    </>
  );
};

export default LoginPage;
