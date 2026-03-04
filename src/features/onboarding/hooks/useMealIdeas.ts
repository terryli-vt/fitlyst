"use client";

import { useState } from "react";
import type { MealIdea, NutritionResults } from "../types";

/**
 * useMealIdeas hook
 *
 * Centralises all meal-ideas state that was previously split between
 * OnboardingPage (isGeneratingMealIdeas, mealIdeas, showMealIdeas) and
 * ResultsView (isLoading, error).  ResultsView now receives these values as
 * props and calls onGenerateMealIdeas() — no callbacks needed to sync state
 * between parent and child.
 *
 * Future: When the real API is enabled, replace the dummy data block with the
 * commented-out fetch call below.
 */
export function useMealIdeas() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealIdeas, setMealIdeas] = useState<MealIdea[] | null>(null);
  const [showMealIdeas, setShowMealIdeas] = useState(false);

  /**
   * Fetch (or simulate) meal ideas based on the user's nutrition results.
   *
   * Data Flow:
   * 1. User clicks "Generate meal ideas" button in ResultsView
   * 2. Client sends POST request to /api/generate-meal-ideas with nutrition data
   * 3. Server constructs prompt and calls OpenAI API
   * 4. Server returns structured meal ideas array
   * 5. Hook stores the result and flips showMealIdeas to true
   */
  const generateMealIdeas = async (nutrition: NutritionResults) => {
    setIsLoading(true);
    setError(null);

    try {
      // Wait 5 seconds before setting dummy data (to simulate loading)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      /* const response = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nutrition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate meal ideas");
      }

      const data = await response.json(); */

      // Dummy data for testing
      const dummyData = {
        mealIdeas: [
          {
            mealType: "breakfast",
            name: "Oatmeal with Banana and Peanut Butter",
            description:
              "Creamy oatmeal topped with sliced banana and a scoop of peanut butter.",
            macros: { calories: 500, protein: 15, carbs: 70, fat: 20 },
            cookingInstructions: [
              "Step 1: Cook 1 cup of rolled oats in 2 cups of water or milk until soft.",
              "Step 2: Slice 1 banana and stir it into the oatmeal.",
              "Step 3: Add 2 tablespoons of peanut butter and mix well.",
              "Step 4: Serve warm.",
            ],
          },
          {
            mealType: "lunch",
            name: "Grilled Chicken Salad",
            description:
              "A fresh salad with grilled chicken, mixed greens, and a light vinaigrette.",
            macros: { calories: 600, protein: 50, carbs: 30, fat: 25 },
            cookingInstructions: [
              "Step 1: Grill 6 oz of chicken breast until fully cooked.",
              "Step 2: Chop mixed greens (like spinach and romaine) and place in a bowl.",
              "Step 3: Slice the grilled chicken and add it to the salad.",
              "Step 4: Drizzle with a light vinaigrette and toss to combine.",
            ],
          },
          {
            mealType: "dinner",
            name: "Quinoa with Black Beans and Veggies",
            description:
              "Nutritious quinoa served with black beans and sautéed vegetables.",
            macros: { calories: 700, protein: 25, carbs: 100, fat: 15 },
            cookingInstructions: [
              "Step 1: Cook 1 cup of quinoa according to package instructions.",
              "Step 2: Rinse and drain 1 can of black beans.",
              "Step 3: Sauté chopped bell peppers, onions, and zucchini in a pan until tender.",
              "Step 4: Combine quinoa, black beans, and sautéed veggies in a bowl and mix well.",
            ],
          },
          {
            mealType: "dinner",
            name: "Greek Yogurt with Berries and Honey",
            description:
              "Creamy Greek yogurt topped with fresh berries and a drizzle of honey.",
            macros: { calories: 300, protein: 20, carbs: 40, fat: 5 },
            cookingInstructions: [
              "Step 1: Scoop 1 cup of Greek yogurt into a bowl.",
              "Step 2: Add a handful of mixed berries on top.",
              "Step 3: Drizzle with 1 tablespoon of honey and serve.",
            ],
          },
          {
            mealType: "dinner",
            name: "Stir-Fried Tofu with Broccoli and Rice",
            description:
              "Flavorful stir-fried tofu with broccoli served over rice.",
            macros: { calories: 600, protein: 30, carbs: 80, fat: 20 },
            cookingInstructions: [
              "Step 1: Cook 1 cup of rice according to package instructions.",
              "Step 2: Cube 8 oz of firm tofu and sauté in a pan until golden.",
              "Step 3: Add broccoli florets and stir-fry until tender.",
              "Step 4: Serve stir-fried tofu and broccoli over rice.",
            ],
          },
        ],
      };

      // const mealIdeasData = data.mealIdeas as MealIdea[];
      const mealIdeasData = dummyData.mealIdeas as MealIdea[];
      setMealIdeas(mealIdeasData);
      setShowMealIdeas(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Error generating meal ideas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowMealIdeas(false);
  };

  return {
    isLoading,
    error,
    mealIdeas,
    showMealIdeas,
    generateMealIdeas,
    handleBack,
  };
}
