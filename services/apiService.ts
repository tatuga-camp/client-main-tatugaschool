import axios from "axios";
import { parseCookies } from "nookies";

const createAxiosInstance = () => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const refresh_token = cookies.refresh_token;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  return instance;
};

const isTokenExpired = (token) => {
  if (!token) return true;

  const [, payload] = token.split(".");
  const decodedPayload = JSON.parse(atob(payload));
  const exp = decodedPayload.exp * 1000;

  return Date.now() >= exp;
};

export default createAxiosInstance;