"use client";

import { useState } from "react";
import type { NutritionResults, MealIdea } from "../types";

interface ResultsViewProps {
  results: NutritionResults;
  onLoadingChange?: (isLoading: boolean) => void;
  onMealIdeasGenerated?: (mealIdeas: MealIdea[]) => void;
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
export function ResultsView({ results, onLoadingChange, onMealIdeasGenerated }: ResultsViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notify parent when loading state changes
  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  };

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
    updateLoadingState(true);
    setError(null);

    try {
      // Wait 5 seconds before setting dummy data (to simulate loading)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      /* const response = await fetch("/api/generate-meal-ideas", {
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

      const data = await response.json(); */
      
      // dummy data for testing
      const dummyData = {
        "mealIdeas": [
            {
                "mealType": "breakfast",
                "name": "Oatmeal with Banana and Peanut Butter",
                "description": "Creamy oatmeal topped with sliced banana and a scoop of peanut butter.",
                "macros": {
                    "calories": 500,
                    "protein": 15,
                    "carbs": 70,
                    "fat": 20
                },
                "cookingInstructions": [
                    "Step 1: Cook 1 cup of rolled oats in 2 cups of water or milk until soft.",
                    "Step 2: Slice 1 banana and stir it into the oatmeal.",
                    "Step 3: Add 2 tablespoons of peanut butter and mix well.",
                    "Step 4: Serve warm."
                ]
            },
            {
                "mealType": "lunch",
                "name": "Grilled Chicken Salad",
                "description": "A fresh salad with grilled chicken, mixed greens, and a light vinaigrette.",
                "macros": {
                    "calories": 600,
                    "protein": 50,
                    "carbs": 30,
                    "fat": 25
                },
                "cookingInstructions": [
                    "Step 1: Grill 6 oz of chicken breast until fully cooked.",
                    "Step 2: Chop mixed greens (like spinach and romaine) and place in a bowl.",
                    "Step 3: Slice the grilled chicken and add it to the salad.",
                    "Step 4: Drizzle with a light vinaigrette and toss to combine."
                ]
            },
            {
                "mealType": "dinner",
                "name": "Quinoa with Black Beans and Veggies",
                "description": "Nutritious quinoa served with black beans and sautéed vegetables.",
                "macros": {
                    "calories": 700,
                    "protein": 25,
                    "carbs": 100,
                    "fat": 15
                },
                "cookingInstructions": [
                    "Step 1: Cook 1 cup of quinoa according to package instructions.",
                    "Step 2: Rinse and drain 1 can of black beans.",
                    "Step 3: Sauté chopped bell peppers, onions, and zucchini in a pan until tender.",
                    "Step 4: Combine quinoa, black beans, and sautéed veggies in a bowl and mix well."
                ]
            },
            {
                "mealType": "snack",
                "name": "Greek Yogurt with Berries and Honey",
                "description": "Creamy Greek yogurt topped with fresh berries and a drizzle of honey.",
                "macros": {
                    "calories": 300,
                    "protein": 20,
                    "carbs": 40,
                    "fat": 5
                },
                "cookingInstructions": [
                    "Step 1: Scoop 1 cup of Greek yogurt into a bowl.",
                    "Step 2: Add a handful of mixed berries on top.",
                    "Step 3: Drizzle with 1 tablespoon of honey and serve."
                ]
            },
            {
                "mealType": "dinner",
                "name": "Stir-Fried Tofu with Broccoli and Rice",
                "description": "Flavorful stir-fried tofu with broccoli served over rice.",
                "macros": {
                    "calories": 600,
                    "protein": 30,
                    "carbs": 80,
                    "fat": 20
                },
                "cookingInstructions": [
                    "Step 1: Cook 1 cup of rice according to package instructions.",
                    "Step 2: Cube 8 oz of firm tofu and sauté in a pan until golden.",
                    "Step 3: Add broccoli florets and stir-fry until tender.",
                    "Step 4: Serve stir-fried tofu and broccoli over rice."
                ]
            }
        ]
    }

      

      // setMealIdeas(data.mealIdeas);
      const mealIdeasData = dummyData.mealIdeas as MealIdea[];
      onMealIdeasGenerated?.(mealIdeasData);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Error generating meal ideas:", err);
    } finally {
      updateLoadingState(false);
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
      </div>

      {/* Future: Add "Save Profile" button here when authentication is implemented */}
      {/* Future: Add "Share Results" or "Export Plan" options */}
    </div>
  );
}
