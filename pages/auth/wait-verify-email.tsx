import React from "react";
import Swal from "sweetalert2";
import { AuthFooter } from "../../components/auth/AuthFooter";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthLayout } from "../../components/auth/AuthLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ErrorMessages } from "../../interfaces";
import {
  useGetNoVerifyUser,
  useResendVerifyEmail,
  useUpdateUser,
} from "../../react-query";
import ButtonProfile from "../../components/button/ButtonProfile";
import Link from "next/link";

function Index() {
  const user = useGetNoVerifyUser();
  const resend = useResendVerifyEmail();
  const updateUser = useUpdateUser();
  const [triggerUpdate, setTriggerUpdate] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const handleResend = async () => {
    try {
      await resend.mutateAsync();
      Swal.fire({
        title: "Success",
        text: "Verification Email Sent",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ email });
      Swal.fire({
        title: "Success",
        text: "Email Updated Successfully",
        icon: "success",
      });
      setEmail("");
      setTriggerUpdate(false);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  if (user.data?.isVerifyEmail === true) {
    return (
      <AuthLayout>
        <div className="flex w-full grow flex-col items-center justify-center gap-5">
          <AuthHeader />
          <div className="h-max w-full rounded-md bg-white p-3 text-center md:w-8/12 xl:w-4/12">
            Your Account Email has already been verified
          </div>
          <Link
            href={"/"}
            className="rounded-lg bg-[#5F3DC4] p-4 font-semibold text-white transition duration-300 hover:bg-[#482ab4]"
          >
            Enter Dashboard
          </Link>
        </div>
        <AuthFooter />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout>
      <div className="flex w-full grow flex-col items-center justify-center gap-5">
        <AuthHeader />
        <div className="flex h-max w-full flex-col items-center justify-center rounded-md bg-white p-3 text-center md:w-8/12 xl:w-4/12">
          <ButtonProfile user={user} />

          {triggerUpdate ? (
            <form onSubmit={handleUpdateEmail}>
              <h2 className="text-xl font-semibold">
                Update Your Email Address
              </h2>
              <span className="text-sm text-gray-600">
                after updating your email address, we will send a verification
                link to your new email address
              </span>

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="main-input mt-5 h-10 w-full"
              />
              <button
                disabled={updateUser.isPending}
                className="main-button mt-2 flex w-full items-center justify-center p-2"
              >
                {updateUser.isPending ? <LoadingSpinner /> : "Update Email"}
              </button>

              <button
                type="button"
                onClick={() => setTriggerUpdate(false)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                Back to Verify Email
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                Please Verify Your Email
              </h2>
              <span className="text-sm text-gray-600">
                ({user.data?.email})
              </span>
              <p className="pb-5 text-center text-sm">
                We have sent a verification link to your email address. Please
                check your email and click on the link to verify your email
                address.
              </p>

              <button
                disabled={resend.isPending}
                onClick={handleResend}
                className="main-button flex w-full items-center justify-center p-2"
              >
                {resend.isPending ? (
                  <LoadingSpinner />
                ) : (
                  "Resend Verification Email"
                )}
              </button>
              <button
                onClick={() => setTriggerUpdate(true)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                Want to change your email address?
              </button>
            </>
          )}
        </div>
      </div>
      <AuthFooter />
    </AuthLayout>
  );
}

export default Index;
