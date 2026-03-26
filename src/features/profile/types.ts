// The purpose of this file is to define TypeScript types related to user profiles and nutrition data, which can be used throughout the application for type safety and better code readability.
export type DBProfile = {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  goalPriority: string;
};

export type DBNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmi: number;
  bmr: number;
};

export type UserInfo = {
  name: string | null;
  email: string | null;
  image: string | null;
};
