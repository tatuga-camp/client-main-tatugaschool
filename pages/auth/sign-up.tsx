import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignUpJourneyPanel } from "@/components/auth/SignUpJourneyPanel";
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
        <title>Create a Teacher Account - Tatuga School</title>
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
      <AuthLayout contentClassName="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden pb-safe">
        <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
          <SignUpJourneyPanel
            invitedSchool={data?.invitation?.schoolTitle ?? null}
          />
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center px-4 py-4 sm:px-6 sm:py-6 md:justify-center md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-16 2xl:py-12">
            <div className="my-auto flex w-full flex-col items-center md:my-0">
              <SignUpForm
                {...data?.googleSignUpData}
                invitation={data?.invitation ?? null}
                invitationError={data?.invitationError ?? null}
              />
              <div className="w-full md:hidden">
                <AuthFooter />
              </div>
            </div>
          </div>
        </div>
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
