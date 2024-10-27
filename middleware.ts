import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RefreshTokenService } from "./services";

export async function middleware(request: NextRequest) {
  // Skip token refresh for sign-in and sign-up pages
  if (
    request.nextUrl.pathname.startsWith("/auth/sign-in") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up")
  ) {
    return NextResponse.next();
  }

  try {
    const refresh_token = request.cookies.get("refresh_token")?.value;
    if (!refresh_token) {
      throw new Error("Token not found");
    }

    const accessToken = await RefreshTokenService({
      refreshToken: refresh_token,
    });

    // Set the new access token in a cookie
    const response = NextResponse.next();
    response.cookies.set("access_token", accessToken.accessToken, {
      maxAge: 3600, // 1 hour
      path: "/",
    });
    
    return response;
  } catch (error) {
    // Redirect to sign-in page if there's an error
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/subject/:path*",
    "/school/:path*",
    "/account/:path*",
  ],
};
