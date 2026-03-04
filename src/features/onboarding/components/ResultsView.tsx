"use client";

import type { NutritionResults } from "../types";

interface ResultsViewProps {
  results: NutritionResults;
  isLoading: boolean;
  error: string | null;
  onGenerateMealIdeas: () => void;
}

/**
 * Results View Component
 * Displays nutrition recommendations (calories and macros).
 *
 * Intentionally kept as a pure display component — all async meal-generation
 * logic lives in the useMealIdeas hook so this file stays easy to read.
 *
 * Features:
 * - Shows daily nutrition targets (BMI, BMR, calories, macros)
 * - Generate meal ideas button (AI-powered)
 * - Loading and error states passed in from parent
 */
export function ResultsView({
  results,
  isLoading,
  error,
  onGenerateMealIdeas,
}: ResultsViewProps) {
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
          onClick={onGenerateMealIdeas}
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
      </div>

      {/* Future: Add "Save Profile" button here when authentication is implemented */}
      {/* Future: Add "Share Results" or "Export Plan" options */}
    </div>
  );
}
