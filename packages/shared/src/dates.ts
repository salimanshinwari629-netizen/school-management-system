import { SCHOOL_TIMEZONE } from './constants';

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SCHOOL_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** School-local calendar day as YYYY-MM-DD (avoids UTC offset drift). */
export function toSchoolDate(instant: Date = new Date()): string {
  return isoDateFormatter.format(instant);
}

/** Billing month as YYYY-MM in school time. */
export function toBillingMonth(instant: Date = new Date()): string {
  return toSchoolDate(instant).slice(0, 7);
}

/** True for a valid YYYY-MM-DD calendar date. */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
