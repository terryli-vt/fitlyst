"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-teal-700 dark:text-teal-400 mb-2">Fitlyst</h1>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-8">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Nutrition</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-10">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Try again
            </button>
            <Link
              href="/"
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
