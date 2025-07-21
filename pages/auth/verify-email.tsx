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

const VerifyEmailPage = ({ token }: { token: string | null }) => {
  const router = useRouter();
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
        title: "Email Verified",
        text: "Your email has been verified successfully",
        icon: "success",
      });
      router.push("/");
    } catch (error) {
      setVerificationStatus("fail");
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F9] px-4 py-10">
        <AuthHeader />
        <div className="flex flex-col items-center text-center">
          {verificationStatus === "success" && (
            <>
              <h2 className="mb-4 text-5xl font-bold text-green-600">
                Your Email Has Been Verified
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                Please click the button below to sign in again.
              </p>
              <Link
                href={"/auth/sign-in"}
                className="rounded-lg bg-[#5F3DC4] p-4 font-semibold text-white transition duration-300 hover:bg-[#482ab4]"
              >
                Sign In
              </Link>
            </>
          )}
          {verificationStatus === "pending" && (
            <>
              <h2 className="mb-4 animate-pulse text-5xl font-bold text-blue-600">
                Verifying Your Email..
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                Please wait while we verify your email.
              </p>
            </>
          )}
          {verificationStatus === "no-token" && (
            <>
              <h2 className="mb-4 flex items-center justify-center gap-1 text-5xl font-bold text-red-600">
                No Token Found <FiXCircle />
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                Please resend the email again or contact admin.
              </p>
            </>
          )}

          {verificationStatus === "fail" && (
            <>
              <h2 className="mb-4 text-5xl font-bold text-red-500">
                Email Validation Fail
              </h2>
              <p className="mb-8 text-lg text-[#6E6E6E]">
                Please resend the email again or contact admin.
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
