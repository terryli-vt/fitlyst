"use client";

/**
 * Onboarding Flow Page
 *
 * Multi-step questionnaire to collect user information for nutrition calculations.
 *
 * Future considerations:
 * - User authentication: Add user ID to profile object when users can sign in
 * - Data persistence: Save profile object to database/API after completion
 * - Calculation service: Move calculation logic to separate service/API endpoint
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboarding } from "./hooks/useOnboarding";
import {
  STEPS,
  ACTIVITY_LEVELS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  GOAL_PRIORITY_OPTIONS,
} from "./config";
import { ProgressBar } from "./components/ProgressBar";
import { ResultsView } from "./components/ResultsView";
import { HeightInput } from "./components/HeightInput";
import { WeightInput } from "./components/WeightInput";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    showResults,
    profile,
    heightUnit,
    weightUnit,
    results,
    handleAnswerChange,
    handleHeightUnitChange,
    handleWeightUnitChange,
    handleNext,
    handlePrevious,
    validateCurrentStep,
  } = useOnboarding();

  const step = STEPS[currentStep];

  /**
   * Render current step's question content
   */
  const renderStepContent = () => {
    if (showResults && results) {
      return <ResultsView results={results} />;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{step.question}</h2>

        {step.type === "height" && (
          <HeightInput
            value={profile.height}
            unit={heightUnit}
            onUnitChange={handleHeightUnitChange}
            onChange={(height) => handleAnswerChange("height", height)}
          />
        )}

        {step.type === "weight" && (
          <WeightInput
            value={profile.weight}
            unit={weightUnit}
            onUnitChange={handleWeightUnitChange}
            onChange={(weight) => handleAnswerChange("weight", weight)}
          />
        )}

        {step.type === "number" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => handleAnswerChange("age", e.target.value)}
              placeholder="Enter your age"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
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
                onClick={() => handleAnswerChange("gender", option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                  profile.gender === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {step.type === "select" && (
          <div className="space-y-3">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleAnswerChange("activityLevel", level.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                  profile.activityLevel === level.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300"
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
                onClick={() => handleAnswerChange("goal", option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                  profile.goal === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 mt-1">
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
                onClick={() => handleAnswerChange("goalPriority", option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                  profile.goalPriority === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="pt-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Progress Bar */}
          {!showResults && (
            <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
          )}

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {!showResults && (
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  validateCurrentStep()
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {currentStep === STEPS.length - 1 ? "View Results" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Results View Actions */}
          {showResults && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Edit Answers
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 rounded-lg font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Done
              </button>
              {/* Future: Add "Save Profile" button here when authentication is implemented */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
