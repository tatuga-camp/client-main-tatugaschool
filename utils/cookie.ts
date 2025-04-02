import { destroyCookie, setCookie } from "nookies";

export function setAccessToken({ access_token }: { access_token: string }) {
  setCookie(null, "access_token", access_token, {
    path: "/",
    maxAge: 5 * 24 * 60 * 60,
  });
  return { access_token };
}

export function setRefreshToken({ refresh_token }: { refresh_token: string }) {
  setCookie(null, "refresh_token", refresh_token, {
    path: "/",
    maxAge: 5 * 24 * 60 * 60,
  });

  return { refresh_token };
}

export function removeAccessToken() {
  destroyCookie(null, "access_token");
}

export function removeRefreshToken() {
  destroyCookie(null, "refresh_token");
}
