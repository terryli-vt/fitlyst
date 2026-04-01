"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
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
    remainingGenerations,
    generateMealIdeas,
    viewMealIdeas,
    handleBack,
  } = useMealIdeas();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium text-teal-700 dark:text-teal-400">
            Calculating your nutrition plan...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <MealIdeasLoading />;
  }

  if (showMealIdeas && mealIdeas && mealIdeas.length > 0) {
    return <MealIdeasView mealIdeas={mealIdeas} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <Navbar showLogin={false} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`w-full ${showResults ? "max-w-4xl" : "max-w-2xl"}`}>
          {!showResults && (
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Tell us more about yourself
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We&apos;ll use this to personalise your nutrition plan.
              </p>
            </div>
          )}

          {!showResults && (
            <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            {showResults && results ? (
              <ResultsView
                results={results}
                isLoading={isLoading}
                error={error}
                hasMealIdeas={!!mealIdeas && mealIdeas.length > 0}
                remainingGenerations={remainingGenerations}
                onGenerateMealIdeas={() => generateMealIdeas(results)}
                onViewMealIdeas={viewMealIdeas}
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
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm mb-4">
                  {saveError}
                </div>
              )}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
