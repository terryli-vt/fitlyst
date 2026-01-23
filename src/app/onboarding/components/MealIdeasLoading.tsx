"use client";

import { Loader2 } from "lucide-react";

/**
 * Loading Page Component
 * Displays a full-page loading screen with a loading circle
 * while meal ideas are being generated
 */
export function MealIdeasLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
      <div className="text-center space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-teal-600 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-teal-700">
            Generating Your Meal Ideas
          </h2>
          <p className="text-gray-600">
            Our AI is creating personalized meal suggestions just for you...
          </p>
        </div>
      </div>
    </div>
  );
}
