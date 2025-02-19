import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Head from "next/head";

function SignUpPage() {
  return (
    <>
      <Head>
        <title>Create Teacher Account</title>
        <meta
          name="description"
          content="Create Teacher Account To Join Tatuga School"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tatuga School" />
        <meta
          property="og:description"
          content="Create Teacher Account To Join Tatuga School"
        />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />

        <meta property="twitter:title" content="Tatuga School" />
        <meta
          property="twitter:description"
          content="Create Teacher Account To Join Tatuga School"
        />

        <meta property="twitter:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <AuthLayout>
        <AuthHeader />
        <SignUpForm />
        <AuthFooter />
      </AuthLayout>
    </>
  );
}

export default SignUpPage;
