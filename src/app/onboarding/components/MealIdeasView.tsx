"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MealIdea } from "../types";

interface MealIdeasViewProps {
  mealIdeas: MealIdea[];
  onBack?: () => void;
}

/**
 * Meal Ideas View Component
 * Displays generated meal ideas as cards with expandable cooking instructions
 */
export function MealIdeasView({ mealIdeas, onBack }: MealIdeasViewProps) {
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              ← Back to Results
            </button>
          )}
          <h1 className="text-3xl font-bold text-teal-700 mb-2">
            Your Meal Ideas
          </h1>
          <p className="text-gray-600">
            Personalized meal suggestions based on your nutrition plan
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-5 grid-cols-1">
            {mealIdeas.map((meal, index) => {
              const isExpanded = expandedMealIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedMealIndex(isExpanded ? null : index)}
                >
                  {/* Meal Type Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 capitalize">
                      {meal.mealType}
                    </span>
                  </div>

                  {/* Meal Name */}
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {meal.name}
                  </h4>

                  {/* Meal Description */}
                  {meal.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {meal.description}
                    </p>
                  )}

                  {/* Total Calories */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Total Calories: </span>
                    <span className="text-lg font-semibold text-teal-700">
                      {meal.macros.calories} kcal
                    </span>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Macros
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Protein:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.protein} g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Carbs:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.carbs} g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fat:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {meal.macros.fat} g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Cooking Instructions */}
                  {meal.cookingInstructions && meal.cookingInstructions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        className="flex items-center justify-between w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMealIndex(isExpanded ? null : index);
                        }}
                      >
                        <span className="text-sm font-semibold text-teal-700">
                          Cooking Instructions
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-teal-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-teal-700" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-4 space-y-2">
                          {meal.cookingInstructions.map((step, stepIndex) => (
                            <div
                              key={stepIndex}
                              className="text-sm text-gray-700 leading-relaxed"
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 italic mt-6 text-center">
            Meal ideas are AI-generated and not medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}
