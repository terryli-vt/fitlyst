"use client";

import MealCard from "@/components/MealCard";
import type { MealIdea } from "../types";

interface MealIdeasViewProps {
  mealIdeas: MealIdea[];
  onBack?: () => void;
}

/**
 * Meal Ideas View Component
 * Displays generated meal ideas as cards with expandable cooking instructions
 */
export function MealIdeasView({ mealIdeas, onBack }: MealIdeasViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              ← Back to Results
            </button>
          )}
          <h1 className="text-3xl font-bold text-teal-700 mb-2">Your Meal Ideas</h1>
          <p className="text-gray-600">Personalized meal suggestions based on your nutrition plan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-5">
            {mealIdeas.map((meal, index) => (
              <MealCard key={index} meal={meal} />
            ))}
          </div>
          <p className="text-xs text-gray-500 italic mt-6 text-center">
            Meal ideas are AI-generated and not medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}
