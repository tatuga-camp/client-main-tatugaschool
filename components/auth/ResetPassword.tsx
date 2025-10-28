import React from "react";
import Password from "../common/Password";
import { useResetPassword } from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import LoadingSpinner from "../common/LoadingSpinner";

function ResetPassword({ token }: { token: string }) {
  const resetPassword = useResetPassword();
  const router = useRouter();
  const [formData, setFormData] = React.useState<{
    newPassword?: string;
    confirmNewPassword?: string;
  }>();

  const handleSummit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formData?.newPassword || !formData?.confirmNewPassword) {
        throw new Error("Please fill all fields");
      }
      if (formData?.newPassword !== formData?.confirmNewPassword) {
        throw new Error(
          "New Password and Confirm New Password must be the same",
        );
      }
      await resetPassword.mutateAsync({
        password: formData?.newPassword,
        token,
      });
      setFormData({
        newPassword: "",
        confirmNewPassword: "",
      });

      router.push("/auth/sign-in");
      Swal.fire({
        title: "Success",
        text: "Password Updated Successfully",
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

  return (
    <div className="flex h-60 w-96 flex-col items-center justify-start gap-2 rounded-2xl bg-white p-4 md:w-5/12">
      <h2 className="text-xl font-semibold">Reset Password</h2>

      <p className="text-center text-sm">
        Enter New Password and Confirm Password
      </p>
      <form onSubmit={handleSummit} className="flex w-96 flex-col gap-2">
        <Password
          feedback={false}
          toggleMask={true}
          value={formData?.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          placeholder="New Password"
        />
        <Password
          feedback={false}
          toggleMask={true}
          value={formData?.confirmNewPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmNewPassword: e.target.value })
          }
          placeholder="Confirm Password"
        />
        <button
          type="submit"
          disabled={resetPassword.isPending}
          className="main-button w-full p-2"
        >
          {resetPassword.isPending ? <LoadingSpinner /> : "Confirm"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
