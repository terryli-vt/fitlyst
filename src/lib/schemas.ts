import { z } from "zod";
import {
  VALID_DIETARY_RESTRICTIONS,
  VALID_ALLERGIES,
  VALID_CUISINES,
} from "@/features/onboarding/config";

export const enumFields = {
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["bulk", "cut", "maintain"]),
  goalPriority: z.enum(["aggressive", "balanced", "conservative"]),
};

// POST /api/profile — raw form data, height/weight may be in any unit
export const postProfileSchema = z.object({
  profile: z.object({
    height: z.object({
      value: z.string(),
      unit: z.enum(["cm", "ft"]),
      inches: z.string().optional(),
    }),
    weight: z.object({
      value: z.string(),
      unit: z.enum(["kg", "lb"]),
    }),
    age: z.string(),
    gender: enumFields.gender,
    activityLevel: enumFields.activityLevel,
    goal: enumFields.goal,
    goalPriority: enumFields.goalPriority,
  }),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    bmi: z.number(),
    bmr: z.number(),
  }),
});

// Shared preference fields (reused in PATCH and generate schemas)
export const preferencesFields = {
  dietaryRestrictions: z.array(z.enum(VALID_DIETARY_RESTRICTIONS as [string, ...string[]])).optional(),
  allergies: z.array(z.enum(VALID_ALLERGIES as [string, ...string[]])).optional(),
  cuisinePreferences: z.array(z.enum(VALID_CUISINES as [string, ...string[]])).optional(),
};

// PATCH /api/profile — supports two shapes:
//   1. Full profile update (main fields required) + optional preferences
//   2. Preferences-only update (no main fields needed)
export const patchProfileSchema = z.union([
  z.object({
    heightCm: z.number().positive().max(300),
    weightKg: z.number().positive().max(500),
    age: z.number().int().positive().max(120),
    gender: enumFields.gender,
    activityLevel: enumFields.activityLevel,
    goal: enumFields.goal,
    goalPriority: enumFields.goalPriority,
    ...preferencesFields,
  }),
  z.object(preferencesFields),
]);

// POST /api/generate-meal-ideas
export const generateMealIdeasSchema = z.object({
  nutrition: z.object({
    calories: z.number().positive(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    bmi: z.number(),
    bmr: z.number(),
  }),
  preferences: z.object({
    dietaryRestrictions: z.array(z.enum(VALID_DIETARY_RESTRICTIONS as [string, ...string[]])),
    allergies: z.array(z.enum(VALID_ALLERGIES as [string, ...string[]])),
    cuisinePreferences: z.array(z.enum(VALID_CUISINES as [string, ...string[]])),
  }).optional(),
});
