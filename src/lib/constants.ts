// ─── Profile validation limits ───────────────────────────────────────────────

/** Maximum accepted height in centimetres. */
export const MAX_HEIGHT_CM = 300;

/** Maximum accepted weight in kilograms. */
export const MAX_WEIGHT_KG = 500;

/** Maximum accepted age in years. */
export const MAX_AGE = 120;

// ─── Meal-idea generation ─────────────────────────────────────────────────────

/** Maximum number of meal-idea generations allowed per user per UTC day. */
export const DAILY_GENERATION_LIMIT = 10;

// ─── OpenAI settings ─────────────────────────────────────────────────────────

/** Model used for meal-idea generation. */
export const OPENAI_MODEL = "gpt-4o-mini";

/** Sampling temperature — balances creativity and consistency. */
export const OPENAI_TEMPERATURE = 0.7;

/** Max tokens for meal-idea generation (accommodates cooking instructions). */
export const OPENAI_MAX_TOKENS = 2500;

/** Request timeout in milliseconds — prevents requests from hanging. */
export const OPENAI_TIMEOUT_MS = 30_000;

/** Automatic retries on 429 / 5xx before surfacing an error. */
export const OPENAI_MAX_RETRIES = 2;
