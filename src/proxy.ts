import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// This proxy middleware checks if the user is authenticated before allowing access to protected routes. If the user is not authenticated and tries to access a protected route, they will be redirected to the login page.
export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const protectedPrefixes = ["/onboarding", "/dashboard"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  // Run proxy on all routes except static assets and Next.js internals
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
