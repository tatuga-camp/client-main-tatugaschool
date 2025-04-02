import { useRouter } from "next/router";
import { User } from "../interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestSignInService = {
  email: string;
  password: string;
};

type ResponseSignInService = {
  redirectUrl: string;
  refreshToken: string;
  accessToken: string;
};

export async function SignInService(
  input: RequestSignInService
): Promise<ResponseSignInService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/sign-in",
      withCredentials: true, // Ensure this is included
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    console.error("Sign-In request failed:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestSignUpService = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  provider: "LOCAL" | "GOOGLE";
  providerId?: string;
  photo?: string;
};

type ResponseSignUpService = { redirectUrl: string };
export async function SignUpService(
  input: RequestSignUpService
): Promise<ResponseSignUpService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/sign-up",
      withCredentials: true, // Ensure this is included
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    console.error("Sign-Up request failed:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestVerifyEmailService = {
  token: string;
};

type ResponseVerifyEmailService = {};

export async function VerifyEmailService(
  input: RequestVerifyEmailService
): Promise<ResponseVerifyEmailService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/verify-email",

      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    console.error("Email Verification failed:", error.response?.data);
    throw error?.response?.data;
  }
}

type RequestForgotPasswordService = {
  email: string;
};

type ResponseForgotPasswordService = {};

export async function ForgotPasswordService(
  input: RequestForgotPasswordService
): Promise<ResponseForgotPasswordService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/forgot-password",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Forgot Password request failed:", error.response?.data);
    throw error?.response?.data;
  }
}

export type RequestResetPasswordService = {
  token: string;
  password: string;
};

type ResponseResetPasswordService = {};

export async function ResetPasswordService(
  input: RequestResetPasswordService
): Promise<ResponseResetPasswordService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/auth/reset-password",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Password Reset request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestRefreshTokenService = {
  refreshToken: string;
};

type ResponseRefreshTokenService = {
  accessToken: string;
};

export async function RefreshTokenService(
  input: RequestRefreshTokenService
): Promise<ResponseRefreshTokenService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/auth/refresh-token",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Refresh Token request failed:", error.response.data);
    throw error?.response?.data;
  }
}
