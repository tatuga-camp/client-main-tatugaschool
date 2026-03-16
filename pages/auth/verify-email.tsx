// pages/verify-email.tsx
import { useEffect, useState } from "react";
import { VerifyEmailService } from "@/services"; // Import the service
import { AuthHeader } from "@/components/auth/AuthHeader";
import React from "react";
import { GetServerSideProps } from "next";
import { FiXCircle } from "react-icons/fi";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import Head from "next/head";
import { useGetLanguage } from "../../react-query";
import { verifyEmailLanguageData } from "../../data/languages";

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
      await VerifyEmailService({ token });
      setVerificationStatus("success");
      Swal.fire({
        title: verifyEmailLanguageData.swalSuccessTitle(language.data ?? "en"),
        text: verifyEmailLanguageData.swalSuccessText(language.data ?? "en"),
        icon: "success",
      });
      router.push("/");
    } catch (error) {
      setVerificationStatus("fail");
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error
          ? result.error
          : verifyEmailLanguageData.swalErrorTitle(language.data ?? "en"),
        text: result.message.toString(),
        footer: result.statusCode
          ? verifyEmailLanguageData.swalErrorCode(language.data ?? "en") +
            result.statusCode?.toString()
          : "",
        icon: "error",
      });
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
        <div className="flex flex-col items-center text-center">
          {verificationStatus === "success" && (
            <>
              <h2 className="mb-4 text-5xl font-bold text-green-600">
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
              <h2 className="mb-4 animate-pulse text-5xl font-bold text-blue-600">
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
              <h2 className="mb-4 flex items-center justify-center gap-1 text-5xl font-bold text-red-600">
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
              <h2 className="mb-4 text-5xl font-bold text-red-500">
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
