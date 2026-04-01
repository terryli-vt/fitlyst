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
    // Maintenance (or unrecognised goal): target exactly TDEE
    dailyCalories = Math.round(tdee);
  }

  // Macro distribution based on bodyweight
  // Protein multiplier differs by goal:
  //   Cut:          2.2g/kg — higher intake preserves lean mass during a caloric deficit
  //                 (ISSN meta-analysis recommendation for fat-loss phases)
  //   Bulk/other:   2g/kg  — sufficient to maximise muscle protein synthesis
  // For overweight/obese users (BMI > 25), protein is based on Ideal Body Weight
  // (IBW = 22 × height_m²) to avoid overestimating needs for excess body fat,
  // which does not require the same protein support as lean mass.
  const ibw = 22 * heightInM * heightInM;
  const proteinWeightBasis = bmi > 25 ? ibw : weightInKg;
  const proteinMultiplier = profile.goal === "cut" ? 2.2 : 2;
  const proteinGrams = Math.round(proteinWeightBasis * proteinMultiplier);
  const proteinCalories = proteinGrams * 4; // Protein = 4 kcal per gram

  // Fat: 1g per kg bodyweight (ISSN minimum recommendation).
  // Same IBW basis as protein when BMI > 25 — keeps fat % within the AMDR 20–35%
  // range and avoids an inconsistent split where low IBW-protein meets high
  // actual-weight fat (which pushed fat to 40–50% for obese users).
  const fatWeightBasis = bmi > 25 ? ibw : weightInKg;
  const fatGrams = Math.round(fatWeightBasis * 1);
  const fatCalories = fatGrams * 9; // Fat = 9 kcal per gram

  // Minimum safe calorie floor to avoid recommending dangerously low intake.
  // Below these thresholds the body enters starvation mode and muscle loss accelerates.
  // 1200 kcal for females, 1500 kcal for males are widely accepted clinical minimums.
  const minCalories = profile.gender === "female" ? 1200 : 1500;
  dailyCalories = Math.max(dailyCalories, minCalories);

  // Carbs: fill remaining calories after protein and fat are accounted for.
  // Carbs = 4 kcal per gram.
  // A minimum of 100g is enforced to prevent accidentally recommending a ketogenic
  // diet (typically < 50g). 100g is a widely cited sports-nutrition floor that keeps
  // the brain adequately fuelled without requiring deliberate keto tracking.
  // If the floor raises carbs above the calculated value, dailyCalories is updated
  // to match so that the displayed total always equals protein + fat + carb calories.
  const MIN_CARBS_GRAMS = 100;
  const remainingCalories = dailyCalories - proteinCalories - fatCalories;
  const rawCarbsGrams = Math.max(0, Math.round(remainingCalories / 4));
  const carbsGrams = Math.max(MIN_CARBS_GRAMS, rawCarbsGrams);
  if (carbsGrams > rawCarbsGrams) {
    dailyCalories = proteinCalories + fatCalories + carbsGrams * 4;
  }

  return {
    calories: dailyCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    bmr: Math.round(bmr), // Round to nearest whole number
  };
}
