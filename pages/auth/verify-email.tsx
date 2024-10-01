// pages/verify-email.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { VerifyEmailService } from "@/services"; // Import the service
import { AuthHeader } from "@/components/auth/AuthHeader";
import React from "react";
import { AuthFooter } from "@/components/auth/AuthFooter";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { token } = router.query; // Get token from URL query
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "fail" | null
  >(null);

  useEffect(() => {
    if (token) {
      verifyEmail(token as string);
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      await VerifyEmailService({ token });
      setVerificationStatus("success");
    } catch (error) {
      setVerificationStatus("fail");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F7F9] px-4 py-10">
      <AuthHeader />
      <div className="flex flex-col items-center text-center">
        {verificationStatus === "success" && (
          <>
            <h2 className="text-5xl font-bold text-[#4CAF50] mb-4">
              Your Email Has Been Verified
            </h2>
            <p className="text-[#6E6E6E] mb-8 text-lg">
              Please click the button below to sign in again.
            </p>
            <button
              className="p-4 bg-[#5F3DC4] text-white rounded-lg font-semibold hover:bg-[#482ab4] transition duration-300"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </button>
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
