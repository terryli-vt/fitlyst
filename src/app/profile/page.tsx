import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles, nutritionResults, mealIdeas } from "@/db/schema";
import ProfileContent from "@/features/profile/components/ProfileContent";
import type { MealIdea, DietaryPreferences } from "@/features/onboarding/types";
import { getRemainingGenerations } from "@/lib/mealGenerationLimit";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id: userId, name, email, image } = session.user;

  const [profile, nutrition, mealRecord] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId!),
    }),
    db.query.nutritionResults.findFirst({
      where: eq(nutritionResults.userId, userId!),
    }),
    db.query.mealIdeas.findFirst({ where: eq(mealIdeas.userId, userId!) }),
  ]);

  const meals: MealIdea[] | null = mealRecord
    ? (JSON.parse(mealRecord.mealsJson) as MealIdea[])
    : null;

  const remainingGenerations = getRemainingGenerations(mealRecord);

  const initialPreferences: DietaryPreferences = {
    dietaryRestrictions: parseJsonArray(profile?.dietaryRestrictions),
    allergies: parseJsonArray(profile?.allergies),
    cuisinePreferences: parseJsonArray(profile?.cuisinePreferences),
  };

  return (
    <ProfileContent
      user={{ name: name ?? null, email: email ?? null, image: image ?? null }}
      initialProfile={
        profile
          ? {
              height: profile.height,
              weight: profile.weight,
              age: profile.age,
              gender: profile.gender,
              activityLevel: profile.activityLevel,
              goal: profile.goal,
              goalPriority: profile.goalPriority,
              dietaryRestrictions: initialPreferences.dietaryRestrictions,
              allergies: initialPreferences.allergies,
              cuisinePreferences: initialPreferences.cuisinePreferences,
            }
          : null
      }
      initialNutrition={
        nutrition
          ? {
              calories: nutrition.calories,
              protein: nutrition.protein,
              carbs: nutrition.carbs,
              fat: nutrition.fat,
              bmi: nutrition.bmi,
              bmr: nutrition.bmr,
            }
          : null
      }
      initialMeals={meals}
      initialRemainingGenerations={remainingGenerations}
      initialPreferences={initialPreferences}
    />
  );
}
