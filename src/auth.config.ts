import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Why do we need a separate auth.config.ts file?
// Because NextAuth's config object is big and can get messy. This way we keep it organized and focused on just the auth configuration, while the main auth.ts file can focus on initializing NextAuth with the adapter and providers.
// It also makes it easier to find and update auth settings in one place without digging through the main auth logic.
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Explicitly configure cookie security settings rather than relying on defaults.
  // sameSite: "lax" blocks cross-site POST requests from carrying the session cookie,
  // which is the primary CSRF defence for this app.
  // secure: true in production ensures the cookie is only sent over HTTPS.
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
};
