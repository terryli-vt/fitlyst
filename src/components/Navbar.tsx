"use client";

import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginButton";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  showLogin?: boolean;
}

export default function Navbar({ showLogin = true }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Fitlyst" width={36} height={36} priority />
          <span className="text-xl font-bold text-teal-700 dark:text-teal-400 tracking-tight">Fitlyst</span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showLogin && <LoginButton />}
        </div>
      </div>
    </header>
  );
}
