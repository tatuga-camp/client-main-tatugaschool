
import { User } from "../interfaces";


import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type ResponseUserService = User;
export async function UserService(): Promise<ResponseUserService> {
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

type RequestUpdateUserService = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photo?: string;
};
type ResponseUserService = User;
export async function UpdateUserService(
  input: RequestUpdateUserService
): Promise<ResponseUserService> {
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
