import { SignInService } from "@/services";
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
      // setAccessToken({ access_token: response.accessToken });
      // setRefreshToken({ refresh_token: response.refreshToken });
      router.push(response.redirectUrl);
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
      className="bg-white p-10 w-96 
      rounded-lg shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
      onSubmit={handleLogin}
    >
      <h2 className="text-[24px] font-bold mb-[40px]">
        {signInData.title(language.data ?? "en")}
      </h2>
      {router.query?.error && (
        <span className="text-red-700 text-sm">
          Error: {router.query?.error}
        </span>
      )}
      <span className="text-gray-500 text-sm">
        ({signInData.teacherOnly(language.data ?? "en")})
      </span>

      <div className="flex flex-col gap-3  w-full">
        <input
          type="email"
          placeholder={signInData.inputEmail(language.data ?? "en")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="main-input w-full h-10"
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
        className="block text-left mt-2 hover:underline text-[14px] text-[#6E6E6E] mb-[40px]"
      >
        {signInData.forgetPassword(language.data ?? "en")}
      </Link>

      <div className="flex flex-col gap-3">
        <button type="submit" className="w-full main-button p-2">
          {signInData.loginButton(language.data ?? "en")}
        </button>
        <button
          onClick={handleGoogleLogin}
          className="second-button border gap-2 flex items-center justify-center"
        >
          <FcGoogle />
          {signInData.googleButton(language.data ?? "en")}
        </button>
        <Link href="/auth/sign-up" className="second-button border">
          {signInData.noAccountButton(language.data ?? "en")}
        </Link>
      </div>
    </form>
  );
};
