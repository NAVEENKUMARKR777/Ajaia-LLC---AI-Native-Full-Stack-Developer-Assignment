import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session_user_id";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");

  if (!sessionCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/documents/:path*", "/login"],
};
