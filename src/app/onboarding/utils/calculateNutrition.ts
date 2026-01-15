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

  // Calculate target calories based on goal and priority
  let dailyCalories: number;

  if (profile.goal === "bulk") {
    // Bulking: TDEE + 250-400 kcal
    const minSurplus = 250;
    const maxSurplus = 400;
    let surplus: number;

    if (profile.goalPriority === "aggressive") {
      surplus = maxSurplus; // Upper end
    } else if (profile.goalPriority === "conservative") {
      surplus = minSurplus; // Lower end
    } else {
      // Balanced (or default)
      surplus = (minSurplus + maxSurplus) / 2; // Middle
    }

    dailyCalories = Math.round(tdee + surplus);
  } else if (profile.goal === "cut") {
    // Cutting: TDEE - 300-500 kcal
    const minDeficit = 300;
    const maxDeficit = 500;
    let deficit: number;

    if (profile.goalPriority === "aggressive") {
      deficit = maxDeficit; // Upper end (more aggressive deficit = faster progress)
    } else if (profile.goalPriority === "conservative") {
      deficit = minDeficit; // Lower end (less aggressive deficit = slower but leaner)
    } else {
      // Balanced (or default)
      deficit = (minDeficit + maxDeficit) / 2; // Middle
    }

    dailyCalories = Math.round(tdee - deficit);
  } else {
    // Default to maintenance (TDEE) if no goal is selected
    dailyCalories = Math.round(tdee);
  }

  // Macro distribution based on bodyweight
  // Protein: 2g per kg bodyweight
  const proteinGrams = Math.round(weightInKg * 2);
  const proteinCalories = proteinGrams * 4; // Protein = 4 kcal per gram

  // Fat: 0.8g per kg bodyweight
  const fatGrams = Math.round(weightInKg * 0.8);
  const fatCalories = fatGrams * 9; // Fat = 9 kcal per gram

  // Carbs: fill remaining calories
  // Carbs = 4 kcal per gram
  const remainingCalories = dailyCalories - proteinCalories - fatCalories;
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    calories: dailyCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    bmr: Math.round(bmr), // Round to nearest whole number
  };
}
