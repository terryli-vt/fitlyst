import type { UserProfile, NutritionResults } from "../types";

/**
 * Calculate nutrition recommendations
 *
 * This is a simplified calculation for MVP.
 * Future: Replace with AI-powered calculation or API call
 * Future: This could be moved to a separate service/utility file
 *
 * Uses basic BMR (Basal Metabolic Rate) calculation with activity multiplier
 */
export function calculateNutrition(profile: UserProfile): NutritionResults {
  // Convert all values to metric for calculation
  let heightInCm: number;
  let weightInKg: number;

  // Convert height to cm
  if (profile.height.unit === "ft") {
    const feet = parseFloat(profile.height.value) || 0;
    const inches = parseFloat(profile.height.inches || "0") || 0;
    heightInCm = feet * 30.48 + inches * 2.54;
  } else {
    heightInCm = parseFloat(profile.height.value) || 0;
  }

  // Convert weight to kg
  if (profile.weight.unit === "lb") {
    weightInKg = (parseFloat(profile.weight.value) || 0) * 0.453592;
  } else {
    weightInKg = parseFloat(profile.weight.value) || 0;
  }

  const age = parseFloat(profile.age) || 0;

  // Simplified BMR calculation (Mifflin-St Jeor Equation)
  // For MVP, using a simplified version
  // Future: Use more accurate formula or AI-based calculation
  const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;

  // Activity multipliers
  const activityMultipliers = {
    low: 1.2,
    medium: 1.55,
    high: 1.725,
  };

  const multiplier =
    activityMultipliers[
      profile.activityLevel as keyof typeof activityMultipliers
    ] || 1.2;
  const dailyCalories = Math.round(bmr * multiplier);

  // Macro distribution (simplified for MVP)
  // Future: Make this personalized based on goals, preferences, etc.
  const proteinGrams = Math.round((dailyCalories * 0.3) / 4); // 30% calories from protein
  const carbsGrams = Math.round((dailyCalories * 0.45) / 4); // 45% calories from carbs
  const fatGrams = Math.round((dailyCalories * 0.25) / 9); // 25% calories from fat

  return {
    calories: dailyCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
  };
}
