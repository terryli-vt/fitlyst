import { relations } from "drizzle-orm/relations";
import { users, mealIdeas, nutritionResults, userProfiles } from "./schema";

export const mealIdeasRelations = relations(mealIdeas, ({one}) => ({
	user: one(users, {
		fields: [mealIdeas.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	mealIdeas: many(mealIdeas),
	nutritionResults: many(nutritionResults),
	userProfiles: many(userProfiles),
}));

export const nutritionResultsRelations = relations(nutritionResults, ({one}) => ({
	user: one(users, {
		fields: [nutritionResults.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));