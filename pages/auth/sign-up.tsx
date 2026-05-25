import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Head from "next/head";
import { GetServerSideProps } from "next";
import axios from "axios";

type InvitationProps = {
  email: string;
  schoolTitle: string;
  schoolLogo: string;
  invitationToken: string;
} | null;

type Props = {
  googleSignUpData?: {
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
    photo: string;
    provider: "google";
  } | null;
  invitation?: InvitationProps;
  invitationError?: string | null;
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
        <SignUpForm
          {...data?.googleSignUpData}
          invitation={data?.invitation ?? null}
          invitationError={data?.invitationError ?? null}
        />
        <AuthFooter />
      </AuthLayout>
    </>
  );
}

export default SignUpPage;

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const query = ctx.query as {
    email?: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
    providerId?: string;
    provider?: "google";
    invitationToken?: string;
  };

  let invitation: InvitationProps = null;
  let invitationError: string | null = null;

  if (query.invitationToken) {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const res = await axios.get(
        `${serverUrl}/v1/member-on-schools/invitation/${query.invitationToken}`,
      );
      invitation = {
        email: res.data.email,
        schoolTitle: res.data.schoolTitle,
        schoolLogo: res.data.schoolLogo,
        invitationToken: query.invitationToken,
      };
    } catch (e: any) {
      invitationError =
        e?.response?.data?.message ?? "Invitation could not be loaded";
    }
  }

  const googleSignUpData = query.provider
    ? {
        email: query.email as string,
        firstName: query.firstName as string,
        lastName: query.lastName as string,
        photo: query.photo as string,
        providerId: query.providerId as string,
        provider: query.provider,
      }
    : null;

  return {
    props: {
      googleSignUpData,
      invitation,
      invitationError,
    },
  };
};
