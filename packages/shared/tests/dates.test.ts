import { describe, expect, it } from 'vitest';
import { isIsoDate, toBillingMonth, toSchoolDate } from '../src/dates';

describe('school dates', () => {
  it('uses Asia/Karachi when the UTC day differs', () => {
    // 2026-11-14T20:30:00Z is 2026-11-15 01:30 in Karachi (UTC+5).
    const instant = new Date('2026-11-14T20:30:00Z');
    expect(toSchoolDate(instant)).toBe('2026-11-15');
    expect(toBillingMonth(instant)).toBe('2026-11');
  });

  it('validates calendar dates', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('28-02-2026')).toBe(false);
  });
});
