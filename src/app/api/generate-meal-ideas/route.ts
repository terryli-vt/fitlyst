/**
 * API Route: Generate Meal Ideas
 * 
 * This endpoint generates personalized meal ideas based on the user's nutrition plan.
 * 
 * Data Flow:
 * 1. Client sends POST request with nutrition data (calories, protein, carbs, fat)
 * 2. Server constructs a prompt for the LLM
 * 3. LLM generates 3-5 meal ideas (breakfast, lunch, dinner)
 * 4. Server parses and returns structured meal data
 * 
 * Security Note:
 * - OpenAI API key should be stored in environment variable OPENAI_API_KEY
 * - This endpoint does not require authentication for MVP
 * - Future: Add rate limiting and user authentication when implementing logged-in users
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { mealIdeas as mealIdeasTable } from "@/db/schema";
import { openai } from "@/lib/openai";
import type { NutritionResults, MealIdea, DietaryPreferences } from "@/features/onboarding/types";
import { getTodayCount } from "@/lib/mealGenerationLimit";
import { DAILY_GENERATION_LIMIT, OPENAI_MODEL, OPENAI_TEMPERATURE, OPENAI_MAX_TOKENS } from "@/lib/constants";
import { generateMealIdeasSchema } from "@/lib/schemas";

/**
 * Construct the prompt for the LLM
 * 
 * The prompt includes:
 * - User's daily nutrition targets (calories, protein, carbs, fat)
 * - Instructions to generate 3-5 meal ideas
 * - Requirements for meal type labels (breakfast/lunch/dinner)
 * - Request for macro breakdown per meal
 * - Emphasis on simple, beginner-friendly suggestions
 */
function constructPrompt(nutrition: NutritionResults, preferences?: DietaryPreferences): string {
  const hasPreferences =
    preferences &&
    (preferences.dietaryRestrictions.length > 0 ||
      preferences.allergies.length > 0 ||
      preferences.cuisinePreferences.length > 0);

  const prefLines: string[] = [];
  if (preferences?.dietaryRestrictions.length)
    prefLines.push(`- Dietary restrictions: ${preferences.dietaryRestrictions.join(", ")}`);
  if (preferences?.allergies.length)
    prefLines.push(`- Allergies (must avoid): ${preferences.allergies.join(", ")}`);
  if (preferences?.cuisinePreferences.length)
    prefLines.push(`- Preferred cuisines: ${preferences.cuisinePreferences.join(", ")}`);

  return `You are a helpful nutrition assistant. Generate meal ideas based on the following daily nutrition plan:

Daily Nutrition Targets:
- Calories: ${nutrition.calories} kcal
- Protein: ${nutrition.protein} g
- Carbohydrates: ${nutrition.carbs} g
- Fat: ${nutrition.fat} g
${hasPreferences ? `\nUser Preferences (strictly follow these):\n${prefLines.join("\n")}` : ""}
Calorie distribution guidelines:
- Breakfast: ~25% of daily calories (${Math.round(nutrition.calories * 0.25)} kcal)
- Lunch: ~35% of daily calories (${Math.round(nutrition.calories * 0.35)} kcal)
- Dinner: ~35% of daily calories (${Math.round(nutrition.calories * 0.35)} kcal)
- If breakfast + lunch + dinner total is more than 200 kcal below the daily target, add 1–2 snacks to make up the difference. Each snack should cover roughly half the remaining gap.

Requirements:
1. Always include exactly one breakfast, one lunch, and one dinner
2. Add snacks only if needed to meet the calorie target (as described above)
3. Each meal must be clearly labeled as "breakfast", "lunch", "dinner", or "snack"
4. Provide a simple, beginner-friendly meal name and brief description
5. Include macro breakdown (calories, protein in grams, carbs in grams, fat in grams) for each meal
6. Include cooking instructions as an array of step-by-step instructions
7. Keep suggestions simple and practical for someone new to meal planning
8. The total calories across all meals should be within 150 kcal of the daily target
${hasPreferences ? "9. Strictly respect all dietary restrictions and allergies — do not include any restricted or allergenic ingredients" : ""}

Return a JSON object with a "meals" key containing an array of meal objects:
{
  "meals": [
    {
      "mealType": "breakfast",
      "name": "Meal Name",
      "description": "Brief description of the meal",
      "macros": {
        "calories": 500,
        "protein": 30,
        "carbs": 50,
        "fat": 15
      },
      "cookingInstructions": [
        "Step 1: Prepare ingredients",
        "Step 2: Cook the main component",
        "Step 3: Add seasonings and serve"
      ]
    }
  ]
}`;
}

/**
 * Parse and validate the LLM response
 * Attempts to extract JSON from the response and validates structure
 */
function parseMealIdeas(response: string): MealIdea[] {
  // JSON mode guarantees valid JSON — no regex extraction needed
  const parsed = JSON.parse(response);

  const meals = parsed.meals;
  if (!Array.isArray(meals)) {
    throw new Error("Response missing 'meals' array");
  }

  return meals.map((meal: any) => {
    if (!meal.mealType || !meal.name || !meal.macros) {
      throw new Error("Invalid meal structure");
    }
    return {
      mealType: meal.mealType,
      name: meal.name,
      description: meal.description || "",
      macros: {
        calories: meal.macros.calories || 0,
        protein: meal.macros.protein || 0,
        carbs: meal.macros.carbs || 0,
        fat: meal.macros.fat || 0,
      },
      cookingInstructions: Array.isArray(meal.cookingInstructions)
        ? meal.cookingInstructions
        : meal.cookingInstructions ? [meal.cookingInstructions] : [],
    };
  });
}

/**
 * POST handler
 * Receives nutrition data, calls OpenAI, and returns meal ideas
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate limit check
    const record = await db.query.mealIdeas.findFirst({
      where: eq(mealIdeasTable.userId, userId),
    });
    const todayCount = getTodayCount(record);

    if (todayCount >= DAILY_GENERATION_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit of ${DAILY_GENERATION_LIMIT} generations reached. Try again tomorrow.` },
        { status: 429 }
      );
    }

    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = generateMealIdeasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const nutrition: NutritionResults = parsed.data.nutrition;
    const preferences = parsed.data.preferences as DietaryPreferences | undefined;

    // Construct prompt
    const prompt = constructPrompt(nutrition, preferences);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful nutrition assistant that provides simple, beginner-friendly meal ideas with accurate macro calculations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: OPENAI_TEMPERATURE,
      max_tokens: OPENAI_MAX_TOKENS,
      response_format: { type: "json_object" }, // Guarantees valid JSON — no regex extraction needed
    });

    // Extract response
    const responseText = completion.choices[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate response
    const mealIdeas = parseMealIdeas(responseText);

    // Save meals + increment daily count in a single upsert
    const newCount = todayCount + 1;
    const mealsJson = JSON.stringify(mealIdeas);
    await db
      .insert(mealIdeasTable)
      .values({
        id: crypto.randomUUID(),
        userId,
        mealsJson,
        generatedAt: new Date(),
        dailyCount: newCount,
      })
      .onConflictDoUpdate({
        target: mealIdeasTable.userId,
        set: {
          mealsJson,
          generatedAt: new Date(),
          dailyCount: newCount,
        },
      });

    return NextResponse.json({
      mealIdeas,
      remainingGenerations: DAILY_GENERATION_LIMIT - newCount,
    });

  } catch (error: any) {
    console.error("Error generating meal ideas:", error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate meal ideas. Please try again later." 
      },
      { status: 500 }
    );
  }
}
