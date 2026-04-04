import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// See Auth.js schema docs: https://authjs.dev/getting-started/adapters/drizzle

// ─── Users ────────────────────────────────────────────────────────────────────
// NextAuth requires: id, name, email, emailVerified, image
// We keep our own createdAt on top of that.
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── NextAuth Required Tables ─────────────────────────────────────────────────
// Stores OAuth account links (Google, GitHub, etc.)
// Adding a new provider later = just add it to auth.ts providers array.
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);


// ─── App Tables ───────────────────────────────────────────────────────────────
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
  dietaryRestrictions: text("dietary_restrictions"), // JSON array e.g. '["vegetarian","gluten-free"]'
  allergies: text("allergies"),                       // JSON array e.g. '["nuts","dairy"]'
  cuisinePreferences: text("cuisine_preferences"),    // JSON array e.g. '["asian","mediterranean"]'
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
  dailyCount: integer("daily_count").default(0).notNull(),
  lastGeneratedDate: text("last_generated_date"), // "YYYY-MM-DD", nullable
});
