import type { NutritionResults } from "../types";

interface ResultsViewProps {
  results: NutritionResults;
}

/**
 * Results View Component
 * Displays nutrition recommendations (calories and macros)
 */
export function ResultsView({ results }: ResultsViewProps) {
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

      {/* Future: Add "Save Profile" button here when authentication is implemented */}
      {/* Future: Add "Share Results" or "Export Plan" options */}
    </div>
  );
}
