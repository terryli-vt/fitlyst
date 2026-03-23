"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session?.user) {
    const firstName = session.user.name?.split(" ")[0] ?? "User";
    return (
      <Link
        href="/profile"
        className="inline-block border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white font-medium py-1.5 px-5 rounded-full text-sm transition-colors duration-200"
      >
        Hi, {firstName}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-block border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white font-medium py-1.5 px-5 rounded-full text-sm transition-colors duration-200"
    >
      Login
    </Link>
  );
}
