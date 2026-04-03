export const DAILY_GENERATION_LIMIT = 10;

interface MealRecord {
  dailyCount?: number | null;
  generatedAt?: Date | null;
}

/**
 * Returns how many times the user has generated today (UTC),
 * given their meal_ideas DB record (or null if none exists yet).
 *
 * Uses the server-side UTC timestamp in `generatedAt` instead of a
 * client-supplied date string, so the count cannot be manipulated by
 * timezone tricks or forged request data.
 */
export function getTodayCount(record: MealRecord | null | undefined): number {
  if (!record?.generatedAt || !record?.dailyCount) return 0;

  const now = new Date();
  const generated = new Date(record.generatedAt);

  const sameUTCDay =
    now.getUTCFullYear() === generated.getUTCFullYear() &&
    now.getUTCMonth() === generated.getUTCMonth() &&
    now.getUTCDate() === generated.getUTCDate();

  return sameUTCDay ? (record.dailyCount ?? 0) : 0;
}

/**
 * Returns how many generations the user has left today,
 * given their meal_ideas DB record (or null if none exists yet).
 */
export function getRemainingGenerations(record: MealRecord | null | undefined): number {
  return Math.max(0, DAILY_GENERATION_LIMIT - getTodayCount(record));
}
