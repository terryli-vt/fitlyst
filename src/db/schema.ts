import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  activityLevel: text("activity_level").notNull(),
  goal: text("goal").notNull(),
  goalPriority: text("goal_priority").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nutritionResults = pgTable("nutrition_results", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  bmi: real("bmi").notNull(),
  bmr: real("bmr").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mealIdeas = pgTable("meal_ideas", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  mealsJson: text("meals_json").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
