/**
 * Extracts a human-readable message from an unknown catch value.
 * Use this in every catch block instead of inline instanceof checks.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "An error occurred. Please try again.",
): string {
  return err instanceof Error ? err.message : fallback;
}
