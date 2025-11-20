import axios from "axios";
import { RefreshTokenService } from "./auth";
import {
  getRefetchtoken,
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
} from "../utils";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 1000 * 60 * 10,
    withCredentials: true,
  });
  instance.interceptors.request.use(
    (config) => {
      const { access_token } = getAccessToken();
      const { refresh_token } = getRefetchtoken();
      const request = config.url;
      // Redirect to login if access token is not found and the request is not sign-in
      if (
        (!access_token || !refresh_token) &&
        typeof window !== "undefined" &&
        !request?.startsWith("/v1/auth/")
      ) {
        console.log("redirect to login 1");
        window.location.href = "/auth/sign-in";
        return config;
      }

      // Redirect to login if access token is expired and the request is not sign-in
      if (
        refresh_token &&
        isTokenExpired(refresh_token) &&
        typeof window !== "undefined" &&
        !request?.startsWith("/v1/auth/")
      ) {
        console.log("redirect to login 1");
        window.location.href = "/auth/sign-in";
        return config;
      }

      // Add access token to the header
      if (access_token) {
        config.headers["Authorization"] = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = getRefetchtoken();
        if (!refresh_token) {
          // redirect to login
          throw new Error("Token not found");
        }
        try {
          const { accessToken } = await RefreshTokenService({
            refreshToken: refresh_token,
          });
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          instance.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.log("refreshError", refreshError);
          removeAccessToken();
          removeRefreshToken();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const isTokenExpired = (token: string) => {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    // Use Buffer for server-side or window.atob for client-side
    const decodedString =
      typeof window !== "undefined"
        ? window.atob(payload)
        : Buffer.from(payload, "base64").toString();

    const decodedPayload = JSON.parse(decodedString);
    const exp = decodedPayload.exp;

    // Optional: Add a 10-second buffer to prevent clock skew issues
    // if you really want to keep the client-side check.
    return Math.floor(Date.now() / 1000) >= exp;
  } catch (error) {
    console.log("error decoding token", error);
    return true; // Assume expired if we can't decode
  }
};
export default createAxiosInstance;
