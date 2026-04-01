"use client";

import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Loading Page Component
 * Displays a full-page loading screen with a loading circle
 * while meal ideas are being generated
 */
export function MealIdeasLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar showLogin={false} />
      <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-teal-600 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400">
            Generating Your Meal Ideas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI is creating personalized meal suggestions just for you...
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">This may take 10–30 seconds, please be patient.</p>
        </div>
      </div>
      </div>
    </div>
  );
}
