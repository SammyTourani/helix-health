import { describe, it, expect } from 'vitest';
import type { HealthRecord } from '@/types';
import {
  computeExpiresAt,
  parseFilterSpecialties,
  isShareLinkExpired,
  applyAccessLevel,
  shareLinkInputSchema,
  SHARE_ACCESS_LEVELS,
  SHARE_EXPIRY_OPTIONS,
} from './share';

// Fixed reference instant: 2026-01-01T00:00:00.000Z
const NOW = Date.UTC(2026, 0, 1, 0, 0, 0, 0);
const DAY_MS = 86_400_000;

function makeRecord(overrides: Partial<HealthRecord> = {}): HealthRecord {
  return {
    id: 'r1',
    user_id: 'u1',
    type: 'condition',
    title: 'Test',
    description: null,
    date: '2025-01-01',
    end_date: null,
    status: 'active',
    provider_name: null,
    specialty: null,
    notes: null,
    metadata: {},
    document_url: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeExpiresAt', () => {
  it('adds exactly one day for "1day"', () => {
    const result = computeExpiresAt('1day', NOW);
    expect(result).toBe(new Date(NOW + DAY_MS).toISOString());
    expect(new Date(result!).getTime() - NOW).toBe(DAY_MS);
  });

  it('adds seven days for "1week"', () => {
    expect(new Date(computeExpiresAt('1week', NOW)!).getTime() - NOW).toBe(7 * DAY_MS);
  });

  it('adds thirty days for "1month"', () => {
    expect(new Date(computeExpiresAt('1month', NOW)!).getTime() - NOW).toBe(30 * DAY_MS);
  });

  it('returns null for "never"', () => {
    expect(computeExpiresAt('never', NOW)).toBeNull();
  });

  it('returns null for unrecognized, null, and undefined options', () => {
    expect(computeExpiresAt('garbage', NOW)).toBeNull();
    expect(computeExpiresAt(null, NOW)).toBeNull();
    expect(computeExpiresAt(undefined, NOW)).toBeNull();
    expect(computeExpiresAt('', NOW)).toBeNull();
  });

  it('produces a valid, parseable ISO-8601 string', () => {
    const iso = computeExpiresAt('1week', NOW)!;
    expect(Number.isNaN(Date.parse(iso))).toBe(false);
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('parseFilterSpecialties', () => {
  it('splits a comma-separated list and trims whitespace', () => {
    expect(parseFilterSpecialties('Cardiology, Endocrinology ,Psychiatry')).toEqual([
      'Cardiology',
      'Endocrinology',
      'Psychiatry',
    ]);
  });

  it('returns an empty array for empty, whitespace, null, and undefined input', () => {
    expect(parseFilterSpecialties('')).toEqual([]);
    expect(parseFilterSpecialties('   ')).toEqual([]);
    expect(parseFilterSpecialties(null)).toEqual([]);
    expect(parseFilterSpecialties(undefined)).toEqual([]);
  });

  it('drops empty entries produced by stray or trailing commas', () => {
    expect(parseFilterSpecialties('Cardiology,,Neurology,')).toEqual(['Cardiology', 'Neurology']);
    expect(parseFilterSpecialties(', ,')).toEqual([]);
  });

  it('handles a single specialty with surrounding whitespace', () => {
    expect(parseFilterSpecialties('  Oncology  ')).toEqual(['Oncology']);
  });
});

describe('isShareLinkExpired', () => {
  it('treats a link with no expiry as never expired', () => {
    expect(isShareLinkExpired(null, NOW)).toBe(false);
    expect(isShareLinkExpired(undefined, NOW)).toBe(false);
    expect(isShareLinkExpired('', NOW)).toBe(false);
  });

  it('reports expiry in the past as expired', () => {
    const past = new Date(NOW - 1000).toISOString();
    expect(isShareLinkExpired(past, NOW)).toBe(true);
  });

  it('reports expiry in the future as not expired', () => {
    const future = new Date(NOW + 1000).toISOString();
    expect(isShareLinkExpired(future, NOW)).toBe(false);
  });

  it('is exclusive at the exact expiry instant (not yet expired)', () => {
    const exact = new Date(NOW).toISOString();
    expect(isShareLinkExpired(exact, NOW)).toBe(false);
  });

  it('round-trips with computeExpiresAt: a freshly issued link is not expired', () => {
    const expiresAt = computeExpiresAt('1day', NOW)!;
    expect(isShareLinkExpired(expiresAt, NOW)).toBe(false);
    // ...but is expired one day plus one millisecond later.
    expect(isShareLinkExpired(expiresAt, NOW + DAY_MS + 1)).toBe(true);
  });
});

describe('applyAccessLevel', () => {
  const records = [
    makeRecord({ id: 'a', specialty: 'Cardiology' }),
    makeRecord({ id: 'b', specialty: 'Endocrinology' }),
    makeRecord({ id: 'c', specialty: 'Psychiatry' }),
    makeRecord({ id: 'd', specialty: null }),
  ];

  it('keeps only allowed specialties when filtered with a non-empty list', () => {
    const result = applyAccessLevel(records, 'filtered', ['Cardiology', 'Psychiatry']);
    expect(result.map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('excludes records with a null specialty under filtered access', () => {
    const result = applyAccessLevel(records, 'filtered', ['Cardiology']);
    expect(result.some((r) => r.specialty === null)).toBe(false);
  });

  it('returns all records for "full" access regardless of filter list', () => {
    expect(applyAccessLevel(records, 'full', ['Cardiology'])).toEqual(records);
  });

  it('returns all records for "summary" access', () => {
    expect(applyAccessLevel(records, 'summary')).toEqual(records);
  });

  it('returns all records when filtered but the specialty list is empty', () => {
    expect(applyAccessLevel(records, 'filtered', [])).toEqual(records);
  });

  it('does not mutate the input array', () => {
    const snapshot = [...records];
    applyAccessLevel(records, 'filtered', ['Cardiology']);
    expect(records).toEqual(snapshot);
  });

  it('returns an empty array when no record matches the filter', () => {
    expect(applyAccessLevel(records, 'filtered', ['Neurology'])).toEqual([]);
  });
});

describe('shareLinkInputSchema', () => {
  it('applies defaults for an empty submission', () => {
    const parsed = shareLinkInputSchema.parse({});
    expect(parsed).toEqual({
      recipient_name: null,
      purpose: null,
      access_level: 'summary',
      expiry: '1week',
      filter_specialties: [],
    });
  });

  it('normalizes empty/whitespace text fields to null and parses specialties', () => {
    const parsed = shareLinkInputSchema.parse({
      recipient_name: '   ',
      purpose: 'Annual physical',
      access_level: 'filtered',
      expiry: '1month',
      filter_specialties: 'Cardiology, , Neurology',
    });
    expect(parsed.recipient_name).toBeNull();
    expect(parsed.purpose).toBe('Annual physical');
    expect(parsed.access_level).toBe('filtered');
    expect(parsed.expiry).toBe('1month');
    expect(parsed.filter_specialties).toEqual(['Cardiology', 'Neurology']);
  });

  it('trims surrounding whitespace from text fields', () => {
    const parsed = shareLinkInputSchema.parse({ recipient_name: '  Dr. Lee  ' });
    expect(parsed.recipient_name).toBe('Dr. Lee');
  });

  it('rejects an unknown access level', () => {
    const result = shareLinkInputSchema.safeParse({ access_level: 'admin' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown expiry option', () => {
    const result = shareLinkInputSchema.safeParse({ expiry: '1year' });
    expect(result.success).toBe(false);
  });

  it('rejects an over-long recipient name', () => {
    const result = shareLinkInputSchema.safeParse({ recipient_name: 'x'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('accepts every declared access level and expiry option', () => {
    for (const access_level of SHARE_ACCESS_LEVELS) {
      expect(shareLinkInputSchema.safeParse({ access_level }).success).toBe(true);
    }
    for (const expiry of SHARE_EXPIRY_OPTIONS) {
      expect(shareLinkInputSchema.safeParse({ expiry }).success).toBe(true);
    }
  });
});
