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

  // Calculate BMI (Body Mass Index)
  // BMI = weight (kg) / height (m)^2
  const heightInM = heightInCm / 100;
  const bmi = weightInKg / (heightInM * heightInM);

  // BMR calculation using Mifflin-St Jeor Equation
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  const baseBmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age;
  const bmr = profile.gender === "female" ? baseBmr - 161 : baseBmr + 5;

  // TDEE (Total Daily Energy Expenditure) calculation
  // TDEE = BMR × Activity Multiplier
  // Activity multipliers based on activity level:
  // - Sedentary: 1.2
  // - Training 1–3 days/week: 1.375
  // - Training 3–5 days/week: 1.55
  // - Training 6–7 days/week: 1.725
  // - Very physical job / athlete: 1.9
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  // Default to sedentary (1.2) if activity level is invalid or empty
  // This is a safety fallback, though validation should prevent this in normal flow
  const multiplier =
    activityMultipliers[profile.activityLevel] || activityMultipliers.sedentary;
  const tdee = bmr * multiplier;
  const dailyCalories = Math.round(tdee);

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
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    bmr: Math.round(bmr), // Round to nearest whole number
  };
}
