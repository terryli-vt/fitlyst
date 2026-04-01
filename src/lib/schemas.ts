import { z } from "zod";

export const enumFields = {
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["bulk", "cut"]),
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

// PATCH /api/profile — values already in metric units
export const patchProfileSchema = z.object({
  heightCm: z.number().positive().max(300),
  weightKg: z.number().positive().max(500),
  age: z.number().int().positive().max(120),
  gender: enumFields.gender,
  activityLevel: enumFields.activityLevel,
  goal: enumFields.goal,
  goalPriority: enumFields.goalPriority,
});

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
});
