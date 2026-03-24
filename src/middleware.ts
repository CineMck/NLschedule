import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboardPage =
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/time-off") ||
    pathname.startsWith("/clock") ||
    pathname.startsWith("/availability") ||
    pathname.startsWith("/swaps") ||
    pathname.startsWith("/payroll") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/notifications");

  if (isDashboardPage && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && req.auth) {
    return NextResponse.redirect(new URL("/schedule", req.url));
  }

  // Owner-only routes
  if (pathname.startsWith("/payroll") && req.auth?.user?.role !== "OWNER") {
    return NextResponse.redirect(new URL("/schedule", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
