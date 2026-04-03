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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Your Nutrition Plan</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Based on your profile, here are your daily recommendations</p>
      </div>

      {/* Nutrition Stats */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Daily Targets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NutritionStat label="Daily Calories" value={results.calories} unit="kcal" colorClass="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" />
          <NutritionStat label="Protein" value={results.protein} unit="g/day" colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
          <NutritionStat label="Carbohydrates" value={results.carbs} unit="g/day" colorClass="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
          <NutritionStat label="Fat" value={results.fat} unit="g/day" colorClass="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" />
        </div>
      </div>

      {/* BMI & BMR */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">BMI</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{results.bmi}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Body Mass Index</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">BMR</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {Math.round(results.bmr)}{" "}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">kcal</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Basal Metabolic Rate</p>
        </div>
      </div>

      {/* Adjustment Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">Adjustment Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
        <div className="relative group flex justify-end">
          <span className="text-xs text-gray-400 dark:text-gray-500 cursor-default">
            {remainingGenerations} generation{remainingGenerations !== 1 ? "s" : ""} remaining today
          </span>
          <span className="pointer-events-none absolute right-0 top-full mt-1.5 w-56 rounded-lg bg-gray-800 dark:bg-gray-700 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
            Meal generation uses the OpenAI API, so it&apos;s limited to 10 times per day to manage costs.
          </span>
        </div>
        {hasMealIdeas ? (
          <div className="flex gap-3">
            <button
              onClick={onViewMealIdeas}
              className="flex-1 py-3 rounded-xl font-semibold text-teal-700 dark:text-teal-400 border border-teal-600 dark:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              View Meal Ideas
            </button>
            <button
              onClick={onGenerateMealIdeas}
              disabled={isLoading || remainingGenerations === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
                isLoading || remainingGenerations === 0 ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
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
              isLoading || remainingGenerations === 0 ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isLoading ? "Generating meal ideas..." : "Generate Meal Ideas"}
          </button>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            {remainingGenerations > 0 && (
              <button
                onClick={onGenerateMealIdeas}
                disabled={isLoading}
                className="mt-2 font-medium underline hover:no-underline disabled:opacity-50"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
