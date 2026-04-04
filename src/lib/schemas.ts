import { z } from "zod";
import {
  VALID_DIETARY_RESTRICTIONS,
  VALID_ALLERGIES,
  VALID_CUISINES,
} from "@/features/onboarding/config";
import { MAX_HEIGHT_CM, MAX_WEIGHT_KG, MAX_AGE } from "./constants";

/** Reusable Zod enum fields shared across profile schemas. */
export const enumFields = {
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["bulk", "cut", "maintain"]),
  goalPriority: z.enum(["aggressive", "balanced", "conservative"]),
};

/**
 * Validates the body of POST /api/profile.
 * Accepts raw form data where height/weight may be in any supported unit.
 */
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

/** Shared dietary preference fields reused across PATCH and generate-meal-ideas schemas. */
export const preferencesFields = {
  dietaryRestrictions: z.array(z.enum(VALID_DIETARY_RESTRICTIONS as [string, ...string[]])).optional(),
  allergies: z.array(z.enum(VALID_ALLERGIES as [string, ...string[]])).optional(),
  cuisinePreferences: z.array(z.enum(VALID_CUISINES as [string, ...string[]])).optional(),
};

/**
 * Validates the body of PATCH /api/profile.
 * Accepts two shapes:
 *   1. Full profile update — all main fields required, preferences optional.
 *   2. Preferences-only update — no main fields needed.
 */
export const patchProfileSchema = z.union([
  z.object({
    heightCm: z.number().positive().max(MAX_HEIGHT_CM),
    weightKg: z.number().positive().max(MAX_WEIGHT_KG),
    age: z.number().int().positive().max(MAX_AGE),
    gender: enumFields.gender,
    activityLevel: enumFields.activityLevel,
    goal: enumFields.goal,
    goalPriority: enumFields.goalPriority,
    ...preferencesFields,
  }),
  z.object(preferencesFields),
]);

/** Validates the body of POST /api/generate-meal-ideas. */
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
