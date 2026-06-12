import { describe, it, expect } from 'vitest';
import { calculateAge } from './date';

const YEAR_MS = 31_557_600_000;
// Fixed reference instant: 2026-01-01T00:00:00.000Z
const NOW = Date.UTC(2026, 0, 1, 0, 0, 0, 0);

describe('calculateAge', () => {
  it('returns null for missing date of birth', () => {
    expect(calculateAge(null, NOW)).toBeNull();
    expect(calculateAge(undefined, NOW)).toBeNull();
    expect(calculateAge('', NOW)).toBeNull();
  });

  it('returns null for an unparseable date string', () => {
    expect(calculateAge('not-a-date', NOW)).toBeNull();
  });

  it('computes a whole-number age for a birthday roughly 30 years ago', () => {
    const dob = new Date(NOW - 30 * YEAR_MS).toISOString();
    expect(calculateAge(dob, NOW)).toBe(30);
  });

  it('floors partial years rather than rounding up', () => {
    // 30 years minus one day -> still 29 completed years.
    const dob = new Date(NOW - 30 * YEAR_MS + 86_400_000).toISOString();
    expect(calculateAge(dob, NOW)).toBe(29);
  });

  it('returns 0 for an infant born within the last year', () => {
    const dob = new Date(NOW - 100 * 86_400_000).toISOString();
    expect(calculateAge(dob, NOW)).toBe(0);
  });

  it('accepts a plain date-only string (no time component)', () => {
    const age = calculateAge('1995-07-14', NOW);
    expect(age).toBe(30);
  });

  it('returns a negative age for a future date of birth', () => {
    const dob = new Date(NOW + 2 * YEAR_MS).toISOString();
    expect(calculateAge(dob, NOW)).toBeLessThan(0);
  });
});
