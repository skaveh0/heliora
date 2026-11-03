/**
 * Parses a whole number typed by a person, or returns null. Plain digits only, so NaN, Infinity,
 * negatives, decimals, hex and exponent forms such as "1e308" are all rejected.
 */
export function parseBoundedInteger(raw: string, min: number, max: number): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value < min || value > max) return null;
  return value;
}

export const formatInteger = (value: number): string =>
  Math.round(value).toLocaleString('en-US');
