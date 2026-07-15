// pages/verify-email.tsx
import { AuthHeader } from "@/components/auth/AuthHeader";
import { VerifyEmailService } from "@/services"; // Import the service
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiXCircle } from "react-icons/fi";
import { verifyEmailLanguageData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { useRouter } from "next/router";

const VerifyEmailPage = ({ token }: { token: string | null }) => {
  const router = useRouter();
  const language = useGetLanguage();
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "fail" | "pending" | "no-token"
  >("pending");

  useEffect(() => {
    if (token) {
      verifyEmail(token as string);
    } else {
      setVerificationStatus("no-token");
    }
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      setVerificationStatus("pending");
      const school = await VerifyEmailService({ token });

      setVerificationStatus("success");
      console.log("school", school);
      if (school && school.id) {
        router.push(`/school/${school.id}/`);
      }
    } catch (error) {
      setVerificationStatus("fail");
    }
  };

  return (
    <>
      <Head>
        <title>
          {verifyEmailLanguageData.headTitle(language.data ?? "en")}
        </title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F9] px-4 py-10">
        <AuthHeader />
        <div className="mt-5 flex flex-col items-center text-center">
          {verificationStatus === "success" && (
            <>
              <h2 className="mb-4 text-3xl font-bold text-green-600 md:text-5xl">
                {verifyEmailLanguageData.successTitle(language.data ?? "en")}
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                {verifyEmailLanguageData.successDescription(
                  language.data ?? "en",
                )}
              </p>
              <Link
                href={"/auth/sign-in"}
                className="rounded-2xl bg-[#5F3DC4] p-4 font-semibold text-white transition duration-300 hover:bg-[#482ab4]"
              >
                {verifyEmailLanguageData.signInButton(language.data ?? "en")}
              </Link>
            </>
          )}
          {verificationStatus === "pending" && (
            <>
              <h2 className="mb-4 animate-pulse text-3xl font-bold text-blue-600 md:text-5xl">
                {verifyEmailLanguageData.pendingTitle(language.data ?? "en")}
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                {verifyEmailLanguageData.pendingDescription(
                  language.data ?? "en",
                )}
              </p>
            </>
          )}
          {verificationStatus === "no-token" && (
            <>
              <h2 className="mb-4 flex items-center justify-center gap-1 text-3xl font-bold text-red-600 md:text-5xl">
                {verifyEmailLanguageData.noTokenTitle(language.data ?? "en")}{" "}
                <FiXCircle />
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                {verifyEmailLanguageData.errorDescription(
                  language.data ?? "en",
                )}
              </p>
            </>
          )}

          {verificationStatus === "fail" && (
            <>
              <h2 className="mb-4 text-3xl font-bold text-red-500 md:text-5xl">
                {verifyEmailLanguageData.failTitle(language.data ?? "en")}
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                {verifyEmailLanguageData.errorDescription(
                  language.data ?? "en",
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // read params from ctx.query
  const { token } = ctx.query;
  return {
    props: {
      token: token ?? null,
    },
  };
};
