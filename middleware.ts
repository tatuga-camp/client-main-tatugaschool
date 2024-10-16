import { NextRequest, NextResponse } from "next/server";
import { RefreshTokenService } from "./services";
import { setCookie } from "nookies";

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token");
 
  if (
    req.nextUrl.pathname === "/auth/login" ||
    req.nextUrl.pathname === "/auth/signup"
  ) {
    if (refreshToken) {
      const homeUrl = `${req.nextUrl.origin}/`;
      return NextResponse.redirect(homeUrl);
    } else {
      return NextResponse.next();
    }
  }

  if (!refreshToken) {
    const loginUrl = `${req.nextUrl.origin}/auth/login`;
    return NextResponse.redirect(loginUrl);
  }

  try {
    const newTokens = await RefreshTokenService({
      refreshToken: refreshToken.value,
    });

    const response = NextResponse.next();
    setCookie({ res: response }, "access_token", newTokens.accessToken);
    setCookie({ res: response }, "refresh_token", newTokens.refreshToken);
    return response;
  } catch (error) {
    const loginUrl = `${req.nextUrl.origin}/auth/login`;
    return NextResponse.redirect(loginUrl);
  }

}

export const config = {
  matcher: ["/", "/auth/login", "/auth/signup", "/school/:path*", ],
};
