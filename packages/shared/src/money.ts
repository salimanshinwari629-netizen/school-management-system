import { SCHOOL_CURRENCY } from './constants';

/** PKR has 100 paisa; all money is stored and transported as integer paisa. */
export const MINOR_UNITS_PER_RUPEE = 100;

export function toPaisa(rupees: number): number {
  if (!Number.isFinite(rupees)) {
    throw new TypeError('Amount must be a finite number');
  }
  return Math.round(rupees * MINOR_UNITS_PER_RUPEE);
}

export function toRupees(paisa: number): number {
  if (!Number.isInteger(paisa)) {
    throw new TypeError('Paisa amount must be an integer');
  }
  return paisa / MINOR_UNITS_PER_RUPEE;
}

const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: SCHOOL_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats integer paisa for display, e.g. 150000 -> "Rs 1,500". */
export function formatPKR(paisa: number): string {
  return pkrFormatter.format(toRupees(paisa));
}
