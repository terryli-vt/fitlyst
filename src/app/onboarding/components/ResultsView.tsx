"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { NutritionResults, MealIdea } from "../types";

interface ResultsViewProps {
  results: NutritionResults;
}

/**
 * Results View Component
 * Displays nutrition recommendations (calories and macros)
 * 
 * Features:
 * - Shows daily nutrition targets
 * - Generate meal ideas button (AI-powered)
 * - Displays meal suggestions with macro breakdown
 * - Loading and error states
 */
export function ResultsView({ results }: ResultsViewProps) {
  const [mealIdeas, setMealIdeas] = useState<MealIdea[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);

  /**
   * Handle Generate Meal Ideas button click
   * 
   * Data Flow:
   * 1. User clicks "Generate meal ideas" button
   * 2. Client sends POST request to /api/generate-meal-ideas with nutrition data
   * 3. Server constructs prompt and calls OpenAI API
   * 4. Server returns structured meal ideas array
   * 5. Client displays meal ideas below the button
   */
  const handleGenerateMealIdeas = async () => {
    setIsLoading(true);
    setError(null);
    // Only clear meal ideas if we're generating new ones
    // This ensures meal ideas persist until regenerated
    setExpandedMealIndex(null);

    try {
      const response = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nutrition: results }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate meal ideas");
      }

      const data = await response.json();
      setMealIdeas(data.mealIdeas);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Error generating meal ideas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-teal-700 mb-4">
          Your Nutrition Plan
        </h2>
        <p className="text-gray-600">
          Based on your profile, here are your daily recommendations
        </p>
      </div>

      {/* Results Display */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100">
        <div className="space-y-6">
          {/* BMI and BMR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">BMI</div>
              <div className="text-2xl font-bold text-teal-700">
                {results.bmi}
              </div>
              <div className="text-xs text-gray-500">Body Mass Index</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">BMR</div>
              <div className="text-2xl font-bold text-teal-700">
                {results.bmr}
              </div>
              <div className="text-xs text-gray-500">
                kcal/day (Basal Metabolic Rate)
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Daily Calories</div>
            <div className="text-4xl font-bold text-teal-700">
              {results.calories}
            </div>
            <div className="text-sm text-gray-500 mt-1">kcal</div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Protein</div>
              <div className="text-2xl font-bold text-teal-700">
                {results.protein}
              </div>
              <div className="text-xs text-gray-500">grams</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Carbs</div>
              <div className="text-2xl font-bold text-teal-700">
                {results.carbs}
              </div>
              <div className="text-xs text-gray-500">grams</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Fat</div>
              <div className="text-2xl font-bold text-teal-700">
                {results.fat}
              </div>
              <div className="text-xs text-gray-500">grams</div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Tips */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Adjustment Tips
        </h3>
        <ul className="space-y-3 text-left text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Recalculate every 2–3 weeks</strong> to adjust your plan
              based on progress
            </span>
          </li>

          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Bulking:</strong> Aim to gain{" "}
              <strong>0.25–0.5 kg/week</strong> (0.55–1.1 lb/week)
            </span>
          </li>

          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Cutting:</strong> Aim to lose{" "}
              <strong>0.3–0.7 kg/week</strong> (0.66–1.54 lb/week)
            </span>
          </li>

          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              <strong>Slightly higher carbs on training days</strong> to support
              performance and recovery
            </span>
          </li>
        </ul>
      </div>

      {/* Generate Meal Ideas Section */}
      <div className="space-y-4">
        <button
          onClick={handleGenerateMealIdeas}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700"
          }`}
        >
          {isLoading ? "Generating meal ideas..." : "Generate meal ideas"}
        </button>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Meal Ideas Display */}
        {mealIdeas && mealIdeas.length > 0 && (
          <div className="mt-6 space-y-6">
            <h3 className="text-2xl font-bold text-teal-700">
              Your Meal Ideas
            </h3>
            
            <div className="grid gap-5 grid-cols-1">
              {mealIdeas.map((meal, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left"
                >
                  {/* Meal Type Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 capitalize">
                      {meal.mealType}
                    </span>
                  </div>

                  {/* Meal Name */}
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {meal.name}
                  </h4>

                  {/* Meal Description */}
                  {meal.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {meal.description}
                    </p>
                  )}

                  {/* Macro Breakdown */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Macros
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Calories:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.calories} kcal
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Protein:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.protein} g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Carbs:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.carbs} g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fat:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.fat} g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 italic mt-4">
              Meal ideas are AI-generated and not medical advice.
            </p>
          </div>
        )}
      </div>

      {/* Future: Add "Save Profile" button here when authentication is implemented */}
      {/* Future: Add "Share Results" or "Export Plan" options */}
    </div>
  );
}
