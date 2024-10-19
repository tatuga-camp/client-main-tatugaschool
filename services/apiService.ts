import axios from "axios";
import { RefreshTokenService } from "./auth";
import { setAccessToken, useAccesstoken, useRefetchtoken } from "../hooks";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
  });
  instance.interceptors.request.use(
    (config) => {
      const { access_token } = useAccesstoken();
      if (access_token) {
        config.headers["Authorization"] = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = useRefetchtoken();
        if (!refresh_token) {
          // redirect to login
          throw new Error("Token not found");
        }
        try {
          const { accessToken } = await RefreshTokenService({
            refreshToken: refresh_token,
          });
          setAccessToken({ access_token: accessToken });
          instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Handle token refresh error (e.g., redirect to login)
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const isTokenExpired = (token: string) => {
  if (!token) return true;

  const [, payload] = token.split(".");
  const decodedPayload = JSON.parse(atob(payload));
  const exp = decodedPayload.exp * 1000;

  return Date.now() >= exp;
};

export default createAxiosInstance;
