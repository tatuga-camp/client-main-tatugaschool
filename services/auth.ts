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
    const response = await axios.post("/v1/auth/sign-in", { ...input });
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

type ResponseSignUpService = {
  id: string;
  createAt: string;
  updateAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isVerifyEmail: boolean;
  verifyEmailToken?: string;
  verifyEmailTokenExpiresAt?: string;
  lastActiveAt: string;
  isResetPassword: boolean;
  provider: string;
  deleteAt?: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiresAt?: string;
};

export async function SignUpService(
  input: RequestSignUpService
): Promise<ResponseSignUpService> {
  try {
    const response = await axios.post("/v1/auth/sign-up", { ...input });
    return response.data;
  } catch (error: any) {
    console.error("Sign-Up request failed:", error.response.data);
    throw error?.response?.data;
  }
}


type ResponseGoogleAuthService = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
};

export async function GoogleAuthService(): Promise<ResponseGoogleAuthService> {
  try {
    const response = await axios.get("/v1/auth/google");
    return response.data;
  } catch (error: any) {
    console.error("Google Auth failed:", error.response.data);
    throw error?.response?.data;
  }
}


type ResponseGoogleRedirectService = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
};

export async function GoogleRedirectService(): Promise<ResponseGoogleRedirectService> {
  try {
    const response = await axios.get("/v1/auth/google/redirect");
    return response.data;
  } catch (error: any) {
    console.error("Google Redirect failed:", error.response.data);
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
    const response = await axios.post("/v1/auth/verify-email", { ...input });
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
    const response = await axios.post("/v1/auth/forget-password", { ...input });
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
    const response = await axios.patch("/v1/auth/reset-password", { ...input });
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
    const response = await axios.post("/v1/auth/refresh-token", { ...input });
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
    const response = await axios.post("/v1/auth/student-refetch-token", {
      ...input,
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
    const response = await axios.post("/v1/auth/student-sign-in", { ...input });
    return response.data;
  } catch (error: any) {
    console.error("Student Sign-In request failed:", error.response.data);
    throw error?.response?.data;
  }
}
