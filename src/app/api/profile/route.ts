import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles, nutritionResults } from "@/db/schema";
import type { UserProfile, NutritionResults } from "@/features/onboarding/types";
import { calculateNutrition } from "@/features/onboarding/utils/calculateNutrition";

/**
 * GET /api/profile
 *
 * Returns the current user's profile and nutrition results.
 * Returns { profile: null, nutrition: null } if the user hasn't completed onboarding.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [profile, nutrition] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
    db.query.nutritionResults.findFirst({ where: eq(nutritionResults.userId, userId) }),
  ]);

  return NextResponse.json({
    profile: profile ?? null,
    nutrition: nutrition ?? null,
  });
}

/**
 * POST /api/profile
 *
 * Saves (upserts) the user's profile and nutrition results after onboarding.
 *
 * Expected body:
 * {
 *   profile: UserProfile   // raw form data (height/weight may be in any unit)
 *   nutrition: NutritionResults
 * }
 *
 * Height and weight are converted to cm/kg before storage (canonical units).
 * Unit preferences will be stored separately once that schema column is added.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await request.json();
  const { profile, nutrition }: { profile: UserProfile; nutrition: NutritionResults } = body;

  if (!profile || !nutrition) {
    return NextResponse.json({ error: "Missing profile or nutrition data" }, { status: 400 });
  }

  // Validate enum fields
  const validGenders = ["male", "female"] as const;
  const validActivityLevels = ["sedentary", "light", "moderate", "active", "very_active"] as const;
  const validGoals = ["bulk", "cut"] as const;
  const validGoalPriorities = ["aggressive", "balanced", "conservative"] as const;

  if (!validGenders.includes(profile.gender as typeof validGenders[number])) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  }
  if (!validActivityLevels.includes(profile.activityLevel as typeof validActivityLevels[number])) {
    return NextResponse.json({ error: "Invalid activity level" }, { status: 400 });
  }
  if (!validGoals.includes(profile.goal as typeof validGoals[number])) {
    return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  }
  if (!validGoalPriorities.includes(profile.goalPriority as typeof validGoalPriorities[number])) {
    return NextResponse.json({ error: "Invalid goal priority" }, { status: 400 });
  }

  // Convert height to cm
  let heightCm: number;
  if (profile.height.unit === "ft") {
    const feet = parseFloat(profile.height.value) || 0;
    const inches = parseFloat(profile.height.inches ?? "0") || 0;
    heightCm = feet * 30.48 + inches * 2.54;
  } else {
    heightCm = parseFloat(profile.height.value);
  }

  // Convert weight to kg
  let weightKg: number;
  if (profile.weight.unit === "lb") {
    weightKg = parseFloat(profile.weight.value) / 2.20462;
  } else {
    weightKg = parseFloat(profile.weight.value);
  }

  // Validate converted numeric values
  const age = parseInt(profile.age);
  if (isNaN(heightCm) || heightCm <= 0 || heightCm > 300) {
    return NextResponse.json({ error: "Invalid height" }, { status: 400 });
  }
  if (isNaN(weightKg) || weightKg <= 0 || weightKg > 500) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }
  if (isNaN(age) || age <= 0 || age > 120) {
    return NextResponse.json({ error: "Invalid age" }, { status: 400 });
  }

  const now = new Date();

  await db
    .insert(userProfiles)
    .values({
      id: crypto.randomUUID(),
      userId,
      height: heightCm,
      weight: weightKg,
      age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      goalPriority: profile.goalPriority,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        height: heightCm,
        weight: weightKg,
        age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
        goalPriority: profile.goalPriority,
        updatedAt: now,
      },
    });

  await db
    .insert(nutritionResults)
    .values({
      id: crypto.randomUUID(),
      userId,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      bmi: nutrition.bmi,
      bmr: nutrition.bmr,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: nutritionResults.userId,
      set: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        bmi: nutrition.bmi,
        bmr: nutrition.bmr,
        updatedAt: now,
      },
    });

  return NextResponse.json({ success: true });
}

/**
 * PATCH /api/profile
 *
 * Updates the user's profile fields (in metric units) and recalculates nutrition.
 *
 * Expected body:
 * {
 *   heightCm: number
 *   weightKg: number
 *   age: number
 *   gender: string
 *   activityLevel: string
 *   goal: string
 *   goalPriority: string
 * }
 *
 * Returns { success: true, nutrition: NutritionResults }
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { heightCm, weightKg, age, gender, activityLevel, goal, goalPriority } = body;

  // Validate enum fields
  const validGenders = ["male", "female"] as const;
  const validActivityLevels = ["sedentary", "light", "moderate", "active", "very_active"] as const;
  const validGoals = ["bulk", "cut"] as const;
  const validGoalPriorities = ["aggressive", "balanced", "conservative"] as const;

  if (!validGenders.includes(gender)) return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  if (!validActivityLevels.includes(activityLevel)) return NextResponse.json({ error: "Invalid activity level" }, { status: 400 });
  if (!validGoals.includes(goal)) return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  if (!validGoalPriorities.includes(goalPriority)) return NextResponse.json({ error: "Invalid goal priority" }, { status: 400 });

  const hCm = parseFloat(heightCm);
  const wKg = parseFloat(weightKg);
  const ageNum = parseInt(age);

  if (isNaN(hCm) || hCm <= 0 || hCm > 300) return NextResponse.json({ error: "Invalid height" }, { status: 400 });
  if (isNaN(wKg) || wKg <= 0 || wKg > 500) return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) return NextResponse.json({ error: "Invalid age" }, { status: 400 });

  // Build a UserProfile to pass to calculateNutrition (values already in metric)
  const fakeProfile: UserProfile = {
    height: { value: String(hCm), unit: "cm" },
    weight: { value: String(wKg), unit: "kg" },
    age: String(ageNum),
    gender,
    activityLevel,
    goal,
    goalPriority,
  };

  const nutrition = calculateNutrition(fakeProfile);
  const now = new Date();

  await db
    .insert(userProfiles)
    .values({
      id: crypto.randomUUID(),
      userId,
      height: hCm,
      weight: wKg,
      age: ageNum,
      gender,
      activityLevel,
      goal,
      goalPriority,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { height: hCm, weight: wKg, age: ageNum, gender, activityLevel, goal, goalPriority, updatedAt: now },
    });

  await db
    .insert(nutritionResults)
    .values({
      id: crypto.randomUUID(),
      userId,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      bmi: nutrition.bmi,
      bmr: nutrition.bmr,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: nutritionResults.userId,
      set: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        bmi: nutrition.bmi,
        bmr: nutrition.bmr,
        updatedAt: now,
      },
    });

  return NextResponse.json({ success: true, nutrition });
}
