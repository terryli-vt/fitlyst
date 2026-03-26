"use client"; // context provider needs to be client component

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // allow access to session in any component via useSession() hook from next-auth/react, to check if user is logged in, get user info, etc.
  return <SessionProvider>{children}</SessionProvider>;
}
