import axios from "axios";
import { RefreshTokenService } from "./auth";
import {
  getRefetchtoken,
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
} from "../utils";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 1000 * 60 * 10,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
      const request = config.url;

      // Bypass auth service endpoints
      if (request?.startsWith("/v1/auth/")) {
        return config;
      }

      const { refresh_token } = getRefetchtoken();

      // Check if refresh token is missing or expired
      if (
        !refresh_token ||
        (typeof window !== "undefined" && isTokenExpired(refresh_token))
      ) {
        console.log("Redirect to login: Refresh token missing or expired");
        removeAccessToken();
        removeRefreshToken();
        if (typeof window !== "undefined") {
          const returnUrl = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.href = `/auth/sign-in?returnUrl=${returnUrl}`;
        }
        throw new axios.Cancel("Session expired");
      }

      let { access_token } = getAccessToken();

      // Check if access token is missing or expired
      if (!access_token || isTokenExpired(access_token)) {
        try {
          const { accessToken } = await RefreshTokenService({
            refreshToken: refresh_token,
          });

          // Set the new access token in cookie
          setAccessToken({ access_token: accessToken });
          access_token = accessToken;
        } catch (error) {
          console.log("Refresh token failed", error);
          removeAccessToken();
          removeRefreshToken();
          if (typeof window !== "undefined") {
            const returnUrl = encodeURIComponent(
              window.location.pathname + window.location.search,
            );
            window.location.href = `/auth/sign-in?returnUrl=${returnUrl}`;
          }
          throw error;
        }
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
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = getRefetchtoken();
        if (!refresh_token) {
          throw new Error("Token not found");
        }
        try {
          const { accessToken } = await RefreshTokenService({
            refreshToken: refresh_token,
          });

          setAccessToken({ access_token: accessToken });

          instance.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return instance(originalRequest);
        } catch (refreshError) {
          console.log("refreshError", refreshError);
          removeAccessToken();
          removeRefreshToken();
          if (typeof window !== "undefined") {
            const returnUrl = encodeURIComponent(
              window.location.pathname + window.location.search,
            );
            window.location.href = `/auth/sign-in?returnUrl=${returnUrl}`;
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
