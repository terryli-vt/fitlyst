import { pgTable, unique, text, timestamp, foreignKey, integer, real } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const mealIdeas = pgTable("meal_ideas", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	mealsJson: text("meals_json").notNull(),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "meal_ideas_user_id_users_id_fk"
		}),
	unique("meal_ideas_user_id_unique").on(table.userId),
]);

export const nutritionResults = pgTable("nutrition_results", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	calories: integer().notNull(),
	protein: integer().notNull(),
	carbs: integer().notNull(),
	fat: integer().notNull(),
	bmi: real().notNull(),
	bmr: real().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "nutrition_results_user_id_users_id_fk"
		}),
	unique("nutrition_results_user_id_unique").on(table.userId),
]);

export const userProfiles = pgTable("user_profiles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	height: real().notNull(),
	weight: real().notNull(),
	age: integer().notNull(),
	gender: text().notNull(),
	activityLevel: text("activity_level").notNull(),
	goal: text().notNull(),
	goalPriority: text("goal_priority").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_users_id_fk"
		}),
	unique("user_profiles_user_id_unique").on(table.userId),
]);
