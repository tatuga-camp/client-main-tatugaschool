import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

type ResponseUserService = {
    id: string;
    createAt: string;
    updateAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photo: string;
    role: string;
    createBySchoolId: string | null;
    isVerifyEmail: boolean;
    lastActiveAt: string;
    isResetPassword: boolean;
    provider: string;
    isDeleted: boolean;
    deleteAt: string | null;
  };

export async function UserService(): Promise<ResponseUserService> {
  try {
    const response = await axios({
      method: "GET",
      url: '/v1/users/me',
    });
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error.response.data);
    throw error?.response?.data;
  }
}