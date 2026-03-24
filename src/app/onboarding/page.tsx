"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Authenticated — check if onboarding is already done
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          router.push("/profile");
        } else {
          setAuthChecked(true);
        }
      });
  }, [status, router]);

  const {
    currentStep,
    showResults,
    isSaving,
    saveError,
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

  // Show loading screen during auth/profile check
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show saving/calculating loading screen
  if (isSaving) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium text-teal-700">Calculating your nutrition plan...</p>
        </div>
      </div>
    );
  }

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
                disabled={!validateCurrentStep() || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  validateCurrentStep() && !isSaving
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
            <>
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
                  {saveError}
                </div>
              )}
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
                <button
                  onClick={() => router.push("/profile")}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-teal-800 hover:bg-teal-900 transition-colors"
                >
                  Go to Profile
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
