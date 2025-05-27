import { User } from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export async function GetUserService(): Promise<User> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/users/me",
    });
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export async function GetNoVerifyUserService(): Promise<User> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/users/noverify-user",
    });
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export async function ResendVerifiyEmail(): Promise<User> {
  try {
    const response = await axiosInstance({
      method: "post",
      url: "/v1/users/resend-verify-email",
    });
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw error?.response?.data;
  }
}
export type RequestGetUserByEmailService = {
  email: string;
};
export async function GetUserByEmailService(
  input: RequestGetUserByEmailService,
): Promise<User[]> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/users",
      params: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateUserService = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photo?: string;
  blurHash?: string;
};
export async function UpdateUserService(
  input: RequestUpdateUserService,
): Promise<User> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/users",
      data: { ...input },
    });
    console.info("User updated successfully:", response?.data);
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdatePasswordService = {
  currentPassword: string;
  newPassword: string;
};
export async function UpdatePasswordService(
  input: RequestUpdatePasswordService,
): Promise<User> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/users/password",
      data: { ...input },
    });

    console.info("User updated successfully:", response?.data);
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
