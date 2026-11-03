import { describe, expect, it } from 'vitest';
import { parseBoundedInteger } from './numbers';

describe('parseBoundedInteger', () => {
  it('accepts whole numbers inside the range, including both limits', () => {
    expect(parseBoundedInteger('1', 1, 1000)).toBe(1);
    expect(parseBoundedInteger('1000', 1, 1000)).toBe(1000);
    expect(parseBoundedInteger(' 42 ', 1, 1000)).toBe(42);
  });

  it('rejects values just outside the range', () => {
    expect(parseBoundedInteger('0', 1, 1000)).toBeNull();
    expect(parseBoundedInteger('1001', 1, 1000)).toBeNull();
  });

  it('rejects malicious and malformed input', () => {
    const rejected = [
      '-1',
      '1e308',
      'abc',
      '',
      ' ',
      'NaN',
      'Infinity',
      '-Infinity',
      '1.5',
      '1.0',
      '0x10',
      '1e3',
      '+5',
      '<script>alert(1)</script>',
      '9'.repeat(400),
    ];
    for (const raw of rejected) {
      expect(parseBoundedInteger(raw, 1, 1000), raw).toBeNull();
    }
  });
});
