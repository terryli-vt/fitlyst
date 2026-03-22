import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { authConfig } from "@/auth.config";

// This initializes NextAuth with Drizzle ORM adapter and Google provider for authentication.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),
});
