"use client";

import type { UserProfile } from "../types";
import {
  ACTIVITY_LEVELS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  GOAL_PRIORITY_OPTIONS,
} from "../config";
import { HeightInput } from "./HeightInput";
import { WeightInput } from "./WeightInput";

interface Step {
  question: string;
  type:
    | "height"
    | "weight"
    | "number"
    | "gender"
    | "activity"
    | "goal"
    | "goalPriority";
}

interface StepContentProps {
  step: Step;
  profile: UserProfile;
  heightUnit: "cm" | "ft";
  weightUnit: "kg" | "lb";
  onAnswerChange: (
    key: keyof UserProfile,
    value: string | { value: string; unit: string; inches?: string }
  ) => void;
  onHeightUnitChange: (unit: "cm" | "ft") => void;
  onWeightUnitChange: (unit: "kg" | "lb") => void;
}

export function StepContent({
  step,
  profile,
  heightUnit,
  weightUnit,
  onAnswerChange,
  onHeightUnitChange,
  onWeightUnitChange,
}: StepContentProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{step.question}</h2>

      {step.type === "height" && (
        <HeightInput
          value={profile.height}
          unit={heightUnit}
          onUnitChange={onHeightUnitChange}
          onChange={(height) => onAnswerChange("height", height)}
        />
      )}

      {step.type === "weight" && (
        <WeightInput
          value={profile.weight}
          unit={weightUnit}
          onUnitChange={onWeightUnitChange}
          onChange={(weight) => onAnswerChange("weight", weight)}
        />
      )}

      {step.type === "number" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => onAnswerChange("age", e.target.value)}
            placeholder="Enter your age"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            min="1"
            max="120"
          />
        </div>
      )}

      {step.type === "gender" && (
        <div className="space-y-3">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswerChange("gender", option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                profile.gender === option.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {step.type === "activity" && (
        <div className="space-y-3">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onAnswerChange("activityLevel", level.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                profile.activityLevel === level.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}

      {step.type === "goal" && (
        <div className="space-y-3">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswerChange("goal", option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                profile.goal === option.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {step.type === "goalPriority" && (
        <div className="space-y-3">
          {GOAL_PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswerChange("goalPriority", option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                profile.goalPriority === option.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
