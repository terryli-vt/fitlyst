export const DAILY_GENERATION_LIMIT = 10;

interface MealRecord {
  dailyCount?: number | null;
  lastGeneratedDate?: string | null;
}

/**
 * Returns how many times the user has generated today,
 * given their meal_ideas DB record (or null if none exists yet).
 */
export function getTodayCount(record: MealRecord | null | undefined): number {
  const today = getTodayString();
  return record?.lastGeneratedDate === today ? (record.dailyCount ?? 0) : 0;
}

/**
 * Returns how many generations the user has left today,
 * given their meal_ideas DB record (or null if none exists yet).
 */
export function getRemainingGenerations(record: MealRecord | null | undefined): number {
  return Math.max(0, DAILY_GENERATION_LIMIT - getTodayCount(record));
}

/**
 * Returns today's date string in "YYYY-MM-DD" format.
 */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
