import React, { useState } from "react";
import { SignInService } from "@/services";
import { setCookie } from "nookies";
import Link from "next/link";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../interfaces";
import { useRouter } from "next-nprogress-bar";
import { setAccessToken, setRefreshToken } from "../../utils";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Please wait...",
        text: "We are processing your request",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await SignInService({ email, password });

      setAccessToken({ access_token: response.accessToken });
      setRefreshToken({ refresh_token: response.refreshToken });

      Swal.fire({
        title: "Login Success!",
        text: "You are now logged in",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/");
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

  return (
    <form
      className="bg-white p-10 w-11/12 md:w-96 lg:w-4/12  rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
      onSubmit={handleLogin}
    >
      <h2 className="text-[24px] font-bold mb-[40px]">Log in</h2>

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
      />
      <Link
        href={"/auth/forget-password"}
        className="block text-left hover:underline text-[14px] text-[#6E6E6E] mb-[40px]"
      >
        Forget password?
      </Link>

      <button
        type="submit"
        className="w-full flex items-center justify-center h-5 p-5 bg-secondary-color text-white rounded-md font-semibold
           hover:bg-primary-color transition duration-300"
      >
        Log in
      </button>

      <Link
        href="/auth/sign-up"
        className=" h-5 p-5 ring-0 flex items-center justify-center mt-[20px] hover:ring-1
         hover:ring-primary-color rounded-md  text-[14px] text-[#6E6E6E]"
      >
        No Account ?
      </Link>
    </form>
  );
};
