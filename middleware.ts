import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const protectedPrefixes = ["/onboarding", "/dashboard"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
