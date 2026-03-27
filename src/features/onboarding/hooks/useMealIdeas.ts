"use client";

import { useState, useEffect } from "react";
import { DAILY_GENERATION_LIMIT } from "@/lib/mealGenerationLimit";
import { getErrorMessage } from "@/lib/error";
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
 * On mount, fetches any existing meal ideas from the DB so the results page
 * can show "View Meal Ideas" / "Regenerate" instead of "Generate" if the user
 * has already generated ideas in a previous session.
 */
export function useMealIdeas() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealIdeas, setMealIdeas] = useState<MealIdea[] | null>(null);
  const [showMealIdeas, setShowMealIdeas] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(DAILY_GENERATION_LIMIT);

  // Fetch existing meal ideas and remaining quota from DB on mount
  useEffect(() => {
    fetch("/api/meal-ideas")
      .then((res) => res.json())
      .then((data) => {
        if (data.meals && data.meals.length > 0) {
          setMealIdeas(data.meals);
        }
        if (typeof data.remainingGenerations === "number") {
          setRemainingGenerations(data.remainingGenerations);
        }
      })
      .catch(() => {
        // Silently ignore — user simply hasn't generated ideas yet
      });
  }, []);

  const generateMealIdeas = async (nutrition: NutritionResults) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate meal ideas");
      }

      const data = await response.json();
      const mealIdeasData = data.mealIdeas as MealIdea[];

      if (typeof data.remainingGenerations === "number") {
        setRemainingGenerations(data.remainingGenerations);
      }

      setMealIdeas(mealIdeasData);
      setShowMealIdeas(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      console.error("Error generating meal ideas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowMealIdeas(false);
  };

  const viewMealIdeas = () => {
    setShowMealIdeas(true);
  };

  return {
    isLoading,
    error,
    mealIdeas,
    showMealIdeas,
    remainingGenerations,
    generateMealIdeas,
    viewMealIdeas,
    handleBack,
  };
}
