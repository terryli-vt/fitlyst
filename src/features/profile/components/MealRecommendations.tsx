"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { MealIdea } from "@/features/onboarding/types";
import type { DBNutrition } from "../types";

interface MealRecommendationsProps {
  initialMeals: MealIdea[] | null;
  nutrition: DBNutrition;
}

export default function MealRecommendations({
  initialMeals,
  nutrition,
}: MealRecommendationsProps) {
  const [meals, setMeals] = useState<MealIdea[] | null>(initialMeals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
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

      const { mealIdeas: newMeals } = await genResponse.json();

      await fetch("/api/meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: newMeals }),
      });

      setMeals(newMeals);
      setExpandedMeal(null);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Meal Recommendations</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Generating…" : meals ? "Regenerate" : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isGenerating && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Generating personalized meal ideas…</span>
        </div>
      )}

      {!isGenerating && meals && meals.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal, index) => (
              <MealCard
                key={index}
                meal={meal}
                isExpanded={expandedMeal === index}
                onToggle={() => setExpandedMeal(expandedMeal === index ? null : index)}
              />
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

function MealCard({
  meal,
  isExpanded,
  onToggle,
}: {
  meal: MealIdea;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 capitalize">
          {meal.mealType}
        </span>
      </div>

      <h4 className="text-base font-bold text-gray-900 mb-1.5">{meal.name}</h4>

      {meal.description && (
        <p className="text-gray-500 text-sm mb-3 leading-relaxed">{meal.description}</p>
      )}

      <div className="mb-3">
        <span className="text-lg font-bold text-teal-700">{meal.macros.calories}</span>
        <span className="text-sm text-gray-500 ml-1">kcal</span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs pt-3 border-t border-gray-100 mt-auto">
        <div className="text-center">
          <p className="text-gray-400 font-medium">Protein</p>
          <p className="font-bold text-gray-700">{meal.macros.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium">Carbs</p>
          <p className="font-bold text-gray-700">{meal.macros.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium">Fat</p>
          <p className="font-bold text-gray-700">{meal.macros.fat}g</p>
        </div>
      </div>

      {meal.cookingInstructions && meal.cookingInstructions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-semibold text-teal-600">Cooking Instructions</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-teal-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-teal-600" />
            )}
          </button>
          {isExpanded && (
            <ol className="mt-3 space-y-1.5 list-decimal list-inside">
              {meal.cookingInstructions.map((step, i) => (
                <li key={i} className="text-xs text-gray-600 leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
