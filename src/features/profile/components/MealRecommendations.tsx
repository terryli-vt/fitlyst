"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/error";
import type { MealIdea } from "@/features/onboarding/types";
import MealCard from "@/components/MealCard";
import type { DBNutrition } from "../types";

interface MealRecommendationsProps {
  initialMeals: MealIdea[] | null;
  nutrition: DBNutrition;
  initialRemainingGenerations: number;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export default function MealRecommendations({
  initialMeals,
  nutrition,
  initialRemainingGenerations,
  onGeneratingChange,
}: MealRecommendationsProps) {
  const [meals, setMeals] = useState<MealIdea[] | null>(initialMeals);
  const [isGenerating, setIsGenerating] = useState(false);

  const setGenerating = (value: boolean) => {
    setIsGenerating(value);
    onGeneratingChange?.(value);
  };
  const [error, setError] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(initialRemainingGenerations);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const genResponse = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrition }),
      });

      if (!genResponse.ok) {
        const data = await genResponse.json();
        setError(data.error ?? "Failed to generate meal ideas.");
        return;
      }

      const { mealIdeas: newMeals, remainingGenerations: newRemaining } = await genResponse.json();

      setMeals(newMeals);
      if (typeof newRemaining === "number") {
        setRemainingGenerations(newRemaining);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <h2 className="text-lg font-bold text-gray-900">Meal Recommendations</h2>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-gray-400">{remainingGenerations} left today</span>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || remainingGenerations === 0}
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating…" : meals ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Generating personalized meal ideas…</span>
          </div>
          <span className="text-xs text-gray-400">This may take 10–30 seconds, please be patient.</span>
        </div>
      )}

      {!isGenerating && meals && meals.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {meals.map((meal, index) => (
              <MealCard key={index} meal={meal} />
            ))}
          </div>
          <p className="text-xs text-gray-400 italic mt-5 text-center">
            Meal ideas are AI-generated and not medical advice.
          </p>
        </>
      )}

      {!isGenerating && !meals && (
        <p className="text-gray-400 text-sm text-center py-10">
          Click &quot;Generate&quot; to create personalized meal recommendations based on your
          nutrition plan.
        </p>
      )}
    </div>
  );
}

