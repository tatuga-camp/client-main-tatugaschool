import axios from "axios";
import { parseCookies } from "nookies";
import { User } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestSignInService = {
  email: string;
  password: string;
};

type ResponseSignInService = { access_token: string; user: User };

export async function SignInService(
  input: RequestSignInService
): Promise<ResponseSignInService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/auth/sign-in",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Sign-In request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestSignUpService = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  provider: string;
};

type ResponseSignUpService = User;
export async function SignUpService(
  input: RequestSignUpService
): Promise<ResponseSignUpService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/auth/sign-up",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Sign-Up request failed:", error.response.data);
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
    const response = await axios({
      method: "POST",
      url: "/v1/auth/verify-email",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Email Verification failed:", error.response.data);
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
    const response = await axios({
      method: "POST",
      url: "/v1/auth/forget-password",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Forgot Password request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestResetPasswordService = {
  token: string;
  password: string;
};

type ResponseResetPasswordService = {};

export async function ResetPasswordService(
  input: RequestResetPasswordService
): Promise<ResponseResetPasswordService> {
  try {
    const response = await axios({
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
  refreshToken: string;
};

export async function RefreshTokenService(
  input: RequestRefreshTokenService
): Promise<ResponseRefreshTokenService> {
  try {
    const response = await axios({
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

type RequestStudentRefetchTokenService = {
  refreshToken: string;
};

type ResponseStudentRefetchTokenService = {
  accessToken: string;
  refreshToken: string;
};

export async function StudentRefetchTokenService(
  input: RequestStudentRefetchTokenService
): Promise<ResponseStudentRefetchTokenService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/auth/student-refetch-token",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Student Refetch Token request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestStudentSignInService = {
  email: string;
  password: string;
};

type ResponseStudentSignInService = {
  accessToken: string;
  refreshToken: string;
};

export async function StudentSignInService(
  input: RequestStudentSignInService
): Promise<ResponseStudentSignInService> {
  try {
    const response = await axios({
      method: "POST",
      url: "/v1/auth/student-sign-in",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Student Sign-In request failed:", error.response.data);
    throw error?.response?.data;
  }
}
