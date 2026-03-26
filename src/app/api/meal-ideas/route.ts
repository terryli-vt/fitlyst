import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { mealIdeas } from "@/db/schema";
import type { MealIdea } from "@/features/onboarding/types";
import { getRemainingGenerations } from "@/lib/mealGenerationLimit";

/**
 * POST /api/meal-ideas
 *
 * Saves (upserts) the generated meal ideas for the current user.
 * Expected body: { meals: MealIdea[] }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { meals }: { meals: MealIdea[] } = body;

  if (!Array.isArray(meals) || meals.length === 0) {
    return NextResponse.json({ error: "Invalid meal ideas data" }, { status: 400 });
  }

  await db
    .insert(mealIdeas)
    .values({
      id: crypto.randomUUID(),
      userId,
      mealsJson: JSON.stringify(meals),
      generatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: mealIdeas.userId,
      set: {
        mealsJson: JSON.stringify(meals),
        generatedAt: new Date(),
      },
    });

  return NextResponse.json({ success: true });
}

/**
 * GET /api/meal-ideas
 *
 * Returns the saved meal ideas for the current user, or null if none exist.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await db.query.mealIdeas.findFirst({
    where: eq(mealIdeas.userId, session.user.id),
  });

  const remainingGenerations = getRemainingGenerations(record);

  if (!record) {
    return NextResponse.json({ meals: null, remainingGenerations });
  }

  return NextResponse.json({
    meals: JSON.parse(record.mealsJson),
    remainingGenerations,
  });
}
