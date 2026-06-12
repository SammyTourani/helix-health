/** Average tropical-year length in milliseconds (365.25 days). */
const YEAR_MS = 31_557_600_000;

/**
 * Calculates a whole-number age in years from a date-of-birth string.
 *
 * Returns null when the date of birth is missing or unparseable. Uses the
 * 365.25-day year approximation that the share view and AI brief already rely
 * on, with `now` injectable for deterministic testing.
 */
export function calculateAge(
  dateOfBirth: string | null | undefined,
  now: number = Date.now(),
): number | null {
  if (!dateOfBirth) return null;
  const dobMs = new Date(dateOfBirth).getTime();
  if (Number.isNaN(dobMs)) return null;
  return Math.floor((now - dobMs) / YEAR_MS);
}
