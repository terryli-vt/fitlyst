// useOnboarding centralizes onboarding state and handlers, making the component cleaner and the logic reusable.
// If you use useState in a component, then the state is local to that component and not reusable.
"use client";

import { useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // User profile state - structured for future persistence
  // <UserProfile> is a TypeScript generic type, meaning the profile state must follow the structure defined by the UserProfile interface or type.
  // Future: This could be initialized from saved user data if authenticated
  const [profile, setProfile] = useState<UserProfile>({
    height: { value: "", unit: "cm" },
    weight: { value: "", unit: "kg" },
    age: "",
    gender: "",
    activityLevel: "",
  });

  // Unit preferences for height and weight
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  // Calculate progress percentage
  // Formula: (current step + 1) / total steps * 100
  const progress = showResults ? 100 : ((currentStep + 1) / STEPS.length) * 100;

  /**
   * Handle answer input changes
   * Updates the profile state with the new answer
   */
  const handleAnswerChange = (
    key: keyof UserProfile,
    value: string | { value: string; unit: string; inches?: string }
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

    if (step.type === "select") {
      return profile.activityLevel !== "";
    }

    return false;
  };

  /**
   * Navigate to next step
   * Validates current answer before proceeding
   */
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }

    // If on last step, show results
    if (currentStep === STEPS.length - 1) {
      setShowResults(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * Navigate to previous step
   * Only works if not on first step
   */
  const handlePrevious = () => {
    // If on results view, go back to last step (step 3, index 3)
    if (showResults) {
      setShowResults(false);
      setCurrentStep(STEPS.length - 1);
      return;
    }

    // Otherwise, go to previous step
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Calculate results when showing results view
  const results: NutritionResults | null = showResults
    ? calculateNutrition(profile)
    : null;

  return {
    // State
    currentStep,
    showResults,
    profile,
    heightUnit,
    weightUnit,
    progress,
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
