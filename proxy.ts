import { NextRequest, NextResponse } from "next/server.js";
import { auth } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  const sess = await auth();
  const { pathname } = request.nextUrl;

  // 1. If user is already on the login page, don't redirect
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 2. If no session, redirect to login
  if (!sess) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public (public folder assets like logo.png)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-|apple-icon).*)",
  ],
};
