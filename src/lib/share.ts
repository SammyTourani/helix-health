import { z } from 'zod';
import type { HealthRecord, ShareAccessLevel } from '@/types';

export const SHARE_ACCESS_LEVELS = ['full', 'filtered', 'summary'] as const;
export const SHARE_EXPIRY_OPTIONS = ['1day', '1week', '1month', 'never'] as const;

export type ShareExpiryOption = (typeof SHARE_EXPIRY_OPTIONS)[number];

const DAY_MS = 86_400_000;

/**
 * Maps a share-link expiry option to an absolute ISO-8601 timestamp.
 * Returns null for "never" (or any unrecognized option), matching the
 * "no expiry" semantics used by the create-share-link server action.
 *
 * `now` is injectable so the mapping is deterministic and testable.
 */
export function computeExpiresAt(
  option: string | null | undefined,
  now: number = Date.now(),
): string | null {
  switch (option) {
    case '1day':
      return new Date(now + DAY_MS).toISOString();
    case '1week':
      return new Date(now + 7 * DAY_MS).toISOString();
    case '1month':
      return new Date(now + 30 * DAY_MS).toISOString();
    default:
      return null;
  }
}

/**
 * Parses the comma-separated `filter_specialties` form field into an array.
 * Each entry is trimmed; an empty/whitespace-only input yields an empty array.
 */
export function parseFilterSpecialties(raw: string | null | undefined): string[] {
  if (!raw || raw.trim() === '') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Returns true when a share link has passed its expiry and should be treated
 * as inaccessible. Links with no `expires_at` never expire.
 *
 * `now` is injectable for deterministic testing.
 */
export function isShareLinkExpired(
  expiresAt: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < now;
}

/**
 * Applies a share link's access level to a set of records.
 *
 * - "filtered" with one or more specialties: keep only records whose specialty
 *   is in the allow-list (the same `.in('specialty', …)` semantics the share
 *   page applies at the database layer).
 * - "filtered" with no specialties, "full", or "summary": records are returned
 *   unchanged (callers decide whether "summary" surfaces records in the UI).
 */
export function applyAccessLevel(
  records: HealthRecord[],
  accessLevel: ShareAccessLevel,
  filterSpecialties: string[] = [],
): HealthRecord[] {
  if (accessLevel === 'filtered' && filterSpecialties.length > 0) {
    const allowed = new Set(filterSpecialties);
    return records.filter((r) => r.specialty !== null && allowed.has(r.specialty));
  }
  return records;
}

/**
 * Validation schema for the create-share-link form submission. Mirrors the
 * fields read by the server action and normalizes empty strings to null.
 */
export const shareLinkInputSchema = z.object({
  recipient_name: z
    .string()
    .trim()
    .max(120)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .default(null),
  purpose: z
    .string()
    .trim()
    .max(500)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .default(null),
  access_level: z.enum(SHARE_ACCESS_LEVELS).default('summary'),
  expiry: z.enum(SHARE_EXPIRY_OPTIONS).default('1week'),
  filter_specialties: z
    .string()
    .default('')
    .transform((v) => parseFilterSpecialties(v)),
});

export type ShareLinkInput = z.infer<typeof shareLinkInputSchema>;
