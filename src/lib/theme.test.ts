import { describe, expect, it } from 'vitest';
import { readStoredTheme, writeStoredTheme } from './theme';

const storageWith = (value: string | null) => () => ({ getItem: () => value });
const blockedStorage = (): never => {
  throw new Error('SecurityError: storage is blocked');
};

describe('stored theme', () => {
  it('returns a valid stored theme', () => {
    expect(readStoredTheme(storageWith('dark'))).toBe('dark');
    expect(readStoredTheme(storageWith('light'))).toBe('light');
  });

  it('ignores tampered values', () => {
    for (const value of ['<img src=x onerror=alert(1)>', 'DARK', 'system', '', null]) {
      expect(readStoredTheme(storageWith(value)), String(value)).toBeNull();
    }
  });

  it('survives storage being blocked, on read and on write', () => {
    expect(readStoredTheme(blockedStorage)).toBeNull();
    expect(() => writeStoredTheme(blockedStorage, 'dark')).not.toThrow();
  });
});
