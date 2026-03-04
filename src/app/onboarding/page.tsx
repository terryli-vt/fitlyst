"use client";

/**
 * Onboarding Flow Page
 *
 * Thin routing file — all feature logic lives in src/features/onboarding/.
 *
 * Future considerations:
 * - User authentication: Add user ID to profile object when users can sign in
 * - Data persistence: Save profile object to database/API after completion
 * - Calculation service: Move calculation logic to separate service/API endpoint
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { useMealIdeas } from "@/features/onboarding/hooks/useMealIdeas";
import { STEPS } from "@/features/onboarding/config";
import { ProgressBar } from "@/features/onboarding/components/ProgressBar";
import { StepContent } from "@/features/onboarding/components/StepContent";
import { ResultsView } from "@/features/onboarding/components/ResultsView";
import { MealIdeasLoading } from "@/features/onboarding/components/MealIdeasLoading";
import { MealIdeasView } from "@/features/onboarding/components/MealIdeasView";

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

  const {
    isLoading,
    error,
    mealIdeas,
    showMealIdeas,
    generateMealIdeas,
    handleBack,
  } = useMealIdeas();

  // Show loading page while meal ideas are being generated
  if (isLoading) {
    return <MealIdeasLoading />;
  }

  // Show meal ideas view once generation is complete
  if (showMealIdeas && mealIdeas && mealIdeas.length > 0) {
    return <MealIdeasView mealIdeas={mealIdeas} onBack={handleBack} />;
  }

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

          {/* Step Content or Results */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {showResults && results ? (
              <ResultsView
                results={results}
                isLoading={isLoading}
                error={error}
                onGenerateMealIdeas={() => generateMealIdeas(results)}
              />
            ) : (
              <StepContent
                step={STEPS[currentStep]}
                profile={profile}
                heightUnit={heightUnit}
                weightUnit={weightUnit}
                onAnswerChange={handleAnswerChange}
                onHeightUnitChange={handleHeightUnitChange}
                onWeightUnitChange={handleWeightUnitChange}
              />
            )}
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
