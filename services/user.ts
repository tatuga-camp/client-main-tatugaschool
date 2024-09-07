import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";
import { User } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type ResponseUserService = User;
export async function UserService(): Promise<ResponseUserService> {
  try {
    const response = await axios({
      method: "GET",
      url: "/v1/users/me",
    });
    return response.data;
  } catch (error: any) {
    console.error("User request failed:", error.response.data);
    throw error?.response?.data;
  }
}
