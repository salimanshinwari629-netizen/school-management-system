import { describe, expect, it } from 'vitest';
import { formatPKR, toPaisa, toRupees } from '../src/money';

describe('money', () => {
  it('converts rupees to integer paisa', () => {
    expect(toPaisa(1500)).toBe(150_000);
    expect(toPaisa(12.345)).toBe(1235);
  });

  it('rejects invalid amounts', () => {
    expect(() => toPaisa(Number.NaN)).toThrow(TypeError);
    expect(() => toRupees(10.5)).toThrow(TypeError);
  });

  it('formats PKR for display', () => {
    expect(formatPKR(150_000)).toContain('1,500');
  });
});
