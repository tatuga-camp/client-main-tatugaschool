import axios from "axios";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { User } from "../interfaces";
import { RefreshTokenService } from "../services/auth";
import { getRefetchtoken } from "./token";

const redirectHome = {
  redirect: { destination: "/", permanent: false },
} as const;

/**
 * getServerSideProps body for admin-only pages: refreshes the access token
 * from the refresh cookie, loads /v1/users/me and redirects to "/" unless
 * the user has role ADMIN. Import from "utils/requireAdmin" directly.
 */
export async function requireAdmin(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ user: User }>> {
  const { refresh_token } = getRefetchtoken(context);
  if (!refresh_token) return redirectHome;

  try {
    const access_token = await RefreshTokenService({
      refreshToken: refresh_token,
    });
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/users/me`,
      { headers: { Authorization: `Bearer ${access_token.accessToken}` } },
    );
    if (user.data.role !== "ADMIN") return redirectHome;
    return { props: { user: user.data } };
  } catch {
    return redirectHome;
  }
}
