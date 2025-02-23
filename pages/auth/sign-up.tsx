import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Head from "next/head";
import { GetServerSideProps } from "next";

type Props = {
  googleSignUpData?: {
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
    photo: string;
    provider: "google";
  } | null;
};
function SignUpPage(data: Props) {
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
        <SignUpForm {...data?.googleSignUpData} />
        <AuthFooter />
      </AuthLayout>
    </>
  );
}

export default SignUpPage;

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const query = ctx.query as {
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
    providerId: string;
    provider: "google";
  };

  if (!query.provider) {
    return {
      props: {
        googleSignUpData: null,
      },
    };
  }

  return {
    props: {
      googleSignUpData: {
        email: query.email,
        firstName: query.firstName,
        lastName: query.lastName,
        photo: query.photo,
        providerId: query.providerId,
        provider: query.provider,
      },
    },
  };
};
