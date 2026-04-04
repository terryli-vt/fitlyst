import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="text-center max-w-md">
        <Image src="/logo.svg" alt="Fitlyst" width={72} height={72} className="mx-auto mb-2" />
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-8">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Nutrition</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-10">
          <p className="text-6xl font-bold text-teal-600 dark:text-teal-400 mb-4">404</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
