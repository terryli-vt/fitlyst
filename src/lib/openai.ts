import OpenAI from "openai";
import { OPENAI_TIMEOUT_MS, OPENAI_MAX_RETRIES } from "./constants";

/**
 * Shared OpenAI client instance.
 *
 * Centralised here so every API route imports the same singleton rather than
 * each constructing its own.  The API key is read from the OPENAI_API_KEY
 * environment variable (set it in .env.local for local development).
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT_MS,
  maxRetries: OPENAI_MAX_RETRIES,
});
