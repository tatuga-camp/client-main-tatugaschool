import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";

export function getRefetchtoken(ctx?: GetServerSidePropsContext): {
  refresh_token: string | null;
} {
  const cookies = parseCookies(ctx);
  const refresh_token = cookies.refresh_token;
  return { refresh_token };
}

export function getAccesstoken(): { access_token: string | null } {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  return { access_token };
}

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
