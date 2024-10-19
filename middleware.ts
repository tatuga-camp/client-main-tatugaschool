// import { NextRequest, NextResponse } from "next/server";
// import { RefreshTokenService } from "./services";
// import { setCookie } from "nookies";

import { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const refreshToken = req.cookies.get("refresh_token");

//   // Avoid middleware looping by excluding sign-in, sign-up, and forget-password pages from further redirects
//   const isAuthPage =
//     req.nextUrl.pathname === "/auth/sign-in" ||
//     req.nextUrl.pathname === "/auth/sign-up" ||
//     req.nextUrl.pathname === "/auth/forget-password";

//   // If the user is on the sign-in, sign-up, or forget-password page and has a refresh token, redirect to home
//   if (isAuthPage) {
//     if (refreshToken) {
//       const homeUrl = `${req.nextUrl.origin}/`;
//       return NextResponse.redirect(homeUrl);
//     } else {
//       return NextResponse.next();
//     }
//   }

//   // If no refresh token is present, redirect to sign-in page, but skip redirect if already on auth pages
//   if (!refreshToken) {
//     const loginUrl = `${req.nextUrl.origin}/auth/sign-in`;
//     return NextResponse.redirect(loginUrl);
//   }

//   // Try refreshing tokens if a refresh token is present
//   try {
//     const newTokens = await RefreshTokenService({
//       refreshToken: refreshToken.value,
//     });

//     const response = NextResponse.next();
//     setCookie({ res: response }, "access_token", newTokens.accessToken, {
//       path: "/", // Ensure cookie is set at the root
//     });
//     setCookie({ res: response }, "refresh_token", newTokens.refreshToken, {
//       path: "/", // Ensure cookie is set at the root
//     });
//     return response;
//   } catch (error) {
//     // In case of an error, redirect to the sign-in page
//     const loginUrl = `${req.nextUrl.origin}/auth/sign-in`;
//     return NextResponse.redirect(loginUrl);
//   }
// }

// export const config = {
//   matcher: ["/", "/auth/:path*", "/school/:path*"],
// };

export async function middleware(req: NextRequest) {}
