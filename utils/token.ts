import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";

export function getRefetchtoken(ctx?: GetServerSidePropsContext): {
  refresh_token: string | null;
} {
  const cookies = parseCookies(ctx);
  const refresh_token = cookies.refresh_token;
  return { refresh_token };
}

export function getAccessToken(): { access_token: string | null } {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  return { access_token };
}
