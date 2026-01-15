/**
 * User Profile Type
 *
 * This structure is designed to be easily persisted to a database later.
 * Future: Add userId, createdAt, updatedAt fields when authentication is implemented.
 */
export interface UserProfile {
  height: {
    value: string;
    unit: "cm" | "ft";
    inches?: string; // For imperial height (ft + in)
  };
  weight: {
    value: string;
    unit: "kg" | "lb";
  };
  age: string;
  gender: "male" | "female" | "";
  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | "";
  goal: "bulk" | "cut" | "";
  goalPriority: "aggressive" | "balanced" | "conservative" | "";
}

/**
 * Nutrition Results Type
 *
 * Future: This could come from an AI service or more complex calculation.
 */
export interface NutritionResults {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmi: number;
  bmr: number;
}
