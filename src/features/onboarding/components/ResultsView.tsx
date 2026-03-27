"use client";

import type { NutritionResults } from "../types";
import NutritionStat from "@/components/NutritionStat";

interface ResultsViewProps {
  results: NutritionResults;
  isLoading: boolean;
  error: string | null;
  hasMealIdeas: boolean;
  remainingGenerations: number;
  onGenerateMealIdeas: () => void;
  onViewMealIdeas: () => void;
}

/**
 * Results View Component
 * Displays nutrition recommendations (calories and macros).
 *
 * Intentionally kept as a pure display component — all async meal-generation
 * logic lives in the useMealIdeas hook so this file stays easy to read.
 */
export function ResultsView({
  results,
  isLoading,
  error,
  hasMealIdeas,
  remainingGenerations,
  onGenerateMealIdeas,
  onViewMealIdeas,
}: ResultsViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Your Nutrition Plan</h2>
        <p className="text-gray-500 text-sm">Based on your profile, here are your daily recommendations</p>
      </div>

      {/* Nutrition Stats */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Daily Targets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NutritionStat label="Daily Calories" value={results.calories} unit="kcal" colorClass="bg-teal-50 text-teal-700" />
          <NutritionStat label="Protein" value={results.protein} unit="g/day" colorClass="bg-blue-50 text-blue-700" />
          <NutritionStat label="Carbohydrates" value={results.carbs} unit="g/day" colorClass="bg-amber-50 text-amber-700" />
          <NutritionStat label="Fat" value={results.fat} unit="g/day" colorClass="bg-rose-50 text-rose-700" />
        </div>
      </div>

      {/* BMI & BMR */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">BMI</p>
          <p className="text-2xl font-bold text-gray-800">{results.bmi}</p>
          <p className="text-xs text-gray-400 mt-0.5">Body Mass Index</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">BMR</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round(results.bmr)}{" "}
            <span className="text-sm font-medium text-gray-500">kcal</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Basal Metabolic Rate</p>
        </div>
      </div>

      {/* Adjustment Tips */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
        <h3 className="text-sm font-bold text-blue-900 mb-3">Adjustment Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Recalculate every 2–3 weeks</strong> to adjust your plan based on progress</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Bulking:</strong> Aim to gain <strong>0.25–0.5 kg/week</strong> (0.55–1.1 lb/week)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Cutting:</strong> Aim to lose <strong>0.3–0.7 kg/week</strong> (0.66–1.54 lb/week)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Slightly higher carbs on training days</strong> to support performance and recovery</span>
          </li>
        </ul>
      </div>

      {/* Generate Meal Ideas */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 text-right">
          {remainingGenerations} generation{remainingGenerations !== 1 ? "s" : ""} remaining today
        </p>
        {hasMealIdeas ? (
          <div className="flex gap-3">
            <button
              onClick={onViewMealIdeas}
              className="flex-1 py-3 rounded-xl font-semibold text-teal-700 border border-teal-600 hover:bg-teal-50 transition-colors"
            >
              View Meal Ideas
            </button>
            <button
              onClick={onGenerateMealIdeas}
              disabled={isLoading || remainingGenerations === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
                isLoading || remainingGenerations === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Regenerating..." : "Regenerate Meal Ideas"}
            </button>
          </div>
        ) : (
          <button
            onClick={onGenerateMealIdeas}
            disabled={isLoading || remainingGenerations === 0}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
              isLoading || remainingGenerations === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isLoading ? "Generating meal ideas..." : "Generate Meal Ideas"}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

