"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MealIdea } from "@/features/onboarding/types";

export default function MealCard({ meal }: { meal: MealIdea }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 capitalize">
          {meal.mealType}
        </span>
      </div>

      <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">{meal.name}</h4>

      {meal.description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 leading-relaxed">{meal.description}</p>
      )}

      <div className="mb-3">
        <span className="text-lg font-bold text-teal-700 dark:text-teal-400">{meal.macros.calories}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">kcal</span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-500 font-medium">Protein</p>
          <p className="font-bold text-gray-700 dark:text-gray-300">{meal.macros.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-500 font-medium">Carbs</p>
          <p className="font-bold text-gray-700 dark:text-gray-300">{meal.macros.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-500 font-medium">Fat</p>
          <p className="font-bold text-gray-700 dark:text-gray-300">{meal.macros.fat}g</p>
        </div>
      </div>

      {meal.cookingInstructions && meal.cookingInstructions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Cooking Instructions</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            )}
          </button>
          {isExpanded && (
            <ol className="mt-3 space-y-1.5 list-decimal list-inside">
              {meal.cookingInstructions.map((step, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
