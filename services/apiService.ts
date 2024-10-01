import axios from "axios";
import { parseCookies } from "nookies";

const createAxiosInstance = () => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  return instance;
};

export default createAxiosInstance;