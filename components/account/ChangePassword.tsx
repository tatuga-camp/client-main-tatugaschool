import React from "react";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import {
  RequestUpdatePasswordService,
  UpdatePasswordService,
} from "../../services";
import { useMutation } from "@tanstack/react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import Password from "../common/Password";
import { useGetLanguage, useGetUser } from "../../react-query";
import { FcGoogle } from "react-icons/fc";
import { accountDataLanguage, requestData } from "../../data/languages";

function ChangePassword() {
  const language = useGetLanguage();
  const user = useGetUser();
  const [formData, setFormData] = React.useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>();

  const updatePassword = useMutation({
    mutationFn: (input: RequestUpdatePasswordService) =>
      UpdatePasswordService(input),
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (
        !formData?.currentPassword ||
        !formData?.newPassword ||
        !formData?.confirmNewPassword
      ) {
        throw new Error("Please fill all fields");
      }
      if (formData?.newPassword !== formData?.confirmNewPassword) {
        throw new Error(
          accountDataLanguage.errorUpdatePassword(language.data ?? "en")
        );
      }
      await updatePassword.mutateAsync({
        currentPassword: formData?.currentPassword,
        newPassword: formData?.newPassword,
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      Swal.fire({
        title: requestData.successTitle(language.data ?? "en"),
        text: accountDataLanguage.successUpdatePassword(language.data ?? "en"),
        icon: "success",
      });
    } catch (error) {
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

  if (user.data?.provider === "GOOGLE") {
    return (
      <div className="second-button border gap-2 flex items-center justify-center">
        <FcGoogle />
        {accountDataLanguage.googlePassword(language.data ?? "en")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSummit} className="flex flex-col gap-2">
      <label className=" flex flex-col gap-1 w-full items-start">
        <span className="text-sm">
          {accountDataLanguage.currentPassword(language.data ?? "en")}
        </span>
        <Password
          placeholder={accountDataLanguage.currentPassword(
            language.data ?? "en"
          )}
          value={formData?.currentPassword}
          onChange={handleChange}
          name="currentPassword"
          toggleMask
        />
      </label>

      <label className=" flex flex-col gap-1 items-start">
        <span className="text-sm">
          {accountDataLanguage.newPassword(language.data ?? "en")}
        </span>
        <Password
          placeholder={accountDataLanguage.newPassword(language.data ?? "en")}
          value={formData?.newPassword}
          onChange={handleChange}
          name="newPassword"
          toggleMask
        />
      </label>
      <label className=" flex flex-col gap-1 items-start">
        <span className="text-sm">
          {accountDataLanguage.newConfirmPassword(language.data ?? "en")}
        </span>
        <Password
          value={formData?.confirmNewPassword}
          onChange={handleChange}
          name="confirmNewPassword"
          placeholder={accountDataLanguage.newConfirmPassword(
            language.data ?? "en"
          )}
          toggleMask
        />
      </label>
      {updatePassword.isPending ? (
        <div className="w-40 flex items-center">
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="w-5 h-5"
            strokeWidth="8"
          />
        </div>
      ) : (
        <button type="submit" className="w-40 main-button">
          {accountDataLanguage.buttonPassword(language.data ?? "en")}{" "}
        </button>
      )}
    </form>
  );
}

export default ChangePassword;
