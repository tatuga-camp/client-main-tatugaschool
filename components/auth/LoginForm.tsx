import { GetUserService, SignInService } from "@/services";
import Link from "next/link";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../interfaces";
import Password from "../common/Password";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/router";
import { useGetLanguage } from "../../react-query";
import { requestData, signInData } from "../../data/languages";
import { setAccessToken, setRefreshToken } from "../../utils";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const language = useGetLanguage();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: requestData.loadingTitle(language.data ?? "en"),
        text: requestData.loadingDescription(language.data ?? "en"),
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await SignInService({ email, password });
      const user = await GetUserService();
      // server already set cookie
      // setAccessToken({ access_token: response.accessToken });
      // setRefreshToken({ refresh_token: response.refreshToken });
      const returnUrl = router.query.returnUrl as string;
      router.push(
        returnUrl
          ? returnUrl
          : user.favoritSchool
            ? `/school/${user.favoritSchool}`
            : response.redirectUrl,
      );
      Swal.fire({
        title: requestData.successTitle(language.data ?? "en"),
        text: requestData.successDesciption(language.data ?? "en"),
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
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

  const handleGoogleLogin = async () => {
    try {
      Swal.fire({
        title: requestData.loadingTitle(language.data ?? "en"),
        text: requestData.loadingDescription(language.data ?? "en"),
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      if (router.query.returnUrl) {
        localStorage.setItem("returnUrl", router.query.returnUrl as string);
      }

      router.push(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/auth/google`);
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
    <form
      className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-[0_12px_24px_rgba(145,158,171,0.12)] sm:max-w-md sm:p-8 md:max-w-full md:p-8 lg:max-w-md lg:p-10 xl:max-w-lg xl:p-10 2xl:max-w-xl 2xl:p-12"
      onSubmit={handleLogin}
    >
      <h2 className="mb-6 text-2xl font-bold md:mb-8 xl:text-[28px] 2xl:mb-10 2xl:text-3xl">
        {signInData.title(language.data ?? "en")}
      </h2>

      <span className="text-sm text-gray-500">
        ({signInData.teacherOnly(language.data ?? "en")})
      </span>

      <div className="flex w-full flex-col gap-3 md:gap-4">
        <input
          type="email"
          placeholder={signInData.inputEmail(language.data ?? "en")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="main-input min-h-11 w-full"
        />
        <Password
          feedback={false}
          toggleMask={true}
          value={password}
          placeholder={signInData.inputPassword(language.data ?? "en")}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Link
        href={"/auth/forget-password"}
        className="mb-6 mt-2 block text-left text-sm text-gray-500 hover:underline md:mb-8 2xl:mb-10"
      >
        {signInData.forgetPassword(language.data ?? "en")}
      </Link>
      {router.query?.error && (
        <span className="text-sm text-red-700">
          Error: {router.query?.error}
        </span>
      )}
      <div className="flex flex-col gap-3">
        <button type="submit" className="main-button min-h-11 w-full p-2">
          {signInData.loginButton(language.data ?? "en")}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="second-button flex min-h-11 items-center justify-center gap-2 border"
        >
          <FcGoogle />
          {signInData.googleButton(language.data ?? "en")}
        </button>
        <Link
          href="/auth/sign-up"
          className="second-button flex min-h-11 items-center justify-center border"
        >
          {signInData.noAccountButton(language.data ?? "en")}
        </Link>
      </div>
    </form>
  );
};
