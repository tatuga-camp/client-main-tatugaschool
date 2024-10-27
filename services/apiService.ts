import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { RefreshTokenService } from "./auth";
import { setAccessToken, getRefetchtoken, getAccessToken } from "../utils";

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const { access_token } = getAccessToken();
      if (access_token && !isTokenExpired(access_token)) {
        config.headers.set("Authorization", `Bearer ${access_token}`);
        return config;
      }

      const { refresh_token } = getRefetchtoken();
      if (refresh_token) {
        try {
          const { accessToken } = await RefreshTokenService({ refreshToken: refresh_token });
          setAccessToken({ access_token: accessToken });
          config.headers.set("Authorization", `Bearer ${accessToken}`);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          // Consider redirecting to login here
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/sign-in';
          }
          return Promise.reject(error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = getRefetchtoken();
        if (!refresh_token) {
          throw new Error("Refresh token not found");
        }
        try {
          const { accessToken } = await RefreshTokenService({ refreshToken: refresh_token });
          setAccessToken({ access_token: accessToken });
          instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          // Consider redirecting to login here
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/sign-in';
          }
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(atob(payload));
    const exp = decodedPayload.exp * 1000;

    return Date.now() >= exp;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export default createAxiosInstance;
