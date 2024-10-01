import { NextRequest, NextResponse } from "next/server";
import { RefreshTokenService } from "./services";
import { setCookie } from "nookies";

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token");
  
  if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
    if (refreshToken) {
      const homeUrl = `${req.nextUrl.origin}/`;
      return NextResponse.redirect(homeUrl);
    } else {
      return NextResponse.next();
    }
  }

  if (!refreshToken) {
    const loginUrl = `${req.nextUrl.origin}/login`;
    return NextResponse.redirect(loginUrl);
  }

  if (refreshToken) {
    try {
      const newTokens = await RefreshTokenService({
        refreshToken: refreshToken.value,
      });

      const response = NextResponse.next();
      setCookie({ res: response }, "access_token", newTokens.accessToken);
      setCookie({ res: response }, "refresh_token", newTokens.refreshToken);
      return response;
    } catch (error) {
      const loginUrl = `${req.nextUrl.origin}/login`;
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/", "/login", "/signup"],
};
