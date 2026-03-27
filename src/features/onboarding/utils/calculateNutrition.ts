import type { UserProfile, NutritionResults } from "../types";
import { heightToCm, weightToKg } from "@/lib/units";
import { ACTIVITY_LEVELS } from "../config";

/**
 * Calculate nutrition recommendations
 */
export function calculateNutrition(profile: UserProfile): NutritionResults {
  // Convert all values to metric for calculation
  const heightInCm = heightToCm(profile.height.value, profile.height.unit, profile.height.inches);
  const weightInKg = weightToKg(profile.weight.value, profile.weight.unit);

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
  const activityMultipliers = Object.fromEntries(
    ACTIVITY_LEVELS.map((l) => [l.value, l.multiplier]),
  );

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

  // Minimum safe calorie floor to avoid recommending dangerously low intake.
  // Below these thresholds the body enters starvation mode and muscle loss accelerates.
  // 1200 kcal for females, 1500 kcal for males are widely accepted clinical minimums.
  const minCalories = profile.gender === "female" ? 1200 : 1500;
  dailyCalories = Math.max(dailyCalories, minCalories);

  // Carbs: fill remaining calories after protein and fat are accounted for.
  // Carbs = 4 kcal per gram.
  // Clamped to 0 in edge cases where protein + fat already meet or exceed the calorie
  // target (e.g. very light bodyweight + aggressive cut).
  const remainingCalories = dailyCalories - proteinCalories - fatCalories;
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  return {
    calories: dailyCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    bmr: Math.round(bmr), // Round to nearest whole number
  };
}
