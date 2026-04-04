"use client";

import { useState, useEffect } from "react";
import { DAILY_GENERATION_LIMIT } from "@/lib/mealGenerationLimit";
import { getErrorMessage } from "@/lib/error";
import type { MealIdea, NutritionResults, DietaryPreferences } from "../types";

const EMPTY_PREFERENCES: DietaryPreferences = {
  dietaryRestrictions: [],
  allergies: [],
  cuisinePreferences: [],
};

export function useMealIdeas(initialPreferences?: DietaryPreferences) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealIdeas, setMealIdeas] = useState<MealIdea[] | null>(null);
  const [showMealIdeas, setShowMealIdeas] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(DAILY_GENERATION_LIMIT);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingNutrition, setPendingNutrition] = useState<NutritionResults | null>(null);
  // Saved preferences — starts from profile, updated each time user confirms
  const [savedPreferences, setSavedPreferences] = useState<DietaryPreferences>(
    initialPreferences ?? EMPTY_PREFERENCES,
  );

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

  // Opens the modal instead of generating directly
  const generateMealIdeas = (nutrition: NutritionResults) => {
    setPendingNutrition(nutrition);
    setModalOpen(true);
  };

  // Called when user clicks "Generate" in the modal — saves prefs then generates
  const handleModalConfirm = async (preferences: DietaryPreferences) => {
    setIsSavingPrefs(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietaryRestrictions: preferences.dietaryRestrictions,
          allergies: preferences.allergies,
          cuisinePreferences: preferences.cuisinePreferences,
        }),
      });
      setSavedPreferences(preferences);
    } catch {
      // Non-fatal — still proceed with generation
    } finally {
      setIsSavingPrefs(false);
    }

    setModalOpen(false);
    await doGenerate(pendingNutrition!, preferences);
  };

  // Called when user clicks "Skip" — generates without any preferences, nothing saved
  const handleModalSkip = async () => {
    setModalOpen(false);
    await doGenerate(pendingNutrition!, EMPTY_PREFERENCES);
  };

  const doGenerate = async (nutrition: NutritionResults, preferences: DietaryPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrition, preferences }),
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
    isSavingPrefs,
    error,
    mealIdeas,
    showMealIdeas,
    remainingGenerations,
    modalOpen,
    savedPreferences,
    generateMealIdeas,
    handleModalConfirm,
    handleModalSkip,
    onModalClose: () => setModalOpen(false),
    viewMealIdeas,
    handleBack,
  };
}
