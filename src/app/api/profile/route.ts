import { NextRequest, NextResponse } from "next/server";
import { heightToCm, weightToKg } from "@/lib/units";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles, nutritionResults } from "@/db/schema";
import type { UserProfile } from "@/features/onboarding/types";
import { calculateNutrition } from "@/features/onboarding/utils/calculateNutrition";
import { postProfileSchema, patchProfileSchema } from "@/lib/schemas";

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
    db.query.nutritionResults.findFirst({
      where: eq(nutritionResults.userId, userId),
    }),
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
  const parsed = postProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { profile, nutrition } = parsed.data as { profile: UserProfile; nutrition: typeof parsed.data.nutrition };

  // Convert height and weight to metric
  const heightCm = heightToCm(profile.height.value, profile.height.unit, profile.height.inches ?? undefined);
  const weightKg = weightToKg(profile.weight.value, profile.weight.unit);
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

  // onConflictDoUpdate is used to perform an upsert: if a record for this user already exists, it will be updated with the new values; if not, a new record will be inserted. This ensures that we only have one profile and one nutrition result per user, which are updated as needed.
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
  const parsed = patchProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const now = new Date();

  // Preferences-only update (no main profile fields)
  if (!("heightCm" in data)) {
    const prefSet: Record<string, string | Date> = { updatedAt: now };
    if (data.dietaryRestrictions !== undefined)
      prefSet.dietaryRestrictions = JSON.stringify(data.dietaryRestrictions);
    if (data.allergies !== undefined)
      prefSet.allergies = JSON.stringify(data.allergies);
    if (data.cuisinePreferences !== undefined)
      prefSet.cuisinePreferences = JSON.stringify(data.cuisinePreferences);

    await db
      .update(userProfiles)
      .set(prefSet)
      .where(eq(userProfiles.userId, userId));

    return NextResponse.json({ success: true });
  }

  // Full profile update
  const { heightCm: hCm, weightKg: wKg, age: ageNum, gender, activityLevel, goal, goalPriority,
          dietaryRestrictions, allergies, cuisinePreferences } = data;

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
      dietaryRestrictions: dietaryRestrictions ? JSON.stringify(dietaryRestrictions) : null,
      allergies: allergies ? JSON.stringify(allergies) : null,
      cuisinePreferences: cuisinePreferences ? JSON.stringify(cuisinePreferences) : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        height: hCm,
        weight: wKg,
        age: ageNum,
        gender,
        activityLevel,
        goal,
        goalPriority,
        dietaryRestrictions: dietaryRestrictions ? JSON.stringify(dietaryRestrictions) : null,
        allergies: allergies ? JSON.stringify(allergies) : null,
        cuisinePreferences: cuisinePreferences ? JSON.stringify(cuisinePreferences) : null,
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

  return NextResponse.json({ success: true, nutrition });
}
