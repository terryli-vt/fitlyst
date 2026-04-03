import OpenAI from "openai";

/**
 * Shared OpenAI client instance.
 *
 * Centralised here so every API route imports the same singleton rather than
 * each constructing its own.  The API key is read from the OPENAI_API_KEY
 * environment variable (set it in .env.local for local development).
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000, // 30 seconds — prevents requests from hanging indefinitely
  maxRetries: 2,   // auto-retry on 429 and 5xx before surfacing the error
});
