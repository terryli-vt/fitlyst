// useOnboarding is a custom React hook that manages the state and logic for the onboarding flow
// It centralizes all the state related to the user's profile, the current step of the questionnaire, and the results calculation.
// By using this hook in the onboarding page component, we can keep the component clean and focused on rendering, while all the logic is handled in this reusable hook. This also allows us to easily extend or modify the onboarding logic in the future without having to change the component code.
// If you use useState in a component, then the state is local to that component and not reusable.
"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/error";
import { useRouter } from "next/navigation";
import type { UserProfile, NutritionResults } from "../types";
import { STEPS } from "../config";
import { calculateNutrition } from "../utils/calculateNutrition";

/**
 * Custom hook for onboarding flow state management
 * Hooks let you hook into React features from function components.
 *
 * Manages all state and handlers for the multi-step onboarding questionnaire.
 * Future: Could be extended to handle loading/saving from API when authentication is added.
 */
export function useOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // User profile state - structured for future persistence
  // <UserProfile> is a TypeScript generic type, meaning the profile state must follow the structure defined by the UserProfile interface or type.
  // Future: This could be initialized from saved user data if authenticated
  const [profile, setProfile] = useState<UserProfile>({
    height: { value: "", unit: "cm" },
    weight: { value: "", unit: "kg" },
    age: "",
    gender: "",
    activityLevel: "",
    goal: "",
    goalPriority: "",
  });

  // Unit preferences for height and weight
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  /**
   * Handle answer input changes
   * Updates the profile state with the new answer
   */
  const handleAnswerChange = (
    key: keyof UserProfile,
    value: string | { value: string; unit: string; inches?: string },
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Handle height unit change
   * Note: Conversion logic is handled in HeightInput component
   */
  const handleHeightUnitChange = (newUnit: "cm" | "ft") => {
    setHeightUnit(newUnit);
  };

  /**
   * Handle weight unit change
   * Note: Conversion logic is handled in WeightInput component
   */
  const handleWeightUnitChange = (newUnit: "kg" | "lb") => {
    setWeightUnit(newUnit);
  };

  /**
   * Validate current step before proceeding
   * Returns true if the current step has a valid answer
   */
  const validateCurrentStep = (): boolean => {
    const step = STEPS[currentStep];

    if (step.type === "height") {
      if (heightUnit === "cm") {
        const heightValue = parseFloat(profile.height.value);
        return (
          profile.height.value !== "" && heightValue > 0 && heightValue <= 300 // Maximum height: 300 cm
        );
      } else {
        // For imperial, need both feet and inches
        const feet = parseFloat(profile.height.value) || 0;
        const inches = parseFloat(profile.height.inches || "0") || 0;
        // Convert to cm for validation: 300 cm = 9 feet 10.11 inches
        // We'll allow up to 9 feet 10 inches (9'10")
        const totalInches = feet * 12 + inches;
        const maxInches = 300 / 2.54; // ~118.11 inches
        return (
          profile.height.value !== "" &&
          profile.height.inches !== "" &&
          feet > 0 &&
          inches >= 0 &&
          totalInches <= maxInches
        );
      }
    }

    if (step.type === "weight") {
      const weightValue = parseFloat(profile.weight.value);
      if (weightUnit === "kg") {
        return (
          profile.weight.value !== "" && weightValue > 0 && weightValue <= 500 // Maximum weight: 500 kg
        );
      } else {
        // For lb: 500 kg = 1102.31 lb
        const maxLb = 500 * 2.20462; // ~1102.31 lb
        return (
          profile.weight.value !== "" && weightValue > 0 && weightValue <= maxLb
        );
      }
    }

    if (step.type === "number") {
      const ageValue = parseFloat(profile.age);
      return (
        profile.age !== "" && ageValue > 0 && ageValue <= 120 // Maximum age: 120
      );
    }

    if (step.type === "gender") {
      return profile.gender !== "";
    }

    // "activity" was previously called "select" — renamed to be descriptive
    if (step.type === "activity") {
      return profile.activityLevel !== "";
    }

    if (step.type === "goal") {
      return profile.goal !== "";
    }

    if (step.type === "goalPriority") {
      return profile.goalPriority !== "";
    }

    return false;
  };

  /**
   * Navigate to next step.
   * On the last step, saves profile + nutrition to the API (showing a loading screen),
   * then reveals the results page on success.
   * Uses upsert, so re-submitting after "Edit Answers" will update existing data.
   */
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep === STEPS.length - 1) {
      const nutrition = calculateNutrition(profile);
      setIsSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, nutrition }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to save profile");
        }
        setShowResults(true);
      } catch (err: unknown) {
        setSaveError(getErrorMessage(err, "Failed to save profile"));
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * Navigate to previous step.
   * From the results view, goes back to the last questionnaire step.
   */
  const handlePrevious = () => {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(STEPS.length - 1);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Calculate results once showResults is true
  const results: NutritionResults | null = showResults
    ? calculateNutrition(profile)
    : null;

  return {
    // State
    currentStep,
    showResults,
    isSaving,
    saveError,
    profile,
    heightUnit,
    weightUnit,
    results,

    // Handlers
    handleAnswerChange,
    handleHeightUnitChange,
    handleWeightUnitChange,
    handleNext,
    handlePrevious,
    validateCurrentStep,
  };
}
