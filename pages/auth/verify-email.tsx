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

const VerifyEmailPage = ({ token }: { token: string | null }) => {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "fail" | "pending" | "no-token"
  >("no-token");

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F7F9] px-4 py-10">
      <AuthHeader />
      <div className="flex flex-col items-center text-center">
        {verificationStatus === "success" && (
          <>
            <h2 className="text-5xl font-bold text-green-600 mb-4">
              Your Email Has Been Verified
            </h2>
            <p className="text-[#6E6E6E] mb-8 text-lg">
              Please click the button below to sign in again.
            </p>
            <Link
              href={"/auth/sign-in"}
              className="p-4 bg-[#5F3DC4] text-white rounded-lg font-semibold hover:bg-[#482ab4] transition duration-300"
            >
              Sign In
            </Link>
          </>
        )}
        {verificationStatus === "pending" && (
          <>
            <h2 className="text-5xl animate-pulse font-bold text-blue-600 mb-4">
              Verifying Your Email..
            </h2>
            <p className="text-[#6E6E6E] mb-8 text-lg">
              Please wait while we verify your email.
            </p>
          </>
        )}
        {verificationStatus === "no-token" && (
          <>
            <h2 className="text-5xl font-bold flex items-center justify-center gap-1 text-red-600 mb-4">
              No Token Found <FiXCircle />
            </h2>
            <p className="text-[#6E6E6E] mb-8 text-lg">
              Please resend the email again or contact admin.
            </p>
          </>
        )}

        {verificationStatus === "fail" && (
          <>
            <h2 className="text-5xl font-bold text-red-500 mb-4">
              Email Validation Fail
            </h2>
            <p className="text-[#6E6E6E] mb-8 text-lg">
              Please resend the email again or contact admin.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // read params from ctx.query
  const { token } = ctx.query;
  return {
    props: {
      token: token,
    },
  };
};
