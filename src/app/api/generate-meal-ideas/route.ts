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
import OpenAI from "openai";
import type { NutritionResults, MealIdea } from "@/app/onboarding/types";

// Initialize OpenAI client
// The API key should be set in environment variable OPENAI_API_KEY
// For local development, create a .env.local file with: OPENAI_API_KEY=your_key_here
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
function constructPrompt(nutrition: NutritionResults): string {
  return `You are a helpful nutrition assistant. Generate 3-5 meal ideas based on the following daily nutrition plan:

Daily Nutrition Targets:
- Calories: ${nutrition.calories} kcal
- Protein: ${nutrition.protein} g
- Carbohydrates: ${nutrition.carbs} g
- Fat: ${nutrition.fat} g

Requirements:
1. Generate 3-5 meal ideas total, covering breakfast, lunch, and dinner
2. Each meal should be clearly labeled as "breakfast", "lunch", or "dinner"
3. Provide a simple, beginner-friendly meal name and brief description
4. Include macro breakdown (calories, protein in grams, carbs in grams, fat in grams) for each meal
5. Include cooking instructions as an array of step-by-step instructions
6. Keep suggestions simple and practical for someone new to meal planning
7. Ensure the meals together roughly align with the daily targets (they don't need to be exact, just reasonable)

Format your response as a JSON array of objects with this structure:
[
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
  },
  ...
]

Only return valid JSON, no additional text.`;
}

/**
 * Parse and validate the LLM response
 * Attempts to extract JSON from the response and validates structure
 */
function parseMealIdeas(response: string): MealIdea[] {
  try {
    // Try to extract JSON if the response has markdown code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    
    const parsed = JSON.parse(jsonString.trim());
    
    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }
    
    // Validate each meal idea has required fields
    return parsed.map((meal: any) => {
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
          : (meal.cookingInstructions ? [meal.cookingInstructions] : []),
      };
    });
  } catch (error) {
    console.error("Error parsing meal ideas:", error);
    throw new Error("Failed to parse AI response");
  }
}

/**
 * POST handler
 * Receives nutrition data, calls OpenAI, and returns meal ideas
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const nutrition: NutritionResults = body.nutrition;

    // Validate required fields
    if (!nutrition || typeof nutrition.calories !== "number" || typeof nutrition.protein !== "number") {
      return NextResponse.json(
        { error: "Invalid nutrition data provided" },
        { status: 400 }
      );
    }

    // Construct prompt
    const prompt = constructPrompt(nutrition);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can be upgraded to gpt-4o for better results
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
      temperature: 0.7, // Balance between creativity and consistency
      max_tokens: 2500, // Increased to accommodate cooking instructions
    });

    // Extract response
    const responseText = completion.choices[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate response
    const mealIdeas = parseMealIdeas(responseText);

    // Return meal ideas
    return NextResponse.json({ mealIdeas });

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
