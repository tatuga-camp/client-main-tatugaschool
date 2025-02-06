import React from "react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthFooter } from "../../components/auth/AuthFooter";
import { GetServerSideProps } from "next";
import {
  useGetNoVerifyUser,
  useResendVerifyEmail,
  useUpdateUser,
} from "../../react-query";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../interfaces";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
  return (
    <AuthLayout>
      <div className="w-full  flex-col grow  flex justify-center items-center gap-5">
        <AuthHeader />
        <div className="w-full md:w-8/12 xl:w-4/12 h-max rounded-md text-center bg-white p-3">
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
                className="main-input w-full h-10 mt-5"
              />
              <button
                disabled={updateUser.isPending}
                className="w-full flex items-center justify-center mt-2 p-2 main-button"
              >
                {updateUser.isPending ? <LoadingSpinner /> : "Update Email"}
              </button>

              <button
                type="button"
                onClick={() => setTriggerUpdate(false)}
                className="text-xs hover:underline mt-2 text-gray-600"
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
              <p className="text-sm text-center pb-5">
                We have sent a verification link to your email address. Please
                check your email and click on the link to verify your email
                address.
              </p>

              <button
                disabled={resend.isPending}
                onClick={handleResend}
                className="w-full flex items-center justify-center p-2 main-button"
              >
                {resend.isPending ? (
                  <LoadingSpinner />
                ) : (
                  "Resend Verification Email"
                )}
              </button>
              <button
                onClick={() => setTriggerUpdate(true)}
                className="text-xs hover:underline mt-2 text-gray-600"
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
