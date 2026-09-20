import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthLayout } from "@/components/auth/AuthLayout";
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
      <AuthLayout contentClassName="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden pb-safe">
        <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
          <AuthBrandPanel />
          <div className="flex min-h-0 w-full flex-1 flex-col items-center px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:justify-center lg:px-10 lg:py-10 xl:px-12 2xl:px-16 2xl:py-12">
            <div className="my-auto flex w-full flex-col items-center">
              <LoginForm />
              <div className="w-full lg:hidden">
                <AuthFooter />
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
